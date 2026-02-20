// Syncial Reputation Program
// Handles: Reputation scoring, leaderboard, prediction accuracy
// Privacy: Individual bet history is private; reputation score can be selectively revealed
program syncial_reputation_v1.aleo {

    // =============================================
    // RECORDS (Private)
    // =============================================

    // Private reputation proof - user can selectively disclose
    record ReputationProof {
        owner: address,
        user_hash: field,
        accuracy_score: u64,        // out of 10000 (basis points)
        total_predictions: u64,
        correct_predictions: u64,
        total_volume: u64,          // total amount bet
        level: u8,                  // 1-10 tier
    }

    // =============================================
    // MAPPINGS (Public leaderboard)
    // =============================================

    // Public reputation scores (opt-in)
    mapping public_reputation: field => u64;
    // user_hash => reputation_score

    // Prediction count
    mapping prediction_count: field => u64;

    // Correct prediction count
    mapping correct_count: field => u64;

    // Total volume bet
    mapping total_volume: field => u64;

    // Leaderboard position tracking
    mapping leaderboard_score: field => u64;

    // =============================================
    // STRUCTS
    // =============================================

    struct ReputationUpdate {
        user: address,
        poll_id: field,
        was_correct: bool,
    }

    // =============================================
    // TRANSITIONS
    // =============================================

    // Update reputation after poll resolution (called by user)
    transition update_reputation(
        current_proof: ReputationProof,
        was_correct: bool,
        bet_amount: u64,
    ) -> ReputationProof {
        let new_correct: u64 = current_proof.correct_predictions +
            (was_correct ? 1u64 : 0u64);
        let new_total: u64 = current_proof.total_predictions + 1u64;
        let new_volume: u64 = current_proof.total_volume + bet_amount;

        // Calculate accuracy (basis points)
        let accuracy: u64 = (new_correct * 10000u64) / new_total;

        // Calculate level (1-10)
        let level: u8 = calculate_level(new_total, accuracy);

        let updated: ReputationProof = ReputationProof {
            owner: current_proof.owner,
            user_hash: current_proof.user_hash,
            accuracy_score: accuracy,
            total_predictions: new_total,
            correct_predictions: new_correct,
            total_volume: new_volume,
            level: level,
        };

        let user_hash: field = current_proof.user_hash;

        return updated then finalize(user_hash, accuracy, new_total, new_correct, new_volume);
    }

    finalize update_reputation(
        user_hash: field,
        accuracy: u64,
        total_preds: u64,
        correct_preds: u64,
        volume: u64,
    ) {
        Mapping::set(public_reputation, user_hash, accuracy);
        Mapping::set(prediction_count, user_hash, total_preds);
        Mapping::set(correct_count, user_hash, correct_preds);
        Mapping::set(total_volume, user_hash, volume);

        // Leaderboard score = accuracy * log(volume) approximation
        // Simple: accuracy * total_predictions / 100
        let lb_score: u64 = accuracy * total_preds / 100u64;
        Mapping::set(leaderboard_score, user_hash, lb_score);
    }

    // Initialize reputation for new user
    transition init_reputation() -> ReputationProof {
        let user_hash: field = BHP256::hash_to_field(self.caller);

        let proof: ReputationProof = ReputationProof {
            owner: self.caller,
            user_hash: user_hash,
            accuracy_score: 0u64,
            total_predictions: 0u64,
            correct_predictions: 0u64,
            total_volume: 0u64,
            level: 1u8,
        };

        return proof then finalize(user_hash);
    }

    finalize init_reputation(user_hash: field) {
        Mapping::set(public_reputation, user_hash, 0u64);
        Mapping::set(prediction_count, user_hash, 0u64);
        Mapping::set(correct_count, user_hash, 0u64);
        Mapping::set(total_volume, user_hash, 0u64);
        Mapping::set(leaderboard_score, user_hash, 0u64);
    }

    // =============================================
    // HELPER FUNCTIONS
    // =============================================

    function calculate_level(total: u64, accuracy: u64) -> u8 {
        if (total < 5u64) {
            return 1u8;
        } else if (total < 15u64 && accuracy > 4000u64) {
            return 2u8;
        } else if (total < 30u64 && accuracy > 4500u64) {
            return 3u8;
        } else if (total < 50u64 && accuracy > 5000u64) {
            return 4u8;
        } else if (total < 75u64 && accuracy > 5500u64) {
            return 5u8;
        } else if (total < 100u64 && accuracy > 6000u64) {
            return 6u8;
        } else if (total < 150u64 && accuracy > 6500u64) {
            return 7u8;
        } else if (total < 200u64 && accuracy > 7000u64) {
            return 8u8;
        } else if (total < 300u64 && accuracy > 7500u64) {
            return 9u8;
        } else if (accuracy > 8000u64) {
            return 10u8;
        } else {
            return 1u8;
        }
    }
}