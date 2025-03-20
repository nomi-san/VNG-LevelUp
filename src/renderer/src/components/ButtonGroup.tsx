import React, { Children, cloneElement } from "react";

import { cn } from "@renderer/lib/utils";

import { buttonVariants, type ButtonProps } from "./ui/button";

interface ButtonGroupProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  seperatorColor?: string;
  children: React.ReactNode;
  size?: ButtonProps["size"];
}

export interface ButtonGroupChildrenExtraProps {
  isInButtonGroup?: boolean;
  className?: string;
  size?: ButtonProps["size"];
}

export const ButtonGroup = ({
  className,
  orientation = "horizontal",
  children,
  size = "default",
}: ButtonGroupProps) => {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        buttonVariants({ size }),
        "flex",
        {
          "flex-col": isVertical,
          "w-fit": isVertical,
        },
        className,
      )}
    >
      {Children.map(children, (child) => {
        if (!child) return null;
        if (!React.isValidElement(child)) return child;
        return cloneElement(child, {
          ...child.props,
          className: cn(child.props.className, "rounded-none px-0"),
          size,
          isInButtonGroup: true,
        });
      })}
    </div>
  );
};
