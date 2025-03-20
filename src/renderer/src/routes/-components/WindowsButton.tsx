import { Minus, X } from "lucide-react";

import { Button } from "@renderer/components/ui/button";

const WindowButtons = (): JSX.Element => {
  const handleCloseButton = (): void => {
    void window.api.store_getCloseSetting().then((result) => {
      if (!result) return;
      if (result === "MINIMIZE_TO_TRAY") {
        window.api.app_minimizeToTray();
      } else if (result === "EXIT_LAUNCHER") {
        window.api.app_attemptToClose();
      }
    });
  };
  return (
    <>
      <Button variant="ghost" size="icon-md" onClick={() => window.api.app_minimize()}>
        <Minus className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon-md" onClick={handleCloseButton}>
        <X className="h-5 w-5" />
      </Button>
    </>
  );
};

export default WindowButtons;
