import hre from "hardhat";
import { expect } from "chai";

// Hardhat 3: create a single network connection shared across all tests
const { ethers } = await hre.network.connect();

describe("UnityGive", function () {
  let contract: any;
  let admin: any;
  let org: any;
  let donor1: any;
  let donor2: any;

  const GOAL = ethers.parseEther("1"); // 1 ETH goal
  const MONGO_ID = "664f1b2c9a1e2d3f4a5b6c7e";

  beforeEach(async () => {
    [admin, org, donor1, donor2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("UnityGive");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ─── registerCampaign ───────────────────────────────────────
  describe("registerCampaign", () => {
    it("admin can register a campaign", async () => {
      await expect(contract.registerCampaign(MONGO_ID, org.address, GOAL))
        .to.emit(contract, "CampaignRegistered")
        .withArgs(0, MONGO_ID, GOAL);

      const c = await contract.getCampaign(0);
      expect(c.mongoId).to.equal(MONGO_ID);
      expect(c.goalAmount).to.equal(GOAL);
      expect(c.isActive).to.be.true;
    });

    it("non-admin cannot register a campaign", async () => {
      await expect(
        contract.connect(donor1).registerCampaign(MONGO_ID, org.address, GOAL)
      ).to.be.revertedWith("Only admin can call this");
    });
  });

  // ─── donate ─────────────────────────────────────────────────
  describe("donate", () => {
    beforeEach(async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);
    });

    it("donor can donate ETH", async () => {
      const amount = ethers.parseEther("0.5");
      await expect(contract.connect(donor1).donate(0, { value: amount }))
        .to.emit(contract, "DonationReceived")
        .withArgs(0, donor1.address, amount);

      const c = await contract.getCampaign(0);
      expect(c.currentAmount).to.equal(amount);
    });

    it("cannot donate 0 ETH", async () => {
      await expect(
        contract.connect(donor1).donate(0, { value: 0 })
      ).to.be.revertedWith("Donation must be greater than 0");
    });

    it("isGoalReached returns true when goal is met", async () => {
      await contract.connect(donor1).donate(0, { value: GOAL });
      expect(await contract.isGoalReached(0)).to.be.true;
    });
  });

  // ─── releaseFunds ────────────────────────────────────────────
  describe("releaseFunds", () => {
    it("admin can release funds to org wallet", async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);
      await contract.connect(donor1).donate(0, { value: GOAL });

      const orgBalanceBefore = await ethers.provider.getBalance(org.address);
      await expect(contract.releaseFunds(0))
        .to.emit(contract, "FundsReleased")
        .withArgs(0, org.address, GOAL);

      const orgBalanceAfter = await ethers.provider.getBalance(org.address);
      expect(orgBalanceAfter - orgBalanceBefore).to.equal(GOAL);
    });

    it("cannot release funds twice", async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);
      await contract.connect(donor1).donate(0, { value: GOAL });
      await contract.releaseFunds(0);

      await expect(contract.releaseFunds(0)).to.be.revertedWith(
        "Campaign is not active"
      );
    });
  });

  // ─── cancelCampaign & refund ─────────────────────────────────
  describe("cancelCampaign + refund", () => {
    it("donors get refunded after cancellation", async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);

      const donation = ethers.parseEther("0.3");
      await contract.connect(donor1).donate(0, { value: donation });
      await contract.cancelCampaign(0);

      const balanceBefore = await ethers.provider.getBalance(donor1.address);
      const tx = await contract.connect(donor1).refund(0);
      const receipt = await tx.wait();
      const gasCost = BigInt(receipt!.gasUsed) * BigInt(receipt!.gasPrice);
      const balanceAfter = await ethers.provider.getBalance(donor1.address);

      expect(balanceAfter - balanceBefore + gasCost).to.equal(donation);
    });

    it("cannot refund from an active campaign", async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);
      await contract.connect(donor1).donate(0, { value: ethers.parseEther("0.1") });

      await expect(contract.connect(donor1).refund(0)).to.be.revertedWith(
        "Campaign is still active"
      );
    });

    it("cannot refund if no donation was made", async () => {
      await contract.registerCampaign(MONGO_ID, org.address, GOAL);
      await contract.cancelCampaign(0);

      await expect(contract.connect(donor2).refund(0)).to.be.revertedWith(
        "No donation to refund"
      );
    });
  });
});