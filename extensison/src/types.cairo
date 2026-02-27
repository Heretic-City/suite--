use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PoolKey {
    pub token0: ContractAddress,
    pub token1: ContractAddress,
    pub fee: u128,
    pub tick_spacing: u128,
    pub extension: ContractAddress,
}

#[derive(Copy, Drop, Serde)]
pub struct SwapParameters {
    pub amount: i128,
    pub is_token1: bool,
    pub sqrt_ratio_limit: u256,
    pub skip_ahead: u64,
}

#[derive(Copy, Drop, Serde)]
pub enum BeforeSwapResult {
    Continue,
    Delta: (i128, i128),
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct PoolState {
    pub sqrt_ratio: u256,
    pub tick: i32,
}
