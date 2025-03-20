import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";

type HoverSidebarItemPopoverProps = {
  children: React.ReactNode;
  content: React.ReactNode;
};
export const HoverSidebarItemWrapper = ({
  children,
  content,
}: HoverSidebarItemPopoverProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <div onMouseOver={() => setIsOpen(true)} onMouseOut={() => setIsOpen(false)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={`subtle-text ml-2 flex h-[42px] w-auto items-center justify-center rounded-md bg-neutral-800 p-0 px-[13px]`}
        side="right"
        align="center"
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};
