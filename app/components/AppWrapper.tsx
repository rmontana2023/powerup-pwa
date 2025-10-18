"use client";

import InstallPWAButton from "./InstallPWAButton";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPWAButton />
    </>
  );
}
