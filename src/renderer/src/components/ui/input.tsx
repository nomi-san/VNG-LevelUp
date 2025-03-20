import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@renderer/lib/utils";

const inputVariants = cva(
  "flex px-3 py-2 rounded-md body-14-regular border-none w-full bg-neutral-600 placeholder:text-neutral-300 focus-visible:outline-none focus-visible:border-2 focus-visible:border-solid focus-visible:border-neutral-200 disabled:cursor-not-allowed disabled:opacity-80 disabled:text-neutral-500",
  {
    variants: {
      customSize: {
        default: "h-10",
        medium: "h-8",
      },
    },
    defaultVariants: {
      customSize: "default",
    },
  },
);
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, customSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ customSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
