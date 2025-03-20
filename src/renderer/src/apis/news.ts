import { envRender } from "@renderer/env-render";
import { isRunningWebMode } from "@renderer/mode/web";

import { BaseFetchErrorTempForWebMode } from "@src/const/error";
import { type GameClientId } from "@src/types/game";
import { type NewsInfo } from "@src/types/news";

import { makeRequestOnRenderer, type ApiParams } from "./shared";

export const gameClientDownLoadLinks = {} as const;

const fetchNewsMock = async (): Promise<NewsInfo> => {
  return {
    news: [
      {
        id: "1",
        title: "CHƯƠNG TRÌNH TÌM KIẾM “BOMBIE CREATOR” THÁNG 12/2024",
        shortContent: "TÌM KIẾM “BOMBIE CREATOR”",
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
        linkExternal: "",
        categoryId: "1",
        categoryName: "Tin tức",
        thumbnail: "https://img.zing.vn/upload/bomber/source/News/thumb-2.jpg",
        publishDate: 1732689217692,
        ordering: 1,
        isHot: true,
        isNew: true,
      },
      {
        id: "2",
        title: "Danh sách guild, người chơi được hỗ trợ quà hiện vật tháng 7 - tháng 10/2024",
        shortContent: "TÌM KIẾM “BOMBIE CREATOR”",
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
        linkExternal: "",
        categoryId: "1",
        categoryName: "Tin tức",
        thumbnail: "https://img.zing.vn/upload/bomber/source/News/thumb-2.jpg",
        publishDate: 1732689217692,
        ordering: 1,
        isHot: true,
        isNew: true,
      },
      {
        id: "3",
        title: "Chăm Sóc Khách Hàng Thân Thiết Tháng 10/2024",
        shortContent: "TÌM KIẾM “BOMBIE CREATOR”",
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
        linkExternal: "",
        categoryId: "1",
        categoryName: "Tin tức",
        thumbnail: "https://img.zing.vn/upload/bomber/source/News/thumb-2.jpg",
        publishDate: 1732689217692,
        ordering: 1,
        isHot: true,
        isNew: true,
      },
      {
        id: "4",
        title: "CHƯƠNG TRÌNH HỖ TRỢ GIẢI ĐẤU & OFFLINE",
        shortContent: "TÌM KIẾM “BOMBIE CREATOR”",
        link: "https://bomber.vnggames.com/tin-tuc/tin-tuc/chuong-trinh-tim-kiem-bombie-creator.html",
        linkExternal: "",
        categoryId: "1",
        categoryName: "Tin tức",
        thumbnail: "https://img.zing.vn/upload/bomber/source/News/thumb-2.jpg",
        publishDate: 1732689217692,
        ordering: 1,
        isHot: true,
        isNew: true,
      },
    ],
    moreNewsSite: "https://bomber.vnggames.com/tin-tuc/tin-tuc.1.html",
  };
};
export const fetchNews = async (
  params: ApiParams<{ gameClientId: GameClientId }>,
): Promise<NewsInfo> => {
  const { limit } = {
    limit: 10,
  };
  if (isRunningWebMode) {
    const news = await fetchNewsMock()
      .then((r) => r)
      .catch(() => {
        throw new BaseFetchErrorTempForWebMode();
      });

    return news;
  }

  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/content/v1/news?product_id=${params.gameClientId}&limit=${limit}`,
    method: "GET",
    params,
    apiName: "news",
  });
};
