import React, { useEffect, useState } from 'react';
import { connectWallet, getCurrentAccount, onAccountsChanged, onChainChanged, shortAddress } from '../lib/metamask';

export default function ConnectWallet({ onConnected }) {
  const [account, setAccount] = useState(getCurrentAccount());

  useEffect(() => {
    onAccountsChanged((accounts) => {
      setAccount(accounts && accounts[0] ? accounts[0] : null);
      if (accounts && accounts[0] && onConnected) onConnected(accounts[0]);
    });
    onChainChanged(() => {
      // optionally react to chain changes
      setAccount(getCurrentAccount());
    });
    // refresh selectedAddress on mount
    setAccount(getCurrentAccount());
  }, []);

  async function handleConnect() {
    try {
      const acc = await connectWallet();
      setAccount(acc);
      if (onConnected) onConnected(acc);
    } catch (err) {
      console.error('Connect failed', err.message || err);
      alert('MetaMask connection failed: ' + (err.message || err));
    }
  }

  return (
    <div>
      {account ? (
        <button className="btn-connected">{shortAddress(account)}</button>
      ) : (
        <button className="btn-connect" onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
