// app.js

const HXT_ADDRESS = "0x05fc519eb3ea97146c47550707c2d8473e7373b80afe41f89596870f2118181c";
const KATANA_LOCAL = "http://127.0.0.1:5050/rpc";

const HXT_ABI = [
  {
    "name": "total_supply",
    "type": "function",
    "inputs": [],
    "outputs": [{ "type": "core::integer::u256" }],
    "state_mutability": "view"
  }
];

async function updateSupply() {
    const status = document.getElementById('status-msg');
    const supplyDisplay = document.getElementById('supply-value');

    // In the web bundle, the classes are inside the 'starknet' object
    if (typeof starknet === 'undefined') {
        status.innerText = "Error: Library not loaded";
        console.error("Starknet global object not found.");
        return;
    }

    const { RpcProvider, Contract } = starknet;

    status.innerText = "Querying Katana (Fork)...";

    try {
        const provider = new RpcProvider({ nodeUrl: KATANA_LOCAL });
        const contract = new Contract(HXT_ABI, HXT_ADDRESS, provider);

        // Fetching total_supply
        const supplyData = await contract.total_supply();

        // Cairo 1 u256 often returns a BigInt directly or an object {res: ...}
        const rawVal = typeof supplyData === 'object' ? (supplyData.res || supplyData[0]) : supplyData;
        
        const decimals = 18n;
        const divisor = 10n ** decimals;
        const formattedSupply = (BigInt(rawVal) / divisor).toLocaleString();

        supplyDisplay.innerText = formattedSupply;
        status.innerText = "Update Successful";
    } catch (err) {
        console.error("RPC Error:", err);
        status.innerText = "Error: Check Katana/RPC";
    }
}

// Initial call and event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refresh-btn').addEventListener('click', updateSupply);
    updateSupply();
});
