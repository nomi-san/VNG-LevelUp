import { useEffect, useRef } from "react";

const useIsUnmountedRef = () => {
  const isUnmounted = useRef(false);

  useEffect(() => {
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return isUnmounted;
};

export default useIsUnmountedRef;
