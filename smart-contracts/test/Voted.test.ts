import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Voted - Top 5 Donor Multi-Sig Campaign Disbursement", function () {
  let voted;
  let owner;
  let donor1, donor2, donor3, donor4, donor5, outsider;
  let campaignId = 1;
  let milestoneIndex = 0;
  let amount;
  let recipientWallet;
  let top5HashDigest;
  let messageHash;

  const SIGNATURE_DEADLINE_SECONDS = 7 * 24 * 60 * 60; // 7 days
  const REQUIRED_SIGNATURES = 5;

  beforeEach(async function () {
    // Get signers
    [owner, donor1, donor2, donor3, donor4, donor5, outsider] = await ethers.getSigners();
    recipientWallet = owner.address;

    // Deploy Voted contract
    const Voted = await ethers.getContractFactory("Voted");
    voted = await Voted.deploy();

    // Setup test data
    amount = ethers.parseEther("10");

    // Generate a mock Poseidon hash for top 5 donors
    // In real scenario, this would be computed off-chain using circomlib
    const topDonorAddresses = [donor1.address, donor2.address, donor3.address, donor4.address, donor5.address];
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "address", "address", "address", "address"],
      topDonorAddresses
    );
    top5HashDigest = ethers.keccak256(encoded); // Simplified hash for testing

    // Compute the message that donors should sign
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const messageData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "address", "uint256", "uint256", "bytes32"],
      [chainId, voted.getAddress(), campaignId, milestoneIndex, top5HashDigest]
    );
    messageHash = ethers.keccak256(messageData);
  });

  describe("Milestone Registration", function () {
    it("Should register a campaign milestone with correct parameters", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      const details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.top5HashDigest).to.equal(top5HashDigest);
      expect(details.amount).to.equal(amount);
      expect(details.recipient).to.equal(recipientWallet);
      expect(details.signatureCount).to.equal(0);
      expect(details.requiredSignatures).to.equal(REQUIRED_SIGNATURES);
      expect(details.disbursed).to.be.false;
    });

    it("Should set correct deadline when registering milestone", async function () {
      const blockBefore = await ethers.provider.getBlock("latest");
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );
      const blockAfter = await ethers.provider.getBlock("latest");

      const details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.deadlineTimestamp).to.be.closeTo(
        blockAfter.timestamp + SIGNATURE_DEADLINE_SECONDS,
        2 // 2 second tolerance for block mining time
      );
    });

    it("Should reject duplicate milestone registration", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      await expect(
        voted.registerCampaignMilestone(
          campaignId,
          milestoneIndex,
          top5HashDigest,
          amount,
          recipientWallet
        )
      ).to.be.revertedWith("Milestone already registered");
    });

    it("Should reject milestone with zero amount", async function () {
      await expect(
        voted.registerCampaignMilestone(
          campaignId,
          milestoneIndex,
          top5HashDigest,
          0,
          recipientWallet
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject milestone with zero address recipient", async function () {
      await expect(
        voted.registerCampaignMilestone(
          campaignId,
          milestoneIndex,
          top5HashDigest,
          amount,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid recipient address");
    });
  });

  describe("Signature Submission", function () {
    beforeEach(async function () {
      // Register milestone before each test
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      // Send ETH to contract for disbursement
      await owner.sendTransaction({
        to: voted.getAddress(),
        value: amount
      });
    });

    it("Should accept valid signature from top 5 donor", async function () {
      // Sign the message
      const sig = await donor1.signMessage(ethers.toBeArray(messageHash));

      // Submit signature
      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);

      const details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.signatureCount).to.equal(1);
      expect(await voted.hasSigned(campaignId, milestoneIndex, donor1.address)).to.be.true;
    });

    it("Should reject duplicate signature from same address", async function () {
      const sig = await donor1.signMessage(ethers.toBeArray(messageHash));

      // First signature should succeed
      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);

      // Duplicate signature should fail
      await expect(
        voted.submitSignature(campaignId, milestoneIndex, messageHash, sig)
      ).to.be.revertedWith("Already signed by this address");
    });

    it("Should reject signature after deadline", async function () {
      // Move time forward past the deadline
      await time.increase(SIGNATURE_DEADLINE_SECONDS + 1);

      const sig = await donor1.signMessage(ethers.toBeArray(messageHash));

      await expect(
        voted.submitSignature(campaignId, milestoneIndex, messageHash, sig)
      ).to.be.revertedWith("Signature collection deadline passed");
    });

    it("Should reject invalid signature", async function () {
      // Create a fake signature
      const fakeSig = "0x" + "00".repeat(65);

      await expect(
        voted.submitSignature(campaignId, milestoneIndex, messageHash, fakeSig)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should increment signature count correctly", async function () {
      const sig1 = await donor1.signMessage(ethers.toBeArray(messageHash));
      const sig2 = await donor2.signMessage(ethers.toBeArray(messageHash));
      const sig3 = await donor3.signMessage(ethers.toBeArray(messageHash));

      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig1);
      let details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.signatureCount).to.equal(1);

      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig2);
      details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.signatureCount).to.equal(2);

      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig3);
      details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.signatureCount).to.equal(3);
    });
  });

  describe("Auto-Disbursement", function () {
    beforeEach(async function () {
      // Register milestone
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      // Send ETH to contract
      await owner.sendTransaction({
        to: voted.getAddress(),
        value: amount
      });
    });

    it("Should auto-disburse funds when 5 signatures collected", async function () {
      const recipientBalanceBefore = await ethers.provider.getBalance(recipientWallet);

      // Submit 5 signatures
      for (let i = 0; i < 5; i++) {
        const donor = [donor1, donor2, donor3, donor4, donor5][i];
        const sig = await donor.signMessage(ethers.toBeArray(messageHash));
        await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);
      }

      // Check that funds were disbursed
      const details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.disbursed).to.be.true;

      const recipientBalanceAfter = await ethers.provider.getBalance(recipientWallet);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(amount);
    });

    it("Should emit FundsReleased event on auto-disbursement", async function () {
      // Submit 4 signatures (no event yet)
      for (let i = 0; i < 4; i++) {
        const donor = [donor1, donor2, donor3, donor4][i];
        const sig = await donor.signMessage(ethers.toBeArray(messageHash));
        await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);
      }

      // 5th signature should trigger disbursement and event
      const sig5 = await donor5.signMessage(ethers.toBeArray(messageHash));
      const tx = voted.submitSignature(campaignId, milestoneIndex, messageHash, sig5);

      await expect(tx)
        .to.emit(voted, "FundsReleased")
        .withArgs(
          ethers.id(ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256", "uint256"],
            [campaignId, milestoneIndex]
          )),
          campaignId,
          recipientWallet,
          amount
        );
    });

    it("Should prevent signing after funds are disbursed", async function () {
      // Submit 5 signatures to disburse
      for (let i = 0; i < 5; i++) {
        const donor = [donor1, donor2, donor3, donor4, donor5][i];
        const sig = await donor.signMessage(ethers.toBeArray(messageHash));
        await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);
      }

      // Try to submit another signature - should fail
      const extraSig = await outsider.signMessage(ethers.toBeArray(messageHash));
      await expect(
        voted.submitSignature(campaignId, milestoneIndex, messageHash, extraSig)
      ).to.be.revertedWith("Funds already disbursed");
    });
  });

  describe("Milestone Expiration", function () {
    it("Should mark milestone as expired after deadline without 5 signatures", async function () {
      // Register milestone
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      // Submit only 2 signatures
      const sig1 = await donor1.signMessage(ethers.toBeArray(messageHash));
      const sig2 = await donor2.signMessage(ethers.toBeArray(messageHash));
      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig1);
      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig2);

      // Move time past deadline
      await time.increase(SIGNATURE_DEADLINE_SECONDS + 1);

      // Mark as expired
      await voted.markMilestoneExpired(campaignId, milestoneIndex);

      const details = await voted.getMilestoneDetails(campaignId, milestoneIndex);
      expect(details.disbursed).to.be.true;
    });

    it("Should emit MilestoneExpired event", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      await time.increase(SIGNATURE_DEADLINE_SECONDS + 1);

      const tx = voted.markMilestoneExpired(campaignId, milestoneIndex);
      await expect(tx)
        .to.emit(voted, "MilestoneExpired");
    });

    it("Should prevent expiration before deadline", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      // Try to expire without passing deadline
      await expect(
        voted.markMilestoneExpired(campaignId, milestoneIndex)
      ).to.be.revertedWith("Deadline not passed yet");
    });
  });

  describe("Events", function () {
    it("Should emit MilestoneRegistered event", async function () {
      const tx = voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      await expect(tx)
        .to.emit(voted, "MilestoneRegistered")
        .withArgs(
          campaignId,
          milestoneIndex,
          top5HashDigest,
          amount,
          recipientWallet
        );
    });

    it("Should emit SignatureSubmitted event for each signature", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      const sig1 = await donor1.signMessage(ethers.toBeArray(messageHash));

      const tx = voted.submitSignature(campaignId, milestoneIndex, messageHash, sig1);
      await expect(tx)
        .to.emit(voted, "SignatureSubmitted")
        .withArgs(
          ethers.id(ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256", "uint256"],
            [campaignId, milestoneIndex]
          )),
          donor1.address,
          1
        );
    });
  });

  describe("View Functions", function () {
    it("Should return correct milestone count", async function () {
      expect(await voted.getMilestoneCount()).to.equal(0);

      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      expect(await voted.getMilestoneCount()).to.equal(1);

      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex + 1,
        top5HashDigest,
        amount,
        recipientWallet
      );

      expect(await voted.getMilestoneCount()).to.equal(2);
    });

    it("Should get milestone ID by index", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      const milestoneId = await voted.getMilestoneId(0);
      expect(milestoneId).to.not.equal(ethers.ZeroHash);
    });

    it("Should check if address has signed", async function () {
      await voted.registerCampaignMilestone(
        campaignId,
        milestoneIndex,
        top5HashDigest,
        amount,
        recipientWallet
      );

      expect(await voted.hasSigned(campaignId, milestoneIndex, donor1.address)).to.be.false;

      const sig = await donor1.signMessage(ethers.toBeArray(messageHash));
      await voted.submitSignature(campaignId, milestoneIndex, messageHash, sig);

      expect(await voted.hasSigned(campaignId, milestoneIndex, donor1.address)).to.be.true;
    });
  });

  describe("Receive ETH", function () {
    it("Should accept ETH transfers", async function () {
      const votedAddress = await voted.getAddress();
      const balanceBefore = await ethers.provider.getBalance(votedAddress);

      await owner.sendTransaction({
        to: votedAddress,
        value: ethers.parseEther("5")
      });

      const balanceAfter = await ethers.provider.getBalance(votedAddress);
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("5"));
    });
  });
});
