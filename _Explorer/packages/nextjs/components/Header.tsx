"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-stark";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { useTheme } from "next-themes";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { devnet } from "@starknet-react/chains";
import { SwitchTheme } from "./SwitchTheme";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { BlockIdentifier } from "starknet";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Explorer",
    href: "/explorer", 
  },
  {
    label: "Blackpaper",
    href: "/blackpaper",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);
  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive
                  ? "bg-gradient-nav text-white! active:bg-gradient-nav shadow-md"
                  : ""
              } py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col hover:bg-gradient-nav hover:text-white`}
              onClick={() => {
                // Ensure the DaisyUI dropdown loses focus when a link is clicked
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, []),
  );

  const { targetNetwork } = useTargetNetwork();
  const { provider } = useProvider();
  const { address, status, chainId } = useAccount();
  const { chain } = useNetwork();
  const [isDeployed, setIsDeployed] = useState(true);

  // ... (keep useEffect for deployment check same)

  return (
    // Added 'relative' to ensure z-index applies correctly across all mobile browsers
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-[100] px-2 shadow-md relative">
      <div className="navbar-start w-auto lg:w-1/2 -mr-2">
        <div className="lg:hidden dropdown relative" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className="ml-1 btn btn-ghost [@media(max-width:379px)]:px-3! [@media(max-width:379px)]:py-1! [@media(max-width:379px)]:h-9! [@media(max-width:379px)]:min-h-0! [@media(max-width:379px)]:w-10!"
          >
            <Bars3Icon className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-base-200 rounded-box w-52 border border-primary z-[150]"
          >
            <HeaderMenuLinks />
          </ul>
        </div>
        <Link
          href="/"
          passHref
          className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0"
        >
          <div className="flex relative w-10 h-10">
            <Image alt="logo" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Heretic City</span>
            <span className="text-xs">suite--</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>

      {/* 🚨 MOBILE TWEAK: Ensure navbar-end has pointer-events-auto just in case */}
      <div className="navbar-end grow mr-2 gap-4 pointer-events-auto">
        {status === "connected" && !isDeployed ? (
          <span className="bg-[#8a45fc] text-[9px] p-1 text-white">
            Wallet Not Deployed
          </span>
        ) : null}
        
        {/* Wrapping button in a high z-index container to be safe */}
        <div className="relative z-[110]">
          <CustomConnectButton />
        </div>

        <SwitchTheme
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
};