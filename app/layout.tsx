import type { Metadata, Viewport } from "next";
import "./globals.css";
import InstallPWAButton from "./components/InstallPWAButton"; // ✅ we'll create this next

export const metadata: Metadata = {
  title: "PowerUp Rewards",
  description: "Track your fuel points and rewards.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4500",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ PWA meta tags */}
        <meta name="theme-color" content="#ff4500" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        {children}

        {/* ✅ Floating Install button */}
        <InstallPWAButton />
      </body>
    </html>
  );
}
