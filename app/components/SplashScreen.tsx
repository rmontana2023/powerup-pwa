"use client";
import Image from "next/image";
import logo from "../../public/assets/logo/powerup-logo.png";

interface SplashScreenProps {
  fadeOut?: boolean;
}

export default function SplashScreen({ fadeOut }: SplashScreenProps) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-700 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Image
        src={logo}
        alt="PowerUp Rewards"
        width={180}
        height={80}
        priority
        className="animate-pulse"
      />
    </div>
  );
}
