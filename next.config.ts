const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // enable only in prod
});

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ["powerup-pwa.vercel.app"],
  },
});
