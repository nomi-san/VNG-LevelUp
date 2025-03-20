import gamePad from "@renderer/assets/download/game-pad.svg";
import { Button, type ButtonProps } from "@renderer/components/ui/button";
import useGameActions from "@renderer/hooks/useGameActions";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { cn } from "@renderer/lib/utils";

import type { DetailsPageGameInfo } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

const PlayButton = ({
  remoteGameInfo,
  size,
  className,
  gameUpdateInfo,
}: {
  remoteGameInfo: DetailsPageGameInfo;
  size?: ButtonProps["size"];
  className?: string;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element => {
  const { t } = useTranslation();

  const { play, shouldDisablePlay, textShouldDisablePlay } = useGameActions(
    remoteGameInfo.id,
    remoteGameInfo.authType,
    remoteGameInfo.metadata,
    gameUpdateInfo,
  );

  return (
    <Button
      variant="white"
      size={size ? size : "lg"}
      className={cn("grow !font-bold uppercase", className)}
      onClick={() => play("play_button")}
      disabled={shouldDisablePlay}
    >
      <img src={gamePad} className="mr-2 h-6 w-6" />
      {shouldDisablePlay ? textShouldDisablePlay : t("actions.playNow")}
    </Button>
  );
};

export default PlayButton;
