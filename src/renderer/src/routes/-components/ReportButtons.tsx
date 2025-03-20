import { Ellipsis, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu";
import useCustomerSupportUrl from "@renderer/hooks/useCustomerSupportUrl";
import useWebviewArranger from "@renderer/hooks/useWebviewArranger";
import { useTranslation } from "@renderer/i18n/useTranslation";

import { SettingDialogContent } from "./setting-dialog/SettingDialogContent";

const ReportButtons = (): JSX.Element => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOpenSettingDialog, setIsOpenSettingDialog] = useState(false);
  const { onFocusAppNavBar } = useWebviewArranger();
  const changeDropDown = (open): void => {
    setIsDropdownOpen(open);
    if (!isOpenSettingDialog) {
      onFocusAppNavBar(open);
    }
  };
  const changeSettingDialog = (open): void => {
    setIsOpenSettingDialog(open);
    onFocusAppNavBar(open);
  };
  const { t } = useTranslation();
  const { csUrl } = useCustomerSupportUrl();
  return (
    <>
      <Dialog open={isOpenSettingDialog} onOpenChange={changeSettingDialog}>
        <DialogContent className="h-[436px] max-h-[436px] w-[732px] max-w-[732px] p-0">
          <SettingDialogContent />
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
      <DropdownMenu open={isDropdownOpen} onOpenChange={changeDropDown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-md" className="flex items-center">
            <Ellipsis className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-28 mt-3 w-56 bg-neutral-800">
          <DropdownMenuItem
            className="flex h-10 cursor-pointer items-center focus:bg-neutral-600"
            onClick={() => {
              setIsOpenSettingDialog(true);
              onFocusAppNavBar(true);
            }}
          >
            <Settings className="mr-2 h-4 w-4" strokeWidth={2.5} />
            <span className="body-14-regular">{t("actions.setting")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex h-10 cursor-pointer items-center focus:bg-neutral-600"
            onClick={() => {
              window.api.app_openExternalWeb(csUrl);
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" strokeWidth={2.5} />
            <span className="body-14-regular">{t("actions.accessCusSupport")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ReportButtons;
