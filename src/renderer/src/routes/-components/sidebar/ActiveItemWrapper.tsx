import { type ReactNode } from "react";

type ActiveItemWrapperProps = {
  isActive?: boolean;
  children: ReactNode;
};
export const ActiveItemWrapper = ({
  isActive = false,
  children,
}: ActiveItemWrapperProps): JSX.Element => {
  return (
    <div
      className={`flex h-12 w-[60px] cursor-pointer ${!isActive ? "justify-center" : ""} items-center gap-1`}
    >
      {isActive && <div className="h-6 w-[3px] rounded-sm bg-orange-500"></div>}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-lg ${isActive ? "bg-neutral-600" : ""} hover:bg-neutral-800`}
        style={{ boxShadow: isActive ? "0px 0px 32px 0px #F05C22CC" : "" }}
      >
        {children}
      </div>
    </div>
  );
};
