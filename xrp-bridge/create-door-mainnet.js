const xrpl = require('xrpl');
const fs = require('fs');

async function createMainnetDoor() {
  // 1. Connect to a MAINNET Node
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();

  console.log("Connected to XRPL Mainnet...");

  // 2. Generate a wallet locally (This does NOT fund it)
  const wallet = xrpl.Wallet.generate();

  console.log("--- 🏁 MAINNET DOOR GENERATED ---");
  console.log("ADDRESS: ", wallet.address);
  console.log("SECRET (SEED): ", wallet.seed);
  console.log("----------------------------------");
  console.log("⚠️  ACTION REQUIRED:");
  console.log(`1. Send at least 15-20 XRP to ${wallet.address} to activate it.`);
  console.log("2. The first 10 XRP will be locked as the network reserve.");
  console.log("3. SAVE THESE CREDENTIALS SECURELY. If you lose the seed, the bridge is dead.");

  // Save to a secure local file immediately
  const backup = `Mainnet Door: ${wallet.address}\nSeed: ${wallet.seed}\nCreated: ${new Date().toISOString()}`;
  fs.writeFileSync('mainnet_vault_backup.txt', backup);

  await client.disconnect();
}

createMainnetDoor();
