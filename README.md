<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://heretic.city">
    <img src="https://www.heretic.city/logo.svg" alt="Logo" width="120" height="120">
  </a>

  <h3 align="center">Heretic City: Intent-Based Bridging</h3>

  <p align="center">
    A decentralized cross-chain ecosystem routing XRPL liquidity directly into Starknet's ZK-Rollup DeFi ecosystem via encoded intents.
    <br />
    <a href="https://heretic.city/blackpaper"><strong>Read the Blackpaper »</strong></a>
    <br />
    <br />
    <a href="https://www.heretic.city/explorer">Launch App</a>
    ·
    <a href="https://bithomp.com/en/account/rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7">View XRPL Vault</a>
    ·
    <a href="https://github.com/Heretic-City/suite--/issues">Report Bug</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#the-architecture">The Architecture</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#smart-contracts--addresses">Smart Contracts & Addresses</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About The Project

Heretic City is not just a token wrapper; it is an **Intent-Based Cross-Chain Router**. We built a decentralized infrastructure focused on bridging the XRP Ledger's massive liquidity directly into Starknet's high-speed ZK-DeFi ecosystem. 

By utilizing a secure, off-chain relayer node, users can deposit native XRP and have it automatically minted as **sXRP** (Starknet XRP) at a 1:1 ratio. During the deposit phase, users generate a unique `Destination Tag` (Memo) that encodes their specific DeFi intent (e.g., locking for yield, splitting into stablecoins, or pure liquid holding), which our relayer executes on Starknet instantly.

**Key Ecosystem Components:**
* **XRPL Vault:** Secure mainnet custody of native XRP assets.
* **sXRP Token:** A 1:1 pegged liquidity asset natively deployed on Starknet.
* **HXT Token:** Governance and utility token powering the Heretic ecosystem.
* **Vesting Vaults:** Ecosystem contracts allowing users to lock HXT for boosted network multipliers.
* **Pyth Oracle Guard:** Live on-chain price parity monitoring to ensure bridge integrity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### The Architecture (How it Works)

1. **Intent Generation:** The frontend generates a unique 9-digit `Destination Tag` linked to the user's Starknet address and selected risk spread. This is stored in our relayer's SQLite database.
2. **XRPL Execution:** The user sends native XRP to the Heretic Vault, including the `Destination Tag`.
3. **Relayer Node:** Our AWS EC2 node, powered by `xrpl.js`, listens to the live ledger via WebSockets. Upon detecting a successful payment, it queries the database to decode the user's intent.
4. **Starknet Minting:** Using `starknet.js`, the relayer executes a highly-efficient **V3 Transaction** (paying gas fees in `STRK`), calling the Cairo smart contract to mint the exact 18-decimal equivalent of sXRP directly to the user's Starknet wallet.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This project integrates multiple bleeding-edge Web3 technologies. Documentation for our stack can be found below:

* [![Starknet][Starknet-badge]][Starknet-url] - ZK-Rollup Layer 2 scaling
* [![Cairo][Cairo-badge]][Cairo-url] - Turing-complete language for Starknet smart contracts
* [![XRPL][XRPL-badge]][XRPL-url] - The XRP Ledger via `xrpl.js` for mainnet liquidity
* [![Next.js][Next.js]][Next-url] - Frontend framework powered by Scaffold-Stark 2
* [![Node.js][Node-badge]][Node-url] - Core relayer backend and API
* [![Pyth Network][Pyth-badge]][Pyth-url] - Sub-second, on-chain oracle price feeds
* [![Tailwind CSS][Tailwind-badge]][Tailwind-url] - Utility-first CSS framework for UI styling
* [![AWS EC2][AWS-badge]][AWS-url] - Cloud infrastructure hosting the relayer node

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Smart Contracts & Addresses

| Asset/Contract | Network | Address / Hash |
| :--- | :--- | :--- |
| **XRPL Vault** | XRPL Mainnet | [`rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7`](https://bithomp.com/en/account/rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7) |
| **sXRP Token** | Starknet Mainnet | [`0x05483f80138a35ee902febe115e831ab3fe3126ce54c272c809cabd2984d530c`](https://voyager.online/contract/0x05483f80138a35ee902febe115e831ab3fe3126ce54c272c809cabd2984d530c) |
| **HXT Token** | Starknet Mainnet | [`0x05fc519eb3EA97146c47550707c2D8473E7373b80AFE41f89596870f2118181c`](https://voyager.online/contract/0x05fc519eb3EA97146c47550707c2D8473E7373b80AFE41f89596870f2118181c) |
| **HXT Vesting** | Starknet Mainnet | [`0x0641d232db5fa521659d507dfedd010650a96121addd0d910a67cb9d7558fe8e`](https://voyager.online/contract/0x0641d232db5fa521659d507dfedd010650a96121addd0d910a67cb9d7558fe8e) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

To run the Heretic City frontend and relayer locally, follow these steps.

### Prerequisites

* **Scarb & Cairo:** The build toolchain for Starknet contracts.
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf [https://docs.swmansion.com/scarb/install.sh](https://docs.swmansion.com/scarb/install.sh) | sh

  * **Node.js & Yarn:** Required for the Next.js frontend and the Relayer script.
* **Starknet Wallet:** Argent X or Braavos browser extension.

### Installation

1. **Clone the repo**
   ```sh
   git clone [https://github.com/Heretic-City/suite--.git](https://github.com/Heretic-City/suite--.git)
Install Frontend Dependencies (Scaffold-Stark)

Bash
cd suite--/packages/nextjs
yarn install
Run the Next.js App

Bash
yarn start
Setup the Relayer Node
Navigate to your relayer directory, install dependencies, and start the daemon.

Bash
npm install express cors sqlite3 xrpl starknet dotenv
node relayer.js
<p align="right">(<a href="#readme-top">back to top</a>)</p>

Roadmap
[x] Launch XRPL -> Starknet 1:1 Minting Logic

[x] Deploy Intent-Based Routing Memo Architecture

[x] Integrate Pyth Oracle live feeds

[ ] Integrate Controller by Cartridge for seamless, session-based wallet onboarding

[ ] Automate Debridge / Withdraw Flow

[ ] Activate DeFi Lab modules (Lending/Borrowing)

[ ] Implement Topper fiat on-ramp

<p align="right">(<a href="#readme-top">back to top</a>)</p>

License
Distributed under the Unlicense License. See LICENSE.txt for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
