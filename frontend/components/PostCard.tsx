"use client";

import React, { useState } from "react";
import { Post } from "@/lib/types";
import ReputationBadge from "./ReputationBadge";
import PollCard from "./PollCard";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Shield,
} from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="fade-in border-b border-syncial-border bg-syncial-card/50 p-5 transition-colors hover:bg-syncial-card/80">
      {/* Author header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
            {post.author.username?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {post.author.username || truncateAddress(post.author.address)}
              </span>
              <ReputationBadge
                level={5}
                accuracy={6500}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-syncial-muted">
              <span>{formatTime(post.timestamp)}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-emerald-400">
                <Shield className="h-3 w-3" />
                Verified
              </span>
            </div>
          </div>
        </div>
        <button className="rounded-lg p-1.5 text-syncial-muted transition-colors hover:bg-syncial-bg hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <p className="mb-4 leading-relaxed text-syncial-text">{post.content}</p>

      {/* Attached poll */}
      {post.isPoll && post.poll && (
        <div className="mb-4">
          <PollCard poll={post.poll} />
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-6 text-syncial-muted">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked
              ? "text-red-400"
              : "hover:text-red-400"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-red-400" : ""}`}
          />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm transition-colors hover:text-syncial-primary">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments.length}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm transition-colors hover:text-syncial-accent">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}