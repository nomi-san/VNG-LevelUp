export interface LocalRedeemCodeInfo {
  code: string;
  redeemedAt: "not_played_game_yet" | "not_redeemed" | number;
}

export interface SetRedeemCodeInfo {
  code: string;
  gameClientId: string;
}

export enum RedeemCodeState {
  NO_EVENT_AVAILABLE = 0,
  EVENT_IS_ON_GOING = 1,
  EVENT_ENDED = 2,
}
export interface RemoteRedeemCodeInfo {
  state: RedeemCodeState;
  href: string;
}

export type RedeemErrorCode = (typeof RedeemErrorCodes)[keyof typeof RedeemErrorCodes];

export const RedeemErrorCodes = {
  "-44": "CODE_DOES_NOT_EXIST",
  "-45": "CODE_EXPIRED",
  "-46": "CODE_ALREADY_USED",
  "-47": "CODE_ALREADY_USED_BY_YOU_BUT_YOU_CAN_SHARE",
  "-48": "CODE_ALREADY_USED_BY_YOU",
  "-50": "ROLE_DOES_NOT_EXIST_OR_IS_NOT_ONLINE",
  "-55": "CODE_REACHED_REDEMPTION_LIMIT",
  "-505": "UNSUCCESSFUL",
  "-51": "CHARACTER_INFORMATION_NOT_FOUND",
  "-52": "ACCOUNT_IS_LOCKED",
  "-53": "INVALID_CODE",
  "-54": "DATA_NOT_FOUND",
  "-6": "UNSUCCESSFUL",
  "1002": "CHARACTER_INFORMATION_NOT_FOUND",
  "2106": "CODE_DOES_NOT_EXIST",
  "2107": "CODE_EXPIRED",
  "2108": "CODE_ALREADY_USED",
  "2109": "CODE_ALREADY_USED_BY_YOU_BUT_YOU_CAN_SHARE",
  "2110": "CODE_ALREADY_USED_BY_YOU_OR_SOMEONE_ELSE",
  "2105": "ROLE_DOES_NOT_EXIST_OR_IS_NOT_ONLINE",
  "2117": "CODE_REACHED_REDEMPTION_LIMIT",
  "2112": "UNSUCCESSFUL",
  "2113": "CHARACTER_INFORMATION_NOT_FOUND",
  "2114": "ACCOUNT_IS_LOCKED",
  "2115": "INVALID_CODE",
  "2116": "DATA_NOT_FOUND",
  "2111": "UNSUCCESSFUL",
  "2118": "UNSUCCESSFUL",
  "2119": "INVALID_CODE",
  "2120": "GIFT_RECEIVING_ERROR",
  "2121": "YOU_HAVE_EXCEEDED_THE_NUMBER_OF_REDEMPTIONS_FOR_THIS_CODE_TYPE",
  "2122": "GIFT_RECEIVING_ERROR",
  "2126": "CODE_DOES_NOT_APPLY_TO_YOUR_SERVER",
  "2127": "CODE_ALREADY_USED_BY_YOU_BUT_YOU_CAN_SHARE",
  UNSUCCESSFUL: "UNSUCCESSFUL",
} as const;

export const makeRedeemErrorCode = (code: number): RedeemErrorCode => {
  const stringCode = code.toString();

  return RedeemErrorCodes[stringCode] ?? "UNSUCCESSFUL";
};
