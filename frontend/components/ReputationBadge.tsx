"use client";

import React from "react";
import { Shield, Star, Flame, Crown, Zap } from "lucide-react";

interface ReputationBadgeProps {
  level: number;
  accuracy: number;
  size?: "sm" | "md" | "lg";
}

const LEVEL_CONFIG: Record<
  number,
  { label: string; color: string; icon: React.ReactNode; bg: string }
> = {
  1: { label: "Novice", color: "text-gray-400", icon: <Star className="h-3 w-3" />, bg: "bg-gray-500/10" },
  2: { label: "Observer", color: "text-slate-400", icon: <Star className="h-3 w-3" />, bg: "bg-slate-500/10" },
  3: { label: "Analyst", color: "text-blue-400", icon: <Shield className="h-3 w-3" />, bg: "bg-blue-500/10" },
  4: { label: "Predictor", color: "text-cyan-400", icon: <Shield className="h-3 w-3" />, bg: "bg-cyan-500/10" },
  5: { label: "Strategist", color: "text-green-400", icon: <Zap className="h-3 w-3" />, bg: "bg-green-500/10" },
  6: { label: "Expert", color: "text-emerald-400", icon: <Zap className="h-3 w-3" />, bg: "bg-emerald-500/10" },
  7: { label: "Master", color: "text-yellow-400", icon: <Flame className="h-3 w-3" />, bg: "bg-yellow-500/10" },
  8: { label: "Sage", color: "text-orange-400", icon: <Flame className="h-3 w-3" />, bg: "bg-orange-500/10" },
  9: { label: "Oracle", color: "text-purple-400", icon: <Crown className="h-3 w-3" />, bg: "bg-purple-500/10" },
  10: { label: "Legend", color: "text-amber-300", icon: <Crown className="h-3 w-3" />, bg: "bg-amber-500/10" },
};

export default function ReputationBadge({
  level,
  accuracy,
  size = "sm",
}: ReputationBadgeProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full ${config.bg} ${config.color} ${sizeClasses[size]} font-medium`}
    >
      {config.icon}
      <span>{config.label}</span>
      {size !== "sm" && (
        <span className="opacity-60">
          {(accuracy / 100).toFixed(1)}%
        </span>
      )}
    </div>
  );
}