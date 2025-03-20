import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account(): JSX.Element {
  useLayoutEffect(() => {
    window.api.account_mount();
    return (): void => {
      window.api.account_unmount();
    };
  }, []);
  return <></>;
}
