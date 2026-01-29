import {
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandPocket,
  IconBrandX,
  IconLetterL,
  IconShare2,
} from "@tabler/icons-react";

export type SharePlatform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "line"
  | "pocket";

export interface SharePlatformConfig {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  buildUrl: (url: string, title: string) => string;
}

export const SHARE_PLATFORMS: Record<SharePlatform, SharePlatformConfig> = {
  twitter: {
    name: "X (Twitter)",
    icon: IconBrandX,
    color: "#000000",
    buildUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "Facebook",
    icon: IconBrandFacebook,
    color: "#1877F2",
    buildUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  linkedin: {
    name: "LinkedIn",
    icon: IconBrandLinkedin,
    color: "#0A66C2",
    buildUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  line: {
    name: "LINE",
    icon: IconLetterL,
    color: "#06C755",
    buildUrl: (url, title) =>
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  pocket: {
    name: "Pocket",
    icon: IconBrandPocket,
    color: "#EF4056",
    buildUrl: (url, title) =>
      `https://getpocket.com/save?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
};

export const NATIVE_SHARE_ICON = IconShare2;
