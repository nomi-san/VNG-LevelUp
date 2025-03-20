import { useCallback, useState } from "react";

import { BorderGradient } from "@renderer/components/BorderGradient";
import { Card, CardContent } from "@renderer/components/ui/card";

import type { DetailsPageGameInfo } from "@src/types/game";

type CarouselComponentProps = {
  media: DetailsPageGameInfo["detail_thumbnail_urls"];
  onItemIdxChange: (index: number) => void;
};
const CarouselGameMedia = ({ media, onItemIdxChange }: CarouselComponentProps) => {
  const [current, setCurrent] = useState(1);
  const handleChangeIndex = useCallback(
    (newIndex: number): void => {
      setCurrent(newIndex);
      if (onItemIdxChange) {
        onItemIdxChange(newIndex);
      }
    },
    [onItemIdxChange],
  );

  return (
    <div className="!absolute bottom-14 left-12 flex items-center gap-2">
      {media.map((itemMedia, index) => (
        <BorderGradient
          key={index}
          style={{
            margin: index === current ? "0px 26px" : "0px",
            transform: index === current ? "scale(1.6875)" : "scale(1)",
          }}
          variant={index === current ? "carouselItemActive" : "carouselItemInactive"}
          className="cursor-pointer transition-all duration-300"
        >
          <Card
            className={`flex h-[43px] w-[75px] content-center items-center border-0`}
            key={index}
            onClick={() => handleChangeIndex(index)}
          >
            <CardContent className="flex h-full w-full items-center justify-center border-0 p-0">
              <div
                className="h-full w-full bg-cover"
                style={{
                  backgroundImage: `url(${itemMedia})`,
                }}
              >
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      index !== current
                        ? "linear-gradient(107.56deg, #00000000 2.28%, #000000b3 84.92%)"
                        : "",
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </BorderGradient>
      ))}
    </div>
  );
};

export default CarouselGameMedia;
