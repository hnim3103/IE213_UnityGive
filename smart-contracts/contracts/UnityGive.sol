// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Minimal ECDSA utilities (adapted for Remix / local compile convenience)
library ECDSA {
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);
        // solhint-disable-next-line no-inline-assembly
        address signer;
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x1900) // not used but keeps alignment
        }
        // ecrecover
        signer = ecrecover(hash, v, r, s);
        return signer;
    }

    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
}

/**
 * @title UnityGive (Multi-Sig & Milestone DAO)
 * @notice Manages crowdfunding campaigns with milestone-based funding.
 * - Admin registers campaigns and sets the multi-sig council
 * - Donors send ETH
 * - Organizations upload IPFS Proof of Impact for each milestone
 * - Council members vote "Yes". If votes >= required threshold, ETH is released.
 */
contract UnityGive is ReentrancyGuard {
    // ─────────────────────────────────────────────
    // DATA STRUCTURES
    // ─────────────────────────────────────────────
    struct Milestone {
        uint256 amount; // Wei amount to be unlocked for this phase
        string ipfsEvidence; // CID to Proof of Impact (uploaded by org)
        uint256 approvalCount; // Number of "Yes" votes from council
        bool isApproved; // True if votes >= required
        bool isFunded; // True if funds successfully transferred to org
    }
    struct Campaign {
        string mongoId;
        address payable orgWallet;
        uint256 totalGoalAmount;
        uint256 currentAmount; // Total ETH donated
        uint256 requiredVotes; // Multi-Sig threshold (e.g. 3 out of 5)
        uint256 deadline; // Unix timestamp - added for time-bound fundraising
        bool isActive;
        bool isSuccessful; // True if goal is reached (by donation or top-up)
    }
    // ─────────────────────────────────────────────
    // STATE VARIABLES
    // ─────────────────────────────────────────────
    address public admin;
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    // top 5 donors per campaign (highest contributors)
    mapping(uint256 => address[5]) public topDonors;
    // fee recipient (platform fees forwarded here)
    address payable public immutable feeRecipient = payable(0x2F9DD632494D91Fe3e8772cA331A3c067BA06aEF);
    // fee in basis points (parts per 10,000). Default 50 = 0.5%
    uint16 public feeBps = 50;
  
    // campaignId -> milestone array
    mapping(uint256 => Milestone[]) public campaignMilestones;
  
    // campaignId -> user address -> has role
    mapping(uint256 => mapping(address => bool)) public isCouncilMember;
  
    // campaignId -> milestoneIndex -> council address -> has voted
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;
    // campaignId -> donor address -> amount donated (for refunds)
    mapping(uint256 => mapping(address => uint256)) public donations;
    // ─────────────────────────────────────────────
    // EVENTS
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
    // MODIFIERS
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
    modifier campaignNotExpired(uint256 campaignId) {
        require(block.timestamp <= campaigns[campaignId].deadline, "Campaign has expired");
        _;
    }
    // ─────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────
    constructor() {
        admin = msg.sender;
    }
    // ─────────────────────────────────────────────
    // ADMIN FUNCTIONS
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
        uint256[] memory milestoneAmounts,
        uint256 deadline
    ) external onlyAdmin returns (uint256) {
        require(orgWallet != address(0), "Invalid org wallet");
        require(goalAmount > 0, "Goal must be > 0");
        require(councilMembers.length > 0, "Must have council members");
        require(requiredVotes > 0 && requiredVotes <= councilMembers.length, "Invalid vote threshold");
        require(milestoneAmounts.length > 0, "Must have at least one milestone");
        require(deadline > block.timestamp, "Deadline must be in the future");

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
            deadline: deadline,
            isActive: true,
            isSuccessful: false
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
    // DONOR FUNCTIONS
    // ─────────────────────────────────────────────
    function donate(uint256 campaignId)
        external
        payable
        campaignExists(campaignId)
        campaignIsActive(campaignId)
        campaignNotExpired(campaignId)
    {
        require(msg.value > 0, "Must send > 0 ETH");

        Campaign storage c = campaigns[campaignId];
        uint256 toCampaign = msg.value;
        uint256 excess = 0;

        if (c.currentAmount + toCampaign > c.totalGoalAmount) {
            excess = (c.currentAmount + toCampaign) - c.totalGoalAmount;
            toCampaign = toCampaign - excess;
        }

        // Compute platform fee only on the portion that goes to campaign
        uint256 fee = (toCampaign * feeBps) / 10000;
        uint256 added = toCampaign - fee;

        // Update state with net amount
        if (added > 0) {
            c.currentAmount += added;
            donations[campaignId][msg.sender] += added;
            emit DonationReceived(campaignId, msg.sender, added);

            // Forward platform fee immediately to feeRecipient (reduces on-chain bookkeeping)
            if (fee > 0) {
                (bool fOk, ) = feeRecipient.call{value: fee}("");
                require(fOk, "Fee transfer failed");
            }

            // Update top donors list (keeps only 5 entries)
            _updateTopDonors(campaignId, msg.sender);
        }

        // Refund any excess back to donor
        if (excess > 0) {
            (bool rOk, ) = payable(msg.sender).call{value: excess}("");
            require(rOk, "Refund failed");
        }

        // Mark campaign as successful if goal is reached
        if (c.currentAmount >= c.totalGoalAmount && !c.isSuccessful) {
            c.isSuccessful = true;
        }
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
    // ORGANIZATION FUNCTIONS
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
    /**
     * @notice Organization tops up the campaign if deadline passed and goal not reached
     */
    function topUpCampaign(uint256 campaignId)
        external
        payable
        campaignExists(campaignId)
        onlyOrganization(campaignId)
    {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp > c.deadline, "Campaign has not expired yet");
        require(c.currentAmount < c.totalGoalAmount, "Campaign already reached goal");

        uint256 needed = c.totalGoalAmount - c.currentAmount;
        require(msg.value >= needed, "Must top up at least the remaining amount");

        uint256 excess = msg.value - needed;

        c.currentAmount = c.totalGoalAmount;
        c.isSuccessful = true;

        emit DonationReceived(campaignId, msg.sender, needed);

        if (excess > 0) {
            (bool success, ) = c.orgWallet.call{value: excess}("");
            require(success, "Failed to refund excess");
        }

        // Release any pending approved milestones after top-up
        _releasePendingMilestones(campaignId);
    }
    // ─────────────────────────────────────────────
    // INTERNAL HELPER FUNCTIONS
    // ─────────────────────────────────────────────
    /**
     * @notice Internal function to release pending milestones that have been approved but lacked funds
     * @dev Called after donate() and topUpCampaign() to auto-release funds to pending milestones in sequential order
     */
    function _releasePendingMilestones(uint256 /* campaignId */) private pure {
        // Milestone releases must be executed via `releaseMilestoneWithSignatures` to ensure
        // signatures from top-5 donors are present. This helper is intentionally a no-op
        // to prevent automatic transfers but keeps the original call signature.
        return;
    }
    // ─────────────────────────────────────────────
    // MULTI-SIG COUNCIL FUNCTIONS
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

        // If threshold reached, mark approved (final release still requires top-5 donor signatures)
        if (m.approvalCount >= campaigns[campaignId].requiredVotes) {
            m.isApproved = true;
            emit MilestoneApproved(campaignId, milestoneIndex);
        }
    }

    // ─────────────────────────────────────────────
    // TOP DONORS & SIGNATURE-BASED RELEASE
    // ─────────────────────────────────────────────
    function _updateTopDonors(uint256 campaignId, address donor) private {
        address[5] storage arr = topDonors[campaignId];
        uint256 donorAmt = donations[campaignId][donor];

        // If already present, remove it (we will reinsert in order)
        int256 existing = -1;
        for (uint i = 0; i < 5; i++) {
            if (arr[i] == donor) { existing = int256(i); break; }
        }
        if (existing >= 0) {
            uint idx = uint(existing);
            for (uint j = idx; j < 4; j++) {
                arr[j] = arr[j+1];
            }
            arr[4] = address(0);
        }

        // Insert donor into correct position (simple insertion sort into 5-slot array)
        for (uint i = 0; i < 5; i++) {
            // empty slot -> insert here
            if (arr[i] == address(0)) {
                arr[i] = donor;
                return;
            }
            uint256 compAmt = donations[campaignId][arr[i]];
            if (donorAmt > compAmt) {
                // shift right
                for (uint j = 4; j > i; j--) {
                    arr[j] = arr[j-1];
                }
                arr[i] = donor;
                return;
            }
        }
    }

    /**
     * @notice Release milestone funds if all top-5 donors signed the release message
     * @param campaignId campaign id
     * @param milestoneIndex milestone index to release
     * @param signatures array of 65-byte signatures from top-5 donors (order-insensitive)
     */
    function releaseMilestoneWithSignatures(uint256 campaignId, uint256 milestoneIndex, bytes[] calldata signatures)
        external
        nonReentrant
        campaignExists(campaignId)
        campaignIsActive(campaignId)
    {
        require(milestoneIndex < campaignMilestones[campaignId].length, "Invalid milestone");
        require(signatures.length == 5, "Require 5 signatures");

        Milestone storage m = campaignMilestones[campaignId][milestoneIndex];
        require(!m.isFunded, "Already funded");
        require(bytes(m.ipfsEvidence).length > 0, "Proof of Impact not uploaded");

        // Ensure top 5 donors exist
        address[5] storage top = topDonors[campaignId];
        require(top[4] != address(0), "Top-5 donors not set yet");

        bytes32 hash = keccak256(abi.encodePacked(address(this), campaignId, milestoneIndex, m.amount));
        bytes32 ethHash = ECDSA.toEthSignedMessageHash(hash);

        // Verify signatures correspond to the set of top donors (unique, all present)
        // Use local memory map via temporary boolean array; since top list is 5, small nested checks are fine.
        bool[5] memory seen;
        for (uint i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(ethHash, signatures[i]);
            require(signer != address(0), "Invalid signature");
            bool matched = false;
            for (uint j = 0; j < 5; j++) {
                if (signer == top[j]) {
                    require(!seen[j], "Duplicate signature");
                    seen[j] = true;
                    matched = true;
                    break;
                }
            }
            require(matched, "Signer not in top-5 donors");
        }

        // All signatures verified; mark approved and transfer funds
        m.isApproved = true;
        if (campaigns[campaignId].currentAmount >= m.amount) {
            m.isFunded = true;
            campaigns[campaignId].currentAmount -= m.amount;
            (bool success, ) = campaigns[campaignId].orgWallet.call{value: m.amount}("");
            require(success, "ETH transfer to organization failed");
            emit FundsReleased(campaignId, milestoneIndex, campaigns[campaignId].orgWallet, m.amount);
        } else {
            revert("Insufficient campaign balance for milestone");
        }
    }
    // ─────────────────────────────────────────────
    // VIEW FUNCTIONS
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