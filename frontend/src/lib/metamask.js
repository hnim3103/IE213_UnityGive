// Minimal MetaMask helper utilities
import { ethers } from 'ethers';

export async function connectWallet() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export function getCurrentAccount() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  const accounts = (window.ethereum && window.ethereum.selectedAddress) ? [window.ethereum.selectedAddress] : [];
  return accounts[0] || null;
}

export function onAccountsChanged(handler) {
  if (typeof window === 'undefined' || !window.ethereum) return;
  window.ethereum.on('accountsChanged', (accounts) => handler(accounts));
}

export function onChainChanged(handler) {
  if (typeof window === 'undefined' || !window.ethereum) return;
  window.ethereum.on('chainChanged', (chainId) => handler(chainId));
}

export async function switchChain(chainIdHex, chainParams) {
  if (typeof window === 'undefined' || !window.ethereum) throw new Error('MetaMask not available');
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError && switchError.code === 4902 && chainParams) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [chainParams] });
      return true;
    }
    throw switchError;
  }
}

// Utility: shorten address for display
export function shortAddress(addr) {
  if (!addr) return '';
  return addr.slice(0,6) + '...' + addr.slice(-4);
}

/**
 * Sign a message with MetaMask (for milestone approval)
 * Uses personal_sign which adds the Ethereum signed message prefix
 *
 * @param {string} messageHash - The keccak256 hash to sign
 * @param {string} account - The account to sign with (from getCurrentAccount)
 * @returns {Promise<string>} - The signature bytes
 */
export async function signMilestoneApproval(messageHash, account) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available');
  }

  if (!messageHash || !messageHash.startsWith('0x')) {
    throw new Error('Invalid message hash format');
  }

  if (!account) {
    throw new Error('No account connected');
  }

  try {
    // Use personal_sign to sign the message
    // MetaMask will display this to the user as a message to sign
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [messageHash, account]
    });

    console.log('[MetaMask] Message signed successfully:', signature);
    return signature;
  } catch (err) {
    console.error('[MetaMask] Error signing message:', err);
    throw err;
  }
}

/**
 * Submit a milestone approval signature to the Voted contract
 * This calls the smart contract directly via ethers.js
 *
 * @param {object} params - Parameters
 * @param {string} params.votedContractAddress - Address of Voted contract
 * @param {string} params.votedContractAbi - ABI of Voted contract
 * @param {number} params.campaignId - Campaign ID
 * @param {number} params.milestoneIndex - Milestone index
 * @param {string} params.messageHash - The message hash that was signed
 * @param {string} params.signature - The signature from MetaMask
 * @returns {Promise<object>} - Transaction receipt
 */
export async function submitApprovalSignature({
  votedContractAddress,
  votedContractAbi,
  campaignId,
  milestoneIndex,
  messageHash,
  signature
}) {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available');
  }

  try {
    // Create ethers provider and signer from MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const account = await signer.getAddress();

    console.log('[MetaMask] Submitting signature with account:', account);

    // Create contract instance with signer
    const votedContract = new ethers.Contract(
      votedContractAddress,
      votedContractAbi,
      signer
    );

    // Call submitSignature on contract
    const tx = await votedContract.submitSignature(
      campaignId,
      milestoneIndex,
      messageHash,
      signature
    );

    console.log('[MetaMask] Signature submitted, transaction hash:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log('[MetaMask] Signature confirmed in block:', receipt.blockNumber);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: 'Signature submitted successfully'
    };
  } catch (err) {
    console.error('[MetaMask] Error submitting signature:', err);
    throw err;
  }
}

/**
 * Complete milestone approval workflow
 * Handles network switching, signing, and contract interaction
 *
 * @param {object} params - Parameters
 * @param {number} params.campaignId - Campaign ID
 * @param {number} params.milestoneIndex - Milestone index
 * @param {string} params.messageHash - Message to sign
 * @param {string} params.votedContractAddress - Voted contract address
 * @param {string} params.votedContractAbi - Voted contract ABI
 * @param {string} params.chainId - Target chain ID (e.g., 11155111 for Sepolia)
 * @returns {Promise<object>} - Result with status and details
 */
export async function approveMilestoneWithSignature({
  campaignId,
  milestoneIndex,
  messageHash,
  votedContractAddress,
  votedContractAbi,
  chainId
}) {
  try {
    const account = getCurrentAccount();
    if (!account) {
      throw new Error('No wallet connected. Please connect MetaMask first.');
    }

    // Convert chainId to hex if needed
    const targetChainHex = typeof chainId === 'string' ? chainId : '0x' + chainId.toString(16);

    // Ensure user is on correct network
    console.log('[Milestone Approval] Checking network...');
    const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });

    if (currentChainHex !== targetChainHex) {
      console.log('[Milestone Approval] Switching to correct network...');
      await switchChain(targetChainHex);
    }

    // Sign the message
    console.log('[Milestone Approval] Requesting signature...');
    const signature = await signMilestoneApproval(messageHash, account);

    // Submit signature to contract
    console.log('[Milestone Approval] Submitting signature to contract...');
    const result = await submitApprovalSignature({
      votedContractAddress,
      votedContractAbi,
      campaignId,
      milestoneIndex,
      messageHash,
      signature
    });

    return {
      success: true,
      status: 'approved',
      account,
      signature,
      transactionHash: result.txHash,
      blockNumber: result.blockNumber,
      message: 'Milestone approval submitted successfully!'
    };
  } catch (err) {
    console.error('[Milestone Approval] Error:', err);
    return {
      success: false,
      status: 'error',
      error: err.message,
      message: 'Failed to approve milestone: ' + err.message
    };
  }
}

