use starknet::ContractAddress;
use starknet::ClassHash;

#[starknet::interface]
pub trait IHXT<TContractState> {
fn upgrade(ref self: TContractState, new_class_hash: ClassHash);
    fn decimals(self: @TContractState) -> u8;
    // Metadata & Supply
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
    fn total_supply(self: @TContractState) -> u256;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;

    // Transfers
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn allowance(self: @TContractState, owner: ContractAddress, spender: ContractAddress) -> u256;

    // Admin & Metadata
    fn set_metadata_uri(ref self: TContractState, uri: ByteArray);
    fn get_metadata_uri(self: @TContractState) -> ByteArray;
    fn set_fee_params(ref self: TContractState, fee_bps: u256, collector: ContractAddress);
    fn burn(ref self: TContractState, amount: u256);

    // Exemptions
    fn set_exemption(ref self: TContractState, account: ContractAddress, is_exempt: bool);
    fn is_exempt(self: @TContractState, account: ContractAddress) -> bool;
    fn set_fee_exemption(ref self: TContractState, account: ContractAddress, is_exempt: bool);
    fn is_fee_exempt(self: @TContractState, account: ContractAddress) -> bool;

    // XRPL Bridge Logic
    fn mint_from_xrpl(ref self: TContractState, recipient: ContractAddress, amount: u256, xrpl_tx_hash: felt252);
    fn register_xrpl_memo(ref self: TContractState, memo: felt252);
    fn get_address_for_memo(self: @TContractState, memo: felt252) -> ContractAddress;
    fn set_relayer(ref self: TContractState, new_relayer: ContractAddress);

    // AMM INFOs
    fn transferFrom(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn balanceOf(self: @TContractState, account: ContractAddress) -> u256;
    fn totalSupply(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod HereticToken {
    use openzeppelin::token::erc20::ERC20Component;
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::DefaultConfig;
    use openzeppelin::upgrades::UpgradeableComponent;
    use core::num::traits::Zero;
    use starknet::ContractAddress;
    use starknet::ClassHash;
    use starknet::get_caller_address;
    use starknet::storage::*;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    impl ERC20ConfigImpl = DefaultConfig;

    // Mixins
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // Upgradeable Internal
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    const MAX_WALLET_LIMIT: u256 = 400_000_000_000_000_000_000_000;
    const BASIS_POINT_SCALE: u256 = 10_000;

    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        is_exempt: Map<ContractAddress, bool>,
        is_fee_exempt: Map<ContractAddress, bool>,
        transfer_fee_bps: u256,
        fee_collector: ContractAddress,
        metadata_uri: ByteArray,
        processed_xrpl_txs: Map<felt252, bool>,
        memo_registry: Map<felt252, ContractAddress>,
        relayer_address: ContractAddress,
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
        TokensBurned: TokensBurned,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TokensBurned {
        pub burner: ContractAddress,
        pub amount: u256
    }

        #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        relayer: ContractAddress,
        sale_addr: ContractAddress,
        incentives_addr: ContractAddress,
        treasury_addr: ContractAddress,
        vesting_vault_addr: ContractAddress
    ) {
        self.erc20.initializer("Heretic Token", "HXT");
        self.ownable.initializer(owner);
        self.relayer_address.write(relayer);

        self.is_exempt.entry(sale_addr).write(true);
        self.is_exempt.entry(incentives_addr).write(true);
        self.is_exempt.entry(treasury_addr).write(true);
        self.is_exempt.entry(vesting_vault_addr).write(true);

        self.is_fee_exempt.entry(sale_addr).write(true);
        self.is_fee_exempt.entry(treasury_addr).write(true);

        self.erc20.mint(sale_addr, 40_000_000_000_000_000_000_000_000);
        self.erc20.mint(incentives_addr, 25_000_000_000_000_000_000_000_000);
        self.erc20.mint(treasury_addr, 20_000_000_000_000_000_000_000_000);
        self.erc20.mint(vesting_vault_addr, 15_000_000_000_000_000_000_000_000);
    }

    impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
        fn before_update(
            ref self: ERC20Component::ComponentState<ContractState>,
            from: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            if recipient.is_non_zero() {
                let contract_state = self.get_contract();
                let is_wallet_exempt = contract_state.is_exempt.entry(recipient).read();

                if !is_wallet_exempt {
                    let current_balance = contract_state.erc20.balance_of(recipient);
                    assert!(current_balance + amount <= MAX_WALLET_LIMIT, "Exceeds 1% wallet limit");
                }
            }
        }

        fn after_update(
            ref self: ERC20Component::ComponentState<ContractState>,
            from: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {}
    }


    #[abi(embed_v0)]
    pub impl HXTImpl of super::IHXT<ContractState> {
        fn decimals(self: @ContractState) -> u8 {
        18
    }
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            // Check that the person calling is the owner
            self.ownable.assert_only_owner();

            // Use the component internal logic to do the heavy lifting
            self.upgradeable.upgrade(new_class_hash);
        }
        // --- Standard ERC20 / Metadata ---
        fn name(self: @ContractState) -> ByteArray { self.erc20.name() }
        fn symbol(self: @ContractState) -> ByteArray { self.erc20.symbol() }
        fn total_supply(self: @ContractState) -> u256 { self.erc20.total_supply() }
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 { self.erc20.balance_of(account) }
        fn allowance(self: @ContractState, owner: ContractAddress, spender: ContractAddress) -> u256 { self.erc20.allowance(owner, spender) }
        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool { self.erc20.approve(spender, amount) }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            let sender = get_caller_address();
            self._transfer_with_fee(sender, recipient, amount)
        }

        fn transfer_from(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
        let caller = get_caller_address();
        self.erc20._spend_allowance(sender, caller, amount);
        self._transfer_with_fee(sender, recipient, amount)
        }

        fn burn(ref self: ContractState, amount: u256) {
            let caller = get_caller_address();
            self.erc20.burn(caller, amount);
            self.emit(Event::TokensBurned(TokensBurned { burner: caller, amount }));
        }

        // --- Bridge Logic ---
        fn mint_from_xrpl(ref self: ContractState, recipient: ContractAddress, amount: u256, xrpl_tx_hash: felt252) {
            let caller = get_caller_address();
            assert!(caller == self.relayer_address.read(), "Only authorized relayer can mint");

            let is_processed = self.processed_xrpl_txs.entry(xrpl_tx_hash).read();
            assert!(!is_processed, "XRPL transaction already processed");

            self.processed_xrpl_txs.entry(xrpl_tx_hash).write(true);
            self.erc20.mint(recipient, amount);
        }

        fn register_xrpl_memo(ref self: ContractState, memo: felt252) {
            let caller = get_caller_address();
            self.memo_registry.entry(memo).write(caller);
        }

        fn get_address_for_memo(self: @ContractState, memo: felt252) -> ContractAddress {
            self.memo_registry.entry(memo).read()
        }

        fn set_relayer(ref self: ContractState, new_relayer: ContractAddress) {
            self.ownable.assert_only_owner();
            assert!(new_relayer.is_non_zero(), "New relayer cannot be zero");
            self.relayer_address.write(new_relayer);
        }

        // --- Admin Config ---
        fn set_metadata_uri(ref self: ContractState, uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.metadata_uri.write(uri);
        }

        fn get_metadata_uri(self: @ContractState) -> ByteArray {
            self.metadata_uri.read()
        }

        fn set_fee_params(ref self: ContractState, fee_bps: u256, collector: ContractAddress) {
            self.ownable.assert_only_owner();
            assert!(fee_bps <= BASIS_POINT_SCALE, "Fee exceeds 100%");
            self.transfer_fee_bps.write(fee_bps);
            self.fee_collector.write(collector);
        }

        fn set_exemption(ref self: ContractState, account: ContractAddress, is_exempt: bool) {
            self.ownable.assert_only_owner();
            self.is_exempt.entry(account).write(is_exempt);
        }

        fn is_exempt(self: @ContractState, account: ContractAddress) -> bool {
            self.is_exempt.entry(account).read()
        }

        fn set_fee_exemption(ref self: ContractState, account: ContractAddress, is_exempt: bool) {
            self.ownable.assert_only_owner();
            self.is_fee_exempt.entry(account).write(is_exempt);
        }

        fn is_fee_exempt(self: @ContractState, account: ContractAddress) -> bool {
            self.is_fee_exempt.entry(account).read()
        }

        //camelMeUp
    fn transferFrom(ref self: ContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool {
        // We use the full path to your specific implementation to avoid ambiguity
        HXTImpl::transfer_from(ref self, sender, recipient, amount)
    }

    fn balanceOf(self: @ContractState, account: ContractAddress) -> u256 {
        self.erc20.balance_of(account)
    }

    fn totalSupply(self: @ContractState) -> u256 {
        self.erc20.total_supply()
    }



}

    #[generate_trait]
    impl HXTInternalImpl of HXTInternalTrait {
        fn _transfer_with_fee(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) -> bool {
            let fee_bps = self.transfer_fee_bps.read();
            let collector = self.fee_collector.read();
            let is_sender_fee_exempt = self.is_fee_exempt.entry(sender).read();

            if fee_bps > 0 && collector.is_non_zero() && !is_sender_fee_exempt {
                let fee_amount = (amount * fee_bps) / BASIS_POINT_SCALE;
                let transfer_amount = amount - fee_amount;

                self.erc20._transfer(sender, collector, fee_amount);
                self.erc20._transfer(sender, recipient, transfer_amount);
            } else {
                self.erc20._transfer(sender, recipient, amount);
            }
            true
        }
    }
}
