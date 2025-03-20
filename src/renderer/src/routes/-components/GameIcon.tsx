import { BorderGradient, type BorderGradientProps } from "@renderer/components/BorderGradient";

const GameIcon = ({
  variant,
  size,
  imgSrc,
}: {
  variant: BorderGradientProps["variant"];
  size: BorderGradientProps["size"];
  imgSrc: string;
}): JSX.Element => {
  return (
    <BorderGradient variant={variant} size={size}>
      <div
        className={`box-border flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-md drop-shadow-md`}
      >
        <img
          src={imgSrc}
          className="box-border h-full w-full origin-center rounded-md bg-neutral-900 object-cover p-0.5"
        />
      </div>
    </BorderGradient>
  );
};

export default GameIcon;
