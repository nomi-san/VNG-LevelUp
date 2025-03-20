import { useTranslation } from "@renderer/i18n/useTranslation";
import { timestampToDateStr } from "@renderer/utils/date";

import type { DetailsPageGameInfo } from "@src/types/game";

type GameCardDetailsProps = {
  game: DetailsPageGameInfo;
};
const GameCardDetails = ({ game }: GameCardDetailsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex w-full justify-between py-1">
        <p className="body-14-regular text-neutral-50 opacity-75">{t("game.publisherName")}</p>
        <p className="body-14-regular">{game.publisherName}</p>
      </div>
      <div className="flex w-full justify-between py-1">
        <p className="body-14-regular text-neutral-50 opacity-75">{t("game.developerName")}</p>
        <p className="body-14-regular">{game.developerName}</p>
      </div>
      <div className="flex w-full justify-between py-1">
        <p className="body-14-regular text-neutral-50 opacity-75">{t("game.publishDate")}</p>
        <p className="body-14-regular">{timestampToDateStr(game.publishDate)}</p>
      </div>
      <div className="flex w-full justify-between py-1">
        <p className="body-14-regular text-neutral-50 opacity-75">{t("game.genre")}</p>
        <div className="flex-end flex items-center">
          {game.genres &&
            game.genres.map((category) => {
              return (
                <div
                  key={`${game.id}-${category}`}
                  className="shadow-drop ml-2 rounded-md border border-neutral-100 border-opacity-20 px-2"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0) 100%)",
                  }}
                >
                  <p className="body-14-regular text-neutral-50">{category}</p>
                </div>
              );
            })}
        </div>
      </div>
      <div className="flex w-full flex-col py-1">
        <p className="body-14-regular mb-1 text-neutral-50 opacity-75">
          {t("game.prerequisite.title")}
        </p>

        {game.attributes?.map(({ attributeId, description }) => {
          let label = "";
          switch (attributeId) {
            case "os":
              label = t("game.prerequisite.os");
              break;
            case "size":
              label = t("game.prerequisite.size");
              description = description.toUpperCase();
              break;
          }
          return (
            <div className="flex w-full flex-col py-1" key={`${game.id}-${attributeId}`}>
              <p className="caption-12-regular text-neutral-50 opacity-75">{label}</p>
              <p className="body-14-regular text-neutral-50">{description}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default GameCardDetails;
