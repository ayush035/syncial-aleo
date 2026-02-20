import BetterSqlite3 from "better-sqlite3";
import path from "path";

export class Database {
  private db: BetterSqlite3.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), "syncial.db");
    this.db = new BetterSqlite3(dbPath);
    this.initialize();
  }

  private initialize() {
    this.db.pragma("journal_mode = WAL");

    // Polls table - stores off-chain metadata + on-chain state
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        poll_id_onchain TEXT UNIQUE,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        category TEXT DEFAULT 'Other',
        description TEXT DEFAULT '',
        creator_address_hash TEXT NOT NULL,
        deadline INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        
        -- On-chain synced state
        status INTEGER DEFAULT 0,
        pool_option_a INTEGER DEFAULT 0,
        pool_option_b INTEGER DEFAULT 0,
        total_pool INTEGER DEFAULT 0,
        total_bets INTEGER DEFAULT 0,
        winning_option INTEGER DEFAULT 0,
        
        -- Metadata
        last_synced INTEGER DEFAULT 0,
        updated_at INTEGER DEFAULT 0
      )
    `);

    // Posts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        post_id_onchain TEXT UNIQUE,
        content TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        author_address_hash TEXT NOT NULL,
        author_username TEXT DEFAULT 'Anonymous',
        is_poll INTEGER DEFAULT 0,
        poll_id TEXT,
        timestamp INTEGER NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT 0
      )
    `);

    // Comments table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        author_address_hash TEXT NOT NULL,
        author_username TEXT DEFAULT 'Anonymous',
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )
    `);

    // Public reputation table (opt-in only)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reputation (
        user_hash TEXT PRIMARY KEY,
        username TEXT DEFAULT 'Anonymous',
        accuracy_score INTEGER DEFAULT 0,
        total_predictions INTEGER DEFAULT 0,
        correct_predictions INTEGER DEFAULT 0,
        total_volume INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        last_synced INTEGER DEFAULT 0
      )
    `);

    // Categories table for filtering
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY,
        poll_count INTEGER DEFAULT 0,
        total_volume INTEGER DEFAULT 0
      )
    `);

    // Insert default categories
    const categories = [
      "Crypto", "Finance", "Sports", "Politics",
      "Culture", "Tech", "Entertainment", "Other",
    ];
    const insertCat = this.db.prepare(
      "INSERT OR IGNORE INTO categories (name) VALUES (?)"
    );
    for (const cat of categories) {
      insertCat.run(cat);
    }

    console.log("✅ Database initialized");
  }

  // ===== POLL OPERATIONS =====

  createPoll(poll: {
    id: string;
    pollIdOnchain: string;
    question: string;
    optionA: string;
    optionB: string;
    category: string;
    description: string;
    creatorAddressHash: string;
    deadline: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO polls (id, poll_id_onchain, question, option_a, option_b, 
        category, description, creator_address_hash, deadline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    stmt.run(
      poll.id,
      poll.pollIdOnchain,
      poll.question,
      poll.optionA,
      poll.optionB,
      poll.category,
      poll.description,
      poll.creatorAddressHash,
      poll.deadline,
      now,
      now
    );
  }

  updatePollOnchainState(
    pollIdOnchain: string,
    state: {
      status: number;
      poolOptionA: number;
      poolOptionB: number;
      totalPool: number;
      totalBets: number;
      winningOption: number;
    }
  ) {
    const stmt = this.db.prepare(`
      UPDATE polls SET 
        status = ?, pool_option_a = ?, pool_option_b = ?,
        total_pool = ?, total_bets = ?, winning_option = ?,
        last_synced = ?, updated_at = ?
      WHERE poll_id_onchain = ?
    `);

    const now = Date.now();
    stmt.run(
      state.status,
      state.poolOptionA,
      state.poolOptionB,
      state.totalPool,
      state.totalBets,
      state.winningOption,
      now,
      now,
      pollIdOnchain
    );
  }

  getPolls(options: {
    status?: number;
    category?: string;
    limit?: number;
    offset?: number;
    sortBy?: "created_at" | "total_pool" | "total_bets";
  } = {}) {
    const { status, category, limit = 20, offset = 0, sortBy = "created_at" } = options;

    let query = "SELECT * FROM polls WHERE 1=1";
    const params: any[] = [];

    if (status !== undefined) {
      query += " AND status = ?";
      params.push(status);
    }

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    // Validate sortBy to prevent SQL injection
    const validSorts = ["created_at", "total_pool", "total_bets"];
    const sortColumn = validSorts.includes(sortBy) ? sortBy : "created_at";

    query += ` ORDER BY ${sortColumn} DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return this.db.prepare(query).all(...params);
  }

  getPollById(id: string) {
    return this.db.prepare("SELECT * FROM polls WHERE id = ? OR poll_id_onchain = ?").get(id, id);
  }

  getAllPollOnchainIds(): string[] {
    const rows = this.db
      .prepare("SELECT poll_id_onchain FROM polls WHERE poll_id_onchain IS NOT NULL")
      .all() as any[];
    return rows.map((r) => r.poll_id_onchain);
  }

  // ===== POST OPERATIONS =====

  createPost(post: {
    id: string;
    postIdOnchain: string;
    content: string;
    contentHash: string;
    authorAddressHash: string;
    authorUsername: string;
    isPoll: boolean;
    pollId?: string;
    timestamp: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO posts (id, post_id_onchain, content, content_hash, 
        author_address_hash, author_username, is_poll, poll_id, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      post.id,
      post.postIdOnchain,
      post.content,
      post.contentHash,
      post.authorAddressHash,
      post.authorUsername,
      post.isPoll ? 1 : 0,
      post.pollId || null,
      post.timestamp,
      Date.now()
    );
  }

  getPosts(limit = 20, offset = 0) {
    return this.db
      .prepare("SELECT * FROM posts ORDER BY timestamp DESC LIMIT ? OFFSET ?")
      .all(limit, offset);
  }

  likePost(postId: string) {
    this.db
      .prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?")
      .run(postId);
  }

  // ===== COMMENT OPERATIONS =====

  addComment(comment: {
    id: string;
    postId: string;
    authorAddressHash: string;
    authorUsername: string;
    content: string;
    timestamp: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO comments (id, post_id, author_address_hash, author_username, content, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      comment.id,
      comment.postId,
      comment.authorAddressHash,
      comment.authorUsername,
      comment.content,
      comment.timestamp
    );
  }

  getComments(postId: string) {
    return this.db
      .prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY timestamp ASC")
      .all(postId);
  }

  // ===== REPUTATION OPERATIONS =====

  upsertReputation(rep: {
    userHash: string;
    username: string;
    accuracyScore: number;
    totalPredictions: number;
    correctPredictions: number;
    totalVolume: number;
    level: number;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO reputation (user_hash, username, accuracy_score, total_predictions,
        correct_predictions, total_volume, level, last_synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_hash) DO UPDATE SET
        accuracy_score = excluded.accuracy_score,
        total_predictions = excluded.total_predictions,
        correct_predictions = excluded.correct_predictions,
        total_volume = excluded.total_volume,
        level = excluded.level,
        last_synced = excluded.last_synced
    `);

    stmt.run(
      rep.userHash,
      rep.username,
      rep.accuracyScore,
      rep.totalPredictions,
      rep.correctPredictions,
      rep.totalVolume,
      rep.level,
      Date.now()
    );
  }

  getLeaderboard(limit = 20) {
    return this.db
      .prepare(
        `SELECT * FROM reputation 
         WHERE total_predictions > 0 
         ORDER BY accuracy_score DESC, total_predictions DESC 
         LIMIT ?`
      )
      .all(limit);
  }

  getReputation(userHash: string) {
    return this.db
      .prepare("SELECT * FROM reputation WHERE user_hash = ?")
      .get(userHash);
  }

  // ===== STATS =====

  getStats() {
    const pollCount = this.db
      .prepare("SELECT COUNT(*) as count FROM polls")
      .get() as any;
    const activePollCount = this.db
      .prepare("SELECT COUNT(*) as count FROM polls WHERE status = 0")
      .get() as any;
    const totalVolume = this.db
      .prepare("SELECT COALESCE(SUM(total_pool), 0) as total FROM polls")
      .get() as any;
    const totalBets = this.db
      .prepare("SELECT COALESCE(SUM(total_bets), 0) as total FROM polls")
      .get() as any;
    const userCount = this.db
      .prepare("SELECT COUNT(*) as count FROM reputation")
      .get() as any;

    return {
      totalPolls: pollCount.count,
      activePolls: activePollCount.count,
      totalVolume: totalVolume.total,
      totalBets: totalBets.total,
      totalUsers: userCount.count,
    };
  }
}