"use client";
import { useEffect } from "react";

export default function AutoInstallPWA() {
  useEffect(() => {
    // Define the custom event type
    interface BeforeInstallPromptEvent extends Event {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;

      // Wait a few seconds before showing the prompt
      setTimeout(async () => {
        try {
          await event.prompt();
          const choice = await event.userChoice;
          console.log("PWA install outcome:", choice.outcome);
        } catch (err) {
          console.error("Error showing install prompt:", err);
        }
      }, 3000); // ⏳ delay 3 seconds after page load
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
