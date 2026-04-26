# UnityGive System Documentation

UnityGive is a decentralized crowdfunding platform built with a MERN stack (MongoDB, Express, React, Node) and a Web3 integration (Solidity, Ethers.js, Hardhat).

This document outlines the system architecture, how the different components interact, and the exact workflow required to run the entire system locally.

---

## 1. System Architecture

The platform uses a **Hybrid Architecture** combining traditional Web2 features with Web3 transparency:

*   **Frontend (React/Vite)**: The user interface. It connects to the backend API for traditional data (users, comments, campaign drafts) and directly to MetaMask/Blockchain for financial transactions (donating, voting, refunding).
*   **Backend (Express/Node)**: Handles user authentication, KYC approvals, and serves as an **Indexer**. A background service (`blockchainService.js`) constantly listens to the blockchain. When an event occurs (e.g., `DonationReceived`), it synchronizes the MongoDB database to ensure data consistency.
*   **Smart Contract (Solidity)**: `UnityGive.sol` handles the core financial logic. It stores funds securely, requires Multi-Sig council approval to release milestones, and allows for automated refunds.

### The Role of "Admin" vs "Organization"
In UnityGive, there is no separate "Organization" account type in the database. 
- Organizations submit KYC.
- The **System Admin** reviews KYC.
- The **System Admin** creates the campaign on behalf of the organization.
- During creation, the Admin's wallet address is assigned to the `orgWallet` variable in the smart contract. Thus, technically, the Admin's wallet acts as the "Organization" for all on-chain actions (like uploading proofs and requesting top-ups).

---

## 2. Setup Guide

Ensure you have Node.js (v18+) and MetaMask installed.

1. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
3. **Install Smart Contract Dependencies:**
   ```bash
   cd smart-contracts
   npm install
   ```

---

## 3. Run Workflow (Crucial!)

Because the backend relies on the blockchain, and the frontend relies on both, you **must start the system in this exact order**:

### Step 1: Start the Local Blockchain
Open Terminal 1:
```bash
cd smart-contracts
npx hardhat node
```
*Leave this terminal running. It simulates an Ethereum network at `http://127.0.0.1:8545`.*

### Step 2: Deploy the Smart Contract & Sync Variables
Open Terminal 2:
```bash
cd smart-contracts
npx hardhat run scripts/deploy.ts --network localhost
```
*This script will deploy the contract to your local node. It will also **automatically update** the `VITE_CONTRACT_ADDRESS` in `frontend/.env` and `CONTRACT_ADDRESS` in `backend/.env`, ensuring all parts of the system are talking to the exact same contract.*

### Step 3: Start the Backend Server
In Terminal 2 (or a new terminal):
```bash
cd backend
npm run dev
```
*You should see a message saying `[BlockchainService] Listening for events on 0x...`. This means the indexer has successfully connected to the Hardhat node.*

### Step 4: Start the Frontend
Open Terminal 3:
```bash
cd frontend
npm run dev
```

---

## 4. Testing Guide

When testing locally with Hardhat, use the provided test accounts in MetaMask:
1. Import **Account #0** from the Hardhat console into MetaMask. This is your **Admin Wallet** (and also acts as the Organization wallet when creating campaigns).
2. Import **Account #1 - #5** to act as **Donors** or **Council Members**.

### Full Lifecycle Test:
1. Login as Admin in the Frontend.
2. Go to `Dashboard -> Create Campaign`. Create a campaign.
3. Switch MetaMask to a Donor account. Go to the campaign page and Donate.
4. Switch MetaMask back to the Admin account. Go to the campaign page and click "Upload Proof" (requires Pinata API keys).
5. Switch MetaMask to the Donor/Council account. Go to the campaign page and Vote "Approve".
6. Switch back to the Admin account. Once enough votes are reached, the funds will automatically be released!
