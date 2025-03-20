import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@renderer/lib/utils";

const progressVariants = cva("flex-1 w-full h-full", {
  variants: {
    variant: {
      gray: "bg-neutral-700",
      gradient: "bg-gradient-to-br transition-all from-gradient-start to-gradient-end",
      red: "bg-rose-600",
      green: "bg-green-500",
      white: "bg-white",
    },
    size: {
      normal: "h-4",
      tiny: "h-1",
      download: "h-1.5",
    },
  },
  defaultVariants: {
    size: "normal",
  },
});

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  size: "normal" | "tiny" | "download";
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, variant, size, value, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-progress-background",
        progressVariants({ size }),
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressVariants({ variant, size }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
