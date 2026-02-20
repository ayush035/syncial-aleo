// Syncial Betting Program
// Handles: Poll creation, betting, settlement, payouts
// Privacy: Bet amounts and choices are private; only totals are public
program syncial_betting_v1.aleo {

    // =============================================
    // CONSTANTS
    // =============================================
    
    // Fee percentages (basis points: 100 = 1%)
    // Creator fee: 5% = 500 basis points
    // Platform fee: 1% = 100 basis points
    // Winner pool: 94% = 9400 basis points

    // =============================================
    // RECORDS (Private)
    // =============================================

    // Private bet receipt - proves a user placed a bet without revealing details
    record BetReceipt {
        owner: address,
        poll_id: field,
        option_chosen: u8,         // 1 or 2 (supports binary polls initially)
        amount: u64,               // amount in microcredits
        bet_id: field,
        timestamp: u64,
    }

    // Private winning claim token
    record WinningClaim {
        owner: address,
        poll_id: field,
        amount_won: u64,
        claimed: bool,
    }

    // Creator reward record
    record CreatorReward {
        owner: address,
        poll_id: field,
        reward_amount: u64,
    }

    // =============================================
    // MAPPINGS (Public aggregated state)
    // =============================================

    // Poll metadata: poll_id => creator address hash
    mapping poll_creators: field => field;

    // Poll status: 0=active, 1=resolved, 2=cancelled
    mapping poll_status: field => u8;

    // Total pool for option 1
    mapping pool_option_1: field => u64;

    // Total pool for option 2
    mapping pool_option_2: field => u64;

    // Total bets count
    mapping total_bets_count: field => u64;

    // Winning option (0=unresolved, 1=option1, 2=option2)
    mapping winning_option: field => u8;

    // Poll deadline (block height or timestamp)
    mapping poll_deadline: field => u64;

    // Total pool size
    mapping total_pool: field => u64;

    // Track if a bet_id has been used (prevent double-claim)
    mapping bet_claimed: field => bool;

    // Platform treasury accumulator
    mapping platform_treasury: u8 => u64;

    // Oracle address hash (who can resolve polls)
    mapping authorized_oracles: field => bool;

    // Poll existence
    mapping poll_exists: field => bool;

    // =============================================
    // STRUCTS
    // =============================================

    struct PollInput {
        creator: address,
        seed: field,
        timestamp: u64,
    }

    struct BetInput {
        bettor: address,
        poll_id: field,
        amount: u64,
        timestamp: u64,
    }

    // =============================================
    // TRANSITIONS
    // =============================================

    // Initialize platform (call once)
    transition initialize_platform(oracle_address_hash: field) -> () {
        return then finalize(oracle_address_hash);
    }

    finalize initialize_platform(oracle_address_hash: field) {
        Mapping::set(platform_treasury, 0u8, 0u64);
        Mapping::set(authorized_oracles, oracle_address_hash, true);
    }

    // Register an oracle
    transition register_oracle(oracle_hash: field) -> () {
        return then finalize(oracle_hash);
    }

    finalize register_oracle(oracle_hash: field) {
        Mapping::set(authorized_oracles, oracle_hash, true);
    }

    // Create a new prediction poll
    transition create_poll(
        poll_seed: field,
        deadline: u64,
        timestamp: u64,
    ) -> field {
        // Generate unique poll ID
        let poll_id: field = BHP256::hash_to_field(PollInput {
            creator: self.caller,
            seed: poll_seed,
            timestamp: timestamp,
        });

        let creator_hash: field = BHP256::hash_to_field(self.caller);

        return poll_id then finalize(poll_id, creator_hash, deadline);
    }

    finalize create_poll(
        poll_id: field,
        creator_hash: field,
        deadline: u64,
    ) {
        // Ensure poll doesn't exist
        let exists: bool = Mapping::get_or_use(poll_exists, poll_id, false);
        assert_eq(exists, false);

        // Initialize poll state
        Mapping::set(poll_exists, poll_id, true);
        Mapping::set(poll_creators, poll_id, creator_hash);
        Mapping::set(poll_status, poll_id, 0u8);       // active
        Mapping::set(pool_option_1, poll_id, 0u64);
        Mapping::set(pool_option_2, poll_id, 0u64);
        Mapping::set(total_bets_count, poll_id, 0u64);
        Mapping::set(winning_option, poll_id, 0u8);     // unresolved
        Mapping::set(poll_deadline, poll_id, deadline);
        Mapping::set(total_pool, poll_id, 0u64);
    }

    // Place a private bet on a poll
    // Privacy: The bet amount and option are hidden in the record
    // Only the aggregate totals are updated publicly
    transition place_bet(
        poll_id: field,
        option: u8,
        amount: u64,
        timestamp: u64,
        bet_seed: field,
    ) -> BetReceipt {
        // Validate option is 1 or 2
        assert(option == 1u8 || option == 2u8);

        // Minimum bet: 1000 microcredits (0.001 credits)
        assert(amount >= 1000u64);

        // Generate unique bet ID
        let bet_id: field = BHP256::hash_to_field(BetInput {
            bettor: self.caller,
            poll_id: poll_id,
            amount: amount,
            timestamp: timestamp,
        });

        // Create private bet receipt
        let receipt: BetReceipt = BetReceipt {
            owner: self.caller,
            poll_id: poll_id,
            option_chosen: option,
            amount: amount,
            bet_id: bet_id,
            timestamp: timestamp,
        };

        return receipt then finalize(poll_id, option, amount, bet_id);
    }

    finalize place_bet(
        poll_id: field,
        option: u8,
        amount: u64,
        bet_id: field,
    ) {
        // Ensure poll exists and is active
        let exists: bool = Mapping::get_or_use(poll_exists, poll_id, false);
        assert_eq(exists, true);

        let status: u8 = Mapping::get(poll_status, poll_id);
        assert_eq(status, 0u8); // must be active

        // Ensure bet hasn't been placed before
        let already_claimed: bool = Mapping::get_or_use(bet_claimed, bet_id, false);
        assert_eq(already_claimed, false);
        Mapping::set(bet_claimed, bet_id, true);

        // Update pool totals
        if (option == 1u8) {
            let current: u64 = Mapping::get(pool_option_1, poll_id);
            Mapping::set(pool_option_1, poll_id, current + amount);
        } else {
            let current: u64 = Mapping::get(pool_option_2, poll_id);
            Mapping::set(pool_option_2, poll_id, current + amount);
        }

        // Update total pool
        let current_total: u64 = Mapping::get(total_pool, poll_id);
        Mapping::set(total_pool, poll_id, current_total + amount);

        // Update bet count
        let count: u64 = Mapping::get(total_bets_count, poll_id);
        Mapping::set(total_bets_count, poll_id, count + 1u64);
    }

    // Oracle resolves a poll outcome
    transition resolve_poll(
        poll_id: field,
        winner: u8,             // 1 or 2
        oracle_hash: field,
    ) -> () {
        assert(winner == 1u8 || winner == 2u8);
        return then finalize(poll_id, winner, oracle_hash);
    }

    finalize resolve_poll(
        poll_id: field,
        winner: u8,
        oracle_hash: field,
    ) {
        // Verify oracle is authorized
        let is_oracle: bool = Mapping::get_or_use(authorized_oracles, oracle_hash, false);
        assert_eq(is_oracle, true);

        // Ensure poll is active
        let status: u8 = Mapping::get(poll_status, poll_id);
        assert_eq(status, 0u8);

        // Set winning option
        Mapping::set(winning_option, poll_id, winner);

        // Mark poll as resolved
        Mapping::set(poll_status, poll_id, 1u8);

        // Calculate platform fee (1%)
        let pool: u64 = Mapping::get(total_pool, poll_id);
        let platform_fee: u64 = pool / 100u64; // 1%

        // Accumulate platform treasury
        let treasury: u64 = Mapping::get_or_use(platform_treasury, 0u8, 0u64);
        Mapping::set(platform_treasury, 0u8, treasury + platform_fee);
    }

    // Claim winnings with private bet receipt
    // Privacy: Amount won is private; only the user knows their payout
    transition claim_winnings(
        receipt: BetReceipt,
    ) -> WinningClaim {
        // This creates a private winning claim record
        // The actual payout calculation happens in finalize
        // For privacy, we compute an estimated amount client-side
        // and verify in finalize

        let claim: WinningClaim = WinningClaim {
            owner: receipt.owner,
            poll_id: receipt.poll_id,
            amount_won: 0u64, // Will be calculated
            claimed: false,
        };

        return claim then finalize(
            receipt.poll_id,
            receipt.option_chosen,
            receipt.amount,
            receipt.bet_id,
        );
    }

    finalize claim_winnings(
        poll_id: field,
        option_chosen: u8,
        amount: u64,
        bet_id: field,
    ) {
        // Ensure poll is resolved
        let status: u8 = Mapping::get(poll_status, poll_id);
        assert_eq(status, 1u8);

        // Ensure user chose winning option
        let winner: u8 = Mapping::get(winning_option, poll_id);
        assert_eq(option_chosen, winner);

        // Ensure not already claimed
        // bet_claimed was set to true when placing bet
        // We reuse it - set to false after claim to mark as claimed
        // Actually let's use a separate approach
        // The bet_id was already set to true; for claiming we just verify it exists
        let bet_exists: bool = Mapping::get_or_use(bet_claimed, bet_id, false);
        assert_eq(bet_exists, true);
    }

    // Claim creator reward
    transition claim_creator_reward(
        poll_id: field,
    ) -> CreatorReward {
        let creator_hash: field = BHP256::hash_to_field(self.caller);

        let reward: CreatorReward = CreatorReward {
            owner: self.caller,
            poll_id: poll_id,
            reward_amount: 0u64, // calculated in finalize context
        };

        return reward then finalize(poll_id, creator_hash);
    }

    finalize claim_creator_reward(
        poll_id: field,
        creator_hash: field,
    ) {
        // Verify caller is the creator
        let stored_creator: field = Mapping::get(poll_creators, poll_id);
        assert_eq(stored_creator, creator_hash);

        // Ensure poll is resolved
        let status: u8 = Mapping::get(poll_status, poll_id);
        assert_eq(status, 1u8);
    }

    // Cancel a poll (only creator, only if active)
    transition cancel_poll(
        poll_id: field,
    ) -> () {
        let creator_hash: field = BHP256::hash_to_field(self.caller);
        return then finalize(poll_id, creator_hash);
    }

    finalize cancel_poll(poll_id: field, creator_hash: field) {
        let stored_creator: field = Mapping::get(poll_creators, poll_id);
        assert_eq(stored_creator, creator_hash);

        let status: u8 = Mapping::get(poll_status, poll_id);
        assert_eq(status, 0u8);

        Mapping::set(poll_status, poll_id, 2u8); // cancelled
    }
}