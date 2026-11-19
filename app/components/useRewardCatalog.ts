"use client";
import { useEffect, useState } from "react";
import { RewardTier } from "@/lib/reward-tiers";
export function useRewardCatalog(accountType?: string) {
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [rewardsError, setRewardsError] = useState("");
  useEffect(() => {
    if (!accountType) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/rewards/catalog", { cache: "no-store", signal: controller.signal });
        const data = await response.json(); if (!response.ok) throw new Error(data.error);
        if (!controller.signal.aborted) { setTiers(data.rewards); setRewardsError(""); }
      } catch (error) { if (!controller.signal.aborted) { setTiers([]); setRewardsError(error instanceof Error ? error.message : "Unable to load rewards."); } }
    }
    void refresh(); const timer = window.setInterval(refresh, 30_000); window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [accountType]);
  return { tiers, rewardsError };
}
