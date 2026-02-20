"use client";

import React from "react";
import { useWallet } from "@/hooks/useWallet";
import { Shield, Wallet, ExternalLink } from "lucide-react";

export default function WalletConnect() {
  const { connected, address, connect, disconnect, walletAvailable } =
    useWallet();

  if (connected && address) {
    return (
      <div className="rounded-2xl border border-syncial-border bg-syncial-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="text-sm font-medium text-green-400">Connected</span>
        </div>
        <p className="mb-3 truncate font-mono text-sm text-syncial-muted">
          {address}
        </p>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <Shield className="h-3 w-3" />
          <span>Privacy-preserving connection via Aleo</span>
        </div>
        <button
          onClick={disconnect}
          className="mt-4 w-full rounded-xl border border-syncial-border py-2 text-sm text-syncial-muted transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
        <Wallet className="h-7 w-7 text-syncial-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">
        Connect Your Wallet
      </h3>
      <p className="mb-5 text-sm text-syncial-muted">
        Connect your Aleo wallet to create polls, place private bets, and
        earn rewards.
      </p>
      <button
        onClick={connect}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25"
      >
        {walletAvailable ? "Connect Leo Wallet" : "Connect (Demo Mode)"}
      </button>
      {!walletAvailable && (
        <a
          href="https://www.leo.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs text-syncial-primary hover:underline"
        >
          Get Leo Wallet
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}