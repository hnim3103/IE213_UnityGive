# UnityGive (Web3 V2)

UnityGive is a state-of-the-art decentralized crowdfunding platform. It empowers verified organizations to create fundraising campaigns while protecting donors through a **DAO-governed, Milestone-based, Multi-Sig Smart Contract** architecture built on Ethereum.

By leveraging Web3 technologies, UnityGive ensures that funds are no longer released blindly. Organizations must provide **IPFS Proof of Impact**, and a council of trusted members must cryptographically vote to approve fund releases at every milestone—preventing "rug pulls" and ensuring maximum transparency.

---

## 🌟 Key Features
- **Milestone Fund Disbursement:** Campaigns are split into financial phases. Funds are strictly released per milestone.
- **DAO Multi-Sig Voting:** A custom council (e.g., top donors or auditors) must vote on-chain to approve each milestone.
- **IPFS Proof of Impact:** Organizations must submit verifiable proof of work (images, documents) stored immutably on IPFS to request funding.
- **JWT Secure Authentication:** Backend API is fully protected via strict Bearer Token verification and Role-Based Access Control (Admin, Donor, Organization).
- **Interactive API Docs:** Comprehensive Swagger UI documentation integration.

---

## 📁 Project Structure

```text
UnityGive/
│
├── backend/          # Node.js/Express API & MongoDB Models
├── frontend/         # React + Vite Client (Tailwind & shadcn/ui)
└── smart-contracts/  # Solidity, Hardhat, Ethers.js, and Typechain
```

---

## 🚀 Tech Stack

### Smart Contracts (Web3)
- **Solidity** (Smart Contract Logic)
- **Hardhat** (Development Environment & Testing Suite)
- **Ethers.js v6** (Blockchain Interaction)
- **Typechain** (TypeScript bindings for smart contracts)
- **Chai** (Smart Contract Unit Testing)

### Backend (Web2)
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Complex Schema Referencing)
- **JWT (JSON Web Tokens)** & **Bcrypt** (Auth & Security)
- **Swagger UI** (API Documentation)
- **dotenv & cors**

### Frontend
- **React (Vite)**
- **Tailwind CSS & shadcn/ui**
- **React Router & Axios**
- **ethers.js** (Web3 Provider Integration)

---

## ⚙️ Installation & Setup

### 1. Smart Contracts Setup

Navigate to the smart contracts directory to compile the ABI and run the test suite:
```bash
cd smart-contracts
npm install
npx hardhat compile
npx hardhat test      # Verify Multi-Sig & Milestone logic passes
```
*To deploy locally:* `npx hardhat node` followed by `npx hardhat run scripts/deploy.js --network localhost`

### 2. Backend Setup

Navigate to the backend directory to spin up the API:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```
Run the development server:
```bash
npm run dev
```
* The API will run at: `http://localhost:5000`
* Explore the interactive API Docs at: `http://localhost:5000/docs`

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
* The frontend will run at: `http://localhost:3000`

---

## 🌱 Future Roadmap
- [ ] Admin Dashboard UI for KYC/KYB approval
- [ ] Wallet Integration (MetaMask, WalletConnect) on the Frontend
- [ ] Smart Contract Deployment to an L2 testnet (e.g., Arbitrum Sepolia, Base Goerli) for low-gas voting.
- [ ] Production Deployment (Render / Vercel)
