import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { useState } from "react";

import ScaleIn from "@renderer/animations/ScaleIn";
import ImageProgress from "@renderer/components/ImageProgress";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import useDownloadSubscriber from "@renderer/hooks/useDownloadSubscriber";
import useGetLocalGameIds from "@renderer/hooks/useGetLocalGameIds";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { isDownloadContainingErrors } from "@renderer/utils/download";

import type { GameClientId, ListPageGameInfo } from "@src/types/game";

const GameCard = ({
  game,
  onClickGame,
  localGameIds,
  onDownloadSuccess,
}: {
  game: ListPageGameInfo;
  onClickGame: (gameId: GameClientId) => void;
  localGameIds: string[];
  onDownloadSuccess: () => void;
}): JSX.Element => {
  const { t } = useTranslation();

  const { isLoading, downloadProgressInfo } = useDownloadSubscriber(game.id, onDownloadSuccess);
  const [scaleRatio, setScaleRatio] = useState(0.8);
  return (
    <ScaleIn scale={scaleRatio}>
      <div
        data-testid={`game-card-${game.id}`}
        className="hover:solid-shadow-drop w-[355px] cursor-pointer overflow-hidden rounded-lg p-2 hover:bg-neutral-800"
        onClick={() => {
          setScaleRatio(1.2);
          setTimeout(() => {
            onClickGame(game.id);
          }, 200);
        }}
      >
        <div className="relative mb-3 cursor-pointer overflow-hidden rounded-lg">
          <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            {!isLoading &&
            downloadProgressInfo !== "NOT_FOUND" &&
            downloadProgressInfo.progress.some(
              ({ download }) => download.status === "progressing",
            ) ? (
              <ImageProgress
                className="rounded-lg"
                progress={
                  downloadProgressInfo.progress.reduce(
                    (acc, { download }) => acc + download.percent,
                    0,
                  ) / downloadProgressInfo.progress.length
                }
                imageUrl={downloadProgressInfo.initInfo.remoteGameInfo.thumbnail.url}
                height={200}
                width={355}
                showFail={isDownloadContainingErrors(downloadProgressInfo)}
              />
            ) : (
              <ImgWithSkeleton
                loading="lazy"
                src={game.thumbnail.url}
                alt={game.title}
                className="h-[200px] w-[355px] rounded-md"
              />
            )}
          </motion.div>
          {localGameIds.includes(game.id.toString()) && (
            <div className="absolute right-2 top-2">
              <div className="flex items-center gap-2 rounded-sm bg-[#000000BF] px-2 py-1.5 backdrop-blur-sm">
                <CircleCheck fill="white" color="#22252A" className="h-4 w-4" />
                <p className="caption-12-regular">{t("label.downloaded")}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex w-[355px] gap-3">
          <ImgWithSkeleton
            src={game.icon.url}
            alt={game.title}
            className="h-[42px] w-[42px] rounded-lg"
          />
          <div className="flex h-full grow flex-col gap-1">
            <p className="caption-12-regular text-neutral-200">{game.genres.sort().join(", ")}</p>
            <p className="body-18-bold text-white">{game.title}</p>
          </div>
        </div>
      </div>
    </ScaleIn>
  );
};
const COLUMNS_LENGTH = 3;
const HomeNew = ({
  games,
  onClickGame,
}: {
  games: ListPageGameInfo[];
  onClickGame: (gameId: GameClientId) => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const { data: localGameIds, refetch } = useGetLocalGameIds();
  const substitudeDivsLength = COLUMNS_LENGTH - (games.length % COLUMNS_LENGTH);
  const substitudeDivs = Array(substitudeDivsLength).fill(0);
  return (
    <ScrollArea className="ml-[56px] h-[calc(100vh-56px)] pl-[60px] pr-[56px]">
      <h1 className="heading-2 mb-8">{t("sideBar.allGames")}</h1>

      <div className="mb-16 flex flex-wrap justify-evenly gap-x-3 gap-y-8">
        {games.map((game) => {
          return (
            <GameCard
              key={game.id}
              game={game}
              onClickGame={onClickGame}
              localGameIds={localGameIds || []}
              onDownloadSuccess={refetch}
            />
          );
        })}
        {substitudeDivs.map((_, index) => (
          <div key={index} className="w-[355px]" />
        ))}
      </div>
    </ScrollArea>
  );
};

export default HomeNew;
