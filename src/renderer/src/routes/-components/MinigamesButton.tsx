import { Gamepad2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { useTranslation } from "@renderer/i18n/useTranslation";

import type { Minigame } from "@src/types/minigames";

import { Button } from "../../components/ui/button";

export const MinigamesButton = (): JSX.Element => {
  const { t } = useTranslation();
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const getMinigames = async () => {
    const minigames = await window.api.minigames_getList();
    setMinigames(minigames);
  };

  useEffect(() => {
    void getMinigames();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="minigame" size="lg">
          <Gamepad2 className="mr-2" />
          {t("minigames.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("minigames.title")}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          {minigames.map((minigame) => (
            <Button
              key={minigame.id}
              onClick={() => {
                window.api.minigame_play(minigame.id);
              }}
            >
              {minigame.name}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
