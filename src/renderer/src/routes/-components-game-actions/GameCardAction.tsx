import { useInView } from "react-intersection-observer";

import { ButtonGroup } from "@renderer/components/ButtonGroup";
import { PortalToNavAnimated } from "@renderer/components/PortalToNav";

export const GameActionContainer = ({
  gameMenuButton,
  playButton,
  gameId,
}: {
  gameMenuButton?: React.ReactNode;
  playButton: React.ReactNode;
  gameId: string;
}): JSX.Element => {
  const { ref, inView } = useInView({ initialInView: true });

  const shouldUsePortal = !inView;

  return (
    <>
      <ButtonGroup className="overflow-hidden rounded-lg px-0" size="xl">
        {playButton}
        {gameMenuButton}
      </ButtonGroup>
      <PortalToNavAnimated gameId={gameId} shouldUsePortal={shouldUsePortal} portal="play">
        {playButton}
      </PortalToNavAnimated>
      <span ref={ref}></span>
    </>
  );
};
