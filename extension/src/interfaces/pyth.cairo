#[derive(Drop, Serde, Copy)]
pub struct Price {
    pub price: i64,
    pub conf: u64,
    pub expo: i32,
    pub publish_time: u64,
}

#[starknet::interface]
pub trait IPyth<TState> {
    fn get_price_no_older_than(self: @TState, price_id: u256, age: u64) -> Price;
}
