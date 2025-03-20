import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";

import ErrorComponent from "@renderer/components/ErrorComponent";

function GameErrorComponent({ error }: ErrorComponentProps): JSX.Element {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);
  return (
    <ErrorComponent
      error={error}
      onRetry={() => {
        void router.invalidate();
      }}
    />
  );
}

export default GameErrorComponent;
