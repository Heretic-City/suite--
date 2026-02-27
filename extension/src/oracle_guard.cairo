use heretic_oracle_guard::types::{PoolKey, SwapParameters, BeforeSwapResult};

#[starknet::interface]
pub trait IExtension<TContractState> {
    fn before_swap(
        ref self: TContractState, pool_key: PoolKey, params: SwapParameters
    ) -> BeforeSwapResult;
}

#[starknet::contract]
mod OracleGuard {
    // --- Imports ---
    use heretic_oracle_guard::types::{PoolKey, SwapParameters, BeforeSwapResult};
    use heretic_oracle_guard::constants; // We import the whole module to avoid scope issues
    use heretic_oracle_guard::interfaces::ekubo::{ICoreDispatcher, ICoreDispatcherTrait};
    use heretic_oracle_guard::interfaces::pyth::{IPythDispatcher, IPythDispatcherTrait};

    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerWriteAccess, StoragePointerReadAccess};
    use core::traits::TryInto;

    #[storage]
    struct Storage {
        ekubo_core: ContractAddress,
        max_deviation_bps: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, core: ContractAddress, initial_deviation: u32) {
        self.ekubo_core.write(core);
        self.max_deviation_bps.write(initial_deviation);
    }

    #[abi(embed_v0)]
    impl OracleGuardExtension of super::IExtension<ContractState> {
        fn before_swap(
            ref self: ContractState,
            pool_key: PoolKey,
            params: SwapParameters,
        ) -> BeforeSwapResult {
            let pyth = IPythDispatcher {
                contract_address: constants::PYTH_ORACLE_ADDR.try_into().unwrap()
            };

            // 1. Fetch Price from Pyth
            let price_data = pyth.get_price_no_older_than(
                constants::XRP_PRICE_ID,
                constants::MAX_PRICE_AGE
            );

            // 2. Normalize Oracle Price to 18 Decimals
            // Assuming Pyth price is 8 decimals, we multiply by 10^10 to reach 10^18
            let oracle_price_128: u128 = price_data.price.try_into().unwrap();
            let oracle_price_18 = oracle_price_128 * 10_000_000_000;

            // 3. Get Current Pool Price from Ekubo (also 18 decimals)
            let pool_price_18 = self.get_internal_pool_price(pool_key);

            // 4. Calculate Absolute Deviation
            let diff = if oracle_price_18 > pool_price_18 {
                oracle_price_18 - pool_price_18
            } else {
                pool_price_18 - oracle_price_18
            };

            // 5. Compare deviation in Basis Points (1 bps = 0.01%)
            // Formula: (diff * 10000) / oracle_price
            let diff_u256: u256 = diff.into();
            let oracle_u256: u256 = oracle_price_18.into();
            let deviation_bps = (diff_u256 * 10000_u256) / oracle_u256;

            assert(deviation_bps <= self.max_deviation_bps.read().into(), 'HXT_PEG_VIOLATED');

            BeforeSwapResult::Continue
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn get_internal_pool_price(self: @ContractState, pool_key: PoolKey) -> u128 {
            let core = ICoreDispatcher { contract_address: self.ekubo_core.read() };
            let pool_state = core.get_pool_price(pool_key);

            let sqrt_ratio: u256 = pool_state.sqrt_ratio;
            let q128: u256 = 0x100000000000000000000000000000000_u256;

            // Square ratio math: P = (sqrt_ratio / 2^128)^2
            // We scale down by 2^32 (0x100000000) to prevent u256 overflow during the square
            let s_prime = sqrt_ratio / 0x100000000_u256;
            let q_prime = q128 / 0x100000000_u256;

            let price_18_decimals = (s_prime * s_prime * 1_000_000_000_000_000_000_u256) / (q_prime * q_prime);

            price_18_decimals.try_into().unwrap()
        }
    }
}
