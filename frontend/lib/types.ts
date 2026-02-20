export interface UserProfile {
    address: string;
    usernameHash: string;
    username: string; // stored off-chain
    reputationScore: number;
    totalPosts: number;
    totalPollsCreated: number;
    totalBetsWon: number;
    totalBetsLost: number;
    joinedAt: number;
    avatar?: string;
  }
  
  export interface Post {
    id: string;
    contentHash: string;
    content: string; // stored off-chain
    author: UserProfile;
    timestamp: number;
    isPoll: boolean;
    pollId?: string;
    poll?: Poll;
    likes: number;
    comments: Comment[];
  }
  
  export interface Poll {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    poolOptionA: number;
    poolOptionB: number;
    totalPool: number;
    totalBets: number;
    status: PollStatus;
    winningOption: number; // 0=unresolved, 1=optionA, 2=optionB
    deadline: number;
    creator: string;
    createdAt: number;
  }
  
  export enum PollStatus {
    Active = 0,
    Resolved = 1,
    Cancelled = 2,
  }
  
  export interface Bet {
    id: string;
    pollId: string;
    optionChosen: number;
    amount: number;
    timestamp: number;
    isPrivate: boolean;
  }
  
  export interface Comment {
    id: string;
    postId: string;
    author: string;
    content: string;
    timestamp: number;
  }
  
  export interface ReputationData {
    userHash: string;
    accuracyScore: number;
    totalPredictions: number;
    correctPredictions: number;
    totalVolume: number;
    level: number;
  }