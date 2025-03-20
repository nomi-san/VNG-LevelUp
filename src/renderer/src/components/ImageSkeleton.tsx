import { cn } from "@renderer/lib/utils";

const ImageSkeleton = ({ className }: { className?: string }): JSX.Element => {
  return (
    <img
      src="https://cdn-nexus.vnggames.com/assets/images/common/logo-loading.gif"
      alt="loading"
      className={cn("w-20", className)}
    ></img>
  );
};

export default ImageSkeleton;
