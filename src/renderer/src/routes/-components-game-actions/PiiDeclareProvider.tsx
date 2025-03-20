import { Link } from "@tanstack/react-router";
import { useEffect, useState, type PropsWithChildren } from "react";

import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { useTranslation } from "@renderer/i18n/useTranslation";

import { FROM_NODE_TRIGGER_PII_DECLARE } from "@src/const/events";
import type { PiiUrlNoti } from "@src/types/pii";

export const PiiDeclareDialog = ({ children }: PropsWithChildren<object>) => {
  const [currentPiiUrl, setPiiUrl] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    return window.api.app_addListener(FROM_NODE_TRIGGER_PII_DECLARE, (_, { url }: PiiUrlNoti) => {
      setPiiUrl(url);
    });
  }, []);

  return (
    <>
      <Dialog
        open={Boolean(currentPiiUrl)}
        onOpenChange={() => {
          setPiiUrl("");
        }}
      >
        <DialogContent className="w-[450px] rounded-xl bg-neutral-800">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <div className="!mb-6">
              <div className="mb-5 flex flex-col items-center justify-center">
                <img
                  src="https://cdn-nexus.vnggames.com/assets/images/common/login-dialog.svg"
                  alt={"PII Dialog"}
                  className="h-56 w-56"
                />
              </div>
              <p className="heading-4 mb-2">{t("pii.dialog.title")}</p>
              <p className="body-14-regular text-neutral-300">{t("pii.dialog.description")}</p>
            </div>

            <DialogDescription></DialogDescription>
            <DialogFooter className="flex-row justify-end">
              <Link
                className="[&.active]:font-bold"
                to="/pii-declare"
                search={{
                  piiUrl: currentPiiUrl,
                }}
                onClick={() => {
                  setPiiUrl("");
                }}
              >
                <Button
                  type="button"
                  variant="white"
                  size="lg"
                  className="!font-bold uppercase"
                  onClick={() => {}}
                >
                  {t("pii.dialog.action")}
                </Button>
              </Link>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
};
