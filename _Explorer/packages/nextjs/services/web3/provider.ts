import { jsonRpcProvider } from "@starknet-react/core";

// 🚨 THE RATE-LIMIT KILLER: We force the entire React tree to use Cartridge's unmetered nodes
const provider = jsonRpcProvider({
  rpc: (chain) => {
    // Automatically switch between Mainnet and Sepolia based on your scaffold.config
    // No .env variables required. No rate limits.
    const rpcUrl = chain.network === "mainnet" 
      ? "https://api.cartridge.gg/x/starknet/mainnet"
      : "https://api.cartridge.gg/x/starknet/sepolia";
    
    return { nodeUrl: rpcUrl };
  }
});

export default provider;