export interface RewardTier {
  points: number;
  peso: number;
}

export const REWARD_TIERS: Record<string, RewardTier[]> = {
  ordinary: [
    { points: 50, peso: 20 },
    { points: 100, peso: 40 },
    { points: 250, peso: 100 },
    { points: 500, peso: 250 },
  ],
  fleet: [
    { points: 1000, peso: 500 },
    { points: 2000, peso: 1200 },
    { points: 5000, peso: 3500 },
  ],
};
