"use client";

import React, { useState } from "react";
import { useAleo } from "@/hooks/useAleo";
import { useWallet } from "@/hooks/useWallet";
import { CATEGORIES, Category } from "@/lib/constants";
import {
  Zap,
  Shield,
  Clock,
  AlertTriangle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [category, setCategory] = useState<Category>("Crypto");
  const [deadlineDays, setDeadlineDays] = useState(7);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { createPoll } = useAleo();
  const { connected, connect } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      await connect();
      return;
    }

    if (!question.trim() || !optionA.trim() || !optionB.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deadline = Math.floor(
        (Date.now() + deadlineDays * 86400000) / 1000
      );
      const pollSeed = Math.floor(Math.random() * 1000000000).toString();

      const txId = await createPoll(pollSeed, deadline);
      setTxResult(txId);

      // Store off-chain metadata (question, options, category, description)
      // In production, this would go to IPFS or a backend
      console.log("Poll metadata:", {
        question,
        optionA,
        optionB,
        category,
        description,
        deadline,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-syncial-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-white">
          Create Prediction Poll
        </h1>
        <p className="text-syncial-muted">
          Create a prediction market and earn 5% of all bets placed on your
          poll.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Prediction Question *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Will ETH cross \$4,000 before June 30?"
            maxLength={200}
            className="w-full rounded-xl border border-syncial-border bg-syncial-bg px-4 py-3 text-white placeholder-syncial-muted outline-none transition-colors focus:border-syncial-primary"
          />
          <p className="mt-1 text-xs text-syncial-muted">
            {question.length}/200 characters
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Option A *
            </label>
            <input
              type="text"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder="e.g., Yes"
              maxLength={100}
              className="w-full rounded-xl border border-syncial-border bg-syncial-bg px-4 py-3 text-white placeholder-syncial-muted outline-none transition-colors focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Option B *
            </label>
            <input
              type="text"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder="e.g., No"
              maxLength={100}
              className="w-full rounded-xl border border-syncial-border bg-syncial-bg px-4 py-3 text-white placeholder-syncial-muted outline-none transition-colors focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  category === cat
                    ? "border-syncial-primary bg-syncial-primary/10 text-syncial-primary"
                    : "border-syncial-border text-syncial-muted hover:border-syncial-primary/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
            <Clock className="h-4 w-4" />
            Resolution Deadline
          </label>
          <div className="flex gap-2">
            {[1, 3, 7, 14, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDeadlineDays(days)}
                className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                  deadlineDays === days
                    ? "border-syncial-primary bg-syncial-primary/10 text-syncial-primary"
                    : "border-syncial-border text-syncial-muted hover:border-syncial-primary/50"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or reasoning for your prediction..."
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-syncial-border bg-syncial-bg px-4 py-3 text-white placeholder-syncial-muted outline-none transition-colors focus:border-syncial-primary"
          />
        </div>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-syncial-border bg-syncial-bg p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Zap className="h-4 w-4 text-syncial-primary" />
              Creator Reward
            </div>
            <p className="text-xs text-syncial-muted">
              You earn 5% of the total betting pool when the poll is
              resolved.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <Shield className="h-4 w-4" />
              Privacy First
            </div>
            <p className="text-xs text-emerald-300/70">
              Individual bets are private ZK records. Only aggregate totals
              are public.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {txResult && (
          <div className="rounded-xl bg-green-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <CheckCircle className="h-4 w-4" />
              Poll created successfully!
            </div>
            <p className="mt-1 truncate font-mono text-xs text-syncial-muted">
              TX: {txResult}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-4 text-base font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating on Aleo...
            </span>
          ) : !connected ? (
            "Connect Wallet to Create"
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" />
              Create Prediction Poll
            </span>
          )}
        </button>
      </form>
    </div>
  );
}