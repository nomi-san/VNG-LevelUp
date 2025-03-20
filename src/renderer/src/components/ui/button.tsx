import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@renderer/lib/utils";

import { BorderGradient, type BorderGradientProps } from "../BorderGradient";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-500 ease-linear focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-90 disabled:text-white/50",
  {
    variants: {
      variant: {
        gradient:
          "shadow-lg font-normal text-neutral-50 bg-[linear-gradient(92.38deg,_#F05C22_54.99%,_#F9BC2C_97.32%)] hover:bg-[linear-gradient(92.38deg,_#F05C22_2.38%,_#F9BC2C_97.32%)] hover:border-yellow-300 hover:shadow-none disabled:bg-neutral-800 disabled:bg-[linear-gradient(92.38deg,_#f05c2299_54.99%,_#f9bc2c99_97.32%)] focus:bg-[linear-gradient(92.38deg,_#F05C22_2.38%,_#F9BC2C_97.32%)]",
        solid:
          "font-normal text-neutral-50 bg-orange-500 hover:bg-orange-400 disabled:bg-neutral-800 disabled:text-neutral-500 focus:bg-orange-400",
        outline:
          "font-normal text-neutral-50 bg-neutral-800 border border-neutral-500 hover:bg-neutral-600 hover:border-neutral-400 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-none focus:bg-neutral-600 focus:border-none",
        subtle:
          "font-normal text-neutral-50 bg-[#2F323780] hover:bg-[#FFFFFF26] disabled:bg-[#2F323780] disabled:text-neutral-500 backdrop-blur",
        ghost:
          "font-normal text-neutral-50 bg-transparent hover:bg-[#FFFFFF26] disabled:bg-[#2F323799] disabled:text-neutral-500",
        destructive:
          "font-normal text-neutral-50 bg-red-500 hover:bg-red-400 disabled:text-neutral-500",
        minigame:
          "font-normal text-neutral-50 bg-[linear-gradient(90deg,_#f05c223f_0%,_#f05c227f_50%,_#f05c2200_100%)] border border-orange-300",
        rating: "caption-12-regular border-0 bg-neutral-600 text-white",
        ratingHover: "caption-12-regular border-0 bg-neutral-900 text-white",
        white:
          "text-neutral-900 bg-white hover:text-neutral-500 hover:solid-shadow-drop disabled:bg-[#FFFFFFCC] disabled:text-neutral-500",
        default: "border-none bg-none",
      },
      size: {
        xl: "h-14 rounded-lg px-4 body-14-regular",
        lg: "h-10 rounded-lg px-4 body-14-regular",
        md: "h-8 rounded-lg px-2 body-14-regular",
        sm: "h-6 rounded px-1 caption-12-regular",
        "icon-xl": "h-14 w-14 p-3 rounded-lg",
        "icon-lg": "h-10 w-10 p-[10px] rounded-lg",
        "icon-md": "h-8 w-8 p-[6px] rounded-lg",
        "icon-sm": "h-7 w-7 p-[6px] rounded-lg",
        rating: "h-8 w-8 p-1 rounded-lg",
        ratingHover: "h-[30px] w-[30px] p-1 rounded-lg",
        downloadCTA: "rounded-lg",
        default: "h-full w-full rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  borderGradientSize?: BorderGradientProps["size"];
}

type BorderButtonStyle = {
  borderRounded: string;
  height?: number;
  width?: number;
};

const getStyles = (
  size: ButtonProps["size"],
  borderGradientSize: BorderGradientProps["size"],
): BorderButtonStyle => {
  const defaultStyles: Record<Exclude<ButtonProps["size"], null | undefined>, BorderButtonStyle> = {
    xl: {
      borderRounded: "rounded-2xl",
      height: 56,
    },
    lg: {
      borderRounded: "rounded-xl",
      height: 40,
    },
    md: {
      borderRounded: "rounded-lg",
      height: 32,
    },
    sm: {
      borderRounded: "rounded-md",
      height: 24,
    },
    "icon-xl": {
      borderRounded: "rounded-2xl",
      height: 56,
      width: 56,
    },
    "icon-lg": {
      borderRounded: "rounded-xl",
      height: 40,
      width: 40,
    },
    "icon-md": {
      borderRounded: "rounded-lg",
      height: 32,
      width: 32,
    },
    "icon-sm": {
      borderRounded: "rounded-md",
      height: 28,
      width: 28,
    },
    rating: {
      borderRounded: "rounded-lg",
      height: 32,
      width: 32,
    },
    ratingHover: {
      borderRounded: "rounded-lg",
      height: 30,
      width: 30,
    },
    downloadCTA: {
      borderRounded: "rounded-lg",
      height: 48,
    },
    default: {
      borderRounded: "none",
    },
  };
  const borderRounded = size ? defaultStyles[size].borderRounded : "rounded-lg";
  const height =
    size && borderGradientSize && defaultStyles[size].height
      ? defaultStyles[size].height - borderGradientSize * 2
      : undefined;
  const width =
    size && borderGradientSize && defaultStyles[size].width
      ? defaultStyles[size].width - borderGradientSize * 2
      : undefined;
  return { borderRounded, height, width };
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, borderGradientSize = 1, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const {
      borderRounded,
      height: heightStyleWithBorderGradient,
      width: widthStyleWithBorderGradient,
    } = getStyles(size, borderGradientSize);
    return !asChild && variant === "gradient" ? (
      <BorderGradient
        className={`${borderRounded} neutral-bottom-20`}
        variant={props.disabled ? "buttonDisableGradient" : "buttonGradient"}
        size={borderGradientSize}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          style={{
            ...(heightStyleWithBorderGradient
              ? { height: `${heightStyleWithBorderGradient}px` }
              : {}),
            ...(widthStyleWithBorderGradient ? { width: `${widthStyleWithBorderGradient}px` } : {}),
          }}
          {...props}
        />
      </BorderGradient>
    ) : !asChild && variant === "ratingHover" ? (
      <BorderGradient
        className={`${borderRounded} shadow-drop-orange`}
        variant="ratingActive"
        size={borderGradientSize}
      >
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
      </BorderGradient>
    ) : (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
