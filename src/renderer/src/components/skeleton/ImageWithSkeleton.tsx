import { useState, type ImgHTMLAttributes } from "react";

import { cn } from "@renderer/lib/utils";

import { Skeleton } from "../ui/skeleton";

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  skeletonClass?: string;
}

const ImgWithSkeleton = ({
  src,
  alt,
  skeletonClass,
  className,
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      {!isLoaded && <Skeleton className={cn("h-full w-full", skeletonClass)} />}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${isLoaded ? "h-full w-full opacity-100" : "h-0 w-0 opacity-0"}`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ImgWithSkeleton;
