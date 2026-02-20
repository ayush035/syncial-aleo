"use client";

import React, { useState, useMemo } from "react";
import { Poll } from "@/lib/types";
import { aleoService } from "@/lib/aleo";
import { MIN_BET_AMOUNT } from "@/lib/constants";
import { useAleo } from "@/hooks/useAleo";
import {
  X,
  Shield,
  Eye,
  EyeOff,
  TrendingUp,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface BetModalProps {
  poll: Poll;
  selectedOption: number;
  onClose: () => void;
  onBetPlaced?: () => void;
}

export default function BetModal({
  poll,
  selectedOption,
  onClose,
  onBetPlaced,
}: BetModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { placeBet, txStatus } = useAleo();

  const amountMicrocredits = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return 0;
    return Math.floor(parsed * 1000000);
  }, [amount]);

  const estimatedWinnings = useMemo(() => {
    if (amountMicrocredits === 0) return 0;
    const optionPool =
      selectedOption === 1 ? poll.poolOptionA : poll.poolOptionB;
    return aleoService.calculateEstimatedWinnings(
      amountMicrocredits,
      optionPool + amountMicrocredits,
      poll.totalPool + amountMicrocredits
    );
  }, [amountMicrocredits, selectedOption, poll]);

  const multiplier = useMemo(() => {
    if (amountMicrocredits === 0) return 0;
    return estimatedWinnings / amountMicrocredits;
  }, [estimatedWinnings, amountMicrocredits]);

  const handleSubmit = async () => {
    if (amountMicrocredits < MIN_BET_AMOUNT) {
      setError(`Minimum bet is ${MIN_BET_AMOUNT / 1000000} credits`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const txId = await placeBet(poll.id, selectedOption, amountMicrocredits);
      setTxResult(txId);
      onBetPlaced?.();
    } catch (err: any) {
      setError(err.message || "Failed to place bet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [0.1, 0.5, 1, 5, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="fade-in w-full max-w-md rounded-2xl border border-syncial-border bg-syncial-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-syncial-border p-5">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Place Private Bet
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
              <Shield className="h-3 w-3" />
              <span>Your bet details are ZK-encrypted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-syncial-muted transition-colors hover:bg-syncial-bg hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Selected option */}
          <div className="mb-5 rounded-xl bg-syncial-bg p-4">
            <p className="mb-1 text-xs text-syncial-muted">Your prediction</p>
            <p className="text-sm font-medium text-white">
              {selectedOption === 1 ? poll.optionA : poll.optionB}
            </p>
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-syncial-muted">
              Bet Amount (Credits)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.001"
                step="0.001"
                className="w-full rounded-xl border border-syncial-border bg-syncial-bg px-4 py-3 text-lg font-medium text-white placeholder-syncial-muted outline-none transition-colors focus:border-syncial-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-syncial-muted">
                ALEO
              </span>
            </div>

            {/* Quick amounts */}
            <div className="mt-2 flex gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  className="rounded-lg border border-syncial-border px-3 py-1 text-xs text-syncial-muted transition-colors hover:border-syncial-primary hover:text-syncial-primary"
                >
                  {qa}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated returns */}
          {amountMicrocredits > 0 && (
            <div className="mb-5 space-y-2 rounded-xl bg-syncial-bg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-syncial-muted">Est. Winnings</span>
                <span className="font-medium text-syncial-success">
                  {(estimatedWinnings / 1000000).toFixed(4)} credits
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-syncial-muted">Multiplier</span>
                <span className="font-medium text-syncial-accent">
                  {multiplier.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-syncial-muted">Platform Fee</span>
                <span className="text-syncial-muted">1%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-syncial-muted">Creator Reward</span>
                <span className="text-syncial-muted">5%</span>
              </div>
            </div>
          )}

          {/* Privacy info */}
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div className="text-xs text-emerald-300">
              <p className="font-medium">Privacy Protected</p>
              <p className="mt-0.5 opacity-80">
                Your bet amount and chosen option are stored as a private
                record. Only aggregate pool totals are visible on-chain.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {txResult && (
            <div className="mb-4 rounded-xl bg-green-500/10 p-3">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                Bet placed successfully!
              </div>
              <p className="mt-1 truncate font-mono text-xs text-syncial-muted">
                TX: {txResult}
              </p>
            </div>
          )}

          {/* Submit button */}
          {!txResult && (
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || amountMicrocredits < MIN_BET_AMOUNT
              }
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating ZK Proof...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  Place Private Bet
                </span>
              )}
            </button>
          )}

          {txResult && (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-syncial-bg py-3 text-sm font-medium text-white transition-colors hover:bg-syncial-border"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}