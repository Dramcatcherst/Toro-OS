import { ImageResponse } from "next/og";
import { ToroSocialCard } from "@/components/toro-social-card";

export const alt = "TORO · Operación conectada";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function OpenGraphImage() {
  return new ImageResponse(<ToroSocialCard />, size);
}
