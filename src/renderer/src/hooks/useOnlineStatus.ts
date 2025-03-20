import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";

const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const router = useRouter();
  const isUnmounted = useIsUnmountedRef();
  useEffect(() => {
    if (isUnmounted.current) return;

    const handleOnline = (): void => {
      void router.invalidate();
      window.api.app_reconnectToNetwork();
      setIsOnline(true);
    };
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return (): void => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router, isUnmounted]);

  return isOnline;
};

export default useOnlineStatus;
