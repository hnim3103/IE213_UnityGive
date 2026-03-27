import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import metaMaskIcon from '../assets/metamask.svg';

const Signup = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Invalid email address.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSigningUp(true);
      
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }
        throw new Error(data.message || "Failed to create account");
      }

      toast.success("Account created successfully! Please login.");
      navigate("/login");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred during signup.");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      const nonceRes = await fetch("http://localhost:5000/api/auth/web3/nonce", {
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

      const loginRes = await fetch("http://localhost:5000/api/auth/web3/login", {
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
      {/* Header */}
      <header className="w-full max-w-7xl px-8 py-4 flex justify-center items-center z-10 backdrop-blur-md bg-sage-50/80 sticky top-0">
        <Link to="/" className="text-sm text-sage-800/70 hover:text-sage-800 transition-colors">
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 w-full max-w-lg z-10">
        <Card className="w-full p-10 bg-earth-100 border-white/10 rounded-tl-[64px] rounded-tr-[32px] rounded-bl-[48px] rounded-br-[80px] shadow-[0px_30px_60px_-15px_rgba(69,87,59,0.15)] flex flex-col gap-8 relative">

          <div className="text-center flex flex-col gap-2">
            <h1 className="text-4xl font-instrument text-sage-800 tracking-tight leading-tight">
              Join the UnityGive Community
            </h1>
            <p className="text-lg text-earth-900/80 font-light">
              We make a living by what we get, <br />
              but we make a life by what we give.
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
              <img src={metaMaskIcon} alt="MetaMask" className="w-6 h-6" />
            )}
            <p className="hidden sm:block">
              {isConnecting ? "Connecting..." : "Connect with MetaMask"}
            </p>
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <Separator className="flex-1 bg-sage-200/30" />
            <span className="text-[10px] uppercase tracking-[2px] text-earth-800 whitespace-nowrap">
              or register with email
            </span>
            <Separator className="flex-1 bg-sage-200/30" />
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleEmailSignup}>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full px-6 py-4 bg-white/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/60"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="w-full px-6 py-4 bg-white/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/60"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="px-6 py-4 bg-white/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/60"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="px-6 py-4 bg-white/50 border border-sage-300 rounded-full focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-800/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="pt-1">
                <input 
                  type="checkbox" 
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded-full border-sage-200 text-sage-800 focus:ring-sage-800 hover:cursor-pointer" 
                />
              </div>
              <p className="text-sm text-earth-900">
                I agree to the <Link to="/terms" className="text-sage-800 font-medium hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-sage-800 font-medium hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={isSigningUp}
              className="w-full py-7 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isSigningUp ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Footer of Card */}
          <div className="text-center text-sm text-earth-900">
            Already have an account? <Link to="/login" className="text-earth-500 font-medium hover:underline">Login</Link>
          </div>
        </Card>
      </main>

      {/* Decorative Avatars */}
      <div className="flex -space-x-4 opacity-40 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-slate-200">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-sage-800/10 bg-sage-50 py-10 px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-instrument text-sage-800">Unity Give</span>
            <p className="text-[10px] uppercase tracking-widest text-sage-800/60">
              © 2026 Unity Give. Nurturing change through the block.
            </p>
          </div>
          <nav className="flex gap-8 text-sm text-sage-800/60">
            <Link to="/terms" className="hover:text-sage-800 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-sage-800 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-sage-800 transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
