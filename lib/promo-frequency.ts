const DATABASE = "powerup-promo-frequency";
const STORE = "impressions";
const promoKey = (promoId: string) => `promo:${promoId}:last-shown-at`;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Promo storage is unavailable."));
  });
}

// A read/write transaction serializes claims across tabs. The key is deliberately
// shared across accounts for each promo on this browser/device and survives logout.
export const PROMO_INTERVAL_MS = 60 * 60 * 1000;

export function isWithinPromoHour(lastShown: unknown, serverTime: number): boolean {
  return typeof lastShown === "number" && Number.isFinite(lastShown) && serverTime - lastShown < PROMO_INTERVAL_MS;
}

async function hourOperation(promoId: string, serverTime: number, claim: boolean): Promise<boolean> {
  if (!Number.isFinite(serverTime)) throw new Error("Invalid promo server time.");
  const db = await openDatabase();
  try {
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE, claim ? "readwrite" : "readonly");
      const store = tx.objectStore(STORE);
      const request = store.get(promoKey(promoId));
      let result = false;
      request.onsuccess = () => {
        const seen = isWithinPromoHour(request.result, serverTime);
        result = claim ? !seen : seen;
        if (claim && !seen) store.put(serverTime, promoKey(promoId));
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Promo storage was interrupted."));
    });
  } finally { db.close(); }
}

export const hasSeenPromoHour = (promoId: string, serverTime: number) => hourOperation(promoId, serverTime, false);
export const claimPromoHour = (promoId: string, serverTime: number) => hourOperation(promoId, serverTime, true);
