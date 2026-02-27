
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_mock_call, cheat_block_timestamp, CheatSpan};
use heretic_oracle_guard::oracle_guard::{IExtensionDispatcher, IExtensionDispatcherTrait};
// Import the actual structs to ensure correct serialization in mocks
use heretic_oracle_guard::types::{PoolKey, SwapParameters, PoolState};
use heretic_oracle_guard::interfaces::pyth::Price;
use heretic_oracle_guard::constants::{PYTH_ORACLE_ADDR};
use starknet::ContractAddress;
use core::traits::TryInto;

#[test]
#[should_panic(expected: ('HXT_PEG_VIOLATED',))]
fn test_guard_blocks_manipulated_price() {
    let ekubo_core: ContractAddress = 0x123.try_into().unwrap();
    let pyth_addr: ContractAddress = PYTH_ORACLE_ADDR.try_into().unwrap();
    let contract = declare("OracleGuard").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@array![ekubo_core.into(), 200]).unwrap();
    let guard = IExtensionDispatcher { contract_address };

    // 1. Mock Pyth: $1.50 using the Price struct
    let pyth_price = Price {
        price: 150000000, // 8 decimals
        conf: 100,
        expo: -8,
        publish_time: 99500
    };
    // start_mock_call serializes the struct correctly for the dispatcher
    start_mock_call(pyth_addr, selector!("get_price_no_older_than"), pyth_price);

    // 2. Mock Ekubo: $1.00 using the PoolState struct
    // Ensure all fields of PoolState are initialized as defined in types.cairo
    let q128: u256 = 0x100000000000000000000000000000000_u256;
    let ekubo_state = PoolState {
        sqrt_ratio: q128,
        tick: 0,
        // Add other fields of PoolState here...
    };
    start_mock_call(ekubo_core, selector!("get_pool_price"), ekubo_state);

    let dummy: ContractAddress = 0x1.try_into().unwrap();
    let pool_key = PoolKey { token0: dummy, token1: dummy, fee: 0, tick_spacing: 60, extension: contract_address };

    cheat_block_timestamp(contract_address, 100000, CheatSpan::TargetCalls(1));

    guard.before_swap(pool_key, SwapParameters { amount: 100, is_token1: true, sqrt_ratio_limit: 0, skip_ahead: 0 });
}

#[test]
fn test_guard_allows_aligned_price() {
    let ekubo_core: ContractAddress = 0x123.try_into().unwrap();
    let pyth_addr: ContractAddress = PYTH_ORACLE_ADDR.try_into().unwrap();
    let contract = declare("OracleGuard").unwrap().contract_class();

    // 500 bps = 5% tolerance
    let (contract_address, _) = contract.deploy(@array![ekubo_core.into(), 500]).unwrap();
    let guard = IExtensionDispatcher { contract_address };

    // 1. Mock Pyth: $1.00 using the Price struct
    let pyth_price = Price {
        price: 100000000, // 8 decimals
        conf: 100,
        expo: -8,
        publish_time: 100000
    };
    start_mock_call(pyth_addr, selector!("get_price_no_older_than"), pyth_price);

    // 2. Mock Ekubo: $1.00 using the PoolState struct
    let q128: u256 = 0x100000000000000000000000000000000_u256;
    let ekubo_state = PoolState {
        sqrt_ratio: q128,
        tick: 0,
        // Ensure all other fields defined in your PoolState struct are included here
    };
    start_mock_call(ekubo_core, selector!("get_pool_price"), ekubo_state);

    let dummy: ContractAddress = 0x1.try_into().unwrap();
    let pool_key = PoolKey { token0: dummy, token1: dummy, fee: 0, tick_spacing: 60, extension: contract_address };

    // Set timestamp to match the mock price's publish time
    cheat_block_timestamp(contract_address, 100000, CheatSpan::TargetCalls(1));

    guard.before_swap(pool_key, SwapParameters { amount: 100, is_token1: true, sqrt_ratio_limit: 0, skip_ahead: 0 });
}
