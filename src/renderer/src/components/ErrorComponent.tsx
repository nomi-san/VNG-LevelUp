import { useTranslation } from "react-i18next";

import defaultErrorIcon from "@renderer/assets/default-error.svg";
import wirelessConnectionFailedIcon from "@renderer/assets/wireless-connection-failed.svg";

import { BaseFetchError, type ErrorCode } from "@src/const/error";

import { Button } from "./ui/button";

interface ErrorComponentProp {
  error: Error;
  buttonRetryText?: string;
  onRetry?: () => void;
}
function ErrorComponent({ error, buttonRetryText = "", onRetry }: ErrorComponentProp): JSX.Element {
  const { t } = useTranslation();
  let errorCode: ErrorCode = "unknown";

  if (error instanceof BaseFetchError) {
    switch (error.code) {
      case "connection_failed":
        errorCode = error.code;
        break;
      default:
        errorCode = "unknown";
        break;
    }
  }
  const renderBtnSubmitKey = (): string => {
    if (buttonRetryText) {
      return buttonRetryText;
    }
    return t("actions.reloadPage");
  };
  const renderIconError = (): string => {
    if (error instanceof BaseFetchError) {
      if (error.code == "connection_failed") {
        return wirelessConnectionFailedIcon;
      }
    }
    return defaultErrorIcon;
  };
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <img src={renderIconError()} alt={t("altLauncherLogoImg")} className="mb-4 w-52"></img>
      <p className="heading-4 mb-2 max-w-96 text-center">{t(`error.${errorCode}.title`)}</p>
      <p className="body-14-regular mb-8 max-w-96 text-center text-neutral-300">
        {t(`error.${errorCode}.subTitle`)}
      </p>
      {onRetry && (
        <Button variant="white" size="lg" onClick={onRetry} borderGradientSize={0.7}>
          {renderBtnSubmitKey()}
        </Button>
      )}
    </div>
  );
}

export default ErrorComponent;
