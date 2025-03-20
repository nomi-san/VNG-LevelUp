import { useInView } from "react-intersection-observer";
import { type ReactNode } from "react";

import ImagePreview from "@renderer/components/ImagePreview";
import ImageSkeleton from "@renderer/components/ImageSkeleton";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Card, CardContent } from "@renderer/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@renderer/components/ui/carousel";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { timestampToDateStr } from "@renderer/utils/date";

import { type DetailsPageGameInfo, type ProductAttributeSection } from "@src/types/game";

type GameDetailInformationProp = {
  game: DetailsPageGameInfo;
};

export const GameDetailInformation = ({ game }: GameDetailInformationProp): JSX.Element => {
  const { t } = useTranslation();
  const getAgeRatingUrl = (age: number): string => {
    if (age < 12) return "https://cdn-nexus.vnggames.com/assets/images/common/ages/00.jpg";
    if (age < 16) return "https://cdn-nexus.vnggames.com/assets/images/common/ages/12.jpg";
    if (age < 18) return "https://cdn-nexus.vnggames.com/assets/images/common/ages/16.jpg";
    return "https://cdn-nexus.vnggames.com/assets/images/common/ages/18.jpg";
  };
  const { ref, inView } = useInView({
    initialInView: false,
    triggerOnce: true,
  });
  return (
    <div className="relative z-20 flex w-full flex-col gap-[100px] bg-neutral-900 py-16">
      <div className="flex flex-col gap-6">
        <p className="heading-3 ml-[116px]">{t("game.cardTitle")}</p>
        <div className="flex w-full flex-col gap-4 pl-[116px] pr-14">
          <p className="body-14-regular whitespace-pre-wrap opacity-75">{game.description}</p>
          <div>
            <span className="body-14-bold mr-1 uppercase">{t("game.genre")} </span>
            <span className="body-14-regular opacity-75">{game.genres.join(", ")}</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <p className="body-14-bold uppercase">{t("game.ageRestriction")}:</p>
            <ImgWithSkeleton
              className="h-14 max-h-14 object-contain object-left"
              src={getAgeRatingUrl(game.ageRating)}
              skeletonClass="h-14 w-[156px] rounded-lg"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6" ref={ref}>
        <p className="heading-3 ml-[116px]">{t("game.features")}</p>
        <div className="flex w-full items-center justify-center">
          <div className="ml-[54px] w-[1110px]">
            <Carousel className="w-full">
              <CarouselContent className="-ml-5">
                {game.mediaItems.map((_, index) => (
                  <CarouselItem key={index} className="basis-1/3 pl-5">
                    <div>
                      <Card>
                        <CardContent className="flex h-[200px] w-[356px] items-center justify-center overflow-hidden rounded-lg bg-neutral-500 p-0">
                          {inView ? (
                            <ImagePreview
                              mediaItems={game.mediaItems}
                              focusImgIdx={index}
                              className="h-full w-full"
                            />
                          ) : (
                            <ImageSkeleton />
                          )}
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
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <p className="heading-3 ml-[116px]">{t("game.prerequisite.title")}</p>
        <div className="ml-[116px] flex w-full gap-4">
          <GameRequirements requirements={game.attributes} />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <p className="heading-3 ml-[116px]">{t("game.additionInfo")}</p>
        <div className="ml-[116px] flex w-full gap-4">
          <GameInfoCardWrapper title={t("game.publisherName")}>
            <div className="mt-3 flex">
              <ImgWithSkeleton
                src={game.publisher.url}
                className="max-h-[32px]"
                skeletonClass="h-8 w-[358px] rounded-2xl"
              />
            </div>
          </GameInfoCardWrapper>
          <GameInfoCardWrapper title={t("game.developerName")}>
            <div className="mt-3 flex">
              <ImgWithSkeleton
                src={game.developer.url}
                className="max-h-[32px]"
                skeletonClass="h-8 w-[358px] rounded-2xl"
              />
            </div>
          </GameInfoCardWrapper>
          <GameInfoCardWrapper title={t("game.publishDate")}>
            <p className="body-18-bold mt-3 text-neutral-300">
              {timestampToDateStr(game.publishDate)}
            </p>
          </GameInfoCardWrapper>
        </div>
        <div className="ml-[116px] flex w-full gap-4">
          <GameInfoCardWrapper title={t("game.businessAddress")}>
            <p className="body-14-regular opacity-75">
              {
                game.attributes?.find((attr) => attr.attributeId === "business_address")
                  ?.description
              }
            </p>
          </GameInfoCardWrapper>
          <GameInfoCardWrapper title={t("game.license")}>
            <p className="body-14-regular whitespace-pre-wrap opacity-75">
              {game.attributes?.find((attr) => attr.attributeId === "license")?.description}
            </p>
          </GameInfoCardWrapper>
          <GameInfoCardWrapper title={t("game.hotline")}>
            <p className="body-14-regular opacity-75">
              {game.attributes?.find((attr) => attr.attributeId === "hotline")?.description}
            </p>
          </GameInfoCardWrapper>
        </div>
      </div>
    </div>
  );
};

type GameRequirementsProp = {
  requirements: DetailsPageGameInfo["attributes"];
};
const GameRequirements = ({ requirements }: GameRequirementsProp): JSX.Element => {
  const requirementViewOrder: ProductAttributeSection[] = ["minimum", "recommended"];
  return (
    <>
      {requirementViewOrder.map((section) => {
        return (
          <GameRequirementItem
            key={section}
            requirements={requirements?.filter((requirement) => requirement.section === section)}
          />
        );
      })}
    </>
  );
};

type GameRequirementItemProp = {
  requirements: DetailsPageGameInfo["attributes"];
};

const GameRequirementItem = ({ requirements }: GameRequirementItemProp): JSX.Element => {
  const { t } = useTranslation();

  if (!requirements || requirements.length === 0) return <></>;

  return (
    <div className="flex w-[360px] max-w-[360px] flex-col gap-4">
      <p className="heading-4">{t(`game.prerequisite.subTitle.${requirements[0].section}`)}</p>
      <hr className="w-full border-neutral-600" />
      {requirements.map(({ attributeId, description, section }) => {
        let label = "";
        switch (attributeId) {
          case "os":
            label = t("game.prerequisite.os");
            break;
          case "size":
            label = t("game.prerequisite.size");
            description = description.toUpperCase();
            break;
          case "gpu":
            label = t("game.prerequisite.gpu");
            break;
          case "cpu":
            label = t("game.prerequisite.cpu");
            break;
          case "directx":
            label = t("game.prerequisite.directx");
            break;
          case "ram":
            label = t("game.prerequisite.ram");
            break;
        }
        return (
          <GameInfoCardWrapper title={label} key={`${section}-${attributeId}`}>
            <p className="body-14-regular text-neutral-50 opacity-75">{description}</p>
          </GameInfoCardWrapper>
        );
      })}
    </div>
  );
};

type GameInfoCardWrapperProps = {
  title: string;
  children: ReactNode;
};
const GameInfoCardWrapper = ({ title, children }: GameInfoCardWrapperProps) => {
  return (
    <div className="flex w-[360px] flex-col gap-1">
      <p className="caption-12-bold uppercase text-neutral-50">{title}</p>
      {children}
    </div>
  );
};
