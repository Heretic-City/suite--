const { Account, RpcProvider, uint256 } = require('starknet');
const xrpl = require('xrpl');
require('dotenv').config();

/**
 * SECURE SEQUENTIAL RELAYER - UPDATED
 * Implements immediate deduplication to handle high-frequency XRP events.
 */

// 1. Relayer State
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

    const client = new xrpl.Client(process.env.XRPL_WS_URL || "wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log(`🚀 Secure Relayer Online. Monitoring Door: ${xrplDoor}`);

    await client.request({ command: 'subscribe', accounts: [xrplDoor] });

    // 2. Event Listener: Immediate Deduplication
    client.on('transaction', (event) => {
        const tx = event.tx_json;
        const meta = event.meta;
        const xrplHash = event.hash;

        if (!tx || !meta || !event.validated) return;

        // Check Transaction Type
        const isPayment = tx.TransactionType === "Payment" && tx.Destination === xrplDoor;
        const isEscrowFinish = tx.TransactionType === "EscrowFinish";

        if ((isPayment || isEscrowFinish) && meta.TransactionResult === "tesSUCCESS") {
            // FIX: Check and Add to Set IMMEDIATELY to prevent double-queuing
            if (processedHashes.has(xrplHash)) return;
            processedHashes.add(xrplHash);

            console.log(`\n📥 Queuing ${tx.TransactionType}: ${xrplHash}`);
            eventQueue.push(event);

            // Trigger processing loop
            processQueue(bridgeAccount, myProvider, sXRP_CONTRACT);
        }
    });
}

// 3. Queue Processor: Ensures sequential execution for nonce safety
async function processQueue(account, provider, contractAddress) {
    if (isProcessing || eventQueue.length === 0) return;

    isProcessing = true;
    const event = eventQueue.shift();

    try {
        await handleMinting(event, account, provider, contractAddress);
    } catch (err) {
        console.error(`❌ Fatal Processing Error for ${event.hash}:`, err.message);
        // Optional: Remove from processedHashes on specific failures if retry is needed
        // processedHashes.delete(event.hash);
    } finally {
        isProcessing = false;
        // Recursively check for the next item in the queue
        processQueue(account, provider, contractAddress);
    }
}

// 4. Core Logic: Starknet Interaction
async function handleMinting(event, account, provider, contractAddress) {
    const tx = event.tx_json;
    const meta = event.meta;
    const xrplHash = event.hash;

    // Use delivered_amount for security
    const actualDelivered = meta.delivered_amount;
    if (!actualDelivered) return;

    let recipient = process.env.TEST_RECIPIENT_ADDRESS.trim();
    if (tx.Memos && tx.Memos.length > 0) {
        try {
            const rawMemo = tx.Memos[0].Memo.MemoData;
            const decodedMemo = Buffer.from(rawMemo, 'hex').toString('utf8').trim();
            if (decodedMemo.startsWith('0x')) recipient = decodedMemo;
        } catch (e) { console.warn("⚠️ Memo Decode Error"); }
    }

    try {
        // Scaling: 6 decimals (drops) to 18 decimals
        const amountRaw = BigInt(actualDelivered) * 1_000_000_000_000n;
        const { low, high } = uint256.bnToUint256(amountRaw);

        console.log(`🛠 Executing Mint: ${actualDelivered} drops -> ${recipient}`);

        const { transaction_hash } = await account.execute({
            contractAddress: contractAddress,
            entrypoint: "mint",
            calldata: [recipient, low, high]
        });

        console.log(`⏳ L2 Transaction Submitted: ${transaction_hash}`);

        // MANDATORY: Wait for transaction to increment nonce correctly
        // According to: https://starknetjs.com/docs/next/guides/contracts/interact#sending-sequential-transactions
        const receipt = await provider.waitForTransaction(transaction_hash);

        if (receipt.isSuccess()) {
            console.log(`✅ Mint Confirmed! Finality: ${receipt.finality_status}`);
        }
    } catch (err) {
        throw err;
    }
}

main().catch(console.error);
