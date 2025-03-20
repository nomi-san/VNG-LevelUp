import trash from "@renderer/assets/trash-motion.gif";
import type { ButtonGroupChildrenExtraProps } from "@renderer/components/ButtonGroup";
import { Button } from "@renderer/components/ui/button";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { cn } from "@renderer/lib/utils";
import { GameActionContainer } from "@renderer/routes/-components-game-actions/GameCardAction";

import type { GameClientId } from "@src/types/game";

import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

export const SocialSkeleton = ({ className }: { className: string }): JSX.Element => {
  return (
    <div className={cn("flex flex-col gap-y-3", className)}>
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <Skeleton key={`SocialSkeleton-${index}`} className="h-10 w-10 rounded-lg"></Skeleton>
        ))}
    </div>
  );
};

export const ContentSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("w-[356px]", className)}>
      {/* <Skeleton className="mb-7 h-20 w-full rounded-lg" /> */}
      <Skeleton className="mb-2 h-5 w-full rounded-lg" />
      <div className="mb-7 flex w-full">
        <Carousel className="w-full">
          <CarouselContent className="-ml-5">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <CarouselItem key={index} className="basis-1/1 cursor-pointer pl-5">
                  <Skeleton className="h-[145px] w-[260px] rounded-lg" />
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div className="mb-[62px] flex w-full flex-col gap-2">
        <Skeleton className="h-5 w-full rounded-2xl" />
        {Array(2)
          .fill(0)
          .map((_, index) => (
            <Skeleton
              key={`GameRequirementsSkeleton-${index}`}
              className="h-6 w-full rounded-2xl"
            />
          ))}
      </div>
      <Skeleton className="h-6 w-[140px] rounded-lg" />
    </div>
  );
};
export const ActionButtonSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("w-[355px]", className)}>
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
};

const GameInfoSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <Skeleton className="h-8 w-[280px] rounded-2xl" />
      <Skeleton className="h-5 w-[356px] rounded-2xl" />
      <Skeleton className="h-5 w-[732px] rounded-2xl" />
    </div>
  );
};

const GameMediaSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <Skeleton className="h-8 w-[280px] rounded-2xl" />
      <div className="w-[1110px]">
        <Carousel className="w-full">
          <CarouselContent className="-ml-5">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <CarouselItem key={`GameMediaSkeleton-${index}`} className="basis-1/3 pl-5">
                  <Skeleton className="h-[200px] w-[356px] rounded-lg" />
                </CarouselItem>
              ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

const GameRequirementsSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <Skeleton className="h-8 w-[280px] rounded-2xl" />
      <Skeleton className="h-5 w-[356px] rounded-2xl" />
      <Skeleton className="h-5 w-[732px] rounded-2xl" />
    </div>
  );
};

const GameDecreeSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <Skeleton className="h-8 w-[280px] rounded-2xl" />
      <div className="flex w-full gap-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={`GameDecreeSkeleton-${index}`} className="flex w-[359px] flex-col gap-4">
              <Skeleton className="h-[14px] w-full rounded-2xl" />
              <Skeleton className="h-8 w-full rounded-2xl" />
            </div>
          ))}
      </div>
    </div>
  );
};

const UninstallingButton = ({ className, size }: ButtonGroupChildrenExtraProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Button
      variant="white"
      size={size ? size : "lg"}
      className={cn("grow !font-bold uppercase", className)}
      onClick={() => {}}
      disabled={true}
    >
      <img src={trash} className="mr-[-8px] h-14 w-14" /> {t("uninstall.progress")}
    </Button>
  );
};
export const UninstallSkeleton = ({ gameId }: { gameId: GameClientId }): JSX.Element => {
  return <GameActionContainer gameId={gameId} playButton={<UninstallingButton />} />;
};

const GameDetailSkeleton = (): JSX.Element => {
  return (
    <div className="fixed inset-0 z-10 ml-[60px] mt-14">
      <ScrollArea className="h-[calc(100vh-56px)]">
        <div className="relative h-[calc(100vh-56px)] w-full">
          <SocialSkeleton className="absolute right-3 top-0" />
          <ContentSkeleton className="absolute bottom-[26px] left-[51px]" />
          <ActionButtonSkeleton className="absolute bottom-[26px] right-[51px]" />
        </div>
        <div className="mb-[45px] ml-14 mt-[60px] flex flex-col gap-[100px]">
          <GameInfoSkeleton />
          <GameMediaSkeleton />
          <GameRequirementsSkeleton />
          <GameDecreeSkeleton />
        </div>
      </ScrollArea>
    </div>
  );
};

export default GameDetailSkeleton;
