use starknet::ContractAddress;
use starknet::ClassHash;

#[starknet::interface]
pub trait ISXRPToken<TContractState> {
    fn mint(ref self: TContractState, recipient: ContractAddress, drops: u256);
    fn withdraw(ref self: TContractState, xrpl_address: felt252, amount: u256);
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
    fn set_l1_bridge(ref self: TContractState, new_bridge: felt252);
}

#[starknet::contract]
pub mod sXRP {
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl, DefaultConfig};
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::upgrades::UpgradeableComponent;

    use starknet::ContractAddress;
    use starknet::ClassHash;
    use starknet::get_caller_address;
    use starknet::storage::*;
    use starknet::syscalls::send_message_to_l1_syscall;
    use starknet::SyscallResultTrait;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl ERC20HooksImpl = ERC20HooksEmptyImpl<ContractState>;

    const SCALING_FACTOR: u256 = 1_000_000_000_000;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        l1_bridge_address: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        WithdrawalInitiated: WithdrawalInitiated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawalInitiated {
        pub user: ContractAddress,
        pub xrpl_address: felt252,
        pub drops: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        l1_bridge: felt252
    ) {
        self.erc20.initializer("Starknet XRP", "sXRP");
        self.ownable.initializer(owner);
        self.l1_bridge_address.write(l1_bridge);
    }

    #[abi(embed_v0)]
    impl sXRPImpl of super::ISXRPToken<ContractState> {
        fn mint(ref self: ContractState, recipient: ContractAddress, drops: u256) {
            self.ownable.assert_only_owner();
            let amount: u256 = drops * SCALING_FACTOR;
            self.erc20.mint(recipient, amount);
        }

        fn withdraw(ref self: ContractState, xrpl_address: felt252, amount: u256) {
            let caller = get_caller_address();
            let drops: u256 = amount / SCALING_FACTOR;
            assert!(drops > 0, "Amount too small for withdrawal");

            self.erc20.burn(caller, amount);

            self.emit(Event::WithdrawalInitiated(WithdrawalInitiated {
                user: caller,
                xrpl_address: xrpl_address,
                drops: drops,
            }));

            let mut payload = array![xrpl_address, drops.low.into(), drops.high.into()];

            send_message_to_l1_syscall(
                self.l1_bridge_address.read(),
                payload.span()
            ).unwrap_syscall();
        }

        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }

        fn set_l1_bridge(ref self: ContractState, new_bridge: felt252) {
            // Protect it so only YOU can change the door
            self.ownable.assert_only_owner();

            // Ensure we aren't accidentally setting it to zero
            assert(new_bridge != 0, 'Bridge address cannot be 0');

            self.l1_bridge_address.write(new_bridge);
        }
    }
}
