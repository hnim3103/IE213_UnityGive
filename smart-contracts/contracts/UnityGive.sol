// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title UnityGive
 * @notice Manages fundraising campaigns on-chain.
 *         - Admin registers campaigns (linked to your MongoDB _id)
 *         - Donors send ETH via donate()
 *         - Admin releases funds to org when goal is met
 *         - Admin can cancel a campaign → donors get refunded
 */
contract UnityGive {

    // ─────────────────────────────────────────────
    //  DATA STRUCTURES
    // ─────────────────────────────────────────────

    struct Campaign {
        string  mongoId;          // Your MongoDB campaign _id (links on-chain ↔ off-chain)
        address payable orgWallet; // Organization's wallet — receives funds when goal is met
        uint256 goalAmount;       // Target in wei  (1 ETH = 1e18 wei)
        uint256 currentAmount;    // Total donated so far
        bool    isActive;         // false = cancelled or completed
        bool    isFunded;         // true = funds already released to org
    }

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public admin;   // Deployer — your backend wallet

    // campaignId (uint) → Campaign
    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    // campaignId → donor address → amount donated (for refunds)
    mapping(uint256 => mapping(address => uint256)) public donations;

    // ─────────────────────────────────────────────
    //  EVENTS  (emitted on-chain, your backend listens to these)
    // ─────────────────────────────────────────────

    event CampaignRegistered(uint256 indexed campaignId, string mongoId, uint256 goalAmount);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, address indexed orgWallet, uint256 amount);
    event CampaignCancelled(uint256 indexed campaignId);
    event RefundIssued(uint256 indexed campaignId, address indexed donor, uint256 amount);

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier campaignExists(uint256 campaignId) {
        require(campaignId < campaignCount, "Campaign does not exist");
        _;
    }

    modifier campaignIsActive(uint256 campaignId) {
        require(campaigns[campaignId].isActive, "Campaign is not active");
        _;
    }

    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    constructor() {
        admin = msg.sender; // The wallet that deploys this contract becomes admin
    }

    // ─────────────────────────────────────────────
    //  ADMIN FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Register a new campaign on-chain.
     *         Call this from your backend when a campaign is created in MongoDB.
     * @param mongoId      The MongoDB _id string of the campaign
     * @param orgWallet    The organization's ETH wallet address
     * @param goalAmount   Fundraising goal in wei
     */
    function registerCampaign(
        string memory mongoId,
        address payable orgWallet,
        uint256 goalAmount
    ) external onlyAdmin returns (uint256) {
        require(orgWallet != address(0), "Invalid org wallet");
        require(goalAmount > 0, "Goal must be greater than 0");

        uint256 campaignId = campaignCount;

        campaigns[campaignId] = Campaign({
            mongoId:       mongoId,
            orgWallet:     orgWallet,
            goalAmount:    goalAmount,
            currentAmount: 0,
            isActive:      true,
            isFunded:      false
        });

        campaignCount++;

        emit CampaignRegistered(campaignId, mongoId, goalAmount);
        return campaignId;
    }

    /**
     * @notice Release collected funds to the organization wallet.
     *         Call this from your backend when a campaign is completed.
     * @param campaignId  The on-chain campaign ID
     */
    function releaseFunds(uint256 campaignId)
        external
        onlyAdmin
        campaignExists(campaignId)
        campaignIsActive(campaignId)
    {
        Campaign storage c = campaigns[campaignId];
        require(!c.isFunded, "Funds already released");
        require(c.currentAmount > 0, "Nothing to release");

        uint256 amount = c.currentAmount;
        c.isFunded  = true;
        c.isActive  = false;

        c.orgWallet.transfer(amount);

        emit FundsReleased(campaignId, c.orgWallet, amount);
    }

    /**
     * @notice Cancel a campaign. Donors can then call refund() to get their ETH back.
     * @param campaignId  The on-chain campaign ID
     */
    function cancelCampaign(uint256 campaignId)
        external
        onlyAdmin
        campaignExists(campaignId)
        campaignIsActive(campaignId)
    {
        campaigns[campaignId].isActive = false;
        emit CampaignCancelled(campaignId);
    }

    // ─────────────────────────────────────────────
    //  DONOR FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Donate ETH to a campaign. Called by the donor via MetaMask.
     * @param campaignId  The on-chain campaign ID
     */
    function donate(uint256 campaignId)
        external
        payable
        campaignExists(campaignId)
        campaignIsActive(campaignId)
    {
        require(msg.value > 0, "Donation must be greater than 0");

        campaigns[campaignId].currentAmount += msg.value;
        donations[campaignId][msg.sender]   += msg.value;

        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    /**
     * @notice Claim a refund after a campaign is cancelled.
     *         Donors call this themselves from the frontend.
     * @param campaignId  The on-chain campaign ID
     */
    function refund(uint256 campaignId)
        external
        campaignExists(campaignId)
    {
        Campaign storage c = campaigns[campaignId];
        require(!c.isActive, "Campaign is still active");
        require(!c.isFunded, "Funds already released to org, no refund possible");

        uint256 amount = donations[campaignId][msg.sender];
        require(amount > 0, "No donation to refund");

        // Zero out before transfer to prevent re-entrancy attacks
        donations[campaignId][msg.sender] = 0;
        c.currentAmount -= amount;

        payable(msg.sender).transfer(amount);

        emit RefundIssued(campaignId, msg.sender, amount);
    }

    // ─────────────────────────────────────────────
    //  VIEW FUNCTIONS  (free to call, no gas)
    // ─────────────────────────────────────────────

    /// @notice Get full details of a campaign
    function getCampaign(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (Campaign memory)
    {
        return campaigns[campaignId];
    }

    /// @notice Check how much a specific donor has given to a campaign
    function getDonorAmount(uint256 campaignId, address donor)
        external
        view
        returns (uint256)
    {
        return donations[campaignId][donor];
    }

    /// @notice Check if a campaign has reached its goal
    function isGoalReached(uint256 campaignId)
        external
        view
        campaignExists(campaignId)
        returns (bool)
    {
        Campaign storage c = campaigns[campaignId];
        return c.currentAmount >= c.goalAmount;
    }
}
