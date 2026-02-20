"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useStore } from "@/store/useStory";
import WalletConnect from "@/components/WalletConnect";
import ReputationBadge from "@/components/ReputationBadge";
import PollCard from "@/components/PollCard";
import { PollStatus } from "@/lib/types";
import {
  Shield,
  TrendingUp,
  Award,
  Target,
  Coins,
  BarChart3,
  Eye,
  EyeOff,
  Copy,
  Check,
  Settings,
} from "lucide-react";

export default function ProfilePage() {
  const { connected, address } = useWallet();
  const { myBets } = useStore();
  const [copied, setCopied] = useState(false);
  const [showPrivateData, setShowPrivateData] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "bets" | "polls" | "settings">("overview");

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!connected) {
    return (
      <div className="mx-auto max-w-md pt-10">
        <WalletConnect />
      </div>
    );
  }

  // Mock profile data
  const profileData = {
    username: "Anonymous User",
    reputation: 6500,
    level: 5,
    totalPredictions: 34,
    correctPredictions: 22,
    accuracy: 64.7,
    totalVolume: 450000000,
    totalWinnings: 180000000,
    pollsCreated: 8,
    creatorEarnings: 25000000,
  };

  const formatCredits = (mc: number) => {
    const c = mc / 1000000;
    return c >= 1000 ? `${(c / 1000).toFixed(2)}K` : c.toFixed(2);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Profile Header */}
      <div className="glow-border mb-6 overflow-hidden rounded-2xl bg-syncial-card">
        <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
                A
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {profileData.username}
                  </h1>
                  <ReputationBadge
                    level={profileData.level}
                    accuracy={profileData.reputation}
                    size="md"
                  />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xs text-syncial-muted">
                    {address?.slice(0, 12)}...{address?.slice(-8)}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-syncial-muted transition-colors hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy toggle */}
            <button
              onClick={() => setShowPrivateData(!showPrivateData)}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              {showPrivateData ? (
                <>
                  <Eye className="h-4 w-4" />
                  Showing Private Data
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Private Data Hidden
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-syncial-border sm:grid-cols-4">
          <ProfileStat
            icon={<Target className="h-4 w-4 text-syncial-primary" />}
            label="Accuracy"
            value={`${profileData.accuracy}%`}
          />
          <ProfileStat
            icon={<BarChart3 className="h-4 w-4 text-syncial-accent" />}
            label="Predictions"
            value={`${profileData.correctPredictions}/${profileData.totalPredictions}`}
          />
          <ProfileStat
            icon={<Coins className="h-4 w-4 text-yellow-400" />}
            label="Volume"
            value={
              showPrivateData
                ? `${formatCredits(profileData.totalVolume)}`
                : "🔒 Hidden"
            }
          />
          <ProfileStat
            icon={<TrendingUp className="h-4 w-4 text-green-400" />}
            label="Winnings"
            value={
              showPrivateData
                ? `${formatCredits(profileData.totalWinnings)}`
                : "🔒 Hidden"
            }
          />
        </div>
      </div>

      {/* Section tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl bg-syncial-card p-1">
        {(["overview", "bets", "polls", "settings"] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium capitalize transition-all ${
              activeSection === section
                ? "bg-syncial-primary/15 text-syncial-primary"
                : "text-syncial-muted hover:text-white"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Section content */}
      {activeSection === "overview" && (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Prediction accuracy chart */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Target className="h-5 w-5 text-syncial-primary" />
              Prediction Accuracy
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e1e2e"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray={`${profileData.accuracy * 2.51} 251`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {profileData.accuracy}%
                  </p>
                  <p className="text-xs text-syncial-muted">Accuracy</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <p className="text-lg font-bold text-syncial-success">
                  {profileData.correctPredictions}
                </p>
                <p className="text-xs text-syncial-muted">Correct</p>
              </div>
              <div>
                <p className="text-lg font-bold text-syncial-danger">
                  {profileData.totalPredictions - profileData.correctPredictions}
                </p>
                <p className="text-xs text-syncial-muted">Incorrect</p>
              </div>
            </div>
          </div>

          {/* Creator stats */}
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Award className="h-5 w-5 text-purple-400" />
              Creator Stats
            </h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-syncial-bg p-4">
                <p className="text-sm text-syncial-muted">Polls Created</p>
                <p className="text-2xl font-bold text-white">
                  {profileData.pollsCreated}
                </p>
              </div>
              <div className="rounded-xl bg-syncial-bg p-4">
                <p className="text-sm text-syncial-muted">Creator Earnings</p>
                <p className="text-2xl font-bold text-syncial-success">
                  {showPrivateData
                    ? `${formatCredits(profileData.creatorEarnings)} credits`
                    : "🔒 Hidden"}
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-xs text-emerald-300/70">
                  Your earnings data is stored as private Aleo records. Only
                  you can view this information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "bets" && (
        <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Shield className="h-5 w-5 text-emerald-400" />
            Your Private Bets
          </h3>
          {showPrivateData ? (
            myBets.length > 0 ? (
              <div className="space-y-3">
                {myBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="rounded-xl bg-syncial-bg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">
                        Poll: {bet.pollId}
                      </span>
                      <span className="text-sm text-syncial-muted">
                        Option {bet.optionChosen}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-syncial-muted">
                      Amount: {(bet.amount / 1000000).toFixed(4)} credits
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-syncial-muted">No bets placed yet</p>
                <p className="mt-1 text-sm text-syncial-muted">
                  Browse active markets to start predicting
                </p>
              </div>
            )
          ) : (
            <div className="py-10 text-center">
              <EyeOff className="mx-auto mb-3 h-8 w-8 text-syncial-muted" />
              <p className="text-syncial-muted">
                Private data is hidden
              </p>
              <button
                onClick={() => setShowPrivateData(true)}
                className="mt-3 rounded-lg bg-syncial-primary/10 px-4 py-2 text-sm text-syncial-primary hover:bg-syncial-primary/20"
              >
                Reveal Private Data
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === "polls" && (
        <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
          <h3 className="mb-4 font-semibold text-white">Your Created Polls</h3>
          <div className="py-10 text-center">
            <p className="text-syncial-muted">No polls created yet</p>
            <a
              href="/poll/create"
              className="mt-3 inline-block rounded-lg bg-syncial-primary/10 px-4 py-2 text-sm text-syncial-primary hover:bg-syncial-primary/20"
            >
              Create Your First Poll
            </a>
          </div>
        </div>
      )}

      {activeSection === "settings" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Settings className="h-5 w-5" />
              Privacy Settings
            </h3>
            <div className="space-y-4">
              <SettingToggle
                label="Show reputation on leaderboard"
                description="Allow your accuracy score to appear on the public leaderboard"
                defaultChecked={true}
              />
              <SettingToggle
                label="Public profile"
                description="Allow others to view your prediction history summary"
                defaultChecked={false}
              />
              <SettingToggle
                label="Anonymous posting"
                description="Post using a pseudonymous identity by default"
                defaultChecked={true}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-400">
              <Shield className="h-5 w-5" />
              Aleo Privacy Guarantees
            </h3>
            <ul className="space-y-2 text-sm text-emerald-300/70">
              <li>✓ All bet records are encrypted private records on Aleo</li>
              <li>✓ Your bet amounts are never revealed publicly</li>
              <li>✓ Your chosen prediction options remain private</li>
              <li>✓ Zero-knowledge proofs verify correctness without revealing data</li>
              <li>✓ Only you can decrypt your own records with your view key</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-syncial-card p-4 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-syncial-bg">
        {icon}
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-syncial-muted">{label}</p>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between rounded-xl bg-syncial-bg p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-0.5 text-xs text-syncial-muted">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-syncial-primary" : "bg-syncial-border"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}