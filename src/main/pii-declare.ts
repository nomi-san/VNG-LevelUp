import { type WebContentsView } from "electron";

import {
  FROM_NODE_PII_DECLARE_SUCCESSFULLY,
  FROM_NODE_TRIGGER_PII_DECLARE,
} from "@src/const/events";
import type { PiiUrlNoti } from "@src/types/pii";

export const notifyRendererToTriggerPiiDeclare = (appContentView: WebContentsView, url: string) => {
  const payload: PiiUrlNoti = {
    url,
  };
  appContentView.webContents.send(FROM_NODE_TRIGGER_PII_DECLARE, payload);
};

export const notifyRendererToPiiDeclareSuccessful = (appContentView: WebContentsView) => {
  appContentView.webContents.send(FROM_NODE_PII_DECLARE_SUCCESSFULLY);
};
