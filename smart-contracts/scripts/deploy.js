const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const UnityGive = await ethers.getContractFactory("UnityGive");
  const unityGive = await UnityGive.deploy();
  await unityGive.waitForDeployment();

  console.log("UnityGive deployed to:", await unityGive.getAddress());

  // ─────────────────────────────────────────────
  // CREATE A SAMPLE CAMPAIGN AFTER DEPLOYMENT
  // ─────────────────────────────────────────────
  console.log("Creating a sample campaign for demonstration...");

  const mongoId = "demo-campaign-001";
  const orgWallet = deployer.address;                    // Using deployer as organization wallet for demo
  const goalAmount = ethers.parseEther("10.0");          // 10 ETH total goal
  const councilMembers = [deployer.address];             // Single council member for easy testing
  const requiredVotes = 1;                               // Requires 1 vote to approve milestone
  const milestoneAmounts = [
    ethers.parseEther("4.0"),                            // Milestone 1: 4 ETH
    ethers.parseEther("6.0")                             // Milestone 2: 6 ETH
  ];
  
  // Set deadline to 30 days from now
  const latestBlock = await ethers.provider.getBlock("latest");
  const deadline = latestBlock.timestamp + 86400 * 30;   // 30 days in seconds

  const tx = await unityGive.registerCampaign(
    mongoId,
    orgWallet,
    goalAmount,
    councilMembers,
    requiredVotes,
    milestoneAmounts,
    deadline
  );

  await tx.wait();

  console.log("Sample campaign created successfully with ID: 0");
  console.log("Campaign Deadline:", new Date(deadline * 1000).toLocaleString());

  console.log("\n✅ Deployment and sample campaign creation completed successfully!");
  console.log("Contract Address:", await unityGive.getAddress());
  console.log("Sample Campaign ID: 0");
  console.log("You can now interact with the contract using this address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });