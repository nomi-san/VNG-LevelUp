import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, type SearchSchemaInput } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import { useInView } from "react-intersection-observer";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import FadeInFromY from "@renderer/animations/FadeInFromY";
import ScaleIn from "@renderer/animations/ScaleIn";
import { bannerQueryOptions } from "@renderer/apis/bannerQueryOptions";
import { gameQueryOptions } from "@renderer/apis/gameQueryOptions";
import { newsQueryOptions } from "@renderer/apis/newsQueryOptions";
import overlay from "@renderer/assets/overlay/overlay-news-blur.svg";
import mute from "@renderer/assets/video/mute.svg";
import pause from "@renderer/assets/video/pause.svg";
import play from "@renderer/assets/video/play.svg";
import unmute from "@renderer/assets/video/unmute.svg";
import GameDetailSkeleton, {
  ActionButtonSkeleton,
  ContentSkeleton,
  SocialSkeleton,
} from "@renderer/components/skeleton/GameDetailSkeleton";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Button } from "@renderer/components/ui/button";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import { FROM_RENDERER_STORE_GET_ALL_GAME_IDS } from "@src/const/events";
import type { TriggerState } from "@src/types/auth";
import type { DetailsPageGameInfo } from "@src/types/game";

import { GameActionsContainer } from "./-components/GameActionsContainer";
import { GameDetailInformation } from "./-components/GameDetailInformation";
import GameErrorComponent from "./-components/GameErrorComponent";
import { GameNewsDetail } from "./-components/GameNewsDetail";
import RedeemCodeBanner from "./-components/RedeemCodeBanner";
import { SocialAccessDetail } from "./-components/SocialAccessDetail";
import { WebshopAction } from "./-components/WebshopAction";

type GameDetailSearch = {
  triggerState: TriggerState;
};

export const Route = createFileRoute("/games/$gameClientId")({
  errorComponent: GameErrorComponent,
  pendingComponent: GameDetailSkeleton,
  component: GameComponent,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput): GameDetailSearch => {
    return {
      triggerState: search.triggerState as TriggerState,
    };
  },
});

const HLSVideoPlayer = ({
  src,
  videoProps,
  onHlsNotSupported,
  videoRef,
}: {
  src: string;
  videoProps: React.VideoHTMLAttributes<HTMLVideoElement>;
  onHlsNotSupported: () => void;
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  useEffect(() => {
    if (!videoRef.current) return;

    const hls = new Hls({
      debug: false,
    });

    if (Hls.isSupported()) {
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (err) => {
        console.log("haha", err);
      });
    } else {
      onHlsNotSupported();
    }
  }, [src, onHlsNotSupported, videoRef]);

  return <video ref={videoRef} {...videoProps} />;
};

const TOO_LONG_BUT_FIRST_FRAME_NOT_LOADED = 2000;
const Container = ({
  children,
  remoteGameInfo,
  onClickVideo,
  onFirstFrameLoaded,
  videoRef,
}: {
  children: ReactNode;
  remoteGameInfo: DetailsPageGameInfo;
  onClickVideo: () => void;
  onFirstFrameLoaded: () => void;
  videoRef: RefObject<HTMLVideoElement>;
}): JSX.Element => {
  const [shouldFallBackToImage, setShouldFallBackToImage] = useState(false);
  const onHlsError = useCallback(() => {
    setShouldFallBackToImage(true);
  }, []);
  const shouldUseImage = remoteGameInfo.cover.mimeType.startsWith("image") || shouldFallBackToImage;

  useEffect(() => {
    if (shouldUseImage) onFirstFrameLoaded();
    else {
      setTimeout(() => {
        onFirstFrameLoaded();
      }, TOO_LONG_BUT_FIRST_FRAME_NOT_LOADED);
    }
  }, [shouldUseImage, onFirstFrameLoaded]);

  const commonVideoProps: React.VideoHTMLAttributes<HTMLVideoElement> = useMemo(
    () => ({
      onClick: onClickVideo,
      autoPlay: true,
      loop: true,
      muted: true,
      className: "absolute h-full w-full object-fill",
      //controls={enableControls}
    }),
    [onClickVideo],
  );

  if (shouldUseImage)
    return (
      <div className="relative h-[100vh] bg-cover bg-center mix-blend-difference">
        <ImgWithSkeleton
          className="w-full-h-full absolute z-10"
          src={
            remoteGameInfo.cover.mimeType.startsWith("image")
              ? remoteGameInfo.cover.url
              : remoteGameInfo.thumbnail.url
          }
          alt=""
        />
        <div className="absolute z-20 h-full w-full">{children}</div>
      </div>
    );

  return (
    <div className="relative h-[100vh]">
      {remoteGameInfo.cover.url.endsWith("m3u8") ? (
        <HLSVideoPlayer
          src={remoteGameInfo.cover.url}
          videoProps={{
            ...commonVideoProps,
            onPlay: onFirstFrameLoaded,
          }}
          onHlsNotSupported={onHlsError}
          videoRef={videoRef}
        />
      ) : (
        <video
          src={remoteGameInfo.cover.url}
          {...commonVideoProps}
          onLoadedMetadata={onFirstFrameLoaded}
          ref={videoRef}
        />
      )}
      {children}
    </div>
  );
};
const isVideoPlaying = (video: HTMLVideoElement) =>
  !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);

const VideoControls = ({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!videoRef.current) return null;
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="subtle"
        size="lg"
        className="w-10 p-0"
        onClick={() => {
          if (!videoRef.current) return;

          if (isVideoPlaying(videoRef.current)) {
            videoRef.current.pause();
          } else {
            void videoRef.current.play();
          }

          setIsPlaying(!isPlaying);
        }}
      >
        {isVideoPlaying(videoRef.current) ? <img src={pause} /> : <img src={play} />}
      </Button>
      <Button
        variant="subtle"
        size="lg"
        className="w-10 p-0"
        onClick={() => {
          if (!videoRef.current) return;

          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(!isMuted);
        }}
      >
        {videoRef.current.muted ? <img src={unmute} /> : <img src={mute} />}
      </Button>
    </div>
  );
};
function GameComponent(): JSX.Element {
  const gameClientId = Route.useParams().gameClientId;
  const { language } = useLanguageProvider();
  const { guestId, launcherUser } = useSessionProvider();
  const { isFetching, data: remoteGameInfo } = useSuspenseQuery(
    gameQueryOptions({
      language,
      userId: launcherUser?.userId,
      guestId,
      gameClientId,
    }),
  );
  const [shouldShowGameContent, setShouldShowGameContent] = useState(false);
  const [isFirstVideoFrameLoaded, setIsFirstVideoFrameLoaded] = useState(false);
  const { data: newsInfo, isFetching: isFetchingNews } = useQuery(
    newsQueryOptions({
      language,
      userId: launcherUser?.userId,
      guestId,
      gameClientId,
      enabled: isFirstVideoFrameLoaded,
    }),
  );
  const { data: bannerInfo, isFetching: isFetchingBanner } = useQuery(
    bannerQueryOptions({
      language,
      userId: launcherUser?.userId,
      guestId,
      gameClientId,
      enabled: isFirstVideoFrameLoaded,
    }),
  );
  const { ref, inView } = useInView({ initialInView: true });
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();

  const isUnmounted = useIsUnmountedRef();
  useEffect(() => {
    if (isUnmounted.current) return;
    const triggerRemoveIconSidebarIfInstallSuccess = async (): Promise<void> => {
      window.api.install_removeWhenSuccess(remoteGameInfo.id);
      await queryClient.invalidateQueries({
        queryKey: [FROM_RENDERER_STORE_GET_ALL_GAME_IDS],
      });
    };
    void triggerRemoveIconSidebarIfInstallSuccess();
  }, [remoteGameInfo.id, queryClient, isUnmounted]);

  return (
    <div
      className="fixed inset-0 z-10 transition-all duration-500 ease-linear"
      data-testid={`game-details-container-${gameClientId}`}
    >
      <ScrollArea className="h-[100vh]">
        <div className="absolute bottom-3 left-1/2 z-10 flex items-center justify-center">
          <img
            src="https://cdn-nexus.vnggames.com/assets/images/common/scroll-down.gif"
            alt=""
            className="m-auto max-w-8"
          />
        </div>
        <ScaleIn>
          <Container
            remoteGameInfo={remoteGameInfo}
            onClickVideo={useCallback(() => {
              setShouldShowGameContent((prev) => !prev);
            }, [])}
            onFirstFrameLoaded={useCallback(() => {
              if (isFirstVideoFrameLoaded) return;
              setShouldShowGameContent(true);
              setIsFirstVideoFrameLoaded(true);
            }, [isFirstVideoFrameLoaded])}
            videoRef={videoRef}
          >
            <div
              className="relative h-full w-[477px]"
              style={{
                background: "linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, #000000 100%)",
              }}
            ></div>
            <img src={overlay} className="absolute bottom-0 left-0 h-[619px] w-[619px]"></img>

            <div ref={ref}></div>
            <AnimatePresence>
              {!shouldShowGameContent ? null : (
                <FadeInFromY>
                  {isFetching ? (
                    <>
                      <SocialSkeleton className="!absolute right-3 top-14" />
                      <ActionButtonSkeleton className="!absolute bottom-[25px] right-[52px]" />
                    </>
                  ) : (
                    <>
                      <div className="!absolute bottom-[25px] right-[52px] z-10 flex flex-col gap-4">
                        <div className="flex items-end justify-end gap-2">
                          <RedeemCodeBanner gameClientId={remoteGameInfo.id} />
                          <VideoControls videoRef={videoRef} />
                        </div>
                        <GameActionsContainer remoteGameInfo={remoteGameInfo} />
                        <WebshopAction
                          key={remoteGameInfo.id}
                          game={remoteGameInfo}
                          actionIsInView={inView}
                        />
                      </div>
                      <SocialAccessDetail
                        socials={remoteGameInfo.attributes?.filter(
                          (requirement) => requirement.section === "social",
                        )}
                      />
                    </>
                  )}
                </FadeInFromY>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!shouldShowGameContent ? null : (
                <FadeInFromY>
                  <div className="!absolute bottom-[26px] left-[111px] z-10 flex w-[365px] flex-col gap-7">
                    <ImgWithSkeleton
                      src={remoteGameInfo.logo.url}
                      alt="logoGame"
                      className="max-w-[250px]"
                      skeletonClass="w-[250px] h-[80px] rounded-lg"
                    />
                    {isFetchingNews || isFetchingBanner ? (
                      <ContentSkeleton />
                    ) : (
                      <GameNewsDetail
                        game={remoteGameInfo}
                        newsInfo={newsInfo}
                        bannerInfo={bannerInfo}
                      />
                    )}
                  </div>
                </FadeInFromY>
              )}
            </AnimatePresence>
            <div
              className="absolute bottom-0 left-0 right-0 h-[200px]"
              style={{
                background: "linear-gradient(180deg, rgba(34, 37, 42, 0) 0%, #22252A 100%)",
              }}
            ></div>
          </Container>
        </ScaleIn>
        <GameDetailInformation game={remoteGameInfo} />

        {!inView && (
          <div className="fixed left-0 right-0 top-0 z-30 h-[112px]">
            <FadeInFromY offset={-64}>
              <div
                className="h-[112px] w-full"
                style={{
                  background: "linear-gradient(180deg, #22252A 0%, rgba(34, 37, 42, 0) 100%)",
                }}
              ></div>
            </FadeInFromY>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
