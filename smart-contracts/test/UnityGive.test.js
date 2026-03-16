const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UnityGive Multi-Sig & Milestone Contract", function () {
    let UnityGive, unityGive;
    let admin, orgWallet, donor1, donor2, council1, council2, council3;

    beforeEach(async function () {
        [admin, orgWallet, donor1, donor2, council1, council2, council3] = await ethers.getSigners();
        UnityGive = await ethers.getContractFactory("UnityGive");
        unityGive = await UnityGive.deploy();
    });

    it("Should register a campaign and set council correctly", async function () {
        const mongoId = "60c72b2f9b1d8b001c8e4b5a";
        const goalAmount = ethers.parseEther("5.0"); // 5 ETH total
        const requiredVotes = 2; // 2 out of 3
        const councilMembers = [council1.address, council2.address, council3.address];

        // Milestones: Phase 1 (2 ETH), Phase 2 (3 ETH)
        const milestoneAmounts = [ethers.parseEther("2.0"), ethers.parseEther("3.0")];

        // Connect as admin and explicitly pass the arrays
        const tx = await unityGive.connect(admin).registerCampaign(
            mongoId,
            orgWallet.address,
            goalAmount,
            councilMembers,
            requiredVotes,
            milestoneAmounts
        );

        await tx.wait();

        // Check if the campaign was stored properly
        const campaign = await unityGive.getCampaign(0);
        expect(campaign.totalGoalAmount).to.equal(goalAmount);
        expect(campaign.requiredVotes).to.equal(requiredVotes);

        // Check milestones length
        const mCount = await unityGive.getMilestonesCount(0);
        expect(mCount).to.equal(2n);
    });

    it("Should allow donations and release funds only after multi-sig approval", async function () {
        const goalAmount = ethers.parseEther("5.0");
        const councilMembers = [council1.address, council2.address, council3.address];
        const milestoneAmounts = [ethers.parseEther("2.0"), ethers.parseEther("3.0")];

        await unityGive.connect(admin).registerCampaign(
            "mongo123", orgWallet.address, goalAmount, councilMembers, 2, milestoneAmounts
        );

        // Donors send 3 ETH total
        await unityGive.connect(donor1).donate(0, { value: ethers.parseEther("2.0") });
        await unityGive.connect(donor2).donate(0, { value: ethers.parseEther("1.0") });

        let campaign = await unityGive.getCampaign(0);
        expect(campaign.currentAmount).to.equal(ethers.parseEther("3.0"));

        // Org uploads proof for Milestone 0
        await unityGive.connect(orgWallet).uploadProofOfImpact(0, 0, "ipfs://qm123...");

        // Council 1 votes
        await unityGive.connect(council1).voteApproveMilestone(0, 0);

        // Council 2 votes (this hits the threshold of 2)
        const tx = await unityGive.connect(council2).voteApproveMilestone(0, 0);

        // Expect FundsReleased event for Milestone 0 (2.0 ETH)
        await expect(tx).to.emit(unityGive, "FundsReleased").withArgs(0, 0, orgWallet.address, ethers.parseEther("2.0"));

        // Check the remaining balance
        campaign = await unityGive.getCampaign(0);
        expect(campaign.currentAmount).to.equal(ethers.parseEther("1.0")); // 3 ETH donated - 2 ETH released = 1 ETH left
    });
});
