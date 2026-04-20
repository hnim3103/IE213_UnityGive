/**
 * Network switching utility for UnityGive.
 * Detects the current MetaMask chain and prompts the user to switch
 * to the required chain (Hardhat local = 31337 in dev, or mainnet in prod).
 */

const REQUIRED_CHAIN_ID = import.meta.env.VITE_CHAIN_ID
  ? parseInt(import.meta.env.VITE_CHAIN_ID)
  : 31337; // Hardhat localhost default

const NETWORK_CONFIG = {
  31337: {
    chainId: '0x7A69', // 31337 in hex
    chainName: 'Hardhat Local',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
  11155111: {
    chainId: '0xAA36A7', // Sepolia
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

/**
 * Returns the current MetaMask chain ID as a decimal number.
 */
export async function getCurrentChainId() {
  const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainHex, 16);
}

/**
 * Checks whether MetaMask is on the required chain.
 * Throws a descriptive error if not — call this before any contract TX.
 *
 * @returns {Promise<void>} resolves if on the right network
 * @throws if user rejects or we can't switch
 *
 * Usage:
 *   await ensureCorrectNetwork();
 *   const tx = await contract.someMethod();
 */
export async function ensureCorrectNetwork() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed.');
  }

  const currentChainId = await getCurrentChainId();

  if (currentChainId === REQUIRED_CHAIN_ID) {
    return; // Already on the right network
  }

  const targetConfig = NETWORK_CONFIG[REQUIRED_CHAIN_ID];
  if (!targetConfig) {
    throw new Error(`No network config found for chain ID ${REQUIRED_CHAIN_ID}.`);
  }

  try {
    // Try to switch first (chain may already be in MetaMask)
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetConfig.chainId }],
    });
  } catch (switchError) {
    // Error code 4902 = chain not yet added to MetaMask → add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [targetConfig],
      });
    } else if (switchError.code === 4001) {
      throw new Error('You rejected the network switch. Please switch to the correct network in MetaMask.');
    } else {
      throw switchError;
    }
  }

  // Verify the switch worked
  const newChainId = await getCurrentChainId();
  if (newChainId !== REQUIRED_CHAIN_ID) {
    throw new Error(`Failed to switch to the required network (Chain ID: ${REQUIRED_CHAIN_ID}).`);
  }
}

export { REQUIRED_CHAIN_ID };
