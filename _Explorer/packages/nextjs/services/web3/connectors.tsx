"use client";

import { braavos, InjectedConnector, ready } from "@starknet-react/core";
import { getTargetNetworks } from "~~/utils/scaffold-stark";
import { BurnerConnector } from "@scaffold-stark/stark-burner";
import scaffoldConfig from "~~/scaffold.config";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "~~/utils/Constants";
import { KeplrConnector } from "./keplr";

// 🚨 THE FIX: Use the Named Export specifically for ControllerConnector
import { ControllerConnector } from "@cartridge/connector";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

function withDisconnectWrapper(connector: InjectedConnector) {
  const connectorDisconnect = connector.disconnect;
  const _disconnect = (): Promise<void> => {
    localStorage.removeItem("lastUsedConnector");
    localStorage.removeItem(LAST_CONNECTED_TIME_LOCALSTORAGE_KEY);
    return connectorDisconnect();
  };
  connector.disconnect = _disconnect.bind(connector);
  return connector;
}

function getConnectors() {
  const { targetNetworks } = scaffoldConfig;
  
  // Start with the standard connectors
  const connectors: InjectedConnector[] = [ready(), braavos()];

  // 🚨 SSR SHIELD: Cartridge tries to read the browser window, so we only instantiate it on the client
if (typeof window !== "undefined") {
    try {
      const cartridge = new ControllerConnector({
        // 🚨 OVERRIDE: We are bypassing targetNetworks entirely so it never touches Alchemy again
        rpc: "https://api.cartridge.gg/x/starknet/mainnet",
        policies: [],
      }) as unknown as InjectedConnector;
      
      connectors.unshift(cartridge);
    } catch (e) {
      console.error("Cartridge failed to initialize:", e);
    }
  }

  const isDevnet = targetNetworks.some(
    (network) => (network.network as string) === "devnet",
  );

  if (!isDevnet) {
    connectors.push(new KeplrConnector());
  } else {
    const burnerConnector = new BurnerConnector();
    burnerConnector.chain = targetNetworks[0];
    connectors.push(burnerConnector as unknown as InjectedConnector);
  }

  return connectors.sort(() => Math.random() - 0.5).map(withDisconnectWrapper);
}

export const appChains = targetNetworks;