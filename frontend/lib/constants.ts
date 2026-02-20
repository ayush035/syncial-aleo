import { DEPLOYMENTS } from "./deployment";

// Program IDs - sourced from deployment config
export const PROGRAMS = {
  CORE: DEPLOYMENTS.programs.core,
  BETTING: DEPLOYMENTS.programs.betting,
  REPUTATION: DEPLOYMENTS.programs.reputation,
} as const;

export const NETWORK = DEPLOYMENTS.network;

// Aleo API endpoint
export const ALEO_API_BASE = "https://api.explorer.aleo.org/v1";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Fee structure (basis points)
export const PLATFORM_FEE_BPS = 100; // 1%
export const CREATOR_FEE_BPS = 500; // 5%
export const WINNER_POOL_BPS = 9400; // 94%

export const MIN_BET_AMOUNT = 1000; // microcredits = 0.001 credits

// Default transaction fee for Aleo
export const DEFAULT_TX_FEE = 50_000; // 0.05 credits

export const CATEGORIES = [
  "Crypto",
  "Finance",
  "Sports",
  "Politics",
  "Culture",
  "Tech",
  "Entertainment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];