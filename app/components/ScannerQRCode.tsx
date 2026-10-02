"use client";

import { QRCodeSVG as BaseQRCodeSVG } from "qrcode.react";
import type { ComponentProps } from "react";

// Keep every QR opaque and scannable, including inside dark-themed screens.
export function QRCodeSVG(props: ComponentProps<typeof BaseQRCodeSVG>) {
  return (
    <BaseQRCodeSVG
      {...props}
      bgColor="#ffffff"
      fgColor="#000000"
      marginSize={4}
      style={{
        ...props.style,
        backgroundColor: "#ffffff",
        colorScheme: "only light",
        forcedColorAdjust: "none",
      }}
    />
  );
}
