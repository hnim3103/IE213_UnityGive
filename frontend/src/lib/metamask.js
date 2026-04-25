// Minimal MetaMask helper utilities
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
