"use client";

import { useState, useCallback, useEffect } from "react";
import { Poll, PollStatus } from "@/lib/types";
import { useAleo } from "./useAleo";
import { CATEGORIES, Category } from "@/lib/constants";

const MOCK_POLLS: Poll[] = [
  {
    id: "poll_001",
    question: "Will ETH cross \$4,000 before June 30, 2025?",
    optionA: "Yes, ETH will cross \$4K",
    optionB: "No, ETH stays below \$4K",
    poolOptionA: 150000000,
    poolOptionB: 85000000,
    totalPool: 235000000,
    totalBets: 47,
    status: PollStatus.Active,
    winningOption: 0,
    deadline: Date.now() + 86400000 * 30,
    creator: "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "poll_002",
    question: "Will Bitcoin reach \$100K before 2026?",
    optionA: "Yes, BTC hits \$100K",
    optionB: "No, BTC stays under \$100K",
    poolOptionA: 320000000,
    poolOptionB: 180000000,
    totalPool: 500000000,
    totalBets: 124,
    status: PollStatus.Active,
    winningOption: 0,
    deadline: Date.now() + 86400000 * 90,
    creator: "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "poll_003",
    question: "Will the Fed cut rates in July 2025?",
    optionA: "Yes, rate cut happens",
    optionB: "No, rates unchanged",
    poolOptionA: 90000000,
    poolOptionB: 110000000,
    totalPool: 200000000,
    totalBets: 89,
    status: PollStatus.Active,
    winningOption: 0,
    deadline: Date.now() + 86400000 * 45,
    creator: "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "poll_004",
    question: "Champions League Final: Will Real Madrid win?",
    optionA: "Yes, Real Madrid wins",
    optionB: "No, Real Madrid loses",
    poolOptionA: 200000000,
    poolOptionB: 175000000,
    totalPool: 375000000,
    totalBets: 210,
    status: PollStatus.Resolved,
    winningOption: 1,
    deadline: Date.now() - 86400000,
    creator: "aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc",
    createdAt: Date.now() - 86400000 * 14,
  },
];

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
  const { fetchPollData } = useAleo();

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    try {
      // In production, fetch from on-chain + off-chain index
      // For now, use mock data
      setPolls(MOCK_POLLS);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPollData = useCallback(
    async (pollId: string) => {
      try {
        const onChainData = await fetchPollData(pollId);
        setPolls((prev) =>
          prev.map((p) =>
            p.id === pollId
              ? {
                  ...p,
                  poolOptionA: onChainData.poolOptionA,
                  poolOptionB: onChainData.poolOptionB,
                  totalPool: onChainData.totalPool,
                  totalBets: onChainData.totalBets,
                  status: onChainData.status as PollStatus,
                  winningOption: onChainData.winningOption,
                }
              : p
          )
        );
      } catch (error) {
        console.error("Failed to refresh poll:", error);
      }
    },
    [fetchPollData]
  );

  const getActivePolls = useCallback(() => {
    return polls.filter((p) => p.status === PollStatus.Active);
  }, [polls]);

  const getResolvedPolls = useCallback(() => {
    return polls.filter((p) => p.status === PollStatus.Resolved);
  }, [polls]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  return {
    polls,
    loading,
    selectedCategory,
    setSelectedCategory,
    fetchPolls,
    refreshPollData,
    getActivePolls,
    getResolvedPolls,
  };
}