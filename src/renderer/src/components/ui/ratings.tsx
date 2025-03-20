import React, { useState } from "react";

import { Button, type ButtonProps } from "@renderer/components/ui/button";

interface RatingsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  totalStars?: number;
  onRatingChange?: (rating: number) => void;
}

const Icon = <Button />;
const CircleText = ({ value }: { value: number }): JSX.Element => {
  return (
    <div className="body-14-regular flex h-full w-full items-center justify-center">{value}</div>
  );
};
export const CommentRatings = ({
  rating: initialRating,
  totalStars = 5,
  onRatingChange,
  ...props
}: RatingsProps): JSX.Element => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>,
  ): void => {
    const starIndex = parseInt(event.currentTarget.dataset.starIndex || "0");
    setHoverRating(starIndex);
  };

  const handleMouseLeave = (): void => {
    setHoverRating(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const starIndex = parseInt(event.currentTarget.dataset.starIndex || "0");
    setCurrentRating(starIndex);
    setHoverRating(null);
    onRatingChange?.(starIndex);
  };

  const displayRating = hoverRating ?? currentRating;
  const fullStars = Math.floor(displayRating);

  return (
    <div className="flex w-fit items-center gap-2" onMouseLeave={handleMouseLeave} {...props}>
      <div className="flex items-center gap-2" onMouseEnter={handleMouseEnter}>
        {[...Array(fullStars)].map((_, i) => {
          const buttonProps: ButtonProps & {
            key: number;
            "data-star-index": number;
          } = {
            key: i,
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            "data-star-index": i + 1,
            children: <CircleText value={i + 1} />,
            variant: "outline",
            size: "rating",
            className: "bg-neutral-600 border-neutral-400",
          };
          return React.cloneElement(Icon, buttonProps);
        })}
        {[...Array(Math.max(0, totalStars - fullStars))].map((_, i) => {
          const buttonProps: ButtonProps & {
            key: number;
            "data-star-index": number;
          } = {
            key: i + fullStars + 1,
            onClick: handleClick,
            onMouseEnter: handleMouseEnter,
            "data-star-index": i + fullStars + 1,
            children: <CircleText value={fullStars + i + 1} />,
            variant: "outline",
            size: "rating",
          };

          return React.cloneElement(Icon, buttonProps);
        })}
      </div>
    </div>
  );
};
