// Temporary testing bypass. Set to false to restore offline detection.
export const OFFLINE_TEST_BYPASS = true;

export function isAppOnline() {
  return OFFLINE_TEST_BYPASS || typeof navigator === "undefined" || navigator.onLine;
}
