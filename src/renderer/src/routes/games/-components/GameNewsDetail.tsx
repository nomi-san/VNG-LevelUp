import { SquareArrowOutUpRight } from "lucide-react";

import { useTracking } from "@renderer/analytics";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Card, CardContent } from "@renderer/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@renderer/components/ui/carousel";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { timestampToDayAndMonth } from "@renderer/utils/date";

import type { DetailsPageGameInfo, GameClientId } from "@src/types/game";
import type { BannerInfo, NewsInfo, VPNewsForNexus } from "@src/types/news";

export const GameNewItem = ({
  newsItemInfo,
  gameId,
}: {
  newsItemInfo: VPNewsForNexus;
  gameId: GameClientId;
}): JSX.Element => {
  const { track } = useTracking();
  return (
    <TooltipProvider disableHoverableContent delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="body-14-regular flex cursor-pointer flex-wrap items-center gap-2 text-neutral-200 hover:text-neutral-50"
            onClick={() => {
              if (newsItemInfo.linkExternal || newsItemInfo.link) {
                const newsUrl = newsItemInfo.linkExternal
                  ? newsItemInfo.linkExternal
                  : newsItemInfo.link;
                window.api.app_openExternalWeb(newsUrl);
                track({
                  name: "click_news",
                  payload: {
                    gameId: gameId,
                    newsUrl: newsUrl,
                  },
                });
              }
            }}
          >
            <div className="flex w-[365px] cursor-pointer items-center gap-2 text-neutral-200 hover:text-neutral-50">
              <div className="caption-12-regular max-w-[112px] shrink overflow-clip text-ellipsis whitespace-nowrap rounded-sm bg-neutral-600 p-1 text-neutral-50">
                {newsItemInfo.categoryName}
              </div>
              <p className="body-14-regular shrink grow overflow-hidden text-ellipsis whitespace-nowrap">
                {newsItemInfo.title}
              </p>
              <div className="flex basis-8 justify-end">
                <SquareArrowOutUpRight className="h-4 w-4" />
              </div>
              <p className="body-14-regular">
                {newsItemInfo.publishDate ? timestampToDayAndMonth(newsItemInfo.publishDate) : ""}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="body-14-regular w-full rounded-sm bg-neutral-800 px-2 py-1.5 text-white"
        >
          {newsItemInfo.title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
type GameNewsDetailProps = {
  game: DetailsPageGameInfo;
  bannerInfo: BannerInfo | undefined;
  newsInfo: NewsInfo | undefined;
};

export const GameNewsDetail = ({
  game,
  bannerInfo,
  newsInfo,
}: GameNewsDetailProps): JSX.Element => {
  const { t } = useTranslation();
  const { track } = useTracking();
  return (
    <>
      {bannerInfo && bannerInfo.banners && bannerInfo.banners.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <p className="subtle-bold uppercase">{t("game.outstanding")}</p>
          <Carousel className="w-full">
            <CarouselContent className="-ml-5">
              {bannerInfo.banners.map((bannerItem) => (
                <CarouselItem key={bannerItem.id} className="basis-1/1 cursor-pointer pl-5">
                  <div
                    onClick={() => {
                      if (bannerItem.link) {
                        window.api.app_openExternalWeb(bannerItem.link);
                        track({
                          name: "click_banner",
                          payload: {
                            gameId: game.id,
                            bannerUrl: bannerItem.link,
                          },
                        });
                      }
                    }}
                  >
                    <Card>
                      <CardContent className="flex h-[145px] w-[260px] items-center justify-center overflow-hidden rounded-lg bg-neutral-500 p-0">
                        <ImgWithSkeleton
                          loading="lazy"
                          src={bannerItem.thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}
      <div className="flex w-full flex-col gap-2">
        <p className="subtle-bold uppercase">{t("game.update")}</p>
        <ScrollArea className="flex h-[105px] w-full flex-col">
          <div className="flex flex-col gap-2">
            {newsInfo?.news
              .sort((new1, new2) => new1.ordering - new2.ordering)
              .map((newsItemInfo) => (
                <GameNewItem key={newsItemInfo.id} newsItemInfo={newsItemInfo} gameId={game.id} />
              ))}
          </div>
        </ScrollArea>
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => {
            if (newsInfo?.moreNewsSite) {
              window.api.app_openExternalWeb(newsInfo?.moreNewsSite);
              track({
                name: "click_news",
                payload: {
                  gameId: game.id,
                  newsUrl: newsInfo?.moreNewsSite,
                },
              });
            }
          }}
        >
          <p className="underline">{t("game.viewMoreNews")}</p>
          <SquareArrowOutUpRight className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </div>
    </>
  );
};
