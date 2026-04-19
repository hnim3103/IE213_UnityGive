import { ethers } from "hardhat";

async function main() {
  console.log("Deploying UnityGive contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with wallet:", deployer.address);
  console.log(
    "Wallet balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const UnityGive = await ethers.getContractFactory("UnityGive");
  const contract = await UnityGive.deploy(deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ UnityGive deployed to:", address);
  console.log("");
  console.log("👉 Copy this into your backend .env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});