import { type VariantProps } from "class-variance-authority";
import { CircleCheck, CircleEllipsis, Info, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

import { ToastAction, type actionVariants } from "./toast";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          error: "!bg-red-700 border !border-red-300",
          success: "!bg-green-700 border !border-green-300",
          info: "!bg-blue-800 border !border-blue-300",
          warning: "!bg-yellow-700 border !border-yellow-300",
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg  p-3 top-[36px] body-14-regular rounded-lg",
          description: "group-[.toast]:text-muted-foreground opacity-90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          title: "body-14-regular",
        },
      }}
      icons={{
        error: <TriangleAlert className="h-4 w-4" />,
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <CircleEllipsis className="h-4 w-4" />,
      }}
      duration={5000}
      position="top-center"
      {...props}
    />
  );
};

const CustomToasterAction = ({
  label,
  onClick,
  altText,
  variant,
}: {
  label: string;
  altText: string;
  onClick: () => void;
  variant: VariantProps<typeof actionVariants>["variant"];
}) => {
  return (
    <ToastAction variant={variant} className="ml-auto" altText={altText} onClick={onClick}>
      {label}
    </ToastAction>
  );
};

export { Toaster, CustomToasterAction };
