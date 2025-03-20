import { Skeleton } from "../ui/skeleton";

const HomeSkeleton = (): JSX.Element => {
  return (
    <div className="fixed inset-0 ml-[56px] mt-14 h-[calc(100vh-56px)] pl-[60px] pr-[56px]">
      <Skeleton className="mb-9 h-8 w-[348px]" />
      <div className="mb-16 flex flex-wrap justify-evenly gap-x-3 gap-y-8">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex flex-col gap-y-3">
              <Skeleton className="h-[200px] w-[355px]" />
              <div className="flex w-full gap-x-3">
                <Skeleton className="h-[42px] w-[42px] rounded-lg" />
                <div className="flex flex-col gap-y-2">
                  <Skeleton className="h-[14px] w-[113px] rounded-2xl" />
                  <Skeleton className="h-[20px] w-[294px] rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default HomeSkeleton;
