"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useStore } from "@/store/useStory";
import {
  Shield,
  TrendingUp,
  Plus,
  User,
  Trophy,
  Home,
  Zap,
} from "lucide-react";

export default function Navbar() {
  const { connected, address, connect, disconnect } = useWallet();
  const { activeTab, setActiveTab } = useStore();

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 8)}...${addr.slice(-6)}`;

  return (
    <>
      {/* Top navbar */}
      <nav className="glass fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text text-xl font-bold tracking-tight">
              Syncial
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink
              href="/"
              active={activeTab === "feed"}
              onClick={() => setActiveTab("feed")}
              icon={<Home className="h-4 w-4" />}
              label="Feed"
            />
            <NavLink
              href="/feed"
              active={activeTab === "polls"}
              onClick={() => setActiveTab("polls")}
              icon={<TrendingUp className="h-4 w-4" />}
              label="Markets"
            />
            <NavLink
              href="/poll/create"
              active={false}
              onClick={() => {}}
              icon={<Plus className="h-4 w-4" />}
              label="Create"
            />
            <NavLink
              href="/profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
              icon={<User className="h-4 w-4" />}
              label="Profile"
            />
          </div>

          {/* Privacy badge + Wallet */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 sm:flex">
              <Shield className="h-3 w-3" />
              <span>ZK Private</span>
            </div>

            {connected && address ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-lg bg-syncial-card px-3 py-1.5 font-mono text-xs text-syncial-muted sm:block">
                  {truncateAddress(address)}
                </span>
                <button
                  onClick={disconnect}
                  className="rounded-lg bg-syncial-card px-3 py-1.5 text-sm text-syncial-danger transition-colors hover:bg-red-500/10"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="glass fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <MobileNavLink
            href="/"
            active={activeTab === "feed"}
            onClick={() => setActiveTab("feed")}
            icon={<Home className="h-5 w-5" />}
            label="Feed"
          />
          <MobileNavLink
            href="/feed"
            active={activeTab === "polls"}
            onClick={() => setActiveTab("polls")}
            icon={<TrendingUp className="h-5 w-5" />}
            label="Markets"
          />
          <MobileNavLink
            href="/poll/create"
            active={false}
            onClick={() => {}}
            icon={
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
                <Plus className="h-5 w-5 text-white" />
              </div>
            }
            label=""
          />
          <MobileNavLink
            href="/profile"
            active={activeTab === "leaderboard"}
            onClick={() => setActiveTab("leaderboard")}
            icon={<Trophy className="h-5 w-5" />}
            label="Ranks"
          />
          <MobileNavLink
            href="/profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<User className="h-5 w-5" />}
            label="Profile"
          />
        </div>
      </div>
    </>
  );
}

function NavLink({
  href,
  active,
  onClick,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-syncial-primary/15 text-syncial-primary"
          : "text-syncial-muted hover:bg-syncial-card hover:text-syncial-text"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  onClick,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
        active ? "text-syncial-primary" : "text-syncial-muted"
      }`}
    >
      {icon}
      {label && <span>{label}</span>}
    </Link>
  );
}