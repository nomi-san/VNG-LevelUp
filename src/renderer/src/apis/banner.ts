import { envRender } from "@renderer/env-render";
import { isRunningWebMode } from "@renderer/mode/web";

import { BaseFetchErrorTempForWebMode } from "@src/const/error";
import { type GameClientId } from "@src/types/game";
import { type BannerInfo } from "@src/types/news";

import { makeRequestOnRenderer, type ApiParams } from "./shared";

export const gameClientDownLoadLinks = {} as const;

const fetchBannerMock = async (): Promise<BannerInfo> => {
  return {
    banners: [
      {
        id: "1",
        title: "BOMBIE CREATOR",
        thumbnail: "https://img.zing.vn/upload/bomber/source/Banner/banner-1.jpg",
        publishDate: 1732689217692,
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
      },
      {
        id: "2",
        title: "BOMBIE CREATOR",
        thumbnail: "https://img.zing.vn/upload/bomber/source/News/thumb-nap.jpg",
        publishDate: 1732689217692,
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
      },
      {
        id: "3",
        title: "BOMBIE CREATOR",
        thumbnail: "https://img.zing.vn/upload/bomber/source/s2/3.jpg",
        publishDate: 1732689217692,
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
      },
    ],
  };
};
export const fetchBanner = async (
  params: ApiParams<{ gameClientId: GameClientId }>,
): Promise<BannerInfo> => {
  const { limit } = {
    limit: 10,
  };
  if (isRunningWebMode) {
    const news = await fetchBannerMock()
      .then((r) => r)
      .catch(() => {
        throw new BaseFetchErrorTempForWebMode();
      });

    return news;
  }

  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/content/v1/banners?product_id=${params.gameClientId}&limit=${limit}`,
    method: "GET",
    params,
    apiName: "banner",
  });
};
