#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub enum DataType {
    #[default]
    SpotEntry: felt252,
    FutureEntry: felt252,
}

#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub struct PragmaPricesResponse {
    pub price: u128,
    pub decimals: u32,
    pub last_updated_timestamp: u64,
    pub num_sources: u32,
}

#[starknet::interface]
pub trait IPragmaABI<TContractState> {
    fn get_data_median(self: @TContractState, data_type: DataType) -> PragmaPricesResponse;
}
