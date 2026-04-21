import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import metaMaskIcon from '../../assets/metamask.svg';


import { API_BASE } from '@/lib/api';
import { ensureCorrectNetwork } from '@/lib/network';
export const AuthLayout = ({
  title,
  subtitle,
  dividerText,
  footerText,
  footerLinkText,
  footerLinkTo,
  children
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);

      // Ensure MetaMask is on the correct network before proceeding
      await ensureCorrectNetwork();

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      const nonceRes = await fetch(`${API_BASE}/api/auth/web3/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      });

      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) throw new Error(nonceData.message || "Failed to fetch auth nonce");

      const message = `Sign this message to authenticate with UnityGive.\n\nNonce: ${nonceData.nonce}`;
      const msgHex = "0x" + Array.from(new TextEncoder().encode(message)).map(b => b.toString(16).padStart(2, "0")).join("");

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [msgHex, walletAddress]
      });

      const loginRes = await fetch(`${API_BASE}/api/auth/web3/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature })
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Authentication failed");

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      toast.success("Successfully logged in with MetaMask!");
      navigate("/");

    } catch (error) {
      console.error(error);
      if (error.code === 4001) {
        toast.error("You rejected the MetaMask signature request.");
      } else {
        toast.error(error.message || "An error occurred during Web3 authentication.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col items-center relative overflow-hidden font-plus-jakarta">
      {/* Background Decorations */}
      <div className="absolute bg-sage-700/10 blur-[40px] right-[-64px] rounded-full size-[512px] top-[-112px]" />
      <div className="absolute bg-earth-500/10 blur-[40px] bottom-[-55px] left-[-64px] rounded-full size-[448px]" />

      {/* Header */}
      <header className="w-full max-w-7xl px-8 py-4 flex justify-center items-center z-10 backdrop-blur-md sticky top-0">
        <Link to="/" className="text-sm text-sage-800 border-b-2 border-sage-800 pb-0.5 hover:opacity-80 transition-opacity font-plus-jakarta">
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 w-full max-w-lg z-10">
        <Card className="w-full p-10 bg-earth-100 border-sage-200/10 rounded-tl-[48px] rounded-tr-[96px] rounded-bl-[80px] rounded-br-[64px] shadow-[0px_30px_60px_-15px_rgba(69,87,59,0.12)] flex flex-col gap-8 relative overflow-hidden">

          <div className="text-center flex flex-col gap-3">
            <h1 className="text-5xl font-instrument text-[#1c1c15] tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-[14px] text-earth-900/80 tracking-[0.35px] uppercase font-light font-plus-jakarta">
              {subtitle}
            </p>
          </div>

          {/* Web3 Action */}
          <Button
            onClick={handleMetaMaskLogin}
            disabled={isConnecting}
            type="button"
            className="w-full py-7 bg-sage-600 hover:bg-sage-700 text-sage-100 rounded-full text-lg flex gap-3 shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isConnecting ? (
              <span className="material-symbols-outlined animate-spin">refresh</span>
            ) : (
              <img src={metaMaskIcon} alt="MetaMask logo" className="w-5 h-5" />
            )}
            <span>
              {isConnecting ? "Connecting..." : "Connect with MetaMask"}
            </span>
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Separator className="flex-1 bg-sage-200/30" />
            <span className="text-[12px] uppercase tracking-[2.4px] text-earth-800/60 whitespace-nowrap">
              {dividerText}
            </span>
            <Separator className="flex-1 bg-sage-200/30" />
          </div>

          {/* Form */}
          {children}

          {/* Footer of Card */}
          <div className="text-center text-sm text-earth-900 font-plus-jakarta mt-2">
            {footerText} <Link to={footerLinkTo} className="text-sage-800 font-medium hover:underline">{footerLinkText}</Link>
          </div>

          {/* Decorative element from figma inside card bottom-right */}
          <div className="absolute bottom-[-24px] right-[-24px] w-20 h-20 opacity-20 pointer-events-none">
            <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="42.5" cy="42.5" r="42.5" fill="url(#paint0_radial_9_42)" />
              <defs>
                <radialGradient id="paint0_radial_9_42" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(42.5 42.5) rotate(90) scale(42.5)">
                  <stop stopColor="#45573B" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#45573B" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </Card>
      </main>

    </div>

  );
};
