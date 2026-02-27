const { PriceServiceConnection } = require("@pythnetwork/price-service-client");

async function getXRPUpdate() {
    const connection = new PriceServiceConnection("https://hermes.pyth.network");
    // XRP/USD Feed ID
    const xrpPriceId = "ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8";

    console.log("Connecting to Hermes...");

    try {
        // Fetch the latest VAA (Verified Action Aggregator) blob
        const vaas = await connection.getLatestVaas([xrpPriceId]);

        if (vaas && vaas.length > 0) {
            const vaaBase64 = vaas[0];
            const buffer = Buffer.from(vaaBase64, 'base64');
            const starknetCalldata = Array.from(buffer);

            console.log("\n--- SUCCESS: XRP PRICE BLOB FOUND ---");
            console.log("Array Length:", starknetCalldata.length);
            console.log("\n--- STARKNET CALLDATA (COPY THIS) ---");
            console.log(JSON.stringify(starknetCalldata));
        } else {
            console.log("Hermes returned an empty list. The Price ID might be wrong or inactive.");
        }
    } catch (error) {
        console.error("Error fetching Pyth data:", error.message);
    }
}

getXRPUpdate();
