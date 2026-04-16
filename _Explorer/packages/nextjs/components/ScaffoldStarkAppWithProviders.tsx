"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { StarknetConfig, starkscan } from "@starknet-react/core";
import { Header } from "~~/components/Header";
import { appChains, connectors } from "~~/services/web3/connectors";
import provider from "~~/services/web3/provider";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-stark/useNativeCurrencyPrice";

const Footer = dynamic(
  () => import("~~/components/Footer").then((mod) => mod.Footer),
  { ssr: false }
);

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  useNativeCurrencyPrice();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [isLockdown, setIsLockdown] = useState(false);

  useEffect(() => {
    try {
      const wasmSupported = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
      if (!wasmSupported) setIsLockdown(true);
    } catch (e) {
      setIsLockdown(true);
    }
  }, []);

  return (
    <>
      {isLockdown && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-[9999] p-2 text-center text-xs font-bold uppercase tracking-widest shadow-lg">
          ⚠️ Lockdown Mode Detected: Site functionality limited. Disable in iOS Settings to connect.
        </div>
      )}
      {/* 🚨 CSS ADJUSTMENT: Ensure the container allows sticky behavior (no overflow-x hidden here) */}
      <div className={`flex relative flex-col min-h-screen bg-main ${isLockdown ? "pt-10" : ""}`}>
        {isDarkMode ? (
          <>
            <div className="circle-gradient-dark w-[330px] h-[330px] pointer-events-none"></div>
            <div className="circle-gradient-blue-dark w-[330px] h-[330px] pointer-events-none"></div>
          </>
        ) : (
          <>
            <div className="circle-gradient w-[330px] h-[330px] pointer-events-none"></div>
            <div className="circle-gradient-blue w-[330px] h-[630px] pointer-events-none"></div>
          </>
        )}
        <Header />
        {/* 🚨 CRITICAL: Removed overflow hidden/clip to ensure page.tsx sticky works */}
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const ScaffoldStarkAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <StarknetConfig
      chains={appChains}
      provider={provider}
      connectors={connectors}
      explorer={starkscan}
    >
      <ScaffoldStarkApp>{children}</ScaffoldStarkApp>
    </StarknetConfig>
  );
};