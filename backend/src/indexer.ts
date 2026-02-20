import { Database } from "./database";

const ALEO_API_URL =
  process.env.ALEO_API_URL || "https://api.explorer.aleo.org/v1";
const NETWORK = "testnet";
const BETTING_PROGRAM = "syncial_betting_v1.aleo";
const REPUTATION_PROGRAM = "syncial_reputation_v1.aleo";

export class AleoIndexer {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Fetch a mapping value from Aleo
  private async getMappingValue(
    programId: string,
    mappingName: string,
    key: string
  ): Promise<string | null> {
    try {
      const url = `${ALEO_API_URL}/${NETWORK}/program/${programId}/mapping/${mappingName}/${key}`;
      const response = await fetch(url);

      if (!response.ok) return null;

      const value = await response.text();
      return value.replace(/"/g, "").trim();
    } catch (error) {
      console.error(
        `Failed to fetch ${programId}/${mappingName}/${key}:`,
        error
      );
      return null;
    }
  }

  // Parse Aleo value to number
  private parseAleoNumber(value: string | null): number {
    if (!value) return 0;
    return parseInt(value.replace(/u\d+|field/g, "")) || 0;
  }

  // Sync all known polls from on-chain
  async syncPolls() {
    const pollIds = this.db.getAllPollOnchainIds();

    for (const pollId of pollIds) {
      try {
        await this.syncSinglePoll(pollId);
      } catch (error) {
        console.error(`Error syncing poll ${pollId}:`, error);
      }
    }
  }

  // Sync a single poll's on-chain state
  async syncSinglePoll(pollIdOnchain: string) {
    const [status, poolA, poolB, totalPool, totalBets, winner] =
      await Promise.all([
        this.getMappingValue(BETTING_PROGRAM, "poll_status", pollIdOnchain),
        this.getMappingValue(BETTING_PROGRAM, "pool_option_1", pollIdOnchain),
        this.getMappingValue(BETTING_PROGRAM, "pool_option_2", pollIdOnchain),
        this.getMappingValue(BETTING_PROGRAM, "total_pool", pollIdOnchain),
        this.getMappingValue(BETTING_PROGRAM, "total_bets_count", pollIdOnchain),
        this.getMappingValue(BETTING_PROGRAM, "winning_option", pollIdOnchain),
      ]);

    this.db.updatePollOnchainState(pollIdOnchain, {
      status: this.parseAleoNumber(status),
      poolOptionA: this.parseAleoNumber(poolA),
      poolOptionB: this.parseAleoNumber(poolB),
      totalPool: this.parseAleoNumber(totalPool),
      totalBets: this.parseAleoNumber(totalBets),
      winningOption: this.parseAleoNumber(winner),
    });

    console.log(
      `  Synced poll ${pollIdOnchain.slice(0, 12)}... | ` +
        `Pool: ${this.parseAleoNumber(totalPool)} | ` +
        `Bets: ${this.parseAleoNumber(totalBets)} | ` +
        `Status: ${this.parseAleoNumber(status)}`
    );
  }

  // Sync reputation for a specific user
  async syncUserReputation(userHash: string) {
    const [accuracy, predCount, correctCount, volume] = await Promise.all([
      this.getMappingValue(REPUTATION_PROGRAM, "public_reputation", userHash),
      this.getMappingValue(REPUTATION_PROGRAM, "prediction_count", userHash),
      this.getMappingValue(REPUTATION_PROGRAM, "correct_count", userHash),
      this.getMappingValue(REPUTATION_PROGRAM, "total_volume", userHash),
    ]);

    const accuracyScore = this.parseAleoNumber(accuracy);
    const totalPredictions = this.parseAleoNumber(predCount);
    const correctPredictions = this.parseAleoNumber(correctCount);
    const totalVolume = this.parseAleoNumber(volume);

    // Calculate level
    const level = this.calculateLevel(totalPredictions, accuracyScore);

    this.db.upsertReputation({
      userHash,
      username: "Anonymous",
      accuracyScore,
      totalPredictions,
      correctPredictions,
      totalVolume,
      level,
    });
  }

  private calculateLevel(total: number, accuracy: number): number {
    if (total < 5) return 1;
    if (total < 15 && accuracy > 4000) return 2;
    if (total < 30 && accuracy > 4500) return 3;
    if (total < 50 && accuracy > 5000) return 4;
    if (total < 75 && accuracy > 5500) return 5;
    if (total < 100 && accuracy > 6000) return 6;
    if (total < 150 && accuracy > 6500) return 7;
    if (total < 200 && accuracy > 7000) return 8;
    if (total < 300 && accuracy > 7500) return 9;
    if (accuracy > 8000) return 10;
    return 1;
  }
}