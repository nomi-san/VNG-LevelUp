import * as React from "react";

import { cn } from "@renderer/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "body-14-regular flex min-h-[80px] w-full resize-none rounded-md border-none bg-neutral-600 px-3 py-2 !placeholder-neutral-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-80",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
