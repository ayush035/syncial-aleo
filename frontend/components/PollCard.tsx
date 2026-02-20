"use client";

import React, { useState, useMemo } from "react";
import { Poll, PollStatus } from "@/lib/types";
import { aleoService } from "@/lib/aleo";
import {
  PLATFORM_FEE_BPS,
  CREATOR_FEE_BPS,
  WINNER_POOL_BPS,
  MIN_BET_AMOUNT,
} from "@/lib/constants";
import {
  Clock,
  Users,
  TrendingUp,
  Lock,
  CheckCircle,
  XCircle,
  Shield,
  ChevronDown,
  ChevronUp,
  Coins,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import BetModal from "./BetModal";

interface PollCardProps {
  poll: Poll;
  onBetPlaced?: () => void;
}

export default function PollCard({ poll, onBetPlaced }: PollCardProps) {
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [expanded, setExpanded] = useState(false);
  const { connected } = useWallet();

  const odds = useMemo(
    () => aleoService.calculateOdds(poll.poolOptionA, poll.poolOptionB),
    [poll.poolOptionA, poll.poolOptionB]
  );

  const timeRemaining = useMemo(() => {
    const now = Date.now();
    const diff = poll.deadline - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  }, [poll.deadline]);

  const formatCredits = (microcredits: number) => {
    const credits = microcredits / 1000000;
    if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
    if (credits >= 1) return credits.toFixed(2);
    return credits.toFixed(4);
  };

  const statusBadge = () => {
    switch (poll.status) {
      case PollStatus.Active:
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Live
          </span>
        );
      case PollStatus.Resolved:
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      case PollStatus.Cancelled:
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  const handleOptionClick = (option: number) => {
    if (poll.status !== PollStatus.Active || !connected) return;
    setSelectedOption(option);
    setShowBetModal(true);
  };

  return (
    <>
      <div className="fade-in glow-border overflow-hidden rounded-2xl bg-syncial-card transition-all hover:bg-syncial-card/80">
        {/* Header */}
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between">
            {statusBadge()}
            <div className="flex items-center gap-2 text-xs text-syncial-muted">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          {/* Question */}
          <h3 className="mb-4 text-lg font-semibold leading-snug text-white">
            {poll.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            <OptionBar
              label={poll.optionA}
              percentage={odds.oddsA}
              amount={poll.poolOptionA}
              isWinner={poll.winningOption === 1}
              isResolved={poll.status === PollStatus.Resolved}
              isActive={poll.status === PollStatus.Active}
              onClick={() => handleOptionClick(1)}
              formatCredits={formatCredits}
              color="indigo"
            />
            <OptionBar
              label={poll.optionB}
              percentage={odds.oddsB}
              amount={poll.poolOptionB}
              isWinner={poll.winningOption === 2}
              isResolved={poll.status === PollStatus.Resolved}
              isActive={poll.status === PollStatus.Active}
              onClick={() => handleOptionClick(2)}
              formatCredits={formatCredits}
              color="cyan"
            />
          </div>

          {/* Stats bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-syncial-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" />
                {formatCredits(poll.totalPool)} credits
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {poll.totalBets} bets
              </span>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-syncial-primary hover:underline"
            >
              Details
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-syncial-border bg-syncial-bg/50 p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-syncial-muted">Creator Fee</p>
                <p className="font-medium text-white">
                  5% ({formatCredits((poll.totalPool * CREATOR_FEE_BPS) / 10000)}{" "}
                  credits)
                </p>
              </div>
              <div>
                <p className="text-syncial-muted">Platform Fee</p>
                <p className="font-medium text-white">
                  1% ({formatCredits((poll.totalPool * PLATFORM_FEE_BPS) / 10000)}{" "}
                  credits)
                </p>
              </div>
              <div>
                <p className="text-syncial-muted">Winner Pool</p>
                <p className="font-medium text-syncial-success">
                  94% ({formatCredits((poll.totalPool * WINNER_POOL_BPS) / 10000)}{" "}
                  credits)
                </p>
              </div>
              <div>
                <p className="text-syncial-muted">Privacy</p>
                <p className="flex items-center gap-1 font-medium text-emerald-400">
                  <Shield className="h-3.5 w-3.5" />
                  ZK-Protected Bets
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {showBetModal && (
        <BetModal
          poll={poll}
          selectedOption={selectedOption}
          onClose={() => setShowBetModal(false)}
          onBetPlaced={onBetPlaced}
        />
      )}
    </>
  );
}

function OptionBar({
  label,
  percentage,
  amount,
  isWinner,
  isResolved,
  isActive,
  onClick,
  formatCredits,
  color,
}: {
  label: string;
  percentage: number;
  amount: number;
  isWinner: boolean;
  isResolved: boolean;
  isActive: boolean;
  onClick: () => void;
  formatCredits: (n: number) => string;
  color: "indigo" | "cyan";
}) {
  const bgColor = color === "indigo" ? "bg-indigo-500" : "bg-cyan-500";
  const bgColorLight =
    color === "indigo" ? "bg-indigo-500/10" : "bg-cyan-500/10";
  const textColor =
    color === "indigo" ? "text-indigo-400" : "text-cyan-400";

  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={`group relative w-full overflow-hidden rounded-xl border transition-all ${
        isActive
          ? `border-syncial-border hover:border-${color === "indigo" ? "indigo" : "cyan"}-500/50 cursor-pointer`
          : "cursor-default border-syncial-border"
      } ${isWinner && isResolved ? "border-green-500/50 bg-green-500/5" : bgColorLight} p-3`}
    >
      {/* Progress background */}
      <div
        className={`animate-fill absolute inset-y-0 left-0 ${bgColor} opacity-10`}
        style={{ width: `${percentage}%` }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isWinner && isResolved && (
            <CheckCircle className="h-4 w-4 text-green-400" />
          )}
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-syncial-muted">
            {formatCredits(amount)}
          </span>
          <span className={`text-sm font-bold ${textColor}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Hover effect for active polls */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1 text-sm font-medium text-white">
            <Lock className="h-4 w-4" />
            Place Private Bet
          </span>
        </div>
      )}
    </button>
  );
}