const xrpl = require('xrpl');

async function createDoorAccount() {
  // 1. Connect to the Testnet
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  console.log("Connected to Testnet. Creating Door Account...");

  // 2. Create and fund a new wallet automatically
  // This gives you 1,000 Test XRP instantly.
  const { wallet, balance } = await client.fundWallet();

  console.log("--- Door Account Created ---");
  console.log("Address:", wallet.address);
  console.log("Seed (Secret):", wallet.seed);
  console.log("Balance:", balance, "XRP");

  // IMPORTANT: Save wallet.address and wallet.seed to your .service file or .env now!

  await client.disconnect();
}

createDoorAccount();
