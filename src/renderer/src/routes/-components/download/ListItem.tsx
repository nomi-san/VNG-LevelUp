import { type ReactNode } from "react";

export const ListItem = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element => {
  return (
    <div className="select-none space-y-1 rounded-md no-underline outline-none transition-colors">
      <div className="body-14-regular mb-2">{title}</div>

      <div className="body-14-regular line-clamp-2 text-muted-foreground">{children}</div>
    </div>
  );
};
