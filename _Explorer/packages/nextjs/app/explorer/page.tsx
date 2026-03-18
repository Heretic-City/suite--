"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, useReadContract, useProvider } from "@starknet-react/core";
import { cairo } from "starknet";
import configExternalContracts from "~~/contracts/configExternalContracts";
import deployedContracts from "~~/contracts/deployedContracts";

// --- CONTRACT CONFIGS & CONSTANTS ---
const HXT_DATA = configExternalContracts.mainnet?.[" Heretic Token"] || configExternalContracts.mainnet?.["Heretic Token"];
const SXRP_DATA = configExternalContracts.mainnet?.[" Starknet XRP"] || configExternalContracts.mainnet?.["Starknet XRP"];

const VESTING_DATA =
  deployedContracts.mainnet?.HXTVestingVault ||
  deployedContracts.mainnet?.[" HXTVestingVault"] ||
  configExternalContracts.mainnet?.HXTVestingVault ||
  configExternalContracts.mainnet?.[" HXTVestingVault"];

const XRPL_VAULT_ADDRESS = "rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7";
const PYTH_STARKNET_ADDRESS = "0x028c85e2fb2f9c37b27519ea4bfdf599f52f11815147816f5c5b967ed43ff455";
const XRP_PRICE_FEED_ID = "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8";
const HXT_TOKEN_ADDR = HXT_DATA?.address;

const MINIMAL_PYTH_ABI = [
  {
    type: "struct",
    name: "pyth::price::Price",
    members: [
      { name: "price", type: "core::integer::i64" },
      { name: "conf", type: "core::integer::u64" },
      { name: "expo", type: "core::integer::i32" },
      { name: "publish_time", type: "core::integer::u64" }
    ]
  },
  {
    name: "get_price_unsafe",
    type: "function",
    inputs: [{ name: "price_identifier", type: "core::felt252" }],
    outputs: [{ type: "pyth::price::Price" }],
    state_mutability: "view"
  }
];

// --- GLOBAL MATH HELPERS ---
const formatBalance = (data: any, decimals: number = 2) => {
  if (!data) return "0.00";
  try {
    let valBigInt = 0n;
    if (typeof data === 'bigint') valBigInt = data;
    else if (typeof data === 'object') {
      if ('low' in data && 'high' in data) valBigInt = BigInt(data.low) + (BigInt(data.high) << 128n);
      else if (Array.isArray(data) && data.length > 0) valBigInt = BigInt(data[0]);
      else if ('res' in data) valBigInt = BigInt(data.res);
      else valBigInt = BigInt(data.toString());
    } else valBigInt = data;
    return (Number(valBigInt) / 10**18).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  } catch { return "0.00"; }
};

const getHoldingsValue = (balance: any, price: string) => {
  if (!balance || price === "0.00") return "$0.00";
  try {
    return `$${(parseFloat(formatBalance(balance, 6).replace(/,/g, '')) * parseFloat(price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch { return "$0.00"; }
};

// --- ISOLATED MICRO-COMPONENTS ---
const LiveBalance = ({ contract, address }: { contract: any, address?: string }) => {
  const { data, isFetching } = useReadContract({
    functionName: "balance_of", abi: contract?.abi, address: contract?.address,
    args: address ? [address] : [], watch: true, enabled: !!address,
  });
  if (isFetching && !data) return <span className="loading loading-dots"></span>;
  return <>{formatBalance(data)}</>;
};

const LiveValue = ({ contract, address, price }: { contract: any, address?: string, price: string }) => {
  const { data } = useReadContract({
    functionName: "balance_of", abi: contract?.abi, address: contract?.address,
    args: address ? [address] : [], watch: true, enabled: !!address,
  });
  return <>{getHoldingsValue(data, price)}</>;
};

const LiveSupply = ({ contract }: { contract: any }) => {
  const { data, isFetching, error } = useReadContract({
    functionName: "total_supply", abi: contract?.abi, address: contract?.address,
    args: [], watch: true,
  });
  if (isFetching && !data) return <span className="loading loading-spinner loading-sm"></span>;
  if (error) return <span className="text-error text-sm">Err</span>;
  return <>{formatBalance(data)}</>;
};

const LivePythPrice = () => {
  const { data, isFetching } = useReadContract({
    functionName: "get_price_unsafe", abi: MINIMAL_PYTH_ABI, address: PYTH_STARKNET_ADDRESS,
    args: [XRP_PRICE_FEED_ID], watch: true,
  });
  if (isFetching && !data) return <>...</>;
  const price = (Number((data as any)?.price || 0) * Math.pow(10, (data as any)?.expo || 0)).toFixed(4);
  return <>${price}</>;
};

const LiveVestedAmount = () => {
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = setInterval(() => setCurrentTimestamp(Math.floor(Date.now() / 1000)), 60000);
    return () => clearInterval(timer);
  }, []);
  const { data, isFetching } = useReadContract({
    functionName: "vested_amount", abi: VESTING_DATA?.abi, address: VESTING_DATA?.address,
    args: [HXT_TOKEN_ADDR, currentTimestamp], watch: true,
    enabled: !!VESTING_DATA?.address && !!HXT_TOKEN_ADDR,
  });
  if (isFetching && !data) return <span className="loading loading-dots"></span>;
  return <>{formatBalance(data)}</>;
};


// 🚨 THE NATIVE DOM OVERRIDE FIX 🚨
const WithdrawalForm = React.memo(({ SXRP_DATA, XRPL_VAULT_ADDRESS }: any) => {
  const { account, isConnected } = useAccount();
  const { provider } = useProvider();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destXrplAddress, setDestXrplAddress] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // 1. Create Refs to target the actual HTML DOM elements
  const addrRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  // 2. The Native Override - Bypasses React to physically block event hijacking
  useEffect(() => {
    const addrEl = addrRef.current;
    const amountEl = amountRef.current;

    const stopHijack = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation(); // Kills Scaffold-ETH/DaisyUI listeners instantly
    };

    const enforceFocus = (e: Event) => {
      stopHijack(e);
      (e.target as HTMLElement).focus(); // Force the mobile keyboard to stay open
    };

    if (addrEl) {
      addrEl.addEventListener('mousedown', stopHijack);
      addrEl.addEventListener('touchstart', stopHijack, { passive: false });
      addrEl.addEventListener('touchend', enforceFocus, { passive: false });
      addrEl.addEventListener('click', enforceFocus);
    }

    if (amountEl) {
      amountEl.addEventListener('mousedown', stopHijack);
      amountEl.addEventListener('touchstart', stopHijack, { passive: false });
      amountEl.addEventListener('touchend', enforceFocus, { passive: false });
      amountEl.addEventListener('click', enforceFocus);
    }

    return () => {
      if (addrEl) {
        addrEl.removeEventListener('mousedown', stopHijack);
        addrEl.removeEventListener('touchstart', stopHijack);
        addrEl.removeEventListener('touchend', enforceFocus);
        addrEl.removeEventListener('click', enforceFocus);
      }
      if (amountEl) {
        amountEl.removeEventListener('mousedown', stopHijack);
        amountEl.removeEventListener('touchstart', stopHijack);
        amountEl.removeEventListener('touchend', enforceFocus);
        amountEl.removeEventListener('click', enforceFocus);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    setWithdrawAmount("");
    setDestXrplAddress("");
    setWithdrawError("");
    setIsWithdrawing(false);
  }, []);

  const handleWithdraw = useCallback(async () => {
    setWithdrawError("");
    const destClean = destXrplAddress.trim();
    const amountClean = withdrawAmount.trim();

    if (destClean === XRPL_VAULT_ADDRESS) return setWithdrawError("You cannot withdraw to the Bridge Vault.");
    if (!destClean || !amountClean || !SXRP_DATA?.address) return setWithdrawError("Please enter both an amount and a destination address.");
    if (!account) return setWithdrawError("Wallet not connected.");

    try {
      setIsWithdrawing(true);
      const amountUint256 = cairo.uint256(BigInt(Math.floor(Number(amountClean) * 1e18)));
      const finalCalls = [{ 
        contractAddress: SXRP_DATA.address, 
        entrypoint: "withdraw", 
        calldata: [0, amountUint256.low, amountUint256.high] 
      }];

      const tx = await account.execute(finalCalls);
      await provider.waitForTransaction(tx.transaction_hash);

      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: tx.transaction_hash, destXrplAddress: destClean, amount: amountClean }),
      });

      if (!response.ok) throw new Error("Relayer failed");
      alert(`Success! XRP is on its way to ${destClean}`);
      handleReset();
    } catch (e: any) {
      setWithdrawError(e.message || "Withdrawal failed.");
    } finally {
      setIsWithdrawing(false);
    }
  }, [withdrawAmount, destXrplAddress, account, provider, SXRP_DATA, XRPL_VAULT_ADDRESS, handleReset]);

  return (
    <div className="space-y-3 relative z-50">
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Dest. XRPL Address</span>
        </label>
        <input
          ref={addrRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="r..."
          className={`input input-sm input-bordered w-full ${withdrawError ? "input-error" : ""}`}
          value={destXrplAddress}
          onChange={(e) => setDestXrplAddress(e.target.value)}
          style={{ userSelect: 'auto', pointerEvents: 'auto', touchAction: 'manipulation' }}
        />
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-semibold">Burn Amount (sXRP)</span>
        </label>
        <input
          ref={amountRef}
          type="number"
          step="0.01"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          className="input input-sm input-bordered w-full"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          style={{ userSelect: 'auto', pointerEvents: 'auto', touchAction: 'manipulation' }}
        />
      </div>

      {withdrawError && <p className="text-error text-[10px] font-semibold">{withdrawError}</p>}

      {!isConnected ? (
        <button className="btn btn-error btn-sm w-full mt-2 opacity-50 cursor-not-allowed !text-white" disabled>
          Connect Wallet to Burn
        </button>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            className={`btn btn-error btn-sm flex-1 !text-white font-bold ${isWithdrawing ? "loading" : ""}`}
            onClick={handleWithdraw}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? "Burning..." : "Confirm Burn"}
          </button>
          <button
            className="btn btn-outline border-base-content/20 text-base-content/70 hover:bg-base-content/10 btn-sm btn-square"
            onClick={handleReset}
            disabled={isWithdrawing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});
WithdrawalForm.displayName = "WithdrawalForm";

// --- MAIN EXPLORER PAGE ---
export default function Explorer() {
  const { address, isConnected } = useAccount();

  // --- UI TAB STATE ---
  const [activeCard, setActiveCard] = useState<"SXRP" | "HXT" | null>(null);
  const [sxrpTab, setSxrpTab] = useState<"BRIDGE" | "LOCK" | "LAB">("BRIDGE");
  const [bridgeMode, setBridgeMode] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [hxtTab, setHxtTab] = useState<"GOVERN">("GOVERN");
  const [copiedText, setCopiedText] = useState("");

  // --- INTENT-BASED BRIDGING STATE ---
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // --- EXTERNAL DATA ---
  const [marketData, setMarketData] = useState({
    vaultBalance: "0", offChainPrice: "0.00", transactions: [] as any[],
    hxtPriceUsd: "0.00", sxrpPriceUsd: "0.00", loading: true,
  });
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  // --- BRIDGE DEPOSIT STATE (DESTINATION TAG) ---
  const [destTag, setDestTag] = useState<number | null>(null);
  const [isRegisteringTag, setIsRegisteringTag] = useState(false);
  const [tagRegistered, setTagRegistered] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      let xrpPrice = "0.00"; let vaultBal = "0"; let txs = [] as any[]; let hxtUsd = "0.00";
      try {
        const pythRes = await fetch(`https://hermes.pyth.network/v2/updates/price/latest?ids[]=${XRP_PRICE_FEED_ID}`);
        const p = (await pythRes.json()).parsed[0].price;
        xrpPrice = (Number(p.price) * Math.pow(10, Number(p.expo))).toFixed(4);
      } catch (e) {}

      try {
        const rpcUrl = "https://xrplcluster.com/";
        const balRes = await fetch(rpcUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "account_info", params: [{ account: XRPL_VAULT_ADDRESS, ledger_index: "validated" }] }) });
        vaultBal = (Number((await balRes.json()).result?.account_data?.Balance || 0) / 1_000_000).toFixed(2);

        const txRes = await fetch(rpcUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "account_tx", params: [{ account: XRPL_VAULT_ADDRESS, limit: 5 }] }) });
        txs = (await txRes.json()).result?.transactions || [];
      } catch (e) {}

      try {
        const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${HXT_TOKEN_ADDR}`);
        const dexJson = await dexRes.json();
        if (dexJson.pairs) {
          const hxtP = dexJson.pairs.find((p: any) => p.baseToken.address.toLowerCase() === HXT_TOKEN_ADDR.toLowerCase());
          if (hxtP) hxtUsd = hxtP.priceUsd;
        }
      } catch (e) {}

      setMarketData({ vaultBalance: vaultBal, offChainPrice: xrpPrice, transactions: txs, hxtPriceUsd: hxtUsd, sxrpPriceUsd: xrpPrice, loading: false });
    };
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const handleRegisterTag = async () => {
    if (!address) {
      alert("Please connect your Starknet wallet first.");
      return;
    }
    
    setIsRegisteringTag(true);
    const generatedTag = Math.floor(100000000 + Math.random() * 900000000);

    try {
      const response = await fetch("/api/store-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          starknetAddress: address, 
          xrpMemo: generatedTag,
          riskLevel: selectedRisk,
          isLocked: isLocked,      
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Failed to save to database");
      
      setDestTag(generatedTag);
      setTagRegistered(true);
    } catch (error) {
      console.error("Error registering tag:", error);
      alert("Failed to connect to relayer database. Please ensure your EC2 Node server is running.");
    } finally {
      setIsRegisteringTag(false);
    }
  };

  const renderSxrpContent = () => {
    if (activeCard !== "SXRP") return (
      <div className="text-center transition-all duration-300">
        <p className="text-4xl font-mono font-bold text-base-content">
          <LiveBalance contract={SXRP_DATA} address={address} />
        </p>
        <div className="badge badge-secondary badge-outline mt-2 text-xs flex gap-2 mx-auto">
          <span>${marketData.sxrpPriceUsd} / sXRP</span><span className="opacity-50">(Pyth Oracle)</span>
        </div>
        <p className="text-sm opacity-70 mt-4 font-semibold">
          Value: <LiveValue contract={SXRP_DATA} address={address} price={marketData.sxrpPriceUsd} />
        </p>
      </div>
    );

    return (
      <div className="flex flex-col gap-4 animate-fadeIn">
        <div role="tablist" className="tabs tabs-boxed bg-base-200">
          <a role="tab" className={`tab font-bold ${sxrpTab === "BRIDGE" ? "tab-active bg-secondary text-white!" : ""}`} onClick={() => setSxrpTab("BRIDGE")}>BRIDGE</a>
          <a role="tab" className={`tab font-bold ${sxrpTab === "LOCK" ? "tab-active bg-secondary text-white!" : ""}`} onClick={() => setSxrpTab("LOCK")}>LOCK</a>
          <a role="tab" className={`tab font-bold ${sxrpTab === "LAB" ? "tab-active bg-secondary text-white!" : ""}`} onClick={() => setSxrpTab("LAB")}>LAB</a>
        </div>

        {sxrpTab === "BRIDGE" && (
          <div className="bg-base-200 rounded-xl p-4 border border-base-content/10">
            <div>
              <div className="flex justify-center gap-2 mb-4">
                <button className={`btn btn-xs ${bridgeMode === "DEPOSIT" ? "btn-secondary text-white! font-bold" : "btn-ghost"}`} onClick={() => setBridgeMode("DEPOSIT")}>Deposit (XRPL → Starknet)</button>
                <button className={`btn btn-xs ${bridgeMode === "WITHDRAW" ? "btn-error text-white! font-bold" : "btn-ghost"}`} onClick={() => setBridgeMode("WITHDRAW")}>Withdraw (Burn)</button>
              </div>

              {bridgeMode === "DEPOSIT" ? (
                <div className="space-y-4">
                  {!tagRegistered ? (
                    <div className="bg-base-100 p-5 rounded-lg border border-secondary text-center shadow-[0_0_15px_rgba(var(--color-secondary),0.1)]">
                      <p className="text-sm font-bold mb-4">Step 1: Configure Route & Link Address</p>
                      
                      <div className="mb-6 text-left">
                        <p className="text-[11px] font-bold mb-2 uppercase opacity-80">Select Target Asset Spread:</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {[
                            { id: 1, name: "Pure Liquid", desc: "100% sXRP" },
                            { id: 2, name: "Stable Yield", desc: "50% sXRP / 50% USDC" },
                            { id: 3, name: "Ecosystem", desc: "50% sXRP / 50% STRK" },
                            { id: 4, name: "Heretic Max", desc: "100% HXT" },
                          ].map((risk) => (
                            <button
                              key={risk.id}
                              onClick={() => setSelectedRisk(risk.id)}
                              className={`p-2 rounded border text-left flex flex-col transition-all ${
                                selectedRisk === risk.id 
                                  ? "bg-secondary/20 border-secondary text-secondary shadow-[0_0_8px_rgba(var(--color-secondary),0.4)]" 
                                  : "bg-base-300 border-base-content/10 hover:border-secondary/50 text-base-content/70"
                              }`}
                              disabled={!isConnected}
                            >
                              <span className={`text-xs font-bold ${selectedRisk === risk.id ? 'text-secondary' : ''}`}>{risk.name}</span>
                              <span className="text-[9px] opacity-70 mt-0.5">{risk.desc}</span>
                            </button>
                          ))}
                        </div>
                        
                        <div className={`flex items-center gap-3 p-3 rounded border transition-colors ${isLocked ? 'bg-accent/10 border-accent/40' : 'bg-base-300 border-base-content/10'}`}>
                          <input 
                            type="checkbox" 
                            className="toggle toggle-sm toggle-accent" 
                            checked={isLocked}
                            onChange={(e) => setIsLocked(e.target.checked)}
                            disabled={!isConnected}
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-base-content">Lock assets for 8 Days</span>
                            <span className="text-[9px] opacity-70">Boosts ecosystem yield multiplier</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isConnected ? (
                        <button className="btn btn-secondary btn-sm w-full opacity-50 cursor-not-allowed !text-white" disabled>
                          Connect Wallet to Configure
                        </button>
                      ) : (
                        <button
                          onClick={handleRegisterTag}
                          className={`btn btn-secondary btn-sm w-full !text-white font-bold ${selectedRisk === null ? 'opacity-50' : ''}`}
                          disabled={isRegisteringTag || selectedRisk === null}
                        >
                          {isRegisteringTag ? <span className="loading loading-spinner"></span> : selectedRisk === null ? "Select Spread to Generate Memo" : "Generate & Register Memo"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="bg-base-100 p-3 rounded-lg border border-base-content/20">
                        <p className="text-xs font-bold opacity-70 mb-1">Step 2: Send XRP to Vault</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-[10px] break-all text-info">{XRPL_VAULT_ADDRESS}</code>
                          <button onClick={() => handleCopy(XRPL_VAULT_ADDRESS, "vault")} className="btn btn-xs btn-square btn-ghost">
                            {copiedText === "vault" ? <span className="text-success">✓</span> : "Copy"}
                          </button>
                        </div>
                      </div>
                      <div className="bg-base-100 p-3 rounded-lg border border-secondary shadow-[0_0_10px_rgba(var(--color-secondary),0.2)]">
                        <p className="text-xs font-bold text-secondary mb-1">Step 3: Include Memo!</p>
                        <p className="text-[10px] opacity-70 mb-2">You <strong className="text-error">MUST</strong> include this exact Memo / Destination Tag in your XRP transfer. It contains your routing spread.</p>
                        <div className="flex items-center justify-between gap-2 bg-base-300 p-2 rounded">
                          <code className="text-sm font-bold text-secondary tracking-widest">{destTag}</code>
                          <button onClick={() => handleCopy(destTag?.toString() || "", "tag")} className="btn btn-xs btn-square btn-secondary">
                            {copiedText === "tag" ? "✓" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-4 pt-4 border-t border-base-content/10 text-center">
                     <p className="text-xs opacity-50 mb-2">Or buy crypto directly with card</p>
                     <button className="btn btn-outline btn-sm w-full opacity-50 cursor-not-allowed" disabled>Topper Integration Coming Soon</button>
                  </div>
                </div>
              ) : (
                <WithdrawalForm 
                  SXRP_DATA={SXRP_DATA} 
                  XRPL_VAULT_ADDRESS={XRPL_VAULT_ADDRESS} 
                />
              )}
            </div>
          </div>
        )}

        {sxrpTab === "LOCK" && (
          <div className="bg-base-200 rounded-xl p-6 text-center border border-base-content/10">
            <h3 className="text-lg font-bold mb-2">Lock sXRP</h3>
            <p className="text-sm opacity-70">Provide liquidity or lock your sXRP to earn ecosystem rewards.</p>
            <div className="mt-4 badge badge-outline opacity-50">Module Coming Soon</div>
          </div>
        )}

        {sxrpTab === "LAB" && (
          <div className="bg-base-200 rounded-xl p-6 text-center border border-base-content/10">
            <h3 className="text-lg font-bold mb-2">DeFi Lab</h3>
            <p className="text-sm opacity-70">Utilize your sXRP across Starknet&apos;s top lending and borrowing protocols.</p>
            <div className="mt-4 badge badge-outline opacity-50">Integrations Pending</div>
          </div>
        )}
      </div>
    );
  };

  const renderHxtContent = () => {
    if (activeCard !== "HXT") return (
      <div className="text-center transition-all duration-300">
        <p className="text-4xl font-mono font-bold text-base-content">
          <LiveBalance contract={HXT_DATA} address={address} />
        </p>
        <div className="badge badge-outline mt-2 text-xs">${marketData.hxtPriceUsd} / HXT</div>
        <p className="text-sm opacity-70 mt-4 font-semibold">
          Value: <LiveValue contract={HXT_DATA} address={address} price={marketData.hxtPriceUsd} />
        </p>
      </div>
    );

    return (
      <div className="flex flex-col gap-4 animate-fadeIn">
        <div role="tablist" className="tabs tabs-boxed bg-base-200">
          <a role="tab" className={`tab font-bold ${hxtTab === "GOVERN" ? "tab-active bg-primary text-primary-content" : ""}`} onClick={() => setHxtTab("GOVERN")}>GOVERN</a>
        </div>
        {hxtTab === "GOVERN" && (
          <div className="bg-base-200 rounded-xl p-6 text-center border border-base-content/10">
            <h3 className="text-lg font-bold mb-2">Ecosystem Governance</h3>
            <p className="text-sm opacity-70">Use your HXT to vote on bridge upgrades, relayer nodes, and ecosystem grants.</p>
            <button className="btn btn-primary btn-sm mt-4 w-full" disabled>Proposals Loading...</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5 pb-20 bg-base-300 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-primary">Asset Explorer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 items-start">

        {/* --- HXT CARD --- */}
        <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title opacity-70">HXT Dashboard</h2>
              <button
                onClick={() => setActiveCard(activeCard === "HXT" ? null : "HXT")}
                className={`btn btn-circle btn-sm btn-ghost ${activeCard === "HXT" ? 'bg-primary/20' : 'bg-base-200'}`}
                title="Manage HXT"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            {renderHxtContent()}
          </div>
        </div>

        {/* --- sXRP CARD --- */}
        <div className="card bg-base-100 shadow-xl border-t-4 border-secondary">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title opacity-70">sXRP Dashboard</h2>
              <button
                onClick={() => setActiveCard(activeCard === "SXRP" ? null : "SXRP")}
                className={`btn btn-circle btn-sm btn-ghost ${activeCard === "SXRP" ? 'bg-secondary/20' : 'bg-base-200'}`}
                title="Manage sXRP"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            {renderSxrpContent()}
          </div>
        </div>
      </div>

      {/* --- PARITY & BRIDGE INTEGRITY --- */}
      <div className="w-full max-w-4xl bg-base-200 text-base-content p-8 rounded-2xl shadow-xl relative mb-8">
        <div className="absolute top-0 right-0 bg-info text-info-content px-4 py-1 rounded-bl-2xl font-bold text-sm shadow-sm">Bridge Monitoring</div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">🛡️ Vault Integrity</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-base-100 p-6 rounded-xl border border-base-content/10 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold uppercase opacity-60 mb-6 text-center tracking-widest">Reserves Parity</p>
            <div className="flex justify-between items-center w-full px-2">
              <div className="flex-1 flex flex-col items-center">
                <p className="text-sm opacity-70 mb-1">Vault (XRPL)</p>
                <p className="text-3xl font-mono font-bold text-primary">{marketData.loading ? "..." : marketData.vaultBalance}</p>
              </div>
              <div className="flex-none px-4"><p className="text-4xl font-light opacity-30">/</p></div>
              <div className="flex-1 flex flex-col items-center">
                <p className="text-sm opacity-70 mb-1">Supply (Starknet)</p>
                <div className="text-3xl font-mono font-bold text-secondary">
                  <LiveSupply contract={SXRP_DATA} />
                </div>
              </div>
            </div>
            <progress className="progress progress-secondary w-full mt-6 bg-base-200" value="100" max="100"></progress>
          </div>

          <div className="bg-base-100 p-6 rounded-xl border border-base-content/10 shadow-sm">
            <p className="text-xs font-bold uppercase opacity-60 mb-3 flex justify-between"><span>XRP Price Feed</span><span className="text-success">Live API</span></p>
            <p className="text-4xl font-mono font-bold text-base-content mb-1">${marketData.offChainPrice}</p>
            <div className="flex justify-between items-center border-t border-base-content/10 pt-4 mt-4">
               <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold">On-Chain (Starknet)</p>
                  <p className="text-sm font-mono text-info"><LivePythPrice /></p>
               </div>
               <button onClick={() => (document.getElementById('history_modal') as any).showModal()} className="btn btn-outline btn-xs border-base-content/20 text-base-content/70 hover:bg-base-content/10">History</button>
            </div>
          </div>
        </div>

        <div className="bg-base-100 p-5 rounded-xl border border-base-content/10 shadow-sm">
          <p className="text-xs font-bold uppercase opacity-60 mb-4 italic">Live Vault Transactions (XRPL)</p>
          <div className="overflow-x-auto">
            <table className="table table-xs w-full">
              <thead><tr className="text-base-content/60 border-base-content/10"><th>Type</th><th>Hash</th><th>Status</th></tr></thead>
              <tbody>
                {marketData.transactions.map((t: any, i: number) => (
                  <tr key={i} className="border-base-content/5 hover:bg-base-content/5">
                    <td className="font-bold opacity-80">{t.tx.TransactionType}</td>
                    <td className="font-mono text-info"><a href={`https://bithomp.com/en/explorer/${t.tx.hash}`} target="_blank" rel="noreferrer">{t.tx.hash.slice(0, 12)}...</a></td>
                    <td><div className={`badge badge-xs ${t.meta.TransactionResult === "tesSUCCESS" ? "badge-success" : "badge-error"}`}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- HXT VESTING VAULT CARD --- */}
      {VESTING_DATA?.address && (
        <div className="w-full max-w-4xl bg-base-200 text-base-content p-8 rounded-2xl shadow-xl relative mb-12 border-t-4 border-accent">
          <div className="absolute top-0 right-0 bg-accent text-accent-content px-4 py-1 rounded-bl-2xl font-bold text-sm shadow-sm">Vesting Contract</div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">⏳ HXT Vesting Vault</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-base-100 p-5 rounded-xl border border-base-content/10 text-center shadow-sm">
              <p className="text-xs uppercase opacity-60 font-bold mb-2">Total Locked (HXT)</p>
              <p className="text-2xl font-mono font-bold text-base-content">
                <LiveBalance contract={HXT_DATA} address={VESTING_DATA?.address} />
              </p>
            </div>
            <div className="bg-base-100 p-5 rounded-xl border border-base-content/10 text-center shadow-sm">
              <p className="text-xs uppercase opacity-60 font-bold mb-2">Vested to Date</p>
              <p className="text-2xl font-mono font-bold text-success">
                <LiveVestedAmount />
              </p>
            </div>
            <div className="bg-base-100 p-5 rounded-xl border border-base-content/10 text-center shadow-sm flex flex-col justify-center items-center">
              <p className="text-xs uppercase opacity-60 font-bold mb-2">Contract Address</p>
              <a href={`https://voyager.online/contract/${VESTING_DATA.address}`} target="_blank" rel="noreferrer" className="text-sm font-mono text-info hover:underline break-all">
                {VESTING_DATA.address.slice(0, 8)}...{VESTING_DATA.address.slice(-6)}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      <dialog id="history_modal" className="modal">
         <div className="modal-box bg-base-100 text-base-content border border-base-content/20">
            <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
            <h3 className="font-bold text-lg border-b border-base-content/10 pb-2 mb-4">On-Chain History</h3>
            <div className="py-2">
               <table className="table table-xs w-full">
                  <thead><tr className="text-base-content/60 border-base-content/10"><th>Date</th><th>Price</th></tr></thead>
                  <tbody>{priceHistory.map((h, i) => (<tr key={i} className="border-base-content/5"><td className="opacity-80">{h.date}</td><td className="text-success font-bold font-mono">${h.price}</td></tr>))}</tbody>
               </table>
            </div>
         </div>
         <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
