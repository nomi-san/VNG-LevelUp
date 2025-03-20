interface VPNews {
  id: number | string;
  title: string;
  titleSeo?: string | null; // for SEO, it dung
  keyword?: string; // for SEO, it dung
  description?: string; // for SEO, it dung
  tag?: string | null; //It dung
  linkSeo: string; // Link of the article
  linkSeoHistory: string; // Chua can
  linkExternal?: string | null; // Link to facebook google
  categoryId: number | string; //
  thumbnail?: string | null; // image
  shortContent?: string; // shortContent
  content: string; // HTML
  createDate: number;
  createBy: string;
  updateDate: number;
  updateBy: string;
  publishDate?: number | null;
  closeDate?: number | null;
  ordering: number; // It xai
  isHot: boolean;
  isNew: boolean; // It xai
  isNewTab: boolean; // open in new tab
  view: number; // view count, khogn xai nua
  showHomePage: boolean; // hien len home page
  isActive: boolean;
  linkPreview?: string | null; // What

  link: string;
  categoryName: string;
}

export type VPNewsForNexus = Pick<
  VPNews,
  | "id"
  | "title"
  | "shortContent"
  | "link"
  | "linkExternal"
  | "categoryId"
  | "categoryName"
  | "thumbnail"
  | "publishDate"
  | "ordering"
  | "isHot"
  | "isNew"
>;

export interface NewsInfo {
  news: VPNewsForNexus[];
  moreNewsSite: string;
}

interface BannerItem {
  id: string;
  title: string;
  thumbnail: string;
  publishDate: number;
  link: string;
}

export interface BannerInfo {
  banners: BannerItem[];
}
