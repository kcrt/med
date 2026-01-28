import { SHARE_PLATFORMS, type SharePlatform } from "@/lib/share";

export interface UseShareHandlerOptions {
  shareUrl: string;
  shareTitle: string;
  supportsNativeShare: boolean;
  onShareComplete?: () => void;
}

export function useShareHandler({
  shareUrl,
  shareTitle,
  supportsNativeShare,
  onShareComplete,
}: UseShareHandlerOptions) {
  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;

    try {
      await navigator.share({
        title: shareTitle,
        url: shareUrl,
      });
      onShareComplete?.();
    } catch (err) {
      // User canceled the share or error occurred
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to share:", err);
      }
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    const config = SHARE_PLATFORMS[platform];
    const platformUrl = config.buildUrl(shareUrl, shareTitle);
    window.open(platformUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return { handleNativeShare, handlePlatformShare };
}
