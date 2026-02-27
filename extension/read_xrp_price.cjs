const { execSync } = require("child_process");

const STARKNET_PRIME = BigInt("3618502788666131213697322783095070105623107215331596699973092056135872020481");

function parseSignedFelt(value) {
    const b = BigInt(value);
    if (b > (STARKNET_PRIME / 2n)) {
        return b - STARKNET_PRIME;
    }
    return b;
}

async function getXRPPrice() {
    const contractAddress = "0x062ab68d8e23a7aa0d5bf4d25380c2d54f2dd8f83012e047851c3706b53d64d1";
    const priceId = "0x0ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8";
    const maxAge = 86400;
    const rpcUrl = "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/JmY-gh6LSwE326JtGYB_B";

    // Added a COMMA between the arguments to satisfy the Cairo expression parser
    const command = `sncast call --url ${rpcUrl} --contract-address ${contractAddress} --function get_price_no_older_than --arguments "${priceId}, ${maxAge}"`;

    try {
        console.log("🚀 Querying Pyth Oracle...");
        const rawOutput = execSync(command, { encoding: 'utf-8' });

        const match = rawOutput.match(/Response: \[(.*)\]/);
        if (!match) {
            console.log("Raw Output from sncast:", rawOutput);
            throw new Error("Could not parse response array. See raw output above.");
        }

        const data = match[1].split(',').map(item => item.trim());

        if (data.length < 5) {
            throw new Error("Response data is incomplete.");
        }

        const result = {
            status: (data[0] === "0x0" || data[0] === "0") ? "Success" : "Error",
            price: BigInt(data[1]),
            conf: BigInt(data[2]),
            expo: Number(parseSignedFelt(data[3])),
            publish_time: new Date(Number(data[4]) * 1000).toLocaleString()
        };

        const humanPrice = Number(result.price) * Math.pow(10, result.expo);

        console.log("\n--- 💎 XRP/USD ORACLE DATA ---");
        console.log(`Status:       ${result.status}`);
        console.log(`Raw Price:    ${result.price.toString()}`);
        console.log(`Exponent:     ${result.expo}`);
        console.log(`Last Updated: ${result.publish_time}`);
        console.log(`------------------------------`);
        console.log(`💰 HUMAN PRICE: $${humanPrice.toFixed(4)} USD`);
        console.log("------------------------------\n");

    } catch (error) {
        console.error("\n❌ EXECUTION ERROR:");
        console.error(error.message);
    }
}

getXRPPrice();
