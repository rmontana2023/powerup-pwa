const DATABASE = "powerup-promo-frequency";
const STORE = "impressions";
const promoKey = (promoId: string) => `promo:${promoId}:last-shown-day`;

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
async function dayOperation(promoId: string, dayKey: string, claim: boolean): Promise<boolean> {
  const db = await openDatabase();
  try {
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE, claim ? "readwrite" : "readonly");
      const store = tx.objectStore(STORE);
      const request = store.get(promoKey(promoId));
      let result = false;
      request.onsuccess = () => {
        const seen = typeof request.result === "string" && request.result >= dayKey;
        result = claim ? !seen : seen;
        if (claim && !seen) store.put(dayKey, promoKey(promoId));
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error ?? new Error("Promo storage was interrupted."));
    });
  } finally { db.close(); }
}

export const hasSeenPromoDay = (promoId: string, dayKey: string) => dayOperation(promoId, dayKey, false);
export const claimPromoDay = (promoId: string, dayKey: string) => dayOperation(promoId, dayKey, true);
