export type SupportedPlatforms = "win32" | "darwin";

export type GameClientId = string;

export type GameTypes = "web" | "native";

export interface Deprecated_LocalGameInfo {
  path: string;
  version: string;
}
export interface Deprecated_LocalGameInfoV2 {
  runnablePath: string;
  rootFolderPath: string;
  version: string;
}

export interface LocalGameInfoV3 {
  runnablePath: string;
  rootFolderPath: string;
  internalVersion: number | "legacy";
}

// STORE

type ProductRequirementType = "os" | "size" | "gpu" | "cpu" | "directx" | "ram";
type ProductDecreeType = "license" | "business_address" | "hotline";
export type ProductSocialType =
  | "homepage"
  | "facebook"
  | "facebook_group"
  | "instagram"
  | "tiktok"
  | "discord"
  | "cs"
  | "youtube"
  | "reddit";

export type ProductAttributeType = ProductRequirementType | ProductDecreeType | ProductSocialType;
export type ProductAttributeSection = "recommended" | "minimum" | "other" | "social";

type ProductType = "web-based" | "native";
type ProductStatus = "available" | "unavailable";
/*
  nexus: integrate SDK + force Login
  sigin: not integrate SDK + force Login
  none: not integrate SDK + not force Login
*/
export type ProductAuthType = "nexus" | "signin" | "none";

/*
"sird": signin required
"sinrd": signin NOT required
"extb": bật external browser
*/
export type WebshopAuthType = "sird" | "sinrd" | "extb";

type MediaMimeType = "image/jpeg" | "image/png" | "video/mp4";
export interface MediaItem {
  mimeType: MediaMimeType;
  url: string;
  tintColor: string;
}

// legacy version is when we detect the user has installed the game before installing nexus
// we will not ever touch or update its version, just let the game handle its own update
export type LocalGameInternalVersion = "legacy" | number;

interface BaseGameInfo {
  id: string;
  title: string;
  description: string;
  // categories: string[]; // Use genres instead
  compatibilities: string[];
  packageSizeInMb: number;
  downloadUrl: string;

  version: string;
  internalVersion: number;
  productType: ProductType;
  runnablePath: string;
  installPath: string;
  // coverUrl: string; //  Use cover instead
  // thumbnailUrl: string; //  Use thumbnail instead
  // logoUrl: string; // Use logo instead
  status: ProductStatus;
  shopUrl: string;
  authType: ProductAuthType;
  metadata?: { escapeStartCommand?: true };

  genres: string[];
  logo: MediaItem;
  thumbnail: MediaItem;
  cover: MediaItem;
  icon: MediaItem;
  verticalThumbnail: MediaItem;
  mediaItems: MediaItem[];
}
export interface ListPageGameInfo extends BaseGameInfo {}
export interface DetailsPageGameInfo extends BaseGameInfo {
  attributes?: Array<{
    attributeId: ProductAttributeType;
    description: string;
    section: ProductAttributeSection;
  }>;
  detail_cover_urls: string[];
  detail_thumbnail_urls: string[];
  publisherName: string;
  developerName: string;
  publishDate: number;
  shopType: WebshopAuthType;
  developer: MediaItem;
  publisher: MediaItem;
  ageRating: number;
  homepageUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  discordUrl: string;
  csUrl: string;
  youtubeUrl: string;
  redditUrl: string;
  groupFacebookUrl: string;
  internalVersion: number;
}
export const MOCK_TEST_REMOTE_GAME_INFO: DetailsPageGameInfo[] = [
  {
    id: "ghoststory0",
    title: "Ghost Story - Thiện Nữ",
    compatibilities: ["Windows"],
    description: "Tìm chân ái cùng Ghost Story!\n Bom tấn nhập vai hẹn hò lãng mạn",
    genres: ["MMORPG1", "MMORPG2"],
    version: "1.0.0",
    downloadUrl:
      "https://cdn-tnuh.vnggames.com/game_package/20240815/ghoststory.601593.2018.pc.win64.zip",
    attributes: [
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "minimum",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "minimum",
      },
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "recommended",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "recommended",
      },
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "other",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "other",
      },
    ],
    packageSizeInMb: 3613281.25,
    productType: "native",
    runnablePath: "Windows\\qnyh.exe",
    publisherName: "VNG",
    developerName: "NetEase Games",
    publishDate: 1726572415000,
    status: "available",
    shopUrl: "",
    authType: "nexus",
    cover: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
      tintColor: "ffffff",
    },
    thumbnail: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-Appicon.jpg",
      tintColor: "ffffff",
    },
    icon: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-Appicon.jpg",
      tintColor: "ffffff",
    },
    verticalThumbnail: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
      tintColor: "ffffff",
    },
    detail_cover_urls: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS49GPEFWZYR9Jv9WxzINQbvQGRgFH-imnYg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2sB7jL4sxjCtvdc7RoPnTRRVWTWOsYIX8Rg&s",
    ],
    detail_thumbnail_urls: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2sB7jL4sxjCtvdc7RoPnTRRVWTWOsYIX8Rg&s",
      "https://media.gq-magazine.co.uk/photos/645b5c3c8223a5c3801b8b26/16:9/w_1280%2Cc_limit/100-best-games-hp-b.jpg",
    ],
    logo: {
      mimeType: "image/png",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-GameName.png",
      tintColor: "ffffff",
    },
    installPath: "Ghost Story",
    shopType: "sinrd",
    metadata: {},
    mediaItems: [
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-2nd.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-3rd.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-4th.jpg",
        tintColor: "ffffff",
      },
    ],
    developer: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/thiennu/developer.jpg",
      tintColor: "ffffff",
    },
    publisher: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/thiennu/publisher.jpg",
      tintColor: "ffffff",
    },
    ageRating: 12,
    homepageUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    discordUrl: "",
    csUrl: "",
    youtubeUrl: "",
    redditUrl: "",
    groupFacebookUrl: "",
    internalVersion: 1,
  },
  {
    id: "bomber1",
    title: "Bomber",
    compatibilities: ["Windows"],
    description: "Tìm chân ái cùng Bomber!\n Bom tấn nhập vai hẹn hò lãng mạnn",
    genres: ["CASUAL1", "CASUAL2"],
    version: "1.0.0",
    downloadUrl: "https://cdn-gg.vnggames.app/launcher/valorant-0.0.1.zip",
    attributes: [
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "minimum",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "minimum",
      },
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "recommended",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "recommended",
      },
      {
        attributeId: "os",
        description: "Window 10 64-bit Operating System",
        section: "other",
      },
      {
        attributeId: "size",
        description: "7gb",
        section: "other",
      },
    ],
    packageSizeInMb: 1367187.5,
    productType: "native",
    runnablePath: "Valorant\\Valorant.exe",
    publisherName: "VNG",
    developerName: "Kingame Corporation",
    publishDate: 1726572415000,
    status: "available",
    shopUrl: "",
    authType: "signin",
    cover: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
      tintColor: "ffffff",
    },
    thumbnail: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-Appicon.jpg",
      tintColor: "ffffff",
    },
    icon: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-Appicon.jpg",
      tintColor: "ffffff",
    },
    verticalThumbnail: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
      tintColor: "ffffff",
    },
    detail_cover_urls: [
      "https://media.gq-magazine.co.uk/photos/645b5c3c8223a5c3801b8b26/16:9/w_1280%2Cc_limit/100-best-games-hp-b.jpg",
    ],
    detail_thumbnail_urls: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2sB7jL4sxjCtvdc7RoPnTRRVWTWOsYIX8Rg&s",
    ],
    logo: {
      mimeType: "image/png",
      url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-GameName.png",
      tintColor: "ffffff",
    },
    installPath: "Ghost Story",
    shopType: "sinrd",
    metadata: {},
    mediaItems: [
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-1st.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-2nd.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-3rd.jpg",
        tintColor: "ffffff",
      },
      {
        mimeType: "image/jpeg",
        url: "https://cdn-nexus.vnggames.com/assets/images/gunnypc/Gunny-BigImage-4th.jpg",
        tintColor: "ffffff",
      },
    ],
    developer: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/thiennu/developer.jpg",
      tintColor: "ffffff",
    },
    publisher: {
      mimeType: "image/jpeg",
      url: "https://cdn-nexus.vnggames.com/assets/images/thiennu/publisher.jpg",
      tintColor: "ffffff",
    },
    ageRating: 12,
    homepageUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    discordUrl: "",
    csUrl: "",
    youtubeUrl: "",
    redditUrl: "",
    groupFacebookUrl: "",
    internalVersion: 1,
  },
];
