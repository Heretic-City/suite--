<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

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
    &middot;
    <a href="https://bithomp.com/en/account/rakJBTzLuhFBxFwogaqj73Q9anqAdjy8U7">View Vault</a>
    &middot;
    <a href="https://github.com/Heretic-City/suite--/issues">Report Bug</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#smart-contracts--addresses">Smart Contracts & Addresses</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://heretic.city)

Heretic City is a decentralized organization focused on seamless asset migration between the XRP Ledger and Starknet. By utilizing a secure relayer-based bridge, users can wrap XRP into **sXRP** on Starknet at a 1:1 ratio.

**Key Components:**
* **XRPL Vault:** Secure custody of native XRP assets.
* **sXRP Token:** A 1:1 pegged asset on Starknet.
* **HXT Token:** Governance and utility token for the Heretic ecosystem.
* **Oracle Guard:** A proprietary stability mechanism to ensure price integrity.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Starknet][Starknet-badge]][Starknet-url]
* [![Cairo][Cairo-badge]][Cairo-url]
* [![XRPL][XRPL-badge]][XRPL-url]
* [![Node.js][Node-badge]][Node-url]
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

### Prerequisites

* **Scarb & Cairo:**
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf [https://docs.swmansion.com/scarb/install.sh](https://docs.swmansion.com/scarb/install.sh) | sh
