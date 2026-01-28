import { ActionIcon, Group, Tooltip, TooltipProps } from "@mantine/core";
import { NATIVE_SHARE_ICON, SHARE_PLATFORMS, type SharePlatform } from "@/lib/share";

export interface ShareButtonsGridProps {
  shareUrl: string;
  shareTitle: string;
  supportsNativeShare: boolean;
  onNativeShare: () => void;
  onPlatformShare: (platform: SharePlatform) => void;
  nativeShareLabel: string;
  getPlatformShareLabel: (platformName: string) => string;
  tooltipPosition?: TooltipProps["position"];
}

export function ShareButtonsGrid({
  supportsNativeShare,
  onNativeShare,
  onPlatformShare,
  nativeShareLabel,
  getPlatformShareLabel,
  tooltipPosition = "bottom",
}: ShareButtonsGridProps) {
  return (
    <Group wrap="wrap" justify="center" gap="xs" w="100%" style={{ alignContent: "center" }}>
      {/* Native Share Button (macOS/iOS style) */}
      {supportsNativeShare && (
        <Tooltip label={nativeShareLabel} position={tooltipPosition}>
          <ActionIcon
            onClick={onNativeShare}
            size={48}
            radius="lg"
            variant="filled"
            color="gray"
            aria-label={nativeShareLabel}
          >
            <NATIVE_SHARE_ICON size={24} />
          </ActionIcon>
        </Tooltip>
      )}
      {(Object.keys(SHARE_PLATFORMS) as SharePlatform[]).map((platform) => {
        const config = SHARE_PLATFORMS[platform];
        const Icon = config.icon;
        return (
          <Tooltip key={platform} label={config.name} position={tooltipPosition}>
            <ActionIcon
              onClick={() => onPlatformShare(platform)}
              size={48}
              radius="lg"
              variant="filled"
              style={{ backgroundColor: config.color }}
              aria-label={getPlatformShareLabel(config.name)}
            >
              <Icon size={24} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </Group>
  );
}
