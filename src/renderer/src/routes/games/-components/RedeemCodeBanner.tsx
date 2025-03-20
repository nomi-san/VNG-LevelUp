import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { redeemQueryOptions } from "@renderer/apis/redeem";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { Label } from "@renderer/components/ui/label";
import { CustomToast } from "@renderer/components/ui/toaster";
import useCustomerSupportUrl from "@renderer/hooks/useCustomerSupportUrl";
import { useSubscribeToGameStart } from "@renderer/hooks/useGameStateSubscribers";
import useGetLocalRedeemCodeInfo, {
  useInvalidateLocalRedeemCodeInfo,
} from "@renderer/hooks/useGetRedeemCodeInfo";
import Trans from "@renderer/i18n/Trans";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import type { GameClientId } from "@src/types/game";
import { makeRedeemErrorCode, RedeemCodeState, type RemoteRedeemCodeInfo } from "@src/types/redeem";

// move to i18n later
const redeemCodeImages = {
  banner: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_banner.png",
  intro: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_intro.png",
  welcome: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_welcome.png",
  success: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_success.jfif",
  fail: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_fail.jfif",
  btn: "https://cdn-nexus.vnggames.com/assets/images/common/redeem_code_btn.png",
};

type RedeemCodeEvent = {
  type: "REDEEM_CODE";
  status: "FAILED" | "SUCCESS";
  errorCode: number;
  serverId: string;
  roleId: string;
  itemId: string;
  gameCode: string;
  profileId: string;
  nextUrl: string;
};
// sample message
// {
//    "type": "REDEEM_CODE",
//    "status": "FAILED", // FAILED | SUCCESS
//    "errorCode": 2105, // only fail case
//    "serverId": "0",
//    "roleId": "qweqweqwe",
//    "itemId": "1329120441947710803",
//    "gameCode": "622",
//    "profileId": "3ee92d648c993981",
//    "nextUrl": "this.is.redirect.url" // env test
//}

const RedeemCodeTrigger = () => {
  return <img src={redeemCodeImages.btn} alt="" className="max-w-[259px] cursor-pointer" />;
};

const RedeemDialogContent = ({
  imageUrl,
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onClickPrimaryButton,
  onClickSecondaryButton,
}: {
  imageUrl: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  onClickPrimaryButton: () => void;
  onClickSecondaryButton?: () => void;
}) => {
  return (
    <div>
      <ImgWithSkeleton
        src={imageUrl}
        alt=""
        className="m-auto h-[224px] w-[448px] rounded-t-xl"
      ></ImgWithSkeleton>
      <div className="p-6">
        <p className="heading-4 mb-1">{title}</p>
        <Label className="body-14-regular whitespace-pre-line">{description}</Label>
        <DialogFooter>
          <div className="mt-4 flex gap-2">
            {onClickSecondaryButton ? (
              <DialogTrigger asChild>
                <Button className=" " variant="subtle" size="lg" onClick={onClickSecondaryButton}>
                  {secondaryButtonText}
                </Button>
              </DialogTrigger>
            ) : null}
            <Button
              className="!font-bold uppercase"
              variant="white"
              size="lg"
              onClick={onClickPrimaryButton}
            >
              {primaryButtonText}
            </Button>
          </div>
        </DialogFooter>
      </div>
    </div>
  );
};

const RedeemingIframeDialog = ({
  remoteRedeemInfo,
  gameClientId,
  onRedeemSuccess,
  defaultIframeOpen,
}: {
  remoteRedeemInfo: RemoteRedeemCodeInfo;
  gameClientId: GameClientId;
  onRedeemSuccess: () => void;
  defaultIframeOpen: boolean;
}): JSX.Element => {
  const { t } = useTranslation();
  const [redeemErrorCodeNumber, setRedeemErrorCodeNumber] = useState<number | null>(null);
  const redeemErrorCode =
    redeemErrorCodeNumber !== null ? makeRedeemErrorCode(redeemErrorCodeNumber) : "";
  const [isOpenIframeDialog, setIsOpenIframeDialog] = useState(defaultIframeOpen);
  const { csUrl } = useCustomerSupportUrl();

  useEffect(() => {
    const listener = async (event: MessageEvent<RedeemCodeEvent>) => {
      if (event.data.status === "FAILED") {
        setRedeemErrorCodeNumber(event.data.errorCode);
        return;
      }

      if (event.data.status === "SUCCESS") {
        await window.api.redeem_redeemCode({
          code: remoteRedeemInfo.href,
          gameClientId: gameClientId,
        });
        onRedeemSuccess();
      }
    };
    window.addEventListener("message", listener);
    return () => {
      window.removeEventListener("message", listener);
    };
  }, [remoteRedeemInfo, gameClientId, onRedeemSuccess, t]);

  return (
    <Dialog
      open={isOpenIframeDialog}
      onOpenChange={(open) => {
        setIsOpenIframeDialog(open);
        if (!open) {
          setRedeemErrorCodeNumber(null);
        }
      }}
    >
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogTrigger>
        <RedeemCodeTrigger />
      </DialogTrigger>
      <DialogContent className="max-w-[448px] p-0" closeBtnVariant="black">
        <div className="theme-light w-[448px] overflow-hidden rounded-2xl bg-white">
          <p className="heading-4 flex h-14 items-center justify-center text-black">
            {t("redeemCodeFirstReleaseCampaign.iframeTitle")}
          </p>
          <iframe className="h-[490px] w-full" src={remoteRedeemInfo.href}></iframe>
          {redeemErrorCode ? (
            <div className="px-3 pb-2">
              <CustomToast
                title={
                  t(`redeemCodeErrors.${redeemErrorCode}.title`) + ` (${redeemErrorCodeNumber})`
                }
                description={
                  <Trans
                    i18nKey={`redeemCodeErrors.${redeemErrorCode}.subTitle`}
                    components={{
                      underline: (
                        <span
                          className="cursor-pointer underline"
                          onClick={() => {
                            window.api.app_openExternalWeb(csUrl);
                          }}
                        />
                      ),
                    }}
                  ></Trans>
                }
                variant="error"
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RedeemSuccessDialog = ({
  onClickPlayNowOrQuit,
}: {
  onClickPlayNowOrQuit: () => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const [isOpenSuccessDialog, setIsOpenSuccessDialog] = useState(true);
  return (
    <Dialog
      open={isOpenSuccessDialog}
      onOpenChange={(open) => {
        setIsOpenSuccessDialog(open);
        if (!open) {
          onClickPlayNowOrQuit();
        }
      }}
    >
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogTrigger>
        <RedeemCodeTrigger />
      </DialogTrigger>
      <DialogContent className="max-w-[448px] p-0">
        <RedeemDialogContent
          imageUrl={redeemCodeImages.success}
          title={t("redeemCodeFirstReleaseCampaign.success.title")}
          description={t("redeemCodeFirstReleaseCampaign.success.description")}
          primaryButtonText={t("redeemCodeFirstReleaseCampaign.success.primaryButtonText")}
          onClickPrimaryButton={() => {
            setIsOpenSuccessDialog(false);
            onClickPlayNowOrQuit();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const RedeemIntroDialog = ({
  onClick,
  onClose,
}: {
  onClick: () => void;
  onClose: () => void;
}): JSX.Element => {
  const [isOpenIntroDialog, setIsOpenIntroDialog] = useState(true);
  const { t } = useTranslation();
  return (
    <Dialog
      open={isOpenIntroDialog}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setIsOpenIntroDialog(false);
        }
      }}
    >
      <VisuallyHidden>
        <DialogTitle></DialogTitle>
      </VisuallyHidden>
      <DialogTrigger>
        <RedeemCodeTrigger />
      </DialogTrigger>
      <DialogContent className="max-w-[448px] p-0">
        <RedeemDialogContent
          imageUrl={redeemCodeImages.welcome}
          title={t("redeemCodeFirstReleaseCampaign.mainTitle")}
          description={t("redeemCodeFirstReleaseCampaign.mainDescription")}
          primaryButtonText={t("redeemCodeFirstReleaseCampaign.redeemCode")}
          onClickPrimaryButton={onClick}
        />
      </DialogContent>
    </Dialog>
  );
};

const RedeemCodeBanner = ({ gameClientId }: { gameClientId: GameClientId }): JSX.Element => {
  const { t } = useTranslation();

  const invalidateLocalRedeemCodeInfo = useInvalidateLocalRedeemCodeInfo(gameClientId);
  const { data: localRedeemCodeInfo, isLoading: isLoadingLocalRedeemInfo } =
    useGetLocalRedeemCodeInfo(gameClientId);

  const { language } = useLanguageProvider();
  const { guestId, launcherUser } = useSessionProvider();
  const userHasRedeemedCode = typeof localRedeemCodeInfo?.redeemedAt === "number";
  const { data: remoteRedeemInfo, isFetching: isFetchingRemoteRedeemInfo } = useQuery(
    redeemQueryOptions(
      {
        language,
        userId: launcherUser?.userId,
        guestId,
        gameClientId,
      },
      !userHasRedeemedCode,
    ),
  );

  const shouldNotEnableRedeem =
    isLoadingLocalRedeemInfo ||
    isFetchingRemoteRedeemInfo ||
    !localRedeemCodeInfo ||
    !remoteRedeemInfo ||
    remoteRedeemInfo.state !== RedeemCodeState.EVENT_IS_ON_GOING;

  const { addGameStartSubscriber } = useSubscribeToGameStart(gameClientId);
  const [redeemStatus, setRedeemStatus] = useState<"intro" | "iframe" | "success">("iframe");
  const [defaultIframeOpen, setDefaultIframeOpen] = useState(false);
  useEffect(() => {
    if (shouldNotEnableRedeem) return;
    if (localRedeemCodeInfo.redeemedAt === "not_redeemed") return;

    return addGameStartSubscriber(async () => {
      await window.api.redeem_userPlayGameToRedeem({ clientId: gameClientId });
      await invalidateLocalRedeemCodeInfo();
      setRedeemStatus("intro");
    });
  }, [
    addGameStartSubscriber,
    gameClientId,
    invalidateLocalRedeemCodeInfo,
    localRedeemCodeInfo?.redeemedAt,
    shouldNotEnableRedeem,
    redeemStatus,
  ]);

  if (shouldNotEnableRedeem) return <></>;

  if (localRedeemCodeInfo.redeemedAt === "not_played_game_yet") {
    return (
      <>
        <Dialog>
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
          </VisuallyHidden>
          <DialogTrigger asChild>
            <img src={redeemCodeImages.banner} alt="" className="h-[125px]"></img>
          </DialogTrigger>
          <DialogContent className="max-w-[448px]">
            <div>
              <img
                src={redeemCodeImages.intro}
                alt=""
                className="m-auto h-[217px] w-[217px] py-2"
              ></img>
              <p className="heading-4 mb-1">{t("redeemCodeFirstReleaseCampaign.introTitle")}</p>
              <Label className="body-14-regular whitespace-pre-line">
                {t("redeemCodeFirstReleaseCampaign.introDescription")}
              </Label>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (localRedeemCodeInfo.redeemedAt === "not_redeemed") {
    if (redeemStatus === "intro") {
      return (
        <RedeemIntroDialog
          onClick={() => {
            setRedeemStatus("iframe");
            setDefaultIframeOpen(true);
          }}
          onClose={() => {
            setRedeemStatus("iframe");
          }}
        />
      );
    } else if (redeemStatus === "iframe") {
      return (
        <RedeemingIframeDialog
          gameClientId={gameClientId}
          remoteRedeemInfo={remoteRedeemInfo}
          onRedeemSuccess={() => {
            setRedeemStatus("success");
          }}
          defaultIframeOpen={defaultIframeOpen}
        />
      );
    } else if (redeemStatus === "success") {
      return (
        <RedeemSuccessDialog
          onClickPlayNowOrQuit={() => {
            void invalidateLocalRedeemCodeInfo();
          }}
        />
      );
    }
  }

  return <></>;
};

export default RedeemCodeBanner;
