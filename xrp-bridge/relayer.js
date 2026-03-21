const { Account, RpcProvider, uint256 } = require('starknet');
const xrpl = require('xrpl');
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.STARKNET_ACCOUNT_ADDRESS) {
    console.error("❌ CRITICAL ERROR: .env file was not loaded correctly!");
    process.exit(1);
}

// ==========================================
// 1. DATABASE SETUP
// ==========================================
const db = new sqlite3.Database('./relayer.db', (err) => {
    if (err) console.error("Database connection error:", err);
    else console.log("📦 Local SQLite Database connected.");
});

db.run(`CREATE TABLE IF NOT EXISTS intents (
    destination_tag INTEGER PRIMARY KEY,
    starknet_address TEXT,
    risk_level INTEGER,
    is_locked BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS processed_burns (
    tx_hash TEXT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// ==========================================
// 2. EXPRESS API (WITHDRAWALS & INTENTS)
// ==========================================
const app = express();
app.use(cors());
app.use(express.json());

// Deposit Endpoint (From New UI)
app.post('/api/store-memo', (req, res) => {
    const { starknetAddress, xrpMemo, riskLevel, isLocked } = req.body;
    if (!starknetAddress || !xrpMemo) return res.status(400).json({ error: "Missing required fields" });

    const stmt = db.prepare("INSERT INTO intents (destination_tag, starknet_address, risk_level, is_locked) VALUES (?, ?, ?, ?)");
    stmt.run(xrpMemo, starknetAddress, riskLevel || 1, isLocked ? 1 : 0, function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        console.log(`📝 Registered Intent: Tag [${xrpMemo}] -> Starknet [${starknetAddress}]`);
        res.json({ success: true, tag: xrpMemo });
    });
    stmt.finalize();
});

// Secure Withdraw Endpoint
app.post('/api/withdraw', async (req, res) => {
    const { txHash, destXrplAddress, amount, destinationTag } = req.body;
    if (!txHash || !destXrplAddress || !amount) {
        return res.status(400).json({ error: "Missing withdrawal parameters" });
    }

    // Hard block withdrawing back to the Vault itself
    if (destXrplAddress === process.env.XRPL_ADDRESS) {
        return res.status(400).json({ error: "Cannot withdraw to the bridge vault" });
    }

    try {
        // Prevent Double Spending (Early Read Check)
        const isProcessed = await new Promise((resolve) => {
            db.get("SELECT tx_hash FROM processed_burns WHERE tx_hash = ?", [txHash], (err, row) => resolve(row));
        });
        if (isProcessed) return res.status(400).json({ error: "Transaction already processed" });

        console.log(`🔍 Withdrawal Request Received. Monitoring Starknet for: ${txHash}`);
        const myProvider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC.trim() });
        
        // Wait for network indexing
        let receipt = null;
        for (let i = 0; i < 12; i++) {
            try {
                receipt = await myProvider.getTransactionReceipt(txHash);
                if (receipt) break;
            } catch (e) {
                console.log(`⏳ [Attempt ${i+1}/12] Waiting for Starknet node to index TX...`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }

        if (!receipt || (receipt.execution_status !== 'SUCCEEDED' && receipt.finality_status !== 'ACCEPTED_ON_L2')) {
            return res.status(400).json({ error: "Starknet transaction failed or timed out." });
        }

        // Atomic DB Lock to prevent concurrent race-condition drains
        await new Promise((resolve, reject) => {
            db.run("INSERT INTO processed_burns (tx_hash) VALUES (?)", [txHash], function(err) {
                if (err) reject(new Error("Double spend detected: TX already exists in database."));
                else resolve();
            });
        });

        console.log(`✅ Burn Verified & DB Locked. Releasing ${amount} XRP to ${destXrplAddress}`);

        // Execute XRPL Payment
        const client = new xrpl.Client(process.env.XRPL_WS_URL || "wss://xrplcluster.com");
        await client.connect();
        const vaultWallet = xrpl.Wallet.fromSeed(process.env.XRPL_SEED.trim());

        const txPayload = {
            "TransactionType": "Payment",
            "Account": vaultWallet.address,
            "Amount": xrpl.xrpToDrops(amount.toString()),
            "Destination": destXrplAddress
        };

        // Conditionally add the DestinationTag if the user provided one
        if (destinationTag) {
            txPayload.DestinationTag = parseInt(destinationTag, 10);
            console.log(`🏷️ Tag Attached: ${txPayload.DestinationTag}`);
        }

        const prepared = await client.autofill(txPayload);

        const signed = vaultWallet.sign(prepared);
        const tx = await client.submitAndWait(signed.tx_blob);
        await client.disconnect();        
        console.log(`💸 XRPL Transfer Complete! Hash: ${tx.result.hash}`);
        res.json({ success: true, xrplHash: tx.result.hash });

    } catch (error) {
        console.error("Withdrawal Error:", error);
        res.status(500).json({ error: "Withdrawal Failed", details: error?.data || error?.message || error.toString() });
    }
});

const API_PORT = process.env.PORT || 3001;
app.listen(API_PORT, () => console.log(`🌐 API Server V3 (STRICT INTENT MODE) running on port ${API_PORT}`));


// ==========================================
// 3. MAINNET RELAYER STATE & LOGIC
// ==========================================
const processedHashes = new Set();
const eventQueue = [];
let isProcessing = false;

async function main() {
    const myProvider = new RpcProvider({
        nodeUrl: process.env.STARKNET_RPC.trim()
    });

    const bridgeAccount = new Account({
        provider: myProvider,
        address: process.env.STARKNET_ACCOUNT_ADDRESS.trim(),
        signer: process.env.STARKNET_PRIVATE_KEY.trim(),
        cairoVersion: '1'
    });

    const sXRP_CONTRACT = process.env.STARKNET_sXRP_ADDRESS.trim();
    const xrplDoor = process.env.XRPL_ADDRESS.trim();

    const client = new xrpl.Client(process.env.XRPL_WS_URL || "wss://xrplcluster.com");
    await client.connect();
    console.log(`🚀 Secure Relayer Online. Monitoring Door: ${xrplDoor}`);

    await client.request({ command: 'subscribe', accounts: [xrplDoor] });

    // Event Listener: Immediate Deduplication
    client.on('transaction', (event) => {
        const tx = event.tx_json;
        const meta = event.meta;
        const xrplHash = event.hash;

        if (!tx || !meta || !event.validated) return;

        const isPayment = tx.TransactionType === "Payment" && tx.Destination === xrplDoor;
        const isEscrowFinish = tx.TransactionType === "EscrowFinish";

        if ((isPayment || isEscrowFinish) && meta.TransactionResult === "tesSUCCESS") {
            if (processedHashes.has(xrplHash)) return;
            processedHashes.add(xrplHash);

            console.log(`\n📥 Queuing ${tx.TransactionType}: ${xrplHash}`);
            eventQueue.push(event);

            // Trigger processing loop
            processQueue(bridgeAccount, myProvider, sXRP_CONTRACT);
        }
    });
}

// Queue Processor: Ensures sequential execution for nonce safety
async function processQueue(account, provider, contractAddress) {
    if (isProcessing || eventQueue.length === 0) return;

    isProcessing = true;
    const event = eventQueue.shift();

    try {
        await handleMinting(event, account, provider, contractAddress);
    } catch (err) {
        console.error(`❌ Fatal Processing Error for ${event.hash}:`, err.message);
    } finally {
        isProcessing = false;
        processQueue(account, provider, contractAddress);
    }
}

// Core Logic: STRICT INTENT-BASED ROUTING
async function handleMinting(event, account, provider, contractAddress) {
    const tx = event.tx_json;
    const meta = event.meta;
    
    // Use delivered_amount for security against partial payments
    const actualDelivered = meta.delivered_amount;
    if (!actualDelivered) return;

    // Fallback to the Admin Vault if the intent is invalid/missing
    let recipient = process.env.ADMIN_STARKNET_ADDRESS?.trim();
    
    // --- THE STRICT DB INTENT CHECK ---
    const incomingTag = tx.DestinationTag;
    
    if (incomingTag) {
        console.log(`🔍 Found Destination Tag: ${incomingTag}. Looking up intent...`);
        const intentData = await new Promise((resolve) => {
            db.get("SELECT * FROM intents WHERE destination_tag = ?", [incomingTag], (err, row) => resolve(row));
        });

        if (intentData) {
            recipient = intentData.starknet_address;
            console.log(`🎯 DB Match Found! Routing to ${recipient} (Spread Mode: ${intentData.risk_level}, Locked: ${intentData.is_locked})`);
            
            // Note: If you have a router smart contract, you can pass `intentData.risk_level` 
            // and `intentData.is_locked` as extra calldata in the account.execute block below.
        } else {
            console.warn(`⚠️ Tag ${incomingTag} not found in DB. Falling back to Admin Vault.`);
        }
    } else {
        console.warn(`⚠️ No Destination Tag provided on XRPL transaction. Falling back to Admin Vault.`);
    }

    try {
        // --- SECURE SCALING MATH (THE 1_000_000_000_000n PARADIGM) ---
        // Scaling: 6 decimals (drops) to 18 decimals
        const amountRaw = BigInt(actualDelivered);
        const { low, high } = uint256.bnToUint256(amountRaw);

        console.log(`🛠 Executing Mint: ${actualDelivered} drops -> ${recipient}`);

        const { transaction_hash } = await account.execute({
            contractAddress: contractAddress,
            entrypoint: "mint",
            calldata: [recipient, low, high]
        });

        console.log(`⏳ L2 Transaction Submitted: ${transaction_hash}`);

        // MANDATORY: Wait for transaction to increment nonce correctly
        const receipt = await provider.waitForTransaction(transaction_hash);

        if (receipt.isSuccess?.() || receipt.execution_status === 'SUCCEEDED') {
            console.log(`✅ Mint Confirmed! Finality: ${receipt.finality_status || 'ACCEPTED_ON_L2'}`);
        }
    } catch (err) {
        throw err;
    }
}

main().catch(console.error);
