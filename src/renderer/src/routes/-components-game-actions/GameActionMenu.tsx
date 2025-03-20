import { Ellipsis, Trash } from "lucide-react";
import { useState } from "react";

import createShortcutIcon from "@renderer/assets/download/shortcut.svg";
import { Button, type ButtonProps } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu";
import { useInvalidateQueryLocalGameIds } from "@renderer/hooks/useGetLocalGameIds";
import { useInvalidateQueryLocalGameInfo } from "@renderer/hooks/useGetLocalGameInfo";
import { cn } from "@renderer/lib/utils";

import type { DetailsPageGameInfo } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

import { useTracking } from "../../analytics";
import useGameActions from "../../hooks/useGameActions";
import useToast from "../../hooks/useToast";
import { useTranslation } from "../../i18n/useTranslation";

const FAKE_UNINSTALL_TIMER = 3000;
export const GameActionMenu = ({
  remoteGameInfo,
  className,
  gameUpdateInfo,
  isUninstalling,
  setIsUninstalling,
}: {
  remoteGameInfo: DetailsPageGameInfo;
  buttonStyle?: ButtonProps;
  className?: string;
  gameUpdateInfo: GameUpdateInfo;
  isUninstalling: boolean;
  setIsUninstalling: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const { track } = useTracking();
  const { shouldDisablePlay } = useGameActions(
    remoteGameInfo.id,
    remoteGameInfo.authType,
    remoteGameInfo.metadata,
    gameUpdateInfo,
  );

  const [isUninstallDialogOpen, setIsUninstallDialogOpen] = useState(false);
  const { invalidateQueryLocalGameInfo } = useInvalidateQueryLocalGameInfo();
  const { invalidateQueryLocalGameIds } = useInvalidateQueryLocalGameIds();
  const { toast } = useToast();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-full" asChild>
          <Button
            variant="white"
            size="downloadCTA"
            className={cn("h-full w-14 min-w-14 border-l-2 border-l-neutral-200", className)}
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={shouldDisablePlay}
              onClick={() => {
                track({
                  name: "uninstall_game_init",
                  payload: {
                    gameId: remoteGameInfo.id,
                  },
                });
                setIsUninstallDialogOpen(true);
              }}
            >
              <Trash className="mr-2 h-4 w-4" strokeWidth={3} />
              {t("actions.uninstallGame")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.api.game_createShortcut(remoteGameInfo);
                toast.success(t("success.createShortcut"));
              }}
            >
              <img src={createShortcutIcon} className="mr-2 h-4 w-4" />
              {t("actions.createShortcut")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={isUninstallDialogOpen}
        onOpenChange={() => setIsUninstallDialogOpen((isOpen) => !isOpen)}
      >
        <DialogContent className="w-[450px] rounded-xl bg-neutral-800">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <div className="!mb-6">
              <div className="mb-5 flex flex-col items-center justify-center">
                <img
                  src="https://cdn-nexus.vnggames.com/assets/images/common/uninstall.svg"
                  alt={"Login Dialog"}
                  className="h-56 w-56"
                />
              </div>
              <p className="heading-4 mb-2">
                {t("uninstall.title", { title: remoteGameInfo.title })}
              </p>
              <p className="body-14-regular text-neutral-300">
                {t("uninstall.description", { title: remoteGameInfo.title })}
              </p>
            </div>

            <DialogFooter className="flex-row justify-end">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                disabled={isUninstalling}
                onClick={async () => {
                  track({
                    name: "uninstall_game_confirm",
                    payload: { gameId: remoteGameInfo.id },
                  });
                  setIsUninstalling(true);
                  const result = await window.api.game_uninstallGame({
                    title: remoteGameInfo.title,
                    gameClientId: remoteGameInfo.id,
                  });
                  if (!result) {
                    toast.error(t("error.unknown.title"));
                    return;
                  }

                  setIsUninstallDialogOpen(false);

                  setTimeout(async () => {
                    await invalidateQueryLocalGameInfo(remoteGameInfo.id);

                    await invalidateQueryLocalGameIds();

                    setIsUninstalling(false);
                    toast.success(t("success.uninstallGame", { title: remoteGameInfo.title }));
                  }, FAKE_UNINSTALL_TIMER);
                }}
              >
                {t("actions.uninstallGame")}
              </Button>
              <Button
                className="px-7"
                type="button"
                variant="white"
                size="lg"
                borderGradientSize={0.8}
                onClick={() => setIsUninstallDialogOpen(false)}
              >
                {t("actions.back")}
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
