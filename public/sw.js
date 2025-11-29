if (!self.define) {
  let e,
    s = {};
  const a = (a, c) => (
    (a = new URL(a + ".js", c).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = a), (e.onload = s), document.head.appendChild(e);
        } else (e = a), importScripts(a), s();
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, t) => {
    const i = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (s[i]) return;
    let n = {};
    const r = (e) => a(e, i),
      f = { module: { uri: i }, exports: n, require: r };
    s[i] = Promise.all(c.map((e) => f[e] || r(e))).then((e) => (t(...e), n));
  };
}
define(["./workbox-87b8d583"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "/_next/app-build-manifest.json", revision: "d494f531b49bda5b1f7523bf1bc03eb5" },
        {
          url: "/_next/static/IoZVKJqpWnkbES6mdKZEM/_buildManifest.js",
          revision: "ac60e8070519b5d93f64259a3e57f411",
        },
        {
          url: "/_next/static/IoZVKJqpWnkbES6mdKZEM/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        { url: "/_next/static/chunks/310-29211fecfd1c4ec3.js", revision: "29211fecfd1c4ec3" },
        { url: "/_next/static/chunks/3568-ff86340d55f246fb.js", revision: "ff86340d55f246fb" },
        { url: "/_next/static/chunks/3922-1f90fd7dd9bb81ac.js", revision: "1f90fd7dd9bb81ac" },
        { url: "/_next/static/chunks/41ade5dc-eb384ecbd43159ba.js", revision: "eb384ecbd43159ba" },
        { url: "/_next/static/chunks/472.a3826d29d6854395.js", revision: "a3826d29d6854395" },
        { url: "/_next/static/chunks/4bd1b696-602635ee57868870.js", revision: "602635ee57868870" },
        { url: "/_next/static/chunks/5964-2a1ddd40921d073b.js", revision: "2a1ddd40921d073b" },
        { url: "/_next/static/chunks/6766-7831eb684e5d6775.js", revision: "7831eb684e5d6775" },
        { url: "/_next/static/chunks/7305-54d99e9196c38a86.js", revision: "54d99e9196c38a86" },
        { url: "/_next/static/chunks/8064-ec6e6b2bd439d4af.js", revision: "ec6e6b2bd439d4af" },
        { url: "/_next/static/chunks/8e1d74a4-c142c7a78ecd3cf5.js", revision: "c142c7a78ecd3cf5" },
        { url: "/_next/static/chunks/9341.38a5d6f1af42a503.js", revision: "38a5d6f1af42a503" },
        {
          url: "/_next/static/chunks/app/_not-found/page-244e295e0b89f629.js",
          revision: "244e295e0b89f629",
        },
        {
          url: "/_next/static/chunks/app/admin/customer/page-6fe2fefb2ab37658.js",
          revision: "6fe2fefb2ab37658",
        },
        {
          url: "/_next/static/chunks/app/admin/dashboard/page-b1b4612078c7a77e.js",
          revision: "b1b4612078c7a77e",
        },
        {
          url: "/_next/static/chunks/app/admin/layout-6c6edf3b80eded72.js",
          revision: "6c6edf3b80eded72",
        },
        {
          url: "/_next/static/chunks/app/admin/points/page-6a2b21be8452735f.js",
          revision: "6a2b21be8452735f",
        },
        {
          url: "/_next/static/chunks/app/api/admin/customers/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/admin/points-conversion/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/admin/stats/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/admin/stats/trends/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/forgot-password/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/login/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/logout/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/me/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/register/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/reset-password/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/auth/verify-otp/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/otp/send/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/otp/verify/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/redemptions/me/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/transactions/me/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/vouchers/create/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/vouchers/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/api/vouchers/user/%5Bid%5D/route-f421d573bffd402c.js",
          revision: "f421d573bffd402c",
        },
        {
          url: "/_next/static/chunks/app/dashboard/page-a4e2f7a6fb430dec.js",
          revision: "a4e2f7a6fb430dec",
        },
        {
          url: "/_next/static/chunks/app/help/about-us/page-420ae26755145c50.js",
          revision: "420ae26755145c50",
        },
        {
          url: "/_next/static/chunks/app/help/policy/page-20a36499a020d5b5.js",
          revision: "20a36499a020d5b5",
        },
        {
          url: "/_next/static/chunks/app/help/rewards-history/page-184a4c7665ea3db6.js",
          revision: "184a4c7665ea3db6",
        },
        {
          url: "/_next/static/chunks/app/help/terms/page-a07d7874854a1fc0.js",
          revision: "a07d7874854a1fc0",
        },
        {
          url: "/_next/static/chunks/app/layout-11fd8a0b38ca87c4.js",
          revision: "11fd8a0b38ca87c4",
        },
        {
          url: "/_next/static/chunks/app/login/page-b660ff581d916db9.js",
          revision: "b660ff581d916db9",
        },
        { url: "/_next/static/chunks/app/page-f421d573bffd402c.js", revision: "f421d573bffd402c" },
        {
          url: "/_next/static/chunks/app/profile/additional/page-0156a0a129a26d3d.js",
          revision: "0156a0a129a26d3d",
        },
        {
          url: "/_next/static/chunks/app/profile/personal/page-a902c648ee605de8.js",
          revision: "a902c648ee605de8",
        },
        {
          url: "/_next/static/chunks/app/register/page-a4acb92f731f5290.js",
          revision: "a4acb92f731f5290",
        },
        {
          url: "/_next/static/chunks/app/reset-password/page-64d18ceadd531bce.js",
          revision: "64d18ceadd531bce",
        },
        {
          url: "/_next/static/chunks/app/rewards/faqs/page-314e378902681fde.js",
          revision: "314e378902681fde",
        },
        {
          url: "/_next/static/chunks/app/rewards/page-12fabd83a15f6b2a.js",
          revision: "12fabd83a15f6b2a",
        },
        {
          url: "/_next/static/chunks/app/rewards/vouchers/page-057a0152f9bfae85.js",
          revision: "057a0152f9bfae85",
        },
        {
          url: "/_next/static/chunks/app/settings/account-security/page-8ddf27e09ea3d86c.js",
          revision: "8ddf27e09ea3d86c",
        },
        {
          url: "/_next/static/chunks/app/transactions/page-6fa7047a3b3a5aa3.js",
          revision: "6fa7047a3b3a5aa3",
        },
        { url: "/_next/static/chunks/framework-2c9863a08d67ec10.js", revision: "2c9863a08d67ec10" },
        { url: "/_next/static/chunks/main-952f64b9619f48dc.js", revision: "952f64b9619f48dc" },
        { url: "/_next/static/chunks/main-app-24ca4748f069c767.js", revision: "24ca4748f069c767" },
        {
          url: "/_next/static/chunks/pages/_app-6ffeaeea9cdb76a2.js",
          revision: "6ffeaeea9cdb76a2",
        },
        {
          url: "/_next/static/chunks/pages/_error-bf4ef44063da0134.js",
          revision: "bf4ef44063da0134",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        { url: "/_next/static/chunks/webpack-55f4be1df41f566c.js", revision: "55f4be1df41f566c" },
        { url: "/_next/static/css/d371dca4ab13f05c.css", revision: "d371dca4ab13f05c" },
        {
          url: "/_next/static/media/powerup-logo-2.26d62369.png",
          revision: "abe52ccc26ab481c9d63ace3771a7175",
        },
        {
          url: "/_next/static/media/powerup-logo.9a5ee4eb.png",
          revision: "b844e3dcf2a066cab9220b85e10a59a9",
        },
        {
          url: "/_next/static/media/powerup-new-logo.01ed6ced.png",
          revision: "67e5a166074f46519304e9a7e7cdbacc",
        },
        { url: "/assets/icons/motorbike.svg", revision: "24ef0598d731e9728667c77bd4f340fe" },
        { url: "/assets/logo/powerup-logo-2.png", revision: "abe52ccc26ab481c9d63ace3771a7175" },
        { url: "/assets/logo/powerup-logo.png", revision: "b844e3dcf2a066cab9220b85e10a59a9" },
        { url: "/assets/logo/powerup-new-logo.png", revision: "67e5a166074f46519304e9a7e7cdbacc" },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        { url: "/icons/app_icon.png", revision: "49a35d798e55c2ed82e9b6248ec656bc" },
        { url: "/manifest.json", revision: "dd226c26a189b1bd89960f5a7ef02676" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: a, state: c }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, { status: 200, statusText: "OK", headers: s.headers })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/powerup-pwa\.vercel\.app\/api\/.*/i,
      new e.NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 }),
          new e.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/powerup-pwa\.vercel\.app\/api\/vouchers\/.*/i,
      new e.NetworkFirst({
        cacheName: "qr-cache",
        networkTimeoutSeconds: 5,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 120 }),
          new e.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/powerup-pwa\.vercel\.app\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)/i,
      new e.CacheFirst({
        cacheName: "image-cache",
        plugins: [new e.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 86400 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts",
        plugins: [new e.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 2592e3 })],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/powerup-pwa\.vercel\.app\/_next\/static\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })],
      }),
      "GET"
    );
});
