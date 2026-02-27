use heretic_oracle_guard::types::{PoolKey, PoolState};

#[starknet::interface]
pub trait ICore<TContractState> {
    fn get_pool_price(self: @TContractState, pool_key: PoolKey) -> PoolState;
}
