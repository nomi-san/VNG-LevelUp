import { CircleCheck, CircleEllipsis, Info, TriangleAlert } from "lucide-react";

import { useToast } from "@renderer/hooks/use-toast";
import { cn } from "@renderer/lib/utils";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  toastVariants,
  ToastViewport,
} from "./toast";

const iconVariants = {
  default: <CircleCheck className="min-h-4 min-w-4" />,
  error: <TriangleAlert className="min-h-4 min-w-4" />,
  success: <CircleCheck className="min-h-4 min-w-4" />,
  info: <Info className="min-h-4 min-w-4" />,
  warning: <CircleEllipsis className="min-h-4 min-w-4" />,
};

interface CustomToastProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "error" | "success" | "info" | "warning";
  className?: string;
}

export const CustomToast = ({
  title,
  description,
  action,
  variant,
  className,
}: CustomToastProps) => {
  return (
    <div className={cn(toastVariants({ variant }), className)}>
      <ToastItem title={title} description={description} action={action} variant={variant} />
    </div>
  );
};

const ToastItem = ({ title, description, action, variant }: CustomToastProps) => {
  return (
    <>
      {variant && iconVariants[variant] ? iconVariants[variant] : iconVariants["default"]}
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription variant={variant}>{description}</ToastDescription>}
      </div>
      {action}
    </>
  );
};
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} {...props}>
          <ToastItem
            title={title}
            description={description}
            action={action}
            variant={variant ?? "default"}
          />
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
