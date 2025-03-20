import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import type { MediaItem } from "@src/types/game";

import ImgWithSkeleton from "./skeleton/ImageWithSkeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

type ImagePreviewProp = {
  mediaItems: MediaItem[];
  focusImgIdx: number;
  className: string;
};
export default function ImagePreview({
  mediaItems,
  focusImgIdx,
  className,
}: ImagePreviewProp): JSX.Element {
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        {/* ImgWithSkeleton can't receive a ref, so we need to wrap it in a div */}
        <div>
          <ImgWithSkeleton loading="lazy" src={mediaItems[focusImgIdx].url} className={className} />
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] max-w-[80vw] items-center justify-center rounded-lg p-0 [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <div className="h-full w-full rounded-lg">
          <Carousel
            className="w-full rounded-lg"
            orientation="horizontal"
            opts={{ startIndex: focusImgIdx }}
          >
            <CarouselContent className="ml-0">
              {mediaItems.map(({ url }, index) => (
                <CarouselItem key={index} className="rounded-lg pl-0">
                  <img loading="lazy" key={index} src={url} className="rounded-lg" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
