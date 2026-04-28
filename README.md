# UnityGive

> A decentralized, transparent crowdfunding platform built on Ethereum — where every donated ETH is governed by on-chain milestones, multi-sig voting, and IPFS proof of impact.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.34-blue?logo=solidity)](https://docs.soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Smart Contracts](#1-smart-contracts-setup)
   - [Backend](#2-backend-setup)
   - [Frontend](#3-frontend-setup)
6. [Key Features](#key-features)
7. [API Documentation](#api-documentation)
8. [Smart Contract](#smart-contract)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

---

## Overview

UnityGive is a **Hybrid Governance crowdfunding platform** that combines Web2 UX with Web3 financial security. Organizations create campaigns with defined milestones; funds are only released when a council of trusted members vote to approve an organization's submitted proof of impact, preventing fraud and ensuring accountability.

### The Problem We Solve

Traditional donation platforms release funds entirely at once, with no accountability mechanism. UnityGive enforces:
- 💰 **Milestone-based fund release** — funds are locked in the smart contract and released phase by phase.
- 🗳️ **On-chain multi-sig voting** — a designated council must cryptographically vote before any ETH moves.
- 📄 **IPFS Proof of Impact** — organizations submit immutable, verifiable evidence before requesting a vote.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        UnityGive Monorepo                        │
│                                                                  │
│  ┌─────────────┐    REST API    ┌─────────────────────────────┐  │
│  │   Frontend  │ ◄────────────► │          Backend            │  │
│  │  React/Vite │                │   Express + MongoDB Atlas   │  │
│  └──────┬──────┘                └─────────────┬───────────────┘  │
│         │                                     │                  │
│         │  ethers.js (RPC)          ethers.js (Event Indexer)    │
│         │                                     │                  │
│         └─────────────────┐   ┌───────────────┘                  │
│                           ▼   ▼                                  │
│                  ┌─────────────────────┐                         │
│                  │   UnityGive.sol     │                         │
│                  │  (Sepolia Testnet)  │                         │
│                  └─────────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Admin** registers a campaign on-chain via the backend API (which calls the smart contract).
2. **Donors** connect their MetaMask wallet and donate ETH directly to the contract.
3. **Organizations** upload IPFS Proof of Impact (documents/images via Pinata) and submit it on-chain.
4. **Council Members** (manual auditors + top-5 donors) vote on-chain to approve a milestone.
5. Once the approval threshold is met, **ETH is automatically released** to the organization's wallet.
6. The **Blockchain Event Indexer** (backend service) listens for contract events and syncs state into MongoDB in real-time.

---

## Tech Stack

### 🔗 Smart Contracts
| Technology | Purpose |
|---|---|
| Solidity `^0.8.34` | Core contract logic |
| Hardhat | Compilation, testing, deployment |
| OpenZeppelin | `ReentrancyGuard`, security primitives |
| Ethers.js v6 | Script-based chain interaction |
| Typechain | TypeScript bindings for the ABI |
| Chai | Unit testing assertion library |

### ⚙️ Backend
| Technology | Purpose |
|---|---|
| Node.js 20 + Express.js | REST API server |
| MongoDB Atlas + Mongoose | Database & schema modeling |
| JWT + Bcrypt | Authentication & password hashing |
| Ethers.js v6 | Blockchain event listener / indexer |
| Nodemailer | Password reset emails |
| Swagger UI (swagger-jsdoc) | Interactive API documentation |
| Zod | Request body validation |
| Helmet + express-rate-limit | Security hardening |
| Jest + Supertest | Unit & integration testing |
| Docker | Containerized deployment |

### 🎨 Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component library |
| Axios + SWR | HTTP client & data fetching/caching |
| Ethers.js v6 | MetaMask wallet integration |
| Lucide React | Icon library |
| Sonner | Toast notifications |
| Pinata SDK | IPFS file uploads |

---

## Project Structure

```
IE213_UnityGive/
│
├── .env.example              # ← All environment variables documented here
├── .gitignore
├── README.md
│
├── backend/                  # Node.js/Express REST API
│   ├── src/
│   │   ├── config/           # DB connection, Swagger setup
│   │   ├── controllers/      # Route handler logic
│   │   ├── cron/             # Scheduled jobs
│   │   ├── middleware/       # verifyToken, verifyAdmin
│   │   ├── models/           # Mongoose schemas (Campaign, User, Donation, Comment)
│   │   ├── routes/           # Express routers (auth, campaigns, donations, users, comments)
│   │   ├── services/         # authService, blockchainService (event indexer)
│   │   ├── utils/            # Shared helper functions
│   │   ├── validators/       # Zod schemas for request validation
│   │   └── server.js         # App entry point
│   ├── tests/                # Jest integration tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── layouts/          # Page layout wrappers (AuthLayout, MainLayout)
│   │   ├── lib/              # Utility functions, API clients
│   │   ├── pages/            # Full page components (21 pages)
│   │   │   ├── Home.jsx
│   │   │   ├── Campaigns.jsx
│   │   │   ├── CampaignDetails.jsx
│   │   │   ├── CreateCampaign.jsx
│   │   │   ├── EditCampaign.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminVerifications.jsx
│   │   │   ├── ManagedCampaigns.jsx
│   │   │   ├── ProfileSetting.jsx
│   │   │   ├── Login.jsx / Signup.jsx
│   │   │   ├── ForgotPassword.jsx / ResetPassword.jsx
│   │   │   ├── AboutUs.jsx / ContactSupport.jsx
│   │   │   ├── FAQPage.jsx / PrivacyPolicy.jsx / TermsOfService.jsx
│   │   │   └── NotFound.jsx
│   │   ├── App.jsx           # Router + route definitions
│   │   └── main.jsx          # React entry point
│   ├── public/
│   ├── vercel.json           # Vercel SPA routing config
│   └── package.json
│
└── smart-contracts/          # Hardhat project
    ├── contracts/
    │   └── UnityGive.sol     # Core contract (multi-sig, milestones, DAO)
    ├── scripts/
    │   └── deploy.ts         # Deployment script (Sepolia)
    ├── test/                 # Hardhat/Chai unit tests
    ├── typechain-types/      # Auto-generated TypeScript typings
    ├── ABI.json              # Contract ABI (used by backend & frontend)
    ├── hardhat.config.ts
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 20.x` and **npm** `>= 10.x`
- **MongoDB Atlas** account (free tier works)
- **Alchemy** account for Sepolia RPC ([alchemy.com](https://alchemy.com))
- **MetaMask** browser extension with a Sepolia wallet funded from a faucet
- **Pinata** account for IPFS uploads ([pinata.cloud](https://pinata.cloud))
- **Etherscan** API key for contract verification ([etherscan.io](https://etherscan.io))

---

### Environment Variables

All environment variables are documented in `.env.example` at the project root. Create the actual `.env` files in each sub-package:

```bash
# Reference the root example and create the files manually
cat .env.example

# Create each package's env file
touch backend/.env
touch frontend/.env
touch smart-contracts/.env
```

> ⚠️ **Never commit `.env` files.** They are already excluded by `.gitignore`.

---

### 1. Smart Contracts Setup

```bash
cd smart-contracts
npm install
```

**Compile contracts & generate TypeScript bindings:**
```bash
npx hardhat compile
```

**Run the test suite:**
```bash
npx hardhat test
```

**Deploy to Sepolia testnet** (requires `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in `smart-contracts/.env`):
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Verify on Etherscan** (requires `ETHERSCAN_API_KEY`):
```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

**Run a local Hardhat node for development:**
```bash
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Fill in `backend/.env` (see `.env.example` for all required keys).

**Run development server** (with auto-reload via nodemon):
```bash
npm run dev
```

**Run production server:**
```bash
npm start
```

**Run tests:**
```bash
npm test
```

| Endpoint | URL |
|---|---|
| API Base | `http://localhost:5000` |
| Swagger Docs | `http://localhost:5000/docs` |

**Run with Docker:**
```bash
cd backend
docker build -t unitygive-backend .
docker run -p 5000:5000 --env-file .env unitygive-backend
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Fill in `frontend/.env` (see `.env.example` for all required keys).

**Run development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

The app will be available at `http://localhost:5173`.

---

## Key Features

### For Donors
- 🔐 **Dual Auth** — sign up with email/password or connect directly via MetaMask (Web3 login with nonce signature)
- 🌐 **Browse Campaigns** — filter by category, search by title, view real-time funding progress
- 💸 **Donate with ETH** — send directly to the smart contract; excess is automatically refunded
- 📊 **Personal Dashboard** — view donation history, total impact, and followed campaigns
- 🔙 **Refunds** — if a campaign is cancelled, donors can trustlessly claim their ETH back on-chain

### For Organizations
- 📝 **Campaign Creation** — draft campaigns with title, description, milestones, council members, and cover image
- 📤 **IPFS Proof Upload** — upload evidence documents/images to Pinata; submit the IPFS CID on-chain
- 📢 **Campaign Updates** — post textual progress updates visible to donors
- 🔧 **Campaign Management** — edit, pause, or extend active campaigns

### For Council Members
- 🗳️ **On-chain Voting** — vote to approve or reject a milestone directly from the campaign detail page
- **Hybrid Council** — composed of manually assigned auditors + the top 5 donors by contribution amount (automatically tracked on-chain)

### For Admins
- 👥 **User Management** — view all users, change roles, suspend or delete accounts
- ✅ **KYC Verification** — review submitted KYC documents and approve/reject organization applications
- 🚀 **Campaign Registration** — register campaigns on-chain after KYC approval
- 📉 **Platform Dashboard** — view aggregate stats on donations, active campaigns, and users

---

## API Documentation

The backend exposes a fully interactive **Swagger UI** at `/docs`.

### Route Groups

| Group | Base Path | Auth Required |
|---|---|---|
| Auth | `/api/auth` | No (public) |
| Users | `/api/users` | Varies |
| Campaigns | `/api/campaigns` | Varies |
| Donations | `/api/donations` | Varies |
| Comments | `/api/comments` | No |

### Auth Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register with email & password |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Set new password via token |
| `POST` | `/api/auth/web3/nonce` | Get signable nonce for wallet |
| `POST` | `/api/auth/web3/login` | Authenticate with wallet signature |

---

## Smart Contract

**Contract:** `UnityGive.sol`  
**Network:** Sepolia Testnet  
**Address:** `0x7aD396C2fDfade24F57a20897C0cEAF1D6954bCF`  
**Verified on:** [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x7aD396C2fDfade24F57a20897C0cEAF1D6954bCF)

### Core Functions

| Function | Caller | Description |
|---|---|---|
| `registerCampaign(...)` | Admin | Creates a campaign with milestones and council |
| `donate(campaignId)` | Donor | Sends ETH to a campaign (payable) |
| `uploadProofOfImpact(...)` | Organization | Submits IPFS CID for a milestone |
| `voteApproveMilestone(...)` | Council Member | Casts an approval vote; auto-releases funds if threshold met |
| `refund(campaignId)` | Donor | Claims ETH back from a cancelled campaign |
| `cancelCampaign(campaignId)` | Admin | Deactivates a campaign |
| `topUpCampaign(campaignId)` | Organization | Tops up if goal not met by deadline |

### Key Events

| Event | Emitted When |
|---|---|
| `CampaignRegistered` | New campaign registered on-chain |
| `DonationReceived` | ETH donation processed |
| `ProofUploaded` | Organization submits IPFS evidence |
| `Voted` | Council member casts a vote |
| `MilestoneApproved` | Voting threshold reached |
| `FundsReleased` | ETH transferred to organization wallet |
| `RefundIssued` | Donor claims refund |

---

## Deployment

### Backend (Docker / Render)

The backend includes a `Dockerfile` for containerized deployment.

```bash
# Build image
docker build -t unitygive-backend ./backend

# Run container
docker run -d -p 5000:5000 --env-file ./backend/.env unitygive-backend
```

For Render.com: connect your GitHub repo, set the **Root Directory** to `backend`, and add all `backend/.env` variables as environment variables in the Render dashboard.

### Frontend (Vercel)

A `vercel.json` is included in the `frontend/` directory for SPA routing support.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

Set all `frontend/.env` variables (`VITE_*`) as Environment Variables in the Vercel project settings.

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

*Built with ❤️ for IE213 — Web Application Development*
