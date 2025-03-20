import errorIcon from "@renderer/assets/download/error.svg";
import checkIcon from "@renderer/assets/download/success.svg";
import { cn } from "@renderer/lib/utils";

import ImgWithSkeleton from "./skeleton/ImageWithSkeleton";

interface ImageProgressProp {
  progress: number;
  imageUrl: string;
  height: number;
  width: number;
  padding?: number;
  className?: string;
  showSuccess?: boolean;
  showFail?: boolean;
}
export default function ImageProgress({
  progress,
  imageUrl,
  height,
  width,
  padding = 0,
  showSuccess = false,
  showFail = false,
  className,
}: ImageProgressProp): JSX.Element {
  return (
    <div
      className={cn("relative cursor-pointer overflow-hidden bg-cover bg-center", className)}
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {showSuccess && progress === 100 && (
        <div className="absolute right-0 top-0 z-10">
          <img src={checkIcon} className="h-5 w-5" />
        </div>
      )}
      {showFail && (
        <div className="absolute right-[-2px] top-[-2px] z-10">
          <img src={errorIcon} className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "absolute inset-0 cursor-pointer overflow-hidden bg-inherit bg-cover bg-center grayscale",
        )}
        style={{
          clipPath: `inset(0px 0px 0px ${Math.round(width * (progress / 100))}px)`,
          height: `${height}px`,
          width: `${width}px`,
        }}
      ></div>
      <div
        className="absolute overflow-hidden bg-cover bg-center"
        style={{
          borderRadius: "inherit",
          inset: `${padding}px`,
        }}
      >
        <ImgWithSkeleton src={imageUrl} className="absolute inset-0" />
        <ImgWithSkeleton
          src={imageUrl}
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            clipPath: `inset(0px 0px 0px ${Math.round((width - padding * 2) * (progress / 100))}px)`,
          }}
        />
      </div>
    </div>
  );
}
