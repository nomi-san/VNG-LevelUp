import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@renderer/lib/utils";

const borderGradientVariants = cva(
  "rounded-md flex items-center justify-center overflow-hidden p-px",
  {
    variants: {
      variant: {
        buttonGradient: "bg-[linear-gradient(270deg,_#FFFFFF_0%,_#ffdc1758_60%,_#ffde1700_78.11%)]",
        buttonDisableGradient:
          "bg-[linear-gradient(270deg,_#ffffff99_0%,_#ffdc1758_60%,_#ffde1700_78.11%)]",
        gameItemActive:
          "bg-[linear-gradient(34.23deg,_#F69D7A_3.48%,_#C04A1B_18.6%,_#F69D7A_30.13%,_#DE5019_45.56%,_#F37D4E_71.55%,_#8F3614_87.3%)]",
        gameItemInactive:
          "bg-[linear-gradient(34.23deg,_#D6D8DC_3.48%,_#797B82_18.6%,_#C9CBCF_30.13%,_#75787D_45.56%,_#AEB3B6_71.55%,_#5C6168_87.3%)]",
        carouselItemActive:
          "bg-[linear-gradient(270deg,_#FFFFFF_0%,_#ffdc1755_50%,_#ffde1700_78.11%)]",
        carouselItemInactive: "bg-[linear-gradient(90deg,_#7B8895_0%,_#3F444B_50%,_#A7B1B9_100%)]",
        ratingActive: "bg-[linear-gradient(92.38deg,_#F05C22_54.99%,_#F9BC2C_97.32%)]",
      },
      size: {
        0.5: "p-[0.5px]",
        0.7: "p-[0.7px]",
        0.8: "p-[0.8px]",
        1: "p-px",
        1.1: "p-[1.1px]",
        2: "p-0.5",
      },
    },
    defaultVariants: {
      variant: "buttonGradient",
      size: 1,
    },
  },
);

export interface BorderGradientProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof borderGradientVariants> {}

export function BorderGradient({
  children,
  className,
  style,
  variant,
  size,
}: BorderGradientProps): JSX.Element {
  return (
    <div
      className={cn(borderGradientVariants({ variant, size, className }))}
      style={{
        ...style,
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-md"
        style={{ borderRadius: "inherit" }}
      >
        {children}
      </div>
    </div>
  );
}
