// lib/offline-cache.ts

export function cacheOfflineUser(user: any) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("customerId", user._id || user.id);
  localStorage.setItem("customerName", user.name || "");
  localStorage.setItem("customerQR", user.qrCode || "");
  localStorage.setItem("lastSync", new Date().toISOString());

  if (user.email) {
    localStorage.setItem("customerEmail", user.email);
  }

  if (user.mobile) {
    localStorage.setItem("customerMobile", user.mobile);
  }
}
