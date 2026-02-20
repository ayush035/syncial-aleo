"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import PollCard from "@/components/PollCard";
import { useAleo } from "@/hooks/useAleo";
import { Poll, PollStatus } from "@/lib/types";
import { aleoService } from "@/lib/aleo";
import { PLATFORM_FEE_BPS, CREATOR_FEE_BPS, WINNER_POOL_BPS } from "@/lib/constants";
import {
  ArrowLeft,
  Shield,
  Clock,
  Users,
  Coins,
  TrendingUp,
  BarChart3,
  Activity,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Fallback mock poll for development
const FALLBACK_POLL: Poll = {
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
  creator: "aleo1abcdefghijklmnop",
  createdAt: Date.now() - 86400000 * 2,
};

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;
  const [poll, setPoll] = useState<Poll>(FALLBACK_POLL);
  const [loading, setLoading] = useState(true);
  const { fetchPollData } = useAleo();

  useEffect(() => {
    const loadPoll = async () => {
      setLoading(true);
      try {
        const data = await fetchPollData(pollId);
        setPoll((prev) => ({
          ...prev,
          id: pollId,
          poolOptionA: data.poolOptionA || prev.poolOptionA,
          poolOptionB: data.poolOptionB || prev.poolOptionB,
          totalPool: data.totalPool || prev.totalPool,
          totalBets: data.totalBets || prev.totalBets,
          status: (data.status as PollStatus) ?? prev.status,
          winningOption: data.winningOption ?? prev.winningOption,
        }));
      } catch (error) {
        console.error("Failed to load poll:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPoll();
  }, [pollId, fetchPollData]);

  const odds = useMemo(
    () => aleoService.calculateOdds(poll.poolOptionA, poll.poolOptionB),
    [poll.poolOptionA, poll.poolOptionB]
  );

  const formatCredits = (microcredits: number) => {
    const credits = microcredits / 1000000;
    if (credits >= 1000) return `${(credits / 1000).toFixed(2)}K`;
    return credits.toFixed(4);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-syncial-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back button */}
      <Link
        href="/feed"
        className="mb-6 inline-flex items-center gap-1 text-sm text-syncial-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Poll card */}
          <PollCard poll={poll} />

          {/* Analytics */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <BarChart3 className="h-5 w-5 text-syncial-primary" />
              Market Analytics
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <AnalyticsCard
                label="Option A Pool"
                value={`${formatCredits(poll.poolOptionA)} credits`}
                subvalue={`${odds.oddsA}% of total`}
                icon={<Activity className="h-4 w-4 text-indigo-400" />}
              />
              <AnalyticsCard
                label="Option B Pool"
                value={`${formatCredits(poll.poolOptionB)} credits`}
                subvalue={`${odds.oddsB}% of total`}
                icon={<Activity className="h-4 w-4 text-cyan-400" />}
              />
              <AnalyticsCard
                label="Total Volume"
                value={`${formatCredits(poll.totalPool)} credits`}
                subvalue={`${poll.totalBets} total bets`}
                icon={<Coins className="h-4 w-4 text-yellow-400" />}
              />
              <AnalyticsCard
                label="Winner Payout Pool"
                value={`${formatCredits((poll.totalPool * WINNER_POOL_BPS) / 10000)} credits`}
                subvalue="94% of total pool"
                icon={<TrendingUp className="h-4 w-4 text-green-400" />}
              />
            </div>

            {/* Pool distribution bar */}
            <div className="mt-6">
              <p className="mb-2 text-sm text-syncial-muted">Pool Distribution</p>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-syncial-bg">
                <div
                  className="bg-indigo-500 transition-all duration-500"
                  style={{ width: `${odds.oddsA}%` }}
                />
                <div
                  className="bg-cyan-500 transition-all duration-500"
                  style={{ width: `${odds.oddsB}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-syncial-muted">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  {poll.optionA} ({odds.oddsA}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-cyan-500" />
                  {poll.optionB} ({odds.oddsB}%)
                </span>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Activity className="h-5 w-5 text-syncial-accent" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: "placed a private bet", time: "2m ago", amount: "hidden" },
                { action: "placed a private bet", time: "8m ago", amount: "hidden" },
                { action: "placed a private bet", time: "15m ago", amount: "hidden" },
                { action: "placed a private bet", time: "1h ago", amount: "hidden" },
                { action: "placed a private bet", time: "2h ago", amount: "hidden" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-syncial-bg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-syncial-border">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        Anonymous user {activity.action}
                      </p>
                      <p className="text-xs text-syncial-muted">{activity.time}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                    🔒 Private
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Poll info */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
            <h4 className="mb-3 text-sm font-semibold text-white">Poll Info</h4>
            <div className="space-y-3 text-sm">
              <InfoRow
                icon={<Clock className="h-4 w-4" />}
                label="Deadline"
                value={new Date(poll.deadline).toLocaleDateString()}
              />
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Participants"
                value={poll.totalBets.toString()}
              />
              <InfoRow
                icon={<Coins className="h-4 w-4" />}
                label="Min Bet"
                value="0.001 credits"
              />
              <InfoRow
                icon={<Shield className="h-4 w-4 text-emerald-400" />}
                label="Privacy"
                value="ZK Protected"
              />
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Fee Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-syncial-muted">Winner Pool</span>
                <span className="font-medium text-syncial-success">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-syncial-muted">Creator Reward</span>
                <span className="font-medium text-purple-400">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-syncial-muted">Platform Fee</span>
                <span className="font-medium text-syncial-muted">1%</span>
              </div>
              <div className="mt-2 border-t border-syncial-border pt-2">
                <div className="flex justify-between">
                  <span className="text-white">Total</span>
                  <span className="font-bold text-white">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* On-chain link */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
            <h4 className="mb-3 text-sm font-semibold text-white">On-Chain</h4>
            <a
              href={`https://explorer.aleo.org/program/syncial_betting_v1.aleo`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-syncial-primary hover:underline"
            >
              View Program on Explorer
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 truncate font-mono text-xs text-syncial-muted">
              Poll ID: {pollId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  subvalue,
  icon,
}: {
  label: string;
  value: string;
  subvalue: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-syncial-bg p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs text-syncial-muted">{label}</span>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-syncial-muted">{subvalue}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-syncial-muted">
        {icon}
        {label}
      </span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}