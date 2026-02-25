<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://heretic.city">
    <img src="https://www.heretic.city/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Heretic City</h3>

  <p align="center">
    A decentralized cross-chain ecosystem bridging XRPL liquidity to Starknet's ZK-Rollup.
    <br />
    <a href="https://heretic.city/blackpaper.html"><strong>Read the Blackpaper »</strong></a>
    <br />
    <br />
    <a href="https://www.heretic.city/launch.html">Launch App</a>
    ·
    <a href="https://bithomp.com/en/account/rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7">View Vault</a>
    ·
    <a href="https://github.com/Heretic-City/suite--/issues">Report Bug</a>
  </p>
</div>

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://Heretic.City)

Heretic City is a decentralized organization focused on seamless asset migration between the XRP Ledger and Starknet. By utilizing a secure relayer-based bridge, users can wrap XRP into **sXRP** on Starknet at a 1:1 ratio.

**Key Components:**
* **XRPL Vault:** Secure custody of native XRP assets.
* **sXRP Token:** A 1:1 pegged asset on Starknet.
* **HXT Token:** The native governance and utility token for the Heretic ecosystem.
* **Oracle Guard:** A proprietary stability mechanism to ensure price integrity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Starknet][Starknet-badge]][Starknet-url]
* [![Cairo][Cairo-badge]][Cairo-url]
* [![XRPL][XRPL-badge]][XRPL-url]
* [![Node][Node.js]][Node-url]
* [![AWS][AWS-badge]][AWS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Smart Contracts & Addresses

| Asset/Contract | Network | Address |
| :--- | :--- | :--- |
| **XRPL Vault** | XRPL Mainnet | `rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7` |
| **sXRP Token** | Starknet | `0x05483f80138a35ee902febe115e831ab3fe3126ce54c272c809cabd2984d530c` |
| **HXT Token** | Starknet | `0x05fc519eb3EA97146c47550707c2D8473E7373b80AFE41f89596870f2118181c` |
| **HXT Vesting** | Starknet | `0x0641d232db5fa521659d507dfedd010650a96121addd0d910a67cb9d7558fe8e` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

To interact with the bridge or contribute to the Cairo contracts, ensure you have the following environment set up.

### Prerequisites

* **Scarb & Cairo:** The build toolchain for Starknet.
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf [https://docs.swmansion.com/scarb/install.sh](https://docs.swmansion.com/scarb/install.sh) | sh
Starknet Foundry (snfoundry): For testing and development.

Bash
curl -L [https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh](https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh) | sh
Node.js & npm: To run the relayer.

Bash
npm install npm@latest -g
Installation & Setup
Clone the repo

Bash
git clone [https://github.com/Heretic-City/suite--.git](https://github.com/Heretic-City/suite--.git)
Install Relayer dependencies

Bash
npm install
Compile Cairo contracts

Bash
scarb build
Run tests with snfoundry

Bash
snforge test
<p align="right">(<a href="#readme-top">back to top</a>)</p>

Usage
Bridging XRP to Starknet
Currently, the process requires a minimum of 0.35 XRP.

Send XRP to the Vault: rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7.

The Relayer (running on EC2) detects the transaction.

Under Development: The memoLogDecoder will soon automate routing directly to user addresses on Starknet.

Deploying with sncast
Use sncast to interact with the deployed contracts:

Bash
sncast --account my_account deploy --class-hash <HXT_CLASS_HASH>
<p align="right">(<a href="#readme-top">back to top</a>)</p>

Roadmap
[x] Launch XRPL Vault & Starknet sXRP Contract

[x] Deploy HXT Utility Token & Vesting Vault

[x] Oracle Guard Stability Mechanism

[ ] Implement memoLogDecoder for automated Starknet routing

[ ] Scale to 3/3 active Relayer nodes

[ ] Integration with decentralized front-end

<p align="right">(<a href="#readme-top">back to top</a>)</p>

Contributing
Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

Top contributors:
<a href="https://www.google.com/search?q=https://github.com/Heretic-City/suite--/graphs/contributors">
<img src="https://www.google.com/search?q=https://contrib.rocks/image%3Frepo%3DHeretic-City/suite--" alt="contributors" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

License
Distributed under the Unlicense License. See LICENSE.txt for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

Contact
Project Link: https://github.com/Heretic-City/suite--

<p align="right">(<a href="#readme-top">back to top</a>)</p>

Acknowledgments
The Cairo Book

Starknet Docs

XRPL Foundation

Starknet Foundry

<p align="right">(<a href="#readme-top">back to top</a>)</p>


---

### Strategy: Explaining the System to DoraHacks

Your system is effectively a **Cross-Chain Liquidity Engine**. Here is the breakdown for your "Project Description" and judge Q&A:

**1. The Architecture: "The Heretic Gateway"**
Explain that you are solving the isolation of the XRPL. While XRPL is incredibly fast for payments, it lacks the programmable ZK-scaling that Starknet provides. Heretic City acts as the "Gateway" for XRP to enter the Starknet DeFi ecosystem.

**2. The Innovation: "The Oracle Guard"**
Bridge security is the #1 concern in 2026. Explain that your **Oracle Guard** isn't just a price feed; it's a security layer that monitors for "unusual" activity between the vault and the minting contract. If the peg drifts or a relayer behaves maliciously, the Guard can pause the flow.

**3. The Tooling: "Modern Starknet Stack"**
By including **Scarb**, **snfoundry**, and **sncast**, you are showing the judges that you aren't just "hacking" things together—you are following the latest professional standards for Starknet development (Cairo 2.0+ style).

**4. The Economy: "HXT & Sustainability"**
The HXT token and the Vesting Vault show you have a plan for a **DAO-driven future**. It’s not just a bridge; it’s a city that users want to live in (govern).
