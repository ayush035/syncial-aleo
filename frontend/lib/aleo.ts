import { PROGRAMS, ALEO_API_BASE, NETWORK, DEFAULT_TX_FEE } from "./constants";
import { DEPLOYMENTS, getDeploymentStatus } from "./deployment";

export class AleoService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ALEO_API_BASE;
  }

  // =============================================
  // DEPLOYMENT VERIFICATION
  // =============================================

  // Check if a program is deployed on-chain
  async isProgramDeployed(programId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${NETWORK}/program/${programId}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  // Verify all Syncial programs are deployed
  async verifyDeployments(): Promise<{
    core: boolean;
    betting: boolean;
    reputation: boolean;
    allDeployed: boolean;
  }> {
    const [core, betting, reputation] = await Promise.all([
      this.isProgramDeployed(PROGRAMS.CORE),
      this.isProgramDeployed(PROGRAMS.BETTING),
      this.isProgramDeployed(PROGRAMS.REPUTATION),
    ]);

    return {
      core,
      betting,
      reputation,
      allDeployed: core && betting && reputation,
    };
  }

  // Get full program source from chain (to verify it matches)
  async getProgramSource(programId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${NETWORK}/program/${programId}`
      );
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }

  // =============================================
  // MAPPING READS (Public on-chain state)
  // =============================================

  async getMappingValue(
    programId: string,
    mappingName: string,
    key: string
  ): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${NETWORK}/program/${programId}/mapping/${mappingName}/${key}`
      );
      if (!response.ok) return null;
      const value = await response.text();
      return value.replace(/"/g, "").trim();
    } catch (error) {
      console.error(
        `Error fetching ${programId}/${mappingName}/${key}:`,
        error
      );
      return null;
    }
  }

  // Parse Aleo typed values
  parseAleoU64(value: string | null): number {
    if (!value) return 0;
    return parseInt(value.replace("u64", "")) || 0;
  }

  parseAleoU8(value: string | null): number {
    if (!value) return 0;
    return parseInt(value.replace("u8", "")) || 0;
  }

  parseAleoField(value: string | null): string {
    if (!value) return "0field";
    return value.includes("field") ? value : `${value}field`;
  }

  parsAleoBool(value: string | null): boolean {
    return value === "true";
  }

  // =============================================
  // POLL DATA READS
  // =============================================

  async getPollData(pollId: string) {
    const key = pollId.includes("field") ? pollId : `${pollId}field`;

    const [status, poolA, poolB, totalPool, totalBets, winner, deadline, exists] =
      await Promise.all([
        this.getMappingValue(PROGRAMS.BETTING, "poll_status", key),
        this.getMappingValue(PROGRAMS.BETTING, "pool_option_1", key),
        this.getMappingValue(PROGRAMS.BETTING, "pool_option_2", key),
        this.getMappingValue(PROGRAMS.BETTING, "total_pool", key),
        this.getMappingValue(PROGRAMS.BETTING, "total_bets_count", key),
        this.getMappingValue(PROGRAMS.BETTING, "winning_option", key),
        this.getMappingValue(PROGRAMS.BETTING, "poll_deadline", key),
        this.getMappingValue(PROGRAMS.BETTING, "poll_exists", key),
      ]);

    return {
      exists: this.parsAleoBool(exists),
      status: this.parseAleoU8(status),
      poolOptionA: this.parseAleoU64(poolA),
      poolOptionB: this.parseAleoU64(poolB),
      totalPool: this.parseAleoU64(totalPool),
      totalBets: this.parseAleoU64(totalBets),
      winningOption: this.parseAleoU8(winner),
      deadline: this.parseAleoU64(deadline),
    };
  }

  // Get poll creator hash
  async getPollCreator(pollId: string): Promise<string | null> {
    const key = pollId.includes("field") ? pollId : `${pollId}field`;
    return this.getMappingValue(PROGRAMS.BETTING, "poll_creators", key);
  }

  // Check if poll exists
  async pollExists(pollId: string): Promise<boolean> {
    const key = pollId.includes("field") ? pollId : `${pollId}field`;
    const exists = await this.getMappingValue(
      PROGRAMS.BETTING,
      "poll_exists",
      key
    );
    return this.parsAleoBool(exists);
  }

  // Get platform treasury
  async getPlatformTreasury(): Promise<number> {
    const value = await this.getMappingValue(
      PROGRAMS.BETTING,
      "platform_treasury",
      "0u8"
    );
    return this.parseAleoU64(value);
  }

  // =============================================
  // REPUTATION DATA READS
  // =============================================

  async getReputationData(userHash: string) {
    const key = userHash.includes("field") ? userHash : `${userHash}field`;

    const [accuracy, predCount, correctCount, volume, lbScore] =
      await Promise.all([
        this.getMappingValue(PROGRAMS.REPUTATION, "public_reputation", key),
        this.getMappingValue(PROGRAMS.REPUTATION, "prediction_count", key),
        this.getMappingValue(PROGRAMS.REPUTATION, "correct_count", key),
        this.getMappingValue(PROGRAMS.REPUTATION, "total_volume", key),
        this.getMappingValue(PROGRAMS.REPUTATION, "leaderboard_score", key),
      ]);

    return {
      accuracyScore: this.parseAleoU64(accuracy),
      totalPredictions: this.parseAleoU64(predCount),
      correctPredictions: this.parseAleoU64(correctCount),
      totalVolume: this.parseAleoU64(volume),
      leaderboardScore: this.parseAleoU64(lbScore),
    };
  }

  // Check if username is taken
  async isUsernameTaken(usernameHash: string): Promise<boolean> {
    const key = usernameHash.includes("field")
      ? usernameHash
      : `${usernameHash}field`;
    const taken = await this.getMappingValue(
      PROGRAMS.CORE,
      "username_registry",
      key
    );
    return this.parsAleoBool(taken);
  }

  // =============================================
  // TRANSACTION BUILDERS
  // These build the inputs array for wallet execution
  // =============================================

  buildRegisterUserInputs(usernameHash: string, currentTime: number) {
    return {
      programId: PROGRAMS.CORE,
      functionName: "register_user",
      inputs: [`${usernameHash}field`, `${currentTime}u64`],
      fee: DEFAULT_TX_FEE,
    };
  }

  buildCreatePostInputs(
    profileRecord: string, // serialized record
    contentHash: string,
    timestamp: number,
    postSeed: string
  ) {
    return {
      programId: PROGRAMS.CORE,
      functionName: "create_post",
      inputs: [profileRecord, `${contentHash}field`, `${timestamp}u64`, `${postSeed}field`],
      fee: DEFAULT_TX_FEE,
    };
  }

  buildCreatePollInputs(pollSeed: string, deadline: number, timestamp: number) {
    return {
      programId: PROGRAMS.BETTING,
      functionName: "create_poll",
      inputs: [`${pollSeed}field`, `${deadline}u64`, `${timestamp}u64`],
      fee: DEFAULT_TX_FEE,
    };
  }

  buildPlaceBetInputs(
    pollId: string,
    option: number,
    amount: number,
    timestamp: number,
    betSeed: string
  ) {
    return {
      programId: PROGRAMS.BETTING,
      functionName: "place_bet",
      inputs: [
        `${pollId}field`,
        `${option}u8`,
        `${amount}u64`,
        `${timestamp}u64`,
        `${betSeed}field`,
      ],
      fee: DEFAULT_TX_FEE + amount, // fee + bet amount
    };
  }

  buildResolvePollInputs(
    pollId: string,
    winner: number,
    oracleHash: string
  ) {
    return {
      programId: PROGRAMS.BETTING,
      functionName: "resolve_poll",
      inputs: [`${pollId}field`, `${winner}u8`, `${oracleHash}field`],
      fee: DEFAULT_TX_FEE,
    };
  }

  buildClaimWinningsInputs(betReceipt: string) {
    return {
      programId: PROGRAMS.BETTING,
      functionName: "claim_winnings",
      inputs: [betReceipt], // serialized BetReceipt record
      fee: DEFAULT_TX_FEE,
    };
  }

  buildInitReputationInputs() {
    return {
      programId: PROGRAMS.REPUTATION,
      functionName: "init_reputation",
      inputs: [],
      fee: DEFAULT_TX_FEE,
    };
  }

  // =============================================
  // CALCULATORS
  // =============================================

  calculateEstimatedWinnings(
    betAmount: number,
    optionPool: number,
    totalPool: number
  ): number {
    if (optionPool === 0) return 0;
    const winnerPool = (totalPool * 9400) / 10000; // 94% after fees
    const share = betAmount / optionPool;
    return Math.floor(winnerPool * share);
  }

  calculateOdds(
    poolA: number,
    poolB: number
  ): { oddsA: number; oddsB: number } {
    const total = poolA + poolB;
    if (total === 0) return { oddsA: 50, oddsB: 50 };
    return {
      oddsA: Math.round((poolA / total) * 100),
      oddsB: Math.round((poolB / total) * 100),
    };
  }

  calculateCreatorReward(totalPool: number): number {
    return Math.floor((totalPool * 500) / 10000); // 5%
  }

  calculatePlatformFee(totalPool: number): number {
    return Math.floor((totalPool * 100) / 10000); // 1%
  }
}

export const aleoService = new AleoService();