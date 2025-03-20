import { useCallback } from "react";

const useWebviewArranger = () => {
  const onFocusAppNavBar = useCallback((focus: boolean): void => {
    void window.api.webViewFocus({
      action: focus ? "focusAppMenu" : "unfocusAppMenu",
    });
  }, []);

  return { onFocusAppNavBar };
};

export default useWebviewArranger;
