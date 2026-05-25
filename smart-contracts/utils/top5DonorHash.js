/**
 * Utility to generate Poseidon hash of top 5 donor addresses
 * Used for ZKP verification that proves rank without revealing amounts
 *
 * The Poseidon hash is computed off-chain and stored on-chain as top5HashDigest
 * Donors sign a message that includes this hash, proving they are in the top 5
 */

const { poseidon } = require("circomlib");
const { ethers } = require("ethers");

/**
 * Generate Poseidon hash from top 5 donor addresses
 * @param {string[]} donorAddresses - Array of 5 Ethereum addresses (checksummed)
 * @returns {string} - Poseidon hash as hex string (32 bytes)
 * @throws {Error} - If not exactly 5 addresses or invalid addresses
 */
function generateTop5Hash(donorAddresses) {
  if (!Array.isArray(donorAddresses) || donorAddresses.length !== 5) {
    throw new Error("Must provide exactly 5 donor addresses");
  }

  // Validate and convert addresses to BigInt for Poseidon
  const addressBigInts = donorAddresses.map((addr) => {
    if (!ethers.isAddress(addr)) {
      throw new Error(`Invalid Ethereum address: ${addr}`);
    }
    // Remove 0x prefix and convert to BigInt
    const normalized = ethers.getAddress(addr); // Checksum address
    return BigInt(normalized);
  });

  // Compute Poseidon hash
  // Poseidon hash outputs a field element, we need to convert it to hex for on-chain storage
  const poseidonHash = poseidon(addressBigInts);

  // Convert to hex with 0x prefix, padded to 32 bytes (64 hex chars)
  const hashHex = "0x" + poseidonHash.toString(16).padStart(64, "0");

  return hashHex;
}

/**
 * Generate the message that donors should sign
 * This message combines campaign metadata with the Poseidon hash
 *
 * Message format: keccak256(abi.encodePacked(
 *   uint256(chainId),
 *   address(votedContractAddress),
 *   uint256(campaignId),
 *   uint256(milestoneIndex),
 *   bytes32(poseidonHash)
 * ))
 *
 * @param {object} params - Parameters object
 * @param {number} params.chainId - Network chain ID (11155111 for Sepolia)
 * @param {string} params.votedContractAddress - Address of Voted contract
 * @param {number} params.campaignId - Campaign ID
 * @param {number} params.milestoneIndex - Milestone index
 * @param {string} params.poseidonHash - Poseidon hash output from generateTop5Hash()
 * @returns {string} - Message hash as hex string (to be signed by MetaMask)
 */
function generateSigningMessage(params) {
  const {
    chainId,
    votedContractAddress,
    campaignId,
    milestoneIndex,
    poseidonHash,
  } = params;

  if (!ethers.isAddress(votedContractAddress)) {
    throw new Error("Invalid voted contract address");
  }

  if (!poseidonHash || !poseidonHash.startsWith("0x")) {
    throw new Error("Invalid Poseidon hash format");
  }

  // Encode the message
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abiCoder.encode(
    ["uint256", "address", "uint256", "uint256", "bytes32"],
    [chainId, votedContractAddress, campaignId, milestoneIndex, poseidonHash]
  );

  // Compute keccak256 hash
  const messageHash = ethers.keccak256(encoded);

  return messageHash;
}

/**
 * Format signing message for display/transmission
 * @param {object} params - Parameters (same as generateSigningMessage)
 * @returns {object} - Object with messageHash and human-readable data
 */
function formatSigningMessageForNotification(params) {
  const messageHash = generateSigningMessage(params);

  return {
    messageHash, // For MetaMask signing
    chainId: params.chainId,
    votedContractAddress: params.votedContractAddress,
    campaignId: params.campaignId,
    milestoneIndex: params.milestoneIndex,
    poseidonHash: params.poseidonHash,
    displayText: `Sign to approve Milestone ${params.milestoneIndex} of Campaign ${params.campaignId}`,
  };
}

/**
 * Verify a signature on a message (for backend validation)
 * @param {string} messageHash - The message hash that was signed
 * @param {string} signature - The signature from MetaMask
 * @returns {string} - Recovered signer address (or null if invalid)
 */
function recoverSignerAddress(messageHash, signature) {
  try {
    // Create the eth_sign wrapped message (this is what MetaMask does)
    const ethSignedMessageHash = ethers.hashMessage(
      ethers.toBeHex(messageHash)
    );

    // Recover signer from signature
    const signer = ethers.recoverAddress(ethSignedMessageHash, signature);
    return signer;
  } catch (error) {
    console.error("Error recovering signer:", error);
    return null;
  }
}

module.exports = {
  generateTop5Hash,
  generateSigningMessage,
  formatSigningMessageForNotification,
  recoverSignerAddress,
};
