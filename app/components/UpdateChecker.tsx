"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";

export default function UpdateChecker() {
  useEffect(() => {
    checkVersion();
  }, []);

  async function checkVersion() {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);

      const data = await res.json();

      const latestVersion = data.version;

      const currentVersion = localStorage.getItem("app-version");

      // First visit
      if (!currentVersion) {
        localStorage.setItem("app-version", latestVersion);
        return;
      }

      // New version detected
      if (currentVersion !== latestVersion) {
        Swal.fire({
          icon: "info",
          title: "Update Available",
          html: `
            <p>A new version of PowerUp Rewards is available.</p>
            <br/>
            <b>Current:</b> ${currentVersion}<br/>
            <b>Latest:</b> ${latestVersion}
          `,
          confirmButtonText: "Update Now",
          allowOutsideClick: false,
        }).then(() => {
          localStorage.setItem("app-version", latestVersion);
          window.location.reload();
        });
      }
    } catch (err) {
      console.error("Version check failed", err);
    }
  }

  return null;
}