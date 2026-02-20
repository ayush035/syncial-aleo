"use client";

import React, { useState } from "react";
import PostCard from "@/components/PostCard";
import PollCard from "@/components/PollCard";
import WalletConnect from "@/components/WalletConnect";
import { usePolls } from "@/hooks/usePolls";
import { useWallet } from "@/hooks/useWallet";
import { Post, PollStatus } from "@/lib/types";
import {
  TrendingUp,
  Flame,
  Clock,
  Filter,
  Shield,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

const MOCK_POSTS: Post[] = [
  {
    id: "post_001",
    contentHash: "hash1",
    content:
      "I think ETH is about to break out. The on-chain metrics look incredibly bullish. What do you all think?",
    author: {
      address: "aleo1abcdefghijklmnop",
      usernameHash: "hash",
      username: "CryptoSage",
      reputationScore: 7500,
      totalPosts: 42,
      totalPollsCreated: 12,
      totalBetsWon: 28,
      totalBetsLost: 14,
      joinedAt: Date.now() - 86400000 * 90,
    },
    timestamp: Date.now() - 3600000,
    isPoll: true,
    pollId: "poll_001",
    poll: {
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
    },
    likes: 34,
    comments: [],
  },
  {
    id: "post_002",
    contentHash: "hash2",
    content:
      "The Fed's next move will be critical for markets. I've been analyzing the economic data and here's my take on what happens next...",
    author: {
      address: "aleo1zyxwvutsrqponml",
      usernameHash: "hash2",
      username: "MacroAlpha",
      reputationScore: 8200,
      totalPosts: 89,
      totalPollsCreated: 23,
      totalBetsWon: 41,
      totalBetsLost: 18,
      joinedAt: Date.now() - 86400000 * 120,
    },
    timestamp: Date.now() - 7200000,
    isPoll: true,
    pollId: "poll_003",
    poll: {
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
      creator: "aleo1zyxwvutsrqponml",
      createdAt: Date.now() - 86400000,
    },
    likes: 56,
    comments: [],
  },
  {
    id: "post_003",
    contentHash: "hash3",
    content:
      "Just made my first prediction on Syncial and won! The privacy features are amazing - nobody can see my bet details. This is the future of social prediction markets. 🔮",
    author: {
      address: "aleo1mnbvcxzasdfghjk",
      usernameHash: "hash3",
      username: "PrivacyMaxi",
      reputationScore: 5800,
      totalPosts: 15,
      totalPollsCreated: 3,
      totalBetsWon: 8,
      totalBetsLost: 5,
      joinedAt: Date.now() - 86400000 * 30,
    },
    timestamp: Date.now() - 14400000,
    isPoll: false,
    likes: 22,
    comments: [],
  },
];

type FeedFilter = "trending" | "latest" | "active";

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>("trending");
  const { polls, getActivePolls } = usePolls();
  const { connected } = useWallet();

  const activePolls = getActivePolls();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main Feed */}
      <div>
        {/* Hero banner */}
        <div className="glow-border mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                Predict. Stake. <span className="gradient-text">Earn.</span>
              </h1>
              <p className="mb-4 max-w-md text-sm text-syncial-muted sm:text-base">
                Privacy-preserving prediction markets powered by Aleo's zero-knowledge proofs. 
                Your bets, your privacy.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/poll/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <Zap className="h-4 w-4" />
                  Create Poll
                </Link>
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 rounded-xl border border-syncial-border bg-syncial-card px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-syncial-border"
                >
                  <TrendingUp className="h-4 w-4" />
                  Browse Markets
                </Link>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Active Polls"
                  value={activePolls.length.toString()}
                  icon={<BarChart3 className="h-4 w-4 text-syncial-primary" />}
                />
                <StatBox
                  label="Total Volume"
                  value="1.2M"
                  icon={<TrendingUp className="h-4 w-4 text-syncial-accent" />}
                />
                <StatBox
                  label="Users"
                  value="847"
                  icon={<Users className="h-4 w-4 text-purple-400" />}
                />
                <StatBox
                  label="Privacy"
                  value="ZK"
                  icon={<Shield className="h-4 w-4 text-emerald-400" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feed filters */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-syncial-card p-1">
            <FilterButton
              active={filter === "trending"}
              onClick={() => setFilter("trending")}
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Trending"
            />
            <FilterButton
              active={filter === "latest"}
              onClick={() => setFilter("latest")}
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Latest"
            />
            <FilterButton
              active={filter === "active"}
              onClick={() => setFilter("active")}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Active"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-syncial-border px-3 py-1.5 text-xs text-syncial-muted transition-colors hover:border-syncial-primary hover:text-white">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {/* Posts */}
        <div className="overflow-hidden rounded-2xl border border-syncial-border">
          {MOCK_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-6 text-center">
          <button className="rounded-xl border border-syncial-border px-8 py-3 text-sm font-medium text-syncial-muted transition-colors hover:border-syncial-primary hover:text-white">
            Load More Posts
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden space-y-6 lg:block">
        {/* Wallet */}
        {!connected && <WalletConnect />}

        {/* Trending polls */}
        <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <Flame className="h-5 w-5 text-orange-400" />
            Trending Markets
          </h3>
          <div className="space-y-3">
            {activePolls.slice(0, 3).map((poll) => (
              <TrendingPollItem key={poll.id} poll={poll} />
            ))}
          </div>
          <Link
            href="/feed"
            className="mt-4 block text-center text-sm text-syncial-primary hover:underline"
          >
            View All Markets →
          </Link>
        </div>

        {/* Leaderboard preview */}
        <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-syncial-accent" />
            Top Predictors
          </h3>
          <div className="space-y-3">
            {[
              { name: "CryptoSage", accuracy: 78.5, predictions: 42, rank: 1 },
              { name: "MacroAlpha", accuracy: 74.2, predictions: 89, rank: 2 },
              { name: "DataNerd", accuracy: 71.8, predictions: 56, rank: 3 },
              { name: "ChainOracle", accuracy: 69.3, predictions: 34, rank: 4 },
              { name: "PrivacyMaxi", accuracy: 67.1, predictions: 15, rank: 5 },
            ].map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-3 rounded-xl bg-syncial-bg p-3"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    user.rank === 1
                      ? "bg-yellow-500/20 text-yellow-400"
                      : user.rank === 2
                        ? "bg-gray-400/20 text-gray-300"
                        : user.rank === 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-syncial-border text-syncial-muted"
                  }`}
                >
                  {user.rank}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-syncial-muted">
                    {user.predictions} predictions
                  </p>
                </div>
                <span className="text-sm font-bold text-syncial-success">
                  {user.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy info */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <Shield className="h-5 w-5" />
            <h3 className="font-semibold">Privacy by Default</h3>
          </div>
          <ul className="space-y-2 text-xs text-emerald-300/70">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Bet amounts are private ZK records
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Your prediction choices are hidden
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Only aggregate pool totals are public
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
              Powered by Aleo zero-knowledge proofs
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-syncial-card/80 p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-syncial-bg">
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-syncial-muted">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        active
          ? "bg-syncial-primary/15 text-syncial-primary"
          : "text-syncial-muted hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TrendingPollItem({ poll }: { poll: any }) {
  const formatCredits = (mc: number) => {
    const c = mc / 1000000;
    return c >= 1000 ? `${(c / 1000).toFixed(1)}K` : c.toFixed(1);
  };

  return (
    <Link
      href={`/poll/${poll.id}`}
      className="block rounded-xl bg-syncial-bg p-3 transition-colors hover:bg-syncial-border"
    >
      <p className="mb-2 text-sm font-medium leading-snug text-white">
        {poll.question}
      </p>
      <div className="flex items-center justify-between text-xs text-syncial-muted">
        <span>{formatCredits(poll.totalPool)} credits</span>
        <span>{poll.totalBets} bets</span>
      </div>
    </Link>
  );
}