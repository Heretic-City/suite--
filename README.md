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
    <img src="https://www.heretic.city/logo.png" alt="HC_suite--" width="80" height="80">
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
    <li><a href="#smart-contracts--addresses">Smart Contracts & Addresses</a></li>
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

Heretic City is a decentralized organization focused on bridging the XRP Ledger and Starknet. By utilizing a secure relayer-based bridge, users can wrap XRP into **sXRP** on Starknet at a 1:1 ratio, enabling high-speed ZK-DeFi for XRPL assets.

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

* **Scarb & Cairo:** The build toolchain for Starknet.
  ```sh
  curl --proto '=https' --tlsv1.2 -sSf [https://docs.swmansion.com/scarb/install.sh](https://docs.swmansion.com/scarb/install.sh) | sh

  

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
