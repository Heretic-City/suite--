require('dotenv').config();
const { PriceServiceConnection } = require("@pythnetwork/price-service-client");
const { execSync } = require("child_process");

async function updateXRPPrice() {
    const connection = new PriceServiceConnection("https://hermes.pyth.network");
    const xrpPriceId = "ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8";
    const contractAddress = "0x062ab68d8e23a7aa0d5bf4d25380c2d54f2dd8f83012e047851c3706b53d64d1";
    const rpcUrl = process.env.STARKNET_RPC_URL;

    if (!rpcUrl) throw new Error("STARKNET_RPC_URL missing in .env");

    try {
        const vaas = await connection.getLatestVaas([xrpPriceId]);
        if (!vaas || vaas.length === 0) throw new Error("No VAA found");

        const buffer = Buffer.from(vaas[0], 'base64');
        const chunks = [];
        for (let i = 0; i < buffer.length; i += 31) {
            chunks.push('0x' + buffer.slice(i, i + 31).toString('hex'));
        }

        const args = `pyth::byte_buffer::ByteBuffer {
            num_last_bytes: ${buffer.length % 31 || 31}_u8,
            data: array![${chunks.join(', ')}]
        }`;

        // CLI Tip: Flags like --url and --fee-token must follow 'invoke'
        const command = `sncast --profile pixelwalkers invoke \\
            --url "${rpcUrl}" \\
            --fee-token strk \\
            --contract-address ${contractAddress} \\
            --function update_price_feeds \\
            --arguments '${args}'`;

        console.log("🚀 Executing V3 transaction via profile with STRK fees...");
        const output = execSync(command, { encoding: 'utf-8' });
        console.log("Success:\n", output);

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.stdout) console.error("CLI Output:", error.stdout);
    }
}

updateXRPPrice();
