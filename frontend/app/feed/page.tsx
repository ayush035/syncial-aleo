"use client";

import React, { useState } from "react";
import PollCard from "@/components/PollCard";
import { usePolls } from "@/hooks/usePolls";
import { CATEGORIES, Category } from "@/lib/constants";
import { PollStatus } from "@/lib/types";
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  LayoutGrid,
  List,
} from "lucide-react";

type StatusFilter = "all" | "active" | "resolved" | "cancelled";
type ViewMode = "grid" | "list";

export default function FeedPage() {
  const { polls, loading, selectedCategory, setSelectedCategory } = usePolls();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredPolls = polls.filter((poll) => {
    // Status filter
    if (statusFilter === "active" && poll.status !== PollStatus.Active) return false;
    if (statusFilter === "resolved" && poll.status !== PollStatus.Resolved) return false;
    if (statusFilter === "cancelled" && poll.status !== PollStatus.Cancelled) return false;

    // Search filter
    if (
      searchQuery &&
      !poll.question.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Prediction Markets
        </h1>
        <p className="text-syncial-muted">
          Browse and bet on prediction polls. All bets are privacy-preserving.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-syncial-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search predictions..."
            className="w-full rounded-xl border border-syncial-border bg-syncial-card py-3 pl-11 pr-4 text-white placeholder-syncial-muted outline-none transition-colors focus:border-syncial-primary"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-syncial-card p-1">
            <StatusTab
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              icon={<LayoutGrid className="h-3.5 w-3.5" />}
              label="All"
              count={polls.length}
            />
            <StatusTab
              active={statusFilter === "active"}
              onClick={() => setStatusFilter("active")}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
              label="Active"
              count={polls.filter((p) => p.status === PollStatus.Active).length}
            />
            <StatusTab
              active={statusFilter === "resolved"}
              onClick={() => setStatusFilter("resolved")}
              icon={<CheckCircle className="h-3.5 w-3.5" />}
              label="Resolved"
              count={polls.filter((p) => p.status === PollStatus.Resolved).length}
            />
          </div>

          {/* View mode */}
          <div className="flex items-center gap-1 rounded-lg bg-syncial-card p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-syncial-primary/15 text-syncial-primary"
                  : "text-syncial-muted hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-syncial-primary/15 text-syncial-primary"
                  : "text-syncial-muted hover:text-white"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="All"
            active={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          />
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-syncial-muted">
        Showing {filteredPolls.length} prediction{filteredPolls.length !== 1 ? "s" : ""}
      </p>

      {/* Polls grid/list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-syncial-primary border-t-transparent" />
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-syncial-muted">No predictions found</p>
          <p className="mt-1 text-sm text-syncial-muted">
            Try adjusting your filters or create a new poll
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2"
              : "space-y-4"
          }
        >
          {filteredPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusTab({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
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
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs ${
          active
            ? "bg-syncial-primary/20 text-syncial-primary"
            : "bg-syncial-border text-syncial-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "border-syncial-primary bg-syncial-primary/10 text-syncial-primary"
          : "border-syncial-border text-syncial-muted hover:border-syncial-primary/50 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}