import type { CSSProperties } from "react";
import { roomZero } from "../brand/tokens";

type BrandMarkProps = {
  size?: number;
  color?: string;
  style?: CSSProperties;
};

export function BrandMark({ size = 68, color = roomZero.colors.signal, style }: BrandMarkProps) {
  return (
    <svg aria-label="Manywise mark" height={size} role="img" style={style} viewBox="0 0 40 40" width={size}>
      <path d="M11 11L20 20M29 11L20 20M11 29L20 20M29 29L20 20" stroke={roomZero.colors.cyan} strokeWidth="2" />
      <rect fill={color} height="10" rx="1" width="10" x="4" y="4" />
      <rect fill={color} height="10" rx="1" width="10" x="26" y="4" />
      <rect fill={color} height="10" rx="1" width="10" x="4" y="26" />
      <rect fill={color} height="10" rx="1" width="10" x="26" y="26" />
      <rect fill={roomZero.colors.amber} height="6" rx="1" width="6" x="17" y="17" />
    </svg>
  );
}
