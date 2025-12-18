import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppWrapper from "./components/AppWrapper";
export const metadata: Metadata = {
  title: "PowerUp Rewards",
  description: "Track your fuel points and rewards.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/app_icon.png",
    apple: "/icons/app_icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4500",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ff4500" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/app_icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
