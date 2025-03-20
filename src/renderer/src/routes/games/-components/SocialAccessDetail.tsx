import { useState } from "react";

import FadeInFromX from "@renderer/animations/FadeInFromX";
import DiscordIcon from "@renderer/assets/social-icon/Discord.svg";
import FacebookIcon from "@renderer/assets/social-icon/Facebook.svg";
import GroupFacebookIcon from "@renderer/assets/social-icon/GroupFacebook.svg";
import HomeIcon from "@renderer/assets/social-icon/Home.svg";
import InstagramIcon from "@renderer/assets/social-icon/Instagram.svg";
import RedditIcon from "@renderer/assets/social-icon/Reddit.svg";
import SupportIcon from "@renderer/assets/social-icon/Support.svg";
import TiktokIcon from "@renderer/assets/social-icon/Tiktok.svg";
import YoutubeIcon from "@renderer/assets/social-icon/Youtube.svg";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { useTranslation } from "@renderer/i18n/useTranslation";

import type { DetailsPageGameInfo, ProductSocialType } from "@src/types/game";

type SocialItemProp = {
  socialUrl: string;
  social: ProductSocialType;
};
const SocialItem = ({ socialUrl, social }: SocialItemProp): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const getLogo = (): JSX.Element => {
    switch (social) {
      case "homepage":
        return <ImgWithSkeleton src={HomeIcon} className="h-5 w-5" />;
      case "facebook":
        return <ImgWithSkeleton src={FacebookIcon} className="h-5 w-5" />;
      case "instagram":
        return <ImgWithSkeleton src={InstagramIcon} className="h-5 w-5" />;
      case "tiktok":
        return <ImgWithSkeleton src={TiktokIcon} className="h-5 w-5" />;
      case "discord":
        return <ImgWithSkeleton src={DiscordIcon} className="h-5 w-5" />;
      case "cs":
        return <ImgWithSkeleton src={SupportIcon} className="h-5 w-5" />;
      case "youtube":
        return <ImgWithSkeleton src={YoutubeIcon} className="h-5 w-5" />;
      case "reddit":
        return <ImgWithSkeleton src={RedditIcon} className="h-5 w-5" />;
      case "facebook_group":
        return <ImgWithSkeleton src={GroupFacebookIcon} className="h-5 w-5" />;
      default:
        return <></>;
    }
  };
  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <div
          className="neutral-bottom-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-neutral-900 hover:bg-neutral-600"
          onClick={() => {
            window.api.app_openExternalWeb(socialUrl);
          }}
          onMouseOver={() => setIsOpen(true)}
          onMouseOut={() => setIsOpen(false)}
        >
          {getLogo()}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={`subtle-text mr-1.5 flex h-9 w-auto items-center justify-center rounded-md bg-neutral-800 p-0 px-2`}
        side="left"
        align="center"
      >
        {t(`socialPlatform.${social}`)}
      </PopoverContent>
    </Popover>
  );
};

const customSocialOrder: ProductSocialType[] = [
  "homepage",
  "cs",
  "facebook",
  "facebook_group",
  "instagram",
  "tiktok",
  "discord",
  "youtube",
  "reddit",
];

export const SocialAccessDetail = ({
  socials,
}: {
  socials: DetailsPageGameInfo["attributes"];
}): JSX.Element => {
  const sortedSocials = socials?.sort((a, b) => {
    const indexA = customSocialOrder.indexOf(a.attributeId as ProductSocialType);
    const indexB = customSocialOrder.indexOf(b.attributeId as ProductSocialType);

    return indexA - indexB;
  });

  return (
    <div className="!absolute right-0 top-14">
      <FadeInFromX>
        <div className="flex flex-col items-center justify-between gap-3 p-3">
          {sortedSocials?.map((social) => (
            <SocialItem
              key={social.attributeId}
              socialUrl={social.description}
              social={social.attributeId as ProductSocialType} // TODO: Huy double check
            />
          ))}
        </div>
      </FadeInFromX>
    </div>
  );
};
