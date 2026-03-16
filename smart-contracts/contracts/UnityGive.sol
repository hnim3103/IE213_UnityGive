// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title UnityGive (Multi-Sig & Milestone DAO)
 * @notice Manages crowdfunding campaigns with milestone-based funding.
 *         - Admin registers campaigns and sets the multi-sig council
 *         - Donors send ETH
 *         - Organizations upload IPFS Proof of Impact for each milestone
 *         - Council members vote "Yes". If votes >= required threshold, ETH is released.
 */
contract UnityGive is ReentrancyGuard {

    // ─────────────────────────────────────────────
    //  DATA STRUCTURES
    // ─────────────────────────────────────────────

    struct Milestone {
        uint256 amount;          // Wei amount to be unlocked for this phase
        string ipfsEvidence;     // CID to Proof of Impact (uploaded by org)
        uint256 approvalCount;   // Number of "Yes" votes from council
        bool isApproved;         // True if votes >= required
        bool isFunded;           // True if funds successfully transferred to org
    }

    struct Campaign {
        string mongoId;                
        address payable orgWallet;      
        uint256 totalGoalAmount;        
        uint256 currentAmount;         // Total ETH donated
        uint256 requiredVotes;         // Multi-Sig threshold (e.g. 3 out of 5)
        bool isActive;                  
    }

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public admin;

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    
    // campaignId -> milestone array
    mapping(uint256 => Milestone[]) public campaignMilestones;
    
    // campaignId -> user address -> has role
    mapping(uint256 => mapping(address => bool)) public isCouncilMember;
    
    // campaignId -> milestoneIndex -> council address -> has voted
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;

    // campaignId -> donor address -> amount donated (for refunds)
    mapping(uint256 => mapping(address => uint256)) public donations;

    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event CampaignRegistered(uint256 indexed campaignId, string mongoId, uint256 goalAmount, uint256 requiredVotes);
    event MilestoneAdded(uint256 indexed campaignId, uint256 milestoneIndex, uint256 amount);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event ProofUploaded(uint256 indexed campaignId, uint256 milestoneIndex, string ipfsCID);
    event Voted(uint256 indexed campaignId, uint256 milestoneIndex, address indexed voter);
    event MilestoneApproved(uint256 indexed campaignId, uint256 milestoneIndex);
    event FundsReleased(uint256 indexed campaignId, uint256 milestoneIndex, address indexed orgWallet, uint256 amount);
    event CampaignCancelled(uint256 indexed campaignId);
    event RefundIssued(uint256 indexed campaignId, address indexed donor, uint256 amount);

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only platform admin");
        _;
    }

    modifier onlyCouncilMember(uint256 campaignId) {
        require(isCouncilMember[campaignId][msg.sender], "Not a council member for this campaign");
        _;
    }

    modifier onlyOrganization(uint256 campaignId) {
        require(msg.sender == campaigns[campaignId].orgWallet, "Only campaign organization");
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
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    //  ADMIN FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Register a new campaign and assign the Multi-Sig Council
     */
    function registerCampaign(
        string memory mongoId,
        address payable orgWallet,
        uint256 goalAmount,
        address[] memory councilMembers,
        uint256 requiredVotes,
        uint256[] memory milestoneAmounts
    ) external onlyAdmin returns (uint256) {
        require(orgWallet != address(0), "Invalid org wallet");
        require(goalAmount > 0, "Goal must be > 0");
        require(councilMembers.length > 0, "Must have council members");
        require(requiredVotes > 0 && requiredVotes <= councilMembers.length, "Invalid vote threshold");
        require(milestoneAmounts.length > 0, "Must have at least one milestone");

        uint256 totalMilestonesWei = 0;
        for (uint i = 0; i < milestoneAmounts.length; i++) {
            totalMilestonesWei += milestoneAmounts[i];
        }
        require(totalMilestonesWei == goalAmount, "Sum of milestones must equal goal amount");

        uint256 campaignId = campaignCount;
        
        campaigns[campaignId] = Campaign({
            mongoId: mongoId,
            orgWallet: orgWallet,
            totalGoalAmount: goalAmount,
            currentAmount: 0,
            requiredVotes: requiredVotes,
            isActive: true
        });

        // Set council members
        for (uint i = 0; i < councilMembers.length; i++) {
            isCouncilMember[campaignId][councilMembers[i]] = true;
        }

        // Initialize milestones
        for (uint i = 0; i < milestoneAmounts.length; i++) {
            campaignMilestones[campaignId].push(Milestone({
                amount: milestoneAmounts[i],
                ipfsEvidence: "",
                approvalCount: 0,
                isApproved: false,
                isFunded: false
            }));
            emit MilestoneAdded(campaignId, i, milestoneAmounts[i]);
        }

        campaignCount++;
        emit CampaignRegistered(campaignId, mongoId, goalAmount, requiredVotes);
        return campaignId;
    }

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

    function donate(uint256 campaignId)
        external
        payable
        campaignExists(campaignId)
        campaignIsActive(campaignId)
    {
        require(msg.value > 0, "Must send > 0 ETH");

        campaigns[campaignId].currentAmount += msg.value;
        donations[campaignId][msg.sender] += msg.value;

        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    function refund(uint256 campaignId)
        external
        nonReentrant
        campaignExists(campaignId)
    {
        Campaign storage c = campaigns[campaignId];
        require(!c.isActive, "Campaign still active");

        uint256 amount = donations[campaignId][msg.sender];
        require(amount > 0, "No funds to refund");

        donations[campaignId][msg.sender] = 0;
        
        // Prevent underflow if some funds were already transferred out to an earlier milestone
        if (c.currentAmount >= amount) {
            c.currentAmount -= amount;
        } else {
            c.currentAmount = 0;
        }

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit RefundIssued(campaignId, msg.sender, amount);
    }

    // ─────────────────────────────────────────────
    //  ORGANIZATION FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Organization uploads Proof of Impact (IPFS hash) to request milestone unlock
     */
    function uploadProofOfImpact(uint256 campaignId, uint256 milestoneIndex, string memory ipfsCID)
        external
        campaignExists(campaignId)
        campaignIsActive(campaignId)
        onlyOrganization(campaignId)
    {
        require(milestoneIndex < campaignMilestones[campaignId].length, "Invalid milestone");
        Milestone storage m = campaignMilestones[campaignId][milestoneIndex];
        require(!m.isApproved, "Milestone already approved");
        require(bytes(ipfsCID).length > 0, "IPFS CID cannot be empty");

        m.ipfsEvidence = ipfsCID;
        emit ProofUploaded(campaignId, milestoneIndex, ipfsCID);
    }

    // ─────────────────────────────────────────────
    //  MULTI-SIG COUNCIL FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Council member votes to approve a specific milestone
     */
    function voteApproveMilestone(uint256 campaignId, uint256 milestoneIndex)
        external
        nonReentrant
        campaignExists(campaignId)
        campaignIsActive(campaignId)
        onlyCouncilMember(campaignId)
    {
        require(milestoneIndex < campaignMilestones[campaignId].length, "Invalid milestone index");
        Milestone storage m = campaignMilestones[campaignId][milestoneIndex];
        
        require(!m.isApproved, "Already approved");
        require(!m.isFunded, "Already funded");
        require(bytes(m.ipfsEvidence).length > 0, "Proof of Impact not uploaded yet");
        require(!hasVoted[campaignId][milestoneIndex][msg.sender], "You already voted");

        hasVoted[campaignId][milestoneIndex][msg.sender] = true;
        m.approvalCount += 1;

        emit Voted(campaignId, milestoneIndex, msg.sender);

        // If threshold reached, release funds
        Campaign storage c = campaigns[campaignId];
        if (m.approvalCount >= c.requiredVotes) {
            m.isApproved = true;
            emit MilestoneApproved(campaignId, milestoneIndex);

            // Execute funding transfer if contract has enough balance
            if (c.currentAmount >= m.amount) {
                m.isFunded = true;
                c.currentAmount -= m.amount;
                
                (bool success, ) = c.orgWallet.call{value: m.amount}("");
                require(success, "ETH transfer to Organization failed");

                emit FundsReleased(campaignId, milestoneIndex, c.orgWallet, m.amount);
            }
        }
    }

    // ─────────────────────────────────────────────
    //  VIEW FUNCTIONS
    // ─────────────────────────────────────────────

    function getCampaign(uint256 campaignId)
        external
        view
        returns (Campaign memory)
    {
        return campaigns[campaignId];
    }

    function getMilestone(uint256 campaignId, uint256 milestoneIndex)
        external
        view
        returns (Milestone memory)
    {
        return campaignMilestones[campaignId][milestoneIndex];
    }

    function getMilestonesCount(uint256 campaignId)
        external
        view
        returns (uint256)
    {
        return campaignMilestones[campaignId].length;
    }
}
