const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const UnityGive = await ethers.getContractFactory("UnityGive");
  const unityGive = await UnityGive.deploy();
  await unityGive.waitForDeployment();

  console.log("UnityGive deployed to:", await unityGive.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
