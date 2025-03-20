import type { LocalGameInternalVersion } from "@src/types/game";
import type { InterruptReason } from "@src/types/system";

interface OpenApp {
  name: "open_app";
  payload: {
    app_version: string;
    app_open_time: number;
    platform: NodeJS.Platform;
  };
}

interface Login {
  name: "login";
  payload: {
    territory: string;
    loginChannel: string;
    vga_id: string;
    launcher_user_id: string;
  };
}

interface Logout {
  name: "logout";
  payload: Record<string, unknown>;
}

interface ClickDownloadInit {
  name: "click_download_init";
  payload: {
    gameId: string;
  };
}

// Trigger on first getting default dir and update dir
interface CheckUserAvailableStorage {
  name: "check_user_available_storage";
  payload: {
    hasEnoughStorage: boolean;
    gameId: string;
    version: number;
  };
}

interface ClickUpdateStart {
  name: "click_update_start";
  payload: {
    gameId: string;
    current_internal_version: LocalGameInternalVersion;
    internal_versions: number[];
    update_init_time: number;
  };
}

interface ClickDownloadStart {
  name: "click_download_start";
  payload: {
    gameId: string;
    internal_versions: number[];
    download_init_time: number;
  };
}

interface DownloadCancel {
  name: "download_cancel";
  payload: {
    gameId: string;
    source: string; // TODO: Cancel vs logout
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadResume {
  name: "download_resume";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadRetry {
  name: "download_retry";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadPause {
  name: "download_pause";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_version: number;
  };
}

interface InstallSuccess {
  name: "install_progress_success";
  payload: {
    gameId: string;
    download_init_time: number;
  };
}

interface InstallProgressCompletedTheLastInstall {
  name: "install_progress_completed_the_last_install";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_versions: number[];
  };
}

interface DownloadProgressTrack {
  name: "download_progress_track";
  payload: {
    gameId: string;
    progress: number; // 30 - 60 - 90
    bytesPerSecond: number; // in kb/s
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadProgressSuccess {
  name: "download_progress_success";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadProgressInterrupted {
  name: "download_progress_interrupted";
  payload: {
    gameId: string;
    reason: InterruptReason;
    download_init_time: number;
    internal_version: number;
  };
}

interface DownloadProgressCompletedTheLastDownload {
  name: "download_progress_completed_the_last_download";
  payload: {
    gameId: string;
    download_init_time: number;
    internal_version: number;
  };
}

//// TODO: NOT implemented yet
interface InstallProgressFail {
  name: "install_fail";
  payload: {
    gameId: string;
    reason: string;
    download_init_time: number;
  };
}

interface LauncherUpdateFail {
  name: "launcher_update_fail";
  payload: {
    guestId: string;
    reason: string;
  };
}

interface Bug {
  name: "bug";
  payload: {
    guestId: string;
    ggId: string;
    description: string;
  };
}

///////// END not implemented yet

interface SkipForceLogin {
  name: "skip_force_login";
  payload: {
    gameId: string;
  };
}

interface AcceptForceLoginOnPlayGame {
  name: "accept_force_login_on_play_game";
  payload: {
    gameId: string;
  };
}
interface AcceptForceLoginOnWebshop {
  name: "accept_force_login_on_webshop";
  payload: {
    gameId: string;
  };
}

interface ClickWebshop {
  name: "view_webshop";
  payload: {
    gameId: string;
    webshopUrl: string; // Strip query params
    source: "shop_button" | "redirect_after_login"; // Click play vs redirect
  };
}

interface ClickNews {
  name: "click_news";
  payload: {
    gameId: string;
    newsUrl: string;
  };
}

interface ClickBanner {
  name: "click_banner";
  payload: {
    gameId: string;
    bannerUrl: string;
  };
}

interface ClickAvatar {
  name: "click_avatar";
  payload: { guestId: string };
}

export interface InitStartPlayGame {
  name: "init_start_play_game";
  payload: {
    gameId: string;
    source: "play_button" | "redirect_after_login" | "download_finish" | "desktop_shortcut";
  };
}

interface StartGameSession {
  name: "start_game_session";
  payload: {
    gameId: string;
    sessionId: string;
  };
}

interface EndGameSession {
  name: "end_game_session";
  payload: {
    gameId: string;
    sessionId: string;
  };
}

interface ClickGameItem {
  name: "click_game_item";
  payload: {
    gameId: string;
  };
}

interface ViewGameDetail {
  name: "view_game_detail";
  payload: {
    gameId: string;
  };
}

interface UninstallGameInit {
  name: "uninstall_game_init";
  payload: {
    gameId: string;
  };
}

interface UninstallGameConfirm {
  name: "uninstall_game_confirm";
  payload: {
    gameId: string;
  };
}

// Missing events
// Click Minigames List (Nav bar)
// Play Minigames (click on item)

//////////////////////// Survey

export type RatingsQuestionIds =
  | `customer_satisfaction_${string}`
  | `customer_effort_score_login_and_signup_${string}`
  | `customer_effort_score_download_and_play_game_${string}`;
export type TextQuestionIds = `customer_feedback_${string}`;
export type SurveyQuestionIds = RatingsQuestionIds | TextQuestionIds | "thankyou";

interface ShowSurvey {
  name: "show_survey";
  payload: {
    surveyId: string;
  };
}

interface CloseSurvey {
  name: "close_survey";
  payload: {
    surveyId: string;
    questionId: SurveyQuestionIds;
  };
}
interface RatingQuestions {
  name: "survey_answer";
  payload: {
    surveyId: string;
    questionId: RatingsQuestionIds;
    answer: number;
  };
}
interface CustomerFeedback {
  name: "survey_answer";
  payload: {
    surveyId: string;
    questionId: TextQuestionIds;
    answer: string;
  };
}

export type SurveyEvent = RatingQuestions | CustomerFeedback | ShowSurvey | CloseSurvey;

export type TrackedEvent =
  | OpenApp
  | LauncherUpdateFail
  | Bug
  | Login
  | Logout
  | ClickDownloadInit
  | CheckUserAvailableStorage
  | ClickDownloadStart
  | DownloadProgressTrack
  | DownloadProgressSuccess
  | DownloadProgressInterrupted
  | DownloadProgressCompletedTheLastDownload
  | DownloadPause
  | DownloadCancel
  | DownloadResume
  | DownloadRetry
  | ClickUpdateStart
  | InstallSuccess
  | InstallProgressFail
  | InstallProgressCompletedTheLastInstall
  | InitStartPlayGame
  | StartGameSession
  | EndGameSession
  | ClickGameItem
  | ViewGameDetail
  | ClickWebshop
  | ClickAvatar
  | SkipForceLogin
  | AcceptForceLoginOnPlayGame
  | AcceptForceLoginOnWebshop
  | UninstallGameInit
  | UninstallGameConfirm
  | ClickNews
  | ClickBanner;
