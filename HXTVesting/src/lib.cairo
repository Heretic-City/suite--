use starknet::ContractAddress;

#[starknet::interface]
pub trait IHXTVestingVault<TContractState> {
    fn start(self: @TContractState) -> u64;
    fn cliff(self: @TContractState) -> u64;
    fn duration(self: @TContractState) -> u64;
    fn end(self: @TContractState) -> u64;
    fn released(self: @TContractState, token: ContractAddress) -> u256;
    fn releasable(self: @TContractState, token: ContractAddress) -> u256;
    fn vested_amount(self: @TContractState, token: ContractAddress, timestamp: u64) -> u256;
    fn release(ref self: TContractState, token: ContractAddress) -> u256;
    fn owner(self: @TContractState) -> ContractAddress;
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
    fn renounce_ownership(ref self: TContractState);
}

#[starknet::contract]
pub mod HXTVestingVault {
    use starknet::ContractAddress;
    use starknet::storage::*;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::finance::vesting::VestingComponent;
    use openzeppelin::finance::vesting::LinearVestingSchedule;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: VestingComponent, storage: vesting, event: VestingEvent);

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl VestingImpl = VestingComponent::VestingImpl<ContractState>;
    impl VestingInternalImpl = VestingComponent::InternalImpl<ContractState>;

    impl VestingSchedule = LinearVestingSchedule<ContractState>;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        vesting: VestingComponent::Storage
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        VestingEvent: VestingComponent::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        founder_beneficiary: ContractAddress,
        start_timestamp: u64,
    ) {
        // 12 Months in seconds (365 days * 24h * 60m * 60s)
        let duration: u64 = 31536000;
        let cliff: u64 = 31536000;

        self.ownable.initializer(founder_beneficiary);
        self.vesting.initializer(start_timestamp, duration, cliff);
    }
}
