"use client";
import { isAppOnline } from "@/lib/connectivity";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowUpRight, Megaphone, X } from "lucide-react";
import { CustomerPromo, safePromoLink } from "@/lib/promo-rules";

interface PromoDetails extends CustomerPromo {
  mechanics: string;
  startsAt: string | null;
  endsAt: string | null;
}

function Artwork({ promo }: { promo: PromoDetails }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="flex h-44 items-center justify-center bg-orange-500/10 text-orange-400">
      <Megaphone size={32} aria-hidden="true" />
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- Artwork comes from an authenticated, network-only API.
    <img
      src={promo.imageUrl}
      alt={promo.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="max-h-72 w-full bg-black/20 object-contain"
    />
  );
}

export default function PromoSection() {
  const [promos, setPromos] = useState<PromoDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = promos.find((promo) => promo.id === selectedId);

  useEffect(() => {
    let controller: AbortController | undefined;
    let disposed = false;
    async function refresh() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        if (!isAppOnline()) throw new Error("Connect to the internet to view current promos.");
        const response = await fetch("/api/promos/list", {
          cache: "no-store",
          signal: request.signal,
        });
        if (!response.ok) throw new Error("Unable to load promos. Please try again.");
        const data = await response.json();
        if (!disposed && !request.signal.aborted) {
          setPromos(data.promos);
          setError("");
        }
      } catch (err) {
        if (!disposed && !request.signal.aborted) {
          setPromos([]);
          setSelectedId(null);
          setError(err instanceof Error ? err.message : "Unable to load promos.");
        }
      } finally {
        if (!disposed && !request.signal.aborted) setLoading(false);
      }
    }
    setLoading(true);
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [retry]);

  return (
    <section aria-labelledby="dashboard-promos-title" className="mb-8 w-full max-w-md">
      <div className="mb-4">
        <h2 id="dashboard-promos-title" className="flex items-center gap-2 text-lg font-bold">
          <Megaphone size={20} className="text-orange-400" />
          Promos
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Explore current offers and read the full mechanics.
        </p>
      </div>
      {loading ? (
        <p role="status" className="py-6 text-sm text-gray-400">
          Loading promos…
        </p>
      ) : error ? (
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <p role="status" className="text-sm text-gray-400">
            {error}
          </p>
          <button
            onClick={() => setRetry((value) => value + 1)}
            className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-orange-400 focus-visible:outline-2 focus-visible:outline-orange-400"
          >
            Retry
          </button>
        </div>
      ) : !promos.length ? (
        <p className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 text-sm text-gray-400">
          No active promos right now. Check back soon for new offers.
        </p>
      ) : (
        <div className="space-y-4">
          {promos.map((promo) => (
            <article
              key={promo.id}
              className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-md"
            >
              <Artwork key={promo.imageUrl} promo={promo} />
              <div className="space-y-3 p-5">
                <h3 className="break-words text-lg font-semibold">{promo.title}</h3>
                {promo.endsAt && (
                  <p className="text-xs text-gray-400">
                    Until{" "}
                    {new Date(promo.endsAt).toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Manila",
                    })}{" "}
                    (Philippine time)
                  </p>
                )}
                {promo.mechanics && (
                  <p className="line-clamp-2 whitespace-pre-line break-words text-sm text-gray-400">
                    {promo.mechanics}
                  </p>
                )}
                <button
                  onClick={() => setSelectedId(promo.id)}
                  aria-label={`View mechanics for ${promo.title}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
                >
                  View full mechanics
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Dialog
        open={!!selected}
        onClose={() => setSelectedId(null)}
        className="fixed inset-0 z-[10000]"
      >
        <div aria-hidden="true" className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
          {selected && (
            <DialogPanel className="relative max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#111] text-white shadow-2xl">
              <button
                type="button"
                data-autofocus
                aria-label="Close promo mechanics"
                onClick={() => setSelectedId(null)}
                className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/80 text-white focus-visible:outline-2 focus-visible:outline-orange-400"
              >
                <X size={22} />
              </button>
              <Artwork key={selected.imageUrl} promo={selected} />
              <div className="space-y-5 p-5 sm:p-6">
                <DialogTitle className="break-words text-xl font-bold">
                  {selected.title}
                </DialogTitle>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-400">
                    Full promo mechanics
                  </h3>
                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                    {selected.mechanics ||
                      "Full mechanics have not been provided yet. Please ask the station staff for details."}
                  </p>
                </div>
                {selected.rewardId && /^[a-f\d]{24}$/i.test(selected.rewardId) && (
                  <a
                    href={`/rewards?reward=${selected.rewardId}#rewards`}
                    className="block rounded-xl bg-orange-500 px-4 py-3 text-center font-semibold text-black"
                  >
                    View reward
                  </a>
                )}
                {safePromoLink(selected.link) && (
                  <a
                    href={safePromoLink(selected.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Visit promo link
                    <ArrowUpRight size={16} />
                  </a>
                )}
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-full rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/5"
                >
                  Back to dashboard
                </button>
              </div>
            </DialogPanel>
          )}
        </div>
      </Dialog>
    </section>
  );
}
