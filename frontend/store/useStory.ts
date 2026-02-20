import { create } from "zustand";
import { Post, Poll, UserProfile, Bet, ReputationData } from "@/lib/types";

interface SyncialStore {
  // Auth
  connected: boolean;
  address: string | null;
  profile: UserProfile | null;
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;

  // Feed
  posts: Post[];
  polls: Poll[];
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  setPolls: (polls: Poll[]) => void;
  updatePoll: (pollId: string, data: Partial<Poll>) => void;

  // Bets
  myBets: Bet[];
  addBet: (bet: Bet) => void;
  setMyBets: (bets: Bet[]) => void;

  // Reputation
  reputation: ReputationData | null;
  setReputation: (rep: ReputationData) => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  activeTab: "feed" | "polls" | "profile" | "leaderboard";
  setActiveTab: (tab: "feed" | "polls" | "profile" | "leaderboard") => void;
}

export const useStore = create<SyncialStore>((set) => ({
  // Auth
  connected: false,
  address: null,
  profile: null,
  setConnected: (connected) => set({ connected }),
  setAddress: (address) => set({ address }),
  setProfile: (profile) => set({ profile }),

  // Feed
  posts: [],
  polls: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setPolls: (polls) => set({ polls }),
  updatePoll: (pollId, data) =>
    set((state) => ({
      polls: state.polls.map((p) => (p.id === pollId ? { ...p, ...data } : p)),
    })),

  // Bets
  myBets: [],
  addBet: (bet) => set((state) => ({ myBets: [bet, ...state.myBets] })),
  setMyBets: (bets) => set({ myBets: bets }),

  // Reputation
  reputation: null,
  setReputation: (reputation) => set({ reputation }),

  // UI
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
  activeTab: "feed",
  setActiveTab: (activeTab) => set({ activeTab }),
}));