import type { RedeemErrorCode } from "@src/types/redeem";

export const redeemCodeErrors: Record<RedeemErrorCode, { title: string; subTitle: string }> = {
  CODE_DOES_NOT_EXIST: {
    title: "Không tìm thấy mã này!",
    subTitle:
      "Hãy kiểm tra lại hoặc liên hệ trang <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  CODE_EXPIRED: {
    title: "Mã đã hết hạn",
    subTitle: "Mã này không còn hiệu lực. Hãy kiểm tra lại hoặc thử mã khác nhé!",
  },
  CODE_ALREADY_USED: {
    title: "Mã đã sử dụng",
    subTitle: "Mã này chỉ được sử dụng một lần. Hãy thử nhập mã khác nhé!",
  },
  CODE_ALREADY_USED_BY_YOU_BUT_YOU_CAN_SHARE: {
    title: "Mã đã sử dụng",
    subTitle:
      "Bạn đã sử dụng mã này. Tuy nhiên, đây là mã có thể chia sẻ được cho bạn bè, hãy thử ngay nhé!",
  },
  CODE_ALREADY_USED_BY_YOU: {
    title: "Mã đã sử dụng",
    subTitle: "Mã này chỉ được sử dụng một lần. Hãy thử nhập mã khác nhé!",
  },
  ROLE_DOES_NOT_EXIST_OR_IS_NOT_ONLINE: {
    title: "ID nhân vật không hợp lệ",
    subTitle:
      "Hãy kiểm tra lại ID nhân vật hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  CODE_REACHED_REDEMPTION_LIMIT: {
    title: "Mã đã hết lượt",
    subTitle: "Mã này đã hết lượt sử dụng. Hãy thử nhập mã khác nhé!",
  },
  UNSUCCESSFUL: {
    title: "Thất bại",
    subTitle: "",
  },
  CHARACTER_INFORMATION_NOT_FOUND: {
    title: "Không tìm thấy nhân vật",
    subTitle:
      "Hãy kiểm tra lại thông tin nhân vật hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  CODE_ALREADY_USED_BY_YOU_OR_SOMEONE_ELSE: {
    title: "Mã đã sử dụng",
    subTitle: "Mã này chỉ được sử dụng một lần. Hãy thử nhập mã khác nhé!",
  },
  ACCOUNT_IS_LOCKED: {
    title: "Tài khoản bị khóa",
    subTitle: "Vui lòng liên hệ <underline>VNGGames Support</underline> để được hỗ trợ nhé!",
  },
  INVALID_CODE: {
    title: "Mã sai định dạng",
    subTitle:
      "Hãy kiểm tra lại mã bạn đang nhập hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  DATA_NOT_FOUND: {
    title: "Không tìm thấy dữ liệu",
    subTitle:
      "Hãy kiểm tra lại thông tin bạn đang tìm kiếm hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  GIFT_RECEIVING_ERROR: {
    title: "Nhận quà thất bại",
    subTitle:
      "Đã có lỗi xảy ra. Hãy thử lại hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
  YOU_HAVE_EXCEEDED_THE_NUMBER_OF_REDEMPTIONS_FOR_THIS_CODE_TYPE: {
    title: "Mã đã hết lượt",
    subTitle: "Mã này đã hết lượt sử dụng. Hãy thử nhập mã khác nhé!",
  },
  CODE_DOES_NOT_APPLY_TO_YOUR_SERVER: {
    title: "Mã không hợp lệ trên máy chủ",
    subTitle:
      "Hãy kiểm tra lại server bạn đang sử dụng hoặc liên hệ <underline>VNGGames Support</underline> nếu cần hỗ trợ nhé!",
  },
};

export default redeemCodeErrors;
