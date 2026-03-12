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
    <a href="https://www.heretic.city/blackpaper"><strong>Read the Blackpaper »</strong></a>
    <br /><br />
    <a href="https://www.heretic.city/explorer">Launch App</a>
    ·
    <a href="https://bithomp.com/en/account/rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7">View XRPL Vault</a>
    ·
    <a href="https://github.com/Heretic-City/suite--/issues">Report Bug</a>
  </p>
</div>

---

## Table of Contents

- About The Project
- Architecture
- Built With
- Smart Contracts & Addresses
- Getting Started
- Roadmap
- License

---

## About The Project

Heretic City is an **Intent-Based Cross-Chain Router** connecting  
**XRPL liquidity → Starknet ZK DeFi** using encoded deposit intents.

Users send XRP with a memo tag → relayer decodes intent →  
Cairo contract mints **sXRP 1:1 on Starknet**.

### Ecosystem Components

- XRPL Vault
- sXRP Token
- HXT Token
- Vesting Vaults
- Pyth Oracle Guard
- Relayer Node
- Intent Memo Router

---

## Architecture

1. Frontend generates Destination Tag  
2. User sends XRP to vault  
3. Relayer reads ledger via WebSocket  
4. Relayer decodes memo intent  
5. Starknet contract mints sXRP  

Relayer stack:

- xrpl.js
- starknet.js
- sqlite
- express
- AWS EC2

---

## Built With

- Starknet
- Cairo
- XRPL
- Next.js / Scaffold-Stark 2
- Node.js
- Tailwind
- Pyth Oracle
- AWS EC2

---

## Smart Contracts & Addresses

| Contract | Network | Address |
|----------|----------|----------|
| XRPL Vault | XRPL | rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7 |
| sXRP | Starknet | 0x05483f80138a35ee902febe115e831ab3fe3126ce54c272c809cabd2984d530c |
| HXT | Starknet | 0x05fc519eb3EA97146c47550707c2D8473E7373b80AFE41f89596870f2118181c |
| Vesting | Starknet | 0x0641d232db5fa521659d507dfedd010650a96121addd0d910a67cb9d7558fe8e |

---

# Getting Started

Run frontend + contracts + relayer locally.

---

## Prerequisites

### Windows users

Use WSL2

https://learn.microsoft.com/en-us/windows/wsl/install

### Node + Yarn

Install Node 18+

### Scarb + Cairo

```sh
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

### Wallet

Install

- Argent X
- Braavos

---

## Clone repo

```bash
git clone https://github.com/Heretic-City/suite--.git
cd suite--
```

---

## Install frontend

```bash
cd packages/nextjs
yarn install
```

---

## Environment setup

Create

```
packages/nextjs/.env.local
```

Add

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
NEXT_PUBLIC_NETWORK=mainnet
```

---

## Run frontend

```bash
yarn start
```

Open

```
http://localhost:3000
```

---

## Run relayer

Go to relayer folder

Install deps

```bash
npm install express cors sqlite3 xrpl starknet dotenv
```

Create `.env`

```
XRPL_SECRET=
STARKNET_PRIVATE_KEY=
```

Start

```bash
node relayer.js
```

---

## Deployment

Deploy frontend with Vercel

1. Connect repo
2. Add env vars
3. Deploy

https://vercel.com/docs/deployments

---

## Roadmap

- [x] XRPL → Starknet mint
- [x] Memo intent router
- [x] Pyth oracle
- [ ] Cartridge controller
- [ ] Withdraw flow
- [ ] DeFi modules
- [ ] Fiat on-ramp

---

## License

MIT

---

[contributors-shield]: https://img.shields.io/github/contributors/Heretic-City/suite--
[forks-shield]: https://img.shields.io/github/forks/Heretic-City/suite--
[stars-shield]: https://img.shields.io/github/stars/Heretic-City/suite--
[issues-shield]: https://img.shields.io/github/issues/Heretic-City/suite--
[license-shield]: https://img.shields.io/github/license/Heretic-City/suite--

[contributors-url]: https://github.com/Heretic-City/suite--/graphs/contributors
[forks-url]: https://github.com/Heretic-City/suite--/network/members
[stars-url]: https://github.com/Heretic-City/suite--/stargazers
[issues-url]: https://github.com/Heretic-City/suite--/issues
[license-url]: https://github.com/Heretic-City/suite--/blob/main/LICENSE
