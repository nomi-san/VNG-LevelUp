import { redeemCodeErrors } from "@renderer/i18n/redeem";

import { type ErrorCode } from "@src/const/error";
import { type ProductAttributeSection } from "@src/types/game";
import type {
  DownloadStatus,
  InstallStatus,
  InterruptReason,
  UnzipInterruptReason,
} from "@src/types/system";

const downloadStatus: Record<DownloadStatus, string> = {
  initializing: "Đang bắt đầu tải",
  completed: "Tải xuống thành công",
  interrupted: "{{reason}}",
  progressing: "Còn lại {{remainingMinutes}} phút {{remainingSeconds}} giây",
  cancelled: "Đã hủy",
} as const;

const installStatus: Record<InstallStatus, string> = {
  Downloading: "Đang tải",
  Downloaded: "Đã tải, chờ giải nén",
  Unziping: "Đang giải nén",
  "Unzip Success": "Giải nén thành công",
  "Unzip Failed": "Giải nén thất bại: {{reason}}",
  "Valid File": "Tệp hợp lệ",
  "Invalid File": "Tệp không hợp lệ",
  "Game Info Set": "Đã thiết lập thông tin trò chơi",
  "Deeplink Registered": "Đã cài đặt thành công phiên bản {{version}}",
  "Removing Files": "Đang cập nhật game",
  "Removing Files Failed": "Cập nhật game bại",
  "Adding Files": "Đang cài đặt",
  "Adding Files Failed": "Cài đặt thất bại",
};

const interruptReason: Record<InterruptReason | UnzipInterruptReason, string> = {
  notEnoughSpaceForDownload: "Dung lượng còn lại không đủ để tải xuống",
  notEnoughSpaceForInstallation: "Dung lượng còn lại không đủ để cài đặt",
  notEnoughSpaceForUnzip: "Dung lượng còn lại không đủ để giải nén",
  unknown: "Đã có lỗi xảy ra. Vui lòng thử lại",
  pause: "Tạm dừng",
  "": "Lỗi server",
  serverError: "Lỗi server: {{reason}}",
};

const errorFetch: Record<
  ErrorCode,
  {
    title: string;
    subTitle: string;
  }
> = {
  unknown: {
    title: "Có lỗi xảy ra",
    subTitle: "Vui lòng tải lại trang hoặc thử lại sau",
  },
  connection_failed: {
    title: "Không có kết nối mạng",
    subTitle: "Vui lòng kiểm tra đường truyền của bạn và thử lại",
  },
  unauthorized: {
    title: "Không có quyền truy cập",
    subTitle: "Vui lòng đăng nhập để tiếp tục",
  },
  session_not_found: {
    title: "Không tìm thấy session",
    subTitle: "Vui lòng đăng nhập để tiếp tục",
  },
  state_not_identical: {
    title: "State không khớp",
    subTitle: "Vui lòng đăng nhập để tiếp tục",
  },
  invalid_request: {
    title: "Yêu cầu không hợp lệ",
    subTitle: "Vui lòng đăng nhập để tiếp tục",
  },
  server_error: {
    title: "Lỗi máy chủ",
    subTitle: "Vui lòng thử lại sau",
  },
  game_not_ok: {
    title: "Không lấy được thông tin game",
    subTitle: "Vui lòng thử lại sau",
  },
  games_not_ok: {
    title: "Không lấy được thông tin games",
    subTitle: "Vui lòng thử lại sau",
  },
  news_not_ok: {
    title: "Không lấy được thông tin news",
    subTitle: "Vui lòng thử lại sau",
  },
  banner_not_ok: {
    title: "Không lấy được thông tin banner",
    subTitle: "Vui lòng thử lại sau",
  },
  redeem_not_ok: {
    title: "Không lấy được thông tin redeem",
    subTitle: "Vui lòng thử lại sau",
  },
  gameUpdate_not_ok: {
    title: "Không lấy được thông tin gameUpdate",
    subTitle: "Vui lòng thử lại sau",
  },
  configs_not_ok: {
    title: "Không lấy được cấu hình",
    subTitle: "Vui lòng thử lại sau",
  },
  node_getGameSession_not_ok: {
    title: "Không lấy được thông tin session cho game",
    subTitle: "Vui lòng thử lại sau",
  },
  node_getLogout_not_ok: {
    title: "Logout không thành công",
    subTitle: "Vui lòng thử lại sau",
  },
  node_heartBeat_not_ok: {
    title: "Gửi heartbeat thất bại",
    subTitle: "Vui lòng thử lại sau",
  },
  node_postSession_not_ok: {
    title: "Trao đổi session thất bại",
    subTitle: "Vui lòng thử lại sau",
  },
  node_verifySession_not_ok: {
    title: "Verify session thất bại",
    subTitle: "Vui lòng thử lại sau",
  },
};

const prerequisiteSectionSubtitle: Record<ProductAttributeSection, string> = {
  minimum: "Tối thiểu",
  recommended: "Khuyên dùng",
  other: "Khác",
  social: "Mạng xã hội",
};

const vi = {
  download: {
    dialogTitle: "Tải xuống {{title}}",
    popupTitle: "Quá trình tải xuống",
    warnBeforeQuitTitle: "Quá trình tải xuống đang diễn ra",
    warnBeforeQuitDescription: "Quá trình tải xuống sẽ bị hủy nếu bạn đóng ứng dụng",
    quitApp: "Đóng ứng dụng",
    continueDownload: "Tiếp tục tải về",
    spaceRequired: "Dung lượng trống yêu cầu:",
    storageAvailable: "Dung lượng trống: ",
    estimatedTime: "Thời gian tải dự kiến:",
    chooseDir: "Chọn thư mục cài đặt",
    changeDir: "Chọn lại",
    start: "Bắt đầu tải",
    download: "Tải xuống",
    update: "Cập nhật",
    version: "phiên bản",
    downloading: "Đang tải",
    downloadingWithRemainingMinutes: "Còn lại {{remaining}} phút",
    downloadingWithRemainingSeconds: "Còn lại {{remaining}} giây",
    downloadingGames: "Đang tải {{count}} trò chơi",
    downloadedProgress: "Đã tải {{downloadedSize}} / {{totalSize}} ({{speed}}/s)",
    downloadedResult: "Đã tải {{downloadedSize}} của {{totalSize}}",
    unzipResult: "Đã giải nén {{unzippedSize}} của {{totalSize}}",
    paused: "Tạm dừng",
    cancel: "Hủy tải xuống",
    continue: "Tiếp tục",
    resumeDownload: "Tiếp tục tải",
    queued: "Đang đợi",
    noDownloads: "Bạn chưa tải gì cả",
    interruptReason: {
      ...interruptReason,
    },
    status: {
      ...downloadStatus,
    },
    installStatus: {
      ...installStatus,
    },
  },

  sideBar: {
    allGames: "Tất cả games",
    login: "Đăng nhập",
  },
  socialPlatform: {
    homepage: "Trang chủ",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "Tiktok",
    discord: "Discord",
    cs: "Hỗ trợ",
    youtube: "Youtube",
    reddit: "Reddit",
    facebook_group: "Group Facebook",
  },

  label: {
    downloaded: "Đã tải",
  },

  actions: {
    playNow: "Chơi Game",
    isPlaying: "Đang chơi",
    isOpeningGame: "Đang mở game",
    play: "Chơi",
    shopping: "Nạp game",
    retry: "Thử lại",
    checkGameDetails: "Thông tin game",
    login: "Đăng nhập",
    back: "Quay lại",
    forward: "Quay lại trang trước",
    continue: "Tiếp tục",
    logout: "Đăng xuất",
    manageAccount: "Quản lý tài khoản",
    skip: "Bỏ qua",
    uninstallGame: "Gỡ cài đặt game",
    reloadPage: "Tải lại trang",
    reportBug: "Báo cáo lỗi",
    setting: "Cài đặt",
    sendFeedback: "Gửi phản hồi",
    accessCusSupport: "Báo lỗi và Phản hồi",
    createShortcut: "Tạo phím tắt",
    isCheckingForUpdate: "Đang kiểm tra cập nhật",
    isDownloadingUpdate: "Đang tải cập nhật",
    isLoadingData: "Đang tải dữ liệu",
    copy: "Sao chép ID lỗi",
    copied: "Đã sao chép",
  },
  validation: {
    notEnoughStorage: "Không đủ dung lượng. Chọn thư mục khác để tải xuống.",
    cannotSelectRootDisk: "Tạo thư mục mới hoặc chọn ổ đĩa khác để tải xuống.",
  },
  uninstall: {
    title: "Gỡ cài đặt game {{title}}",
    description:
      "Level Up sẽ gỡ bỏ game {{title}} khỏi máy của bạn. Sau khi xóa, bạn sẽ phải tải lại để tiếp tục chơi.",
    progress: "Đang gỡ cài đặt",
  },
  game: {
    cardTitle: "Thông tin game",
    publisherName: "Nhà phát hành",
    developerName: "Nhà phát triển",
    publishDate: "Ngày phát hành",
    genre: "Thể loại",
    ageRestriction: "Độ tuổi",
    features: "Tính năng nổi bật",
    additionInfo: "Thông tin khác",
    seeMoreGameDetail: "Xem thêm thông tin game",
    prerequisite: {
      title: "Yêu cầu kĩ thuật",
      subTitle: {
        ...prerequisiteSectionSubtitle,
      },
      os: "Hệ điều hành",
      size: "Lưu trữ",
      gpu: "GPU",
      cpu: "CPU",
      directx: "DirectX",
      ram: "RAM",
    },
    estimatedDownloadTime: "{{minutes}} phút {{seconds}} giây",
    comingSoon: "Sắp ra mắt",
    outstanding: "Nổi bật",
    update: "Cập nhật",
    viewMoreNews: "Xem thêm tin tức",
    businessAddress: "Doanh nghiệp",
    license: "Giấy phép",
    hotline: "Hotline",
  },
  login: {
    dialog: {
      title: "Đăng nhập để tiếp tục",
      description: {
        canSkip:
          "Đăng nhập đồng thời Level Up và game để đồng bộ dữ liệu và trải nghiệm chơi liền mạch hơn",
        canNotSkip: "Sử dụng tài khoản game để đồng bộ dữ liệu và trải nghiệm chơi liền mạch hơn",
      },
    },
    transition: {
      description: "Hoàn tất bước đăng nhập tại trình duyệt mặc định của bạn",
    },
  },
  altLauncherLogoImg: "Level Up Logo",
  update: {
    updateNewVersion: "Cập nhật phiên bản mới của Level Up",
    description:
      "Cập nhật ngay để sử dụng phiên bản mới, hoặc Level Up sẽ tự động cài đặt ở lần khởi động tiếp theo",
    now: "Cập nhật ngay",
    later: "Lần sau",
  },
  minigames: {
    button: "Game chơi ngay",
    title: "Game chơi ngay - Không cần tải xuống",
  },
  success: {
    createShortcut: "Tạo phím tắt thành công",
    uninstallGame: "Gỡ bỏ {{title}} thành công",
    logOut: "Đăng xuất thành công",
  },
  error: {
    ...errorFetch,
    not_available_dir: {
      title: "Ổ đĩa chưa có quyền truy cập",
      subTitle: "Tạo thư mục mới hoặc chọn ổ đĩa mặc định khác.",
    },
  },
  connectionStatus: {
    failed: "<strong>Không có kết nối mạng</strong>. Vui lòng kiểm tra đường truyền của bạn",
  },
  survey: {
    shareWithNexus: "Chia sẻ với Level Up",
    customerSatisfaction: "Mức độ hài lòng của bạn về trải nghiệm trên Level Up.",
    customerEffortScoreLoginAndSignup: "Đánh giá trải nghiệm tạo tài khoản/đăng nhập.",
    customerEffortScoreDownloadAndPlayGame:
      "Đánh giá trải nghiệm tải xuống và chơi game trên Level Up.",
    feedback: "Góp ý của bạn.",
    feedbackForChanges: "Chia sẻ điều bạn mong muốn Level Up thay đổi.",
    notSatisfiedAtAll: "Không hài lòng",
    verySatisfied: "Rất hài lòng",
    veryHard: "Rất khó",
    veryEasy: "Rất dễ",
    thankYou: "Level Up cảm ơn bạn!",
    thankYouDescription: "Đóng góp của bạn sẽ giúp Level Up ngày một hoàn thiện hơn.",
    send: "Gửi",
  },
  notification: {
    download: {
      success: {
        title: "Level Up",
        description: " {{title}} đã được tải xuống thành công.",
      },
    },
  },
  appSetting: {
    title: "Cài đặt",
    recommendataion: "Khuyên dùng",
    generalSetting: {
      title: "Cài đặt chung",
      language: {
        title: "Ngôn ngữ",
        action: "Chọn ngôn ngữ",
        supportedLangs: {
          vi: "Tiếng Việt",
          en: "Tiếng Anh",
          th: "Tiếng Thái",
          id: "Tiếng Indo",
          "zh-Hans": "Tiếng zh-Hans",
          "zh-Hant": "Tiếng zh-Hant",
        },
      },
      openOnStart: {
        title: "Khởi động",
        action: "Khởi động Level Up khi mở máy",
      },
      closeWindow: {
        title: "Đóng cửa sổ Level Up",
        action: {
          minimize: "Thu nhỏ xuống thanh tác vụ",
          exit: "Thoát Level Up",
        },
      },
    },
    downloadSetting: {
      title: "Tải xuống",
      defaultDownloadDir: {
        title: "Thư mục mặc định khi tải game",
        action: "Chọn thư mục",
      },
    },
    notificationSetting: {
      title: "Thông báo",
      grantedNotification: {
        title: "Cài đặt thông báo",
        action: "Cho phép Level Up gửi thông báo trên máy tính",
      },
    },
    additionInfo: {
      title: "Về Level Up",
      currentVersion: "Phiên bản hiện tại",
      tos: "Điều khoản dịch vụ",
      privacyOfPolicy: "Chính sách quyền riêng tư",
      update: {
        checking: "Đang kiểm tra",
        notAvailable: "Mới nhất",
        available: "Đã có bản cập nhật mới",
        downloaded: "Đã cập nhật",
        downloadProgress: "Đang cập nhật",
        cancelled: "Đã hủy cập nhật",
        appimageFilenameUpdated: "Đã sẵn sàng cập nhật",
        error: "Đã có lỗi xảy ra. Vui lòng khởi động lại ứng dụng",
      },
    },
  },
  redeemCodeFirstReleaseCampaign: {
    introTitle: "Tải game ngay – Nhận quà hấp dẫn!",
    introDescription: `Nhanh tay tải và chơi game trên Level Up để nhận code quà tặng vô cùng hấp dẫn cho những người dùng đầu tiên.
Áp dụng từ 19/03 - 02/04/2025.
Chương trình có thể kết thúc sớm khi quà được tặng hết.`,
    joinNow: "Tham gia ngay!",
    redeemCode: "Nhận code",
    redeemCodeSuperCool: "Nhận code siêu ngầu",
    mainTitle: "Code xịn trao tay!",
    mainDescription:
      "Chào mừng bạn đến với Level Up! Nhập code ngay để nhận quà trong game bạn nhé!",
    success: {
      title: "Nhập code game thành công",
      description: "Chơi game ngay để kiểm tra quà tặng nhé!",
      primaryButtonText: "Chơi Game",
    },
    failed: {
      title: "Nhập code game thất bại",
      description: "Có lỗi xảy ra, vui lòng nhập lại.",
      primaryButtonText: "Nhập lại",
      secondaryButtonText: "Để sau",
    },
    iframeTitle: "Nhập code",
  },
  redeemCodeErrors: {
    ...redeemCodeErrors,
  },
  pii: {
    dialog: {
      title: "Hoàn tất thông tin để chơi game.",
      description: "Điền nhanh thông tin của bạn để bắt đầu cuộc chơi.",
      action: "Thực hiện",
    },
    page: {
      title: "Hoàn tất thông tin tại trình duyệt của bạn",
      description: "Hoàn tất cung cấp thông tin tại trình duyệt mặc định của bạn.",
    },
  },
};

export default vi;
