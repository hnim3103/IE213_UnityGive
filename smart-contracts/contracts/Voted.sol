// SPDX-License-Identifier: MIT

pragma solidity ^0.8.34;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

            address signer = ecrecover(hash, v, r, s);
            return signer;
        }

        function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
            return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        }
    }

contract Voted is ReentrancyGuard {
    // ============ ECDSA Signature Recovery ============

    // ============ Data Structures ============
    struct CampaignMilestone {
        uint256 campaignId;
        uint256 milestoneIndex;
        bytes32 top5HashDigest;                    // Poseidon hash of top 5 addresses (ZKP proof)
        mapping(address => bytes) signatures;       // Collected signatures per signer
        mapping(address => bool) hasSignedAlready;  // Track signers to prevent duplicates
        uint256 signatureCount;                     // Current signature count
        uint256 requiredSignatures;                 // Threshold (always 5)
        bool disbursed;                             // Fund already released
        uint256 amount;                             // Amount to disburse in Wei
        address payable recipient;                  // Organization wallet
        uint256 deadlineTimestamp;                  // Signature collection deadline
        uint256 createdAt;                          // When milestone was registered
    }

    // ============ Storage ============
    uint256 public constant SIGNATURE_DEADLINE_SECONDS = 7 days;
    uint256 public constant REQUIRED_SIGNATURES = 5;
    uint256 private milestoneMappingIndex = 0;

    mapping(bytes32 => CampaignMilestone) public campaignMilestones;
    mapping(bytes32 => bool) public milestoneExists;
    bytes32[] public milestoneIds;

    // ============ Events ============
    event MilestoneRegistered(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        bytes32 top5HashDigest,
        uint256 amount,
        address indexed recipient,
        uint256 deadlineTimestamp
    );

    event SignatureSubmitted(
        bytes32 indexed milestoneId,
        address indexed signer,
        uint256 signatureCount,
        uint256 timestamp
    );

    event DuplicateSignatureRejected(
        bytes32 indexed milestoneId,
        address indexed signer,
        string reason
    );

    event FundsReleased(
        bytes32 indexed milestoneId,
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event MilestoneExpired(
        bytes32 indexed milestoneId,
        uint256 indexed campaignId,
        uint256 timestamp
    );

    // ============ Functions ============

    /**
     * @dev Register a campaign milestone for top 5 donor signature collection
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index within campaign
     * @param top5HashDigest Poseidon hash of top 5 donor addresses (ZKP proof)
     * @param amount Amount to disburse in Wei
     * @param recipient Organization wallet to receive funds
     */
    function registerCampaignMilestone(
        uint256 campaignId,
        uint256 milestoneIndex,
        bytes32 top5HashDigest,
        uint256 amount,
        address payable recipient
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient address");
        require(top5HashDigest != bytes32(0), "Invalid top5 hash digest");

        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(!milestoneExists[milestoneId], "Milestone already registered");

        CampaignMilestone storage milestone = campaignMilestones[milestoneId];
        milestone.campaignId = campaignId;
        milestone.milestoneIndex = milestoneIndex;
        milestone.top5HashDigest = top5HashDigest;
        milestone.amount = amount;
        milestone.recipient = recipient;
        milestone.signatureCount = 0;
        milestone.requiredSignatures = REQUIRED_SIGNATURES;
        milestone.disbursed = false;
        milestone.createdAt = block.timestamp;
        milestone.deadlineTimestamp = block.timestamp + SIGNATURE_DEADLINE_SECONDS;

        milestoneExists[milestoneId] = true;
        milestoneIds.push(milestoneId);

        emit MilestoneRegistered(
            campaignId,
            milestoneIndex,
            top5HashDigest,
            amount,
            recipient,
            milestone.deadlineTimestamp
        );
    }

    /**
     * @dev Submit a signature from a top 5 donor to approve milestone disbursement
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index
     * @param messageHash The keccak256 hash of the message signed
     * @param signature The signature bytes from MetaMask
     */
    function submitSignature(
        uint256 campaignId,
        uint256 milestoneIndex,
        bytes32 messageHash,
        bytes memory signature
    ) external nonReentrant {
        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(milestoneExists[milestoneId], "Milestone not found");

        CampaignMilestone storage milestone = campaignMilestones[milestoneId];

        require(!milestone.disbursed, "Funds already disbursed");
        require(block.timestamp <= milestone.deadlineTimestamp, "Signature collection deadline passed");
        require(milestone.signatureCount < milestone.requiredSignatures, "All signatures collected");

        // Recover signer from signature
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);

        require(signer != address(0), "Invalid signature");
        require(!milestone.hasSignedAlready[signer], "Already signed by this address");

        // Mark as signed and store signature
        milestone.hasSignedAlready[signer] = true;
        milestone.signatures[signer] = signature;
        milestone.signatureCount += 1;

        emit SignatureSubmitted(
            milestoneId,
            signer,
            milestone.signatureCount,
            block.timestamp
        );

        // Auto-disburse if threshold reached
        if (milestone.signatureCount >= milestone.requiredSignatures) {
            _disburseFunds(milestoneId);
        }
    }

    /**
     * @dev Manually trigger fund disbursement (after deadline or when 5 signatures collected)
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index
     */
    function manualDisburse(uint256 campaignId, uint256 milestoneIndex) external nonReentrant {
        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(milestoneExists[milestoneId], "Milestone not found");

        CampaignMilestone storage milestone = campaignMilestones[milestoneId];
        require(
            milestone.signatureCount >= milestone.requiredSignatures,
            "Not enough signatures to disburse"
        );
        require(!milestone.disbursed, "Already disbursed");

        _disburseFunds(milestoneId);
    }

    /**
     * @dev Internal function to release funds to recipient
     */
    function _disburseFunds(bytes32 milestoneId) internal {
        CampaignMilestone storage milestone = campaignMilestones[milestoneId];
        require(!milestone.disbursed, "Already disbursed");

        milestone.disbursed = true;

        // Transfer funds to recipient
        (bool success, ) = milestone.recipient.call{value: milestone.amount}("");
        require(success, "Fund transfer failed");

        emit FundsReleased(
            milestoneId,
            milestone.campaignId,
            milestone.recipient,
            milestone.amount,
            block.timestamp
        );
    }

    /**
     * @dev Mark milestone as expired (after deadline without 5 signatures)
     * @param campaignId Campaign identifier
     * @param milestoneIndex Milestone index
     */
    function markMilestoneExpired(uint256 campaignId, uint256 milestoneIndex) external {
        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(milestoneExists[milestoneId], "Milestone not found");

        CampaignMilestone storage milestone = campaignMilestones[milestoneId];
        require(block.timestamp > milestone.deadlineTimestamp, "Deadline not passed yet");
        require(milestone.signatureCount < milestone.requiredSignatures, "Already has enough signatures");
        require(!milestone.disbursed, "Already disbursed");

        milestone.disbursed = true; // Mark as expired to prevent further actions

        emit MilestoneExpired(milestoneId, milestone.campaignId, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @dev Get milestone details
     */
    function getMilestoneDetails(uint256 campaignId, uint256 milestoneIndex)
        external
        view
        returns (
            bytes32 top5HashDigest,
            uint256 signatureCount,
            uint256 requiredSignatures,
            bool disbursed,
            uint256 amount,
            address recipient,
            uint256 deadlineTimestamp,
            uint256 createdAt
        )
    {
        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(milestoneExists[milestoneId], "Milestone not found");

        CampaignMilestone storage milestone = campaignMilestones[milestoneId];
        return (
            milestone.top5HashDigest,
            milestone.signatureCount,
            milestone.requiredSignatures,
            milestone.disbursed,
            milestone.amount,
            milestone.recipient,
            milestone.deadlineTimestamp,
            milestone.createdAt
        );
    }

    /**
     * @dev Check if an address has signed a milestone
     */
    function hasSigned(uint256 campaignId, uint256 milestoneIndex, address signer)
        external
        view
        returns (bool)
    {
        bytes32 milestoneId = keccak256(abi.encodePacked(campaignId, milestoneIndex));
        require(milestoneExists[milestoneId], "Milestone not found");

        return campaignMilestones[milestoneId].hasSignedAlready[signer];
    }

    /**
     * @dev Get all milestone IDs
     */
    function getMilestoneCount() external view returns (uint256) {
        return milestoneIds.length;
    }

    /**
     * @dev Get milestone ID by index
     */
    function getMilestoneId(uint256 index) external view returns (bytes32) {
        require(index < milestoneIds.length, "Index out of bounds");
        return milestoneIds[index];
    }

    // ============ Fallback Functions ============

    /**
     * @dev Allow contract to receive ETH directly
     */
    receive() external payable {}

    fallback() external payable {}
}
