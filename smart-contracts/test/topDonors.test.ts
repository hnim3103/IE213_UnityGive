import { expect } from "chai";
import { ethers } from "hardhat";
import { UnityGive } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("UnityGive - Top Donors Logic", function () {
  let unityGive: UnityGive;
  let admin: SignerWithAddress;
  let org: SignerWithAddress;
  let donors: SignerWithAddress[];
  let campaignId: number;

  beforeEach(async function () {
    [admin, org, ...donors] = await ethers.getSigners();

    const UnityGiveFactory = await ethers.getContractFactory("UnityGive");
    unityGive = (await UnityGiveFactory.deploy()) as UnityGive;

    // Register a dummy campaign with a large goal to prevent early completion
    const goalAmount = ethers.parseEther("100");
    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24h from now
    const milestoneAmounts = [ethers.parseEther("50"), ethers.parseEther("50")];
    
    const tx = await unityGive.connect(admin).registerCampaign(
      "mongo-id-123",
      org.address,
      goalAmount,
      [], // No manual council for this test
      1,  // Threshold
      milestoneAmounts,
      deadline
    );
    const receipt = await tx.wait();
    // In Hardhat, we can find the ID from the event
    campaignId = 0; // First campaign
  });

  it("Should track top 5 donors accurately", async function () {
    // 6 donors donate different amounts
    for (let i = 0; i < 6; i++) {
      const amount = ethers.parseEther((i + 1).toString());
      await unityGive.connect(donors[i]).donate(campaignId, { value: amount });
      console.log(`Donor ${i} (${donors[i].address}) donated ${i + 1} ETH`);
    }

    const topList = [];
    for (let i = 0; i < 5; i++) {
      const addr = await unityGive.topDonors(campaignId, i);
      topList.push(addr);
      console.log(`Top ${i}: ${addr}`);
    }

    // Expected order (Highest first): Donor 5, 4, 3, 2, 1
    // Let's verify each one manually to see where it breaks
    expect(topList[0], "Top 0 should be Donor 5").to.equal(donors[5].address);
    expect(topList[1], "Top 1 should be Donor 4").to.equal(donors[4].address);
    expect(topList[2], "Top 2 should be Donor 3").to.equal(donors[3].address);
    expect(topList[3], "Top 3 should be Donor 2").to.equal(donors[2].address);
    expect(topList[4], "Top 4 should be Donor 1").to.equal(donors[1].address);
    
    // Donor 0 should NOT be in the list
    expect(topList).to.not.include(donors[0].address);
  });

  it("Should update position when a donor increases their donation", async function () {
    // Initial state: D1: 1 ETH, D2: 2 ETH
    await unityGive.connect(donors[0]).donate(campaignId, { value: ethers.parseEther("1") });
    await unityGive.connect(donors[1]).donate(campaignId, { value: ethers.parseEther("2") });

    let first = await unityGive.topDonors(campaignId, 0);
    expect(first).to.equal(donors[1].address);

    // D1 donates 2 more ETH (Total 3 ETH), should move to #1
    await unityGive.connect(donors[0]).donate(campaignId, { value: ethers.parseEther("2") });

    first = await unityGive.topDonors(campaignId, 0);
    const second = await unityGive.topDonors(campaignId, 1);

    expect(first).to.equal(donors[0].address);
    expect(second).to.equal(donors[1].address);
  });

  it("Should verify that Hybrid Council includes Top Donors", async function () {
    // Donate enough to be top 1
    await unityGive.connect(donors[0]).donate(campaignId, { value: ethers.parseEther("1") });

    const isCouncil = await unityGive.isHybridCouncilMember(campaignId, donors[0].address);
    expect(isCouncil).to.be.true;

    // Someone who didn't donate should not be council
    const isNotCouncil = await unityGive.isHybridCouncilMember(campaignId, donors[5].address);
    expect(isNotCouncil).to.be.false;
  });
});
