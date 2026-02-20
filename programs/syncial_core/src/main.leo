// Syncial Core Program
// Handles: User profiles, social posts, privacy-preserving identity
program syncial_core_v1.aleo {

    // =============================================
    // RECORDS (Private by default on Aleo)
    // =============================================

    // Private user profile record - only the owner can see their data
    record UserProfile {
        owner: address,
        username_hash: field,       // hash of username for privacy
        reputation_score: u64,
        total_posts: u64,
        total_polls_created: u64,
        total_bets_won: u64,
        total_bets_lost: u64,
        joined_at: u64,
    }

    // Private post record - owner holds proof of authorship
    record PostRecord {
        owner: address,
        post_id: field,
        content_hash: field,        // hash of content stored off-chain (IPFS)
        timestamp: u64,
        is_poll: bool,
        poll_id: field,             // 0field if not a poll
    }

    // =============================================
    // MAPPINGS (Public on-chain state)
    // =============================================

    // Public profile info (only what user chooses to reveal)
    mapping public_profiles: field => field;
    // username_hash => profile_data_hash

    // Track if a username is taken
    mapping username_registry: field => bool;

    // Post counter for generating unique IDs
    mapping post_counter: u8 => u64;

    // Public post metadata (content_hash => author_hash)
    // Author hash provides pseudonymous posting
    mapping public_posts: field => field;

    // Post existence proof
    mapping post_exists: field => bool;

    // =============================================
    // TRANSITIONS (Functions)
    // =============================================

    // Register a new user with privacy-preserving profile
    transition register_user(
        username_hash: field,
        current_time: u64,
    ) -> UserProfile {
        // Create private profile record
        let profile: UserProfile = UserProfile {
            owner: self.caller,
            username_hash: username_hash,
            reputation_score: 100u64,       // starting reputation
            total_posts: 0u64,
            total_polls_created: 0u64,
            total_bets_won: 0u64,
            total_bets_lost: 0u64,
            joined_at: current_time,
        };

        return profile then finalize(username_hash);
    }

    finalize register_user(username_hash: field) {
        // Ensure username is not taken
        let taken: bool = Mapping::get_or_use(username_registry, username_hash, false);
        assert_eq(taken, false);

        // Register the username
        Mapping::set(username_registry, username_hash, true);

        // Initialize post counter if needed
        let count: u64 = Mapping::get_or_use(post_counter, 0u8, 0u64);
        Mapping::set(post_counter, 0u8, count);
    }

    // Create a social post (privacy-preserving)
    transition create_post(
        profile: UserProfile,
        content_hash: field,
        timestamp: u64,
        post_seed: field,
    ) -> (UserProfile, PostRecord) {
        // Generate unique post ID from seed + caller
        let post_id: field = BHP256::hash_to_field(PostIdInput {
            author: self.caller,
            seed: post_seed,
            timestamp: timestamp,
        });

        // Update profile
        let updated_profile: UserProfile = UserProfile {
            owner: profile.owner,
            username_hash: profile.username_hash,
            reputation_score: profile.reputation_score,
            total_posts: profile.total_posts + 1u64,
            total_polls_created: profile.total_polls_created,
            total_bets_won: profile.total_bets_won,
            total_bets_lost: profile.total_bets_lost,
            joined_at: profile.joined_at,
        };

        // Create post record (private proof of authorship)
        let post: PostRecord = PostRecord {
            owner: self.caller,
            post_id: post_id,
            content_hash: content_hash,
            timestamp: timestamp,
            is_poll: false,
            poll_id: 0field,
        };

        return (updated_profile, post) then finalize(post_id, content_hash);
    }

    finalize create_post(post_id: field, content_hash: field) {
        // Ensure post doesn't already exist
        let exists: bool = Mapping::get_or_use(post_exists, post_id, false);
        assert_eq(exists, false);

        // Register post
        Mapping::set(post_exists, post_id, true);
        Mapping::set(public_posts, post_id, content_hash);

        // Increment counter
        let count: u64 = Mapping::get_or_use(post_counter, 0u8, 0u64);
        Mapping::set(post_counter, 0u8, count + 1u64);
    }

    // Create a post with an attached poll
    transition create_poll_post(
        profile: UserProfile,
        content_hash: field,
        poll_id: field,
        timestamp: u64,
        post_seed: field,
    ) -> (UserProfile, PostRecord) {
        let post_id: field = BHP256::hash_to_field(PostIdInput {
            author: self.caller,
            seed: post_seed,
            timestamp: timestamp,
        });

        let updated_profile: UserProfile = UserProfile {
            owner: profile.owner,
            username_hash: profile.username_hash,
            reputation_score: profile.reputation_score,
            total_posts: profile.total_posts + 1u64,
            total_polls_created: profile.total_polls_created + 1u64,
            total_bets_won: profile.total_bets_won,
            total_bets_lost: profile.total_bets_lost,
            joined_at: profile.joined_at,
        };

        let post: PostRecord = PostRecord {
            owner: self.caller,
            post_id: post_id,
            content_hash: content_hash,
            timestamp: timestamp,
            is_poll: true,
            poll_id: poll_id,
        };

        return (updated_profile, post) then finalize(post_id, content_hash);
    }

    finalize create_poll_post(post_id: field, content_hash: field) {
        let exists: bool = Mapping::get_or_use(post_exists, post_id, false);
        assert_eq(exists, false);
        Mapping::set(post_exists, post_id, true);
        Mapping::set(public_posts, post_id, content_hash);
        let count: u64 = Mapping::get_or_use(post_counter, 0u8, 0u64);
        Mapping::set(post_counter, 0u8, count + 1u64);
    }

    // =============================================
    // STRUCTS
    // =============================================

    struct PostIdInput {
        author: address,
        seed: field,
        timestamp: u64,
    }
}