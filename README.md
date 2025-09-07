# TrustLend

A decentralized, trust-minimized peer-to-peer lending DApp deployed on the Vara testnet. Borrow TVARA-backed loans, lend liquidity for yield, and manage risks with real-time health checks and admin controls.

---

## Table of Contents

- [About](#about)  
- [Key Features](#key-features)  
- [Architecture & Technologies](#architecture--technologies)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Running Locally](#running-locally)  
- [Usage Guide](#usage-guide)  
  - [Borrower Flow](#borrower-flow)  
  - [Lender Flow](#lender-flow)  
  - [Admin Flow](#admin-flow)  
- [Risk Mechanics & Safety](#risk-mechanics--safety)  
- [Project Structure](#project-structure)  
- [Contributing](#contributing)  
- [Security & Audits](#security--audits)  
- [FAQ](#faq)  
- [License](#license)

---

## About

TrustLend Protocol enables secure over-collateralized lending:
- Deposit TVARA as collateral  
- Borrow VFT up to ~66% LTV  
- Earn yield by lending liquidity  
- Track risk via Health Factor and dynamic interest  
- Admin controls: price updates, pause, liquidation, fund withdrawals

---

## Key Features

- **Borrower Dashboard**: View collateral, debt, interest, and health factor. Repay loans and withdraw collateral.
- **Lender Dashboard**: Provide liquidity, track earned interest, monitor utilization rate, and view borrower positions.
- **Admin Panel**: Manage risk — update TVARA price, pause/resume operations, liquidate unsafe positions, withdraw liquidity or treasury.
- **Dynamic Risk Metrics**: Health factor alerts (liquidatable <120%, safe ≥150%), utilization rates, and real-time data.
- **Modern UI**: Built with React + Tailwind CSS for fast, responsive, intuitive frontend.

---

## Architecture & Technologies

- **Frontend**:  
  - React  
  - Tailwind CSS  
  - State management via React Context (`ProgramContext`)  
  - Wallet integration using `@polkadot/extension-dapp`, Gear.js, and SailsProgram  

- **On-Chain Backend**:  
  - Rust-based lending protocol smart contracts  
  - TVARA collateral in 12-decimal format, WAD (1e18) for interest and health calculations  
  - Features: lending, borrowing, interest accrual, liquidation, admin controls  

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)  
- Yarn or npm  
- Polkadot.js browser extension installed and configured for Vara testnet  

### Running Locally

```bash
git clone <your-repo-url>
cd tvara-lending-dapp
npm install       # or yarn install
npm run dev       # or yarn dev
````

Open `http://localhost:3000` and connect your wallet to interact as borrower, lender, or admin.

---

## Usage Guide

### Borrower Flow

1. Connect wallet → SS58 → ActorId → fetch user info
2. Deposit TVARA collateral
3. Borrow VFT (capped at \~66% LTV)
4. Monitor Health Factor (e.g., 151%)
5. Repay VFT → Withdraw collateral if HF ≥ liquidation threshold

### Lender Flow

* Provide liquidity → mint VFT
* View utilization rate and earned interest
* Withdraw liquidity and claim interest
* (Optional) View borrower list with health indicators

### Admin Flow

* Authenticate as admin (ActorId match)
* Update TVARA price
* Pause/resume protocol
* Liquidate risky borrower positions (HF < 120%)
* Withdraw funds or treasury

---

## Risk Mechanics & Safety

* **Liquidation threshold**: Health Factor <120% triggers liquidation (enforced in smart contract)
* **Safe Buffer**: Target HF ≥150% to safeguard against volatility and interest accrual
* **Health Factor Formula**: `(collateral × 100) / totalDebt` → integer percentage
* **Utilization Rate**: Displays current borrowing percentage of total liquidity

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── borrower/
│   │   ├── lender/
│   │   ├── admin/
│   │   └── common/
│   ├── contexts/
│   │   └── ProgramContext.jsx        # web3 + Gear API integration
│   └── utils/
│       └── conversions.js            # TVARA conversions & formatting
├── contracts/
│   └── Rust lending service source code
├── README.md
├── package.json
└── LICENSE
```

---

## Contributing

We welcome contributions!

* Fork the repo, create a branch (`feature/…`, `bugfix/…`)
* Commit changes with clear messages
* Open a PR — include screenshots, context, and tests if applicable

This README follows best practices: early clarity, setup instructions, architecture overview, usage steps, and contribution guidance. ([m.dotdev.co][1], [Medium][2])

---

## Security & Audits

* Use safe arithmetic (BigInt) and strict overflow checks in smart contracts
* Consider auditing smart contracts using external audit firms or tools
* Monitor for typical DeFi exploits: reentrancy, oracle manipulation, admin key risks ([Meegle][3])

---

## FAQ

**Q:** What happens if the oracle price fails?
**A:** Admin can pause the protocol to prevent unwanted liquidations or actions.

**Q:** Can I contribute liquidity and also borrow?
**A:** Yes — lender and borrower operations are separate and accessible via role flows.

---

## License

This project is licensed under the [MIT License](LICENSE).

---
