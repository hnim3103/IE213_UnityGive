import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import { ethers } from 'ethers';
import UnityGive from '../lib/UnityGive.json';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

const fetcher = url => axios.get(url).then(res => res.data);

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, error, isLoading: loading, mutate } = useSWR(`http://localhost:5000/api/campaigns/${id}`, fetcher);
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleDonate = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to donate.");
        return;
      }
      if (!donationAmount || Number(donationAmount) <= 0) {
        toast.error("Please enter a valid donation amount in ETH.");
        return;
      }
      
      const onChainId = campaign.onChainCampaignId;
      if (onChainId === undefined || onChainId === null) {
        toast.error("Campaign is not synced with Blockchain.");
        return;
      }

      setIsDonating(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address not configured.");

      const contract = new ethers.Contract(contractAddress, UnityGive.abi, signer);
      const parsedAmount = ethers.parseEther(donationAmount.toString());

      const tx = await contract.donate(onChainId, { value: parsedAmount });
      toast.info("Transaction sent. Waiting for confirmation…");
      
      await tx.wait();
      toast.success("Donation successful!");
      
      setDonationAmount('');
      mutate(); // Re-fetch the campaign data
    } catch (error) {
      console.error(error);
      toast.error(error.reason || error.message || "Donation failed");
    } finally {
      setIsDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-32 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-8 w-full">
            <div className="w-full h-[500px] bg-sage-100 rounded-[48px]" />
            <div className="w-2/3 h-12 bg-sage-100 rounded-full" />
            <div className="w-1/2 h-6 bg-sage-100 rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load campaign details");
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-sage-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-8 py-32 text-center">
          <h1 className="text-4xl font-fraunces text-sage-800">Campaign not found</h1>
          <Link to="/campaigns">
            <Button className="mt-8 bg-sage-800 text-white rounded-full px-8 hover:bg-sage-900 transition-colors">Back to Projects</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const targetEth = campaign.totalGoalAmount ? Number(campaign.totalGoalAmount) / 1e18 : 0;
  const raisedEth = campaign.currentAmount ? Number(campaign.currentAmount) / 1e18 : 0;
  const progress = targetEth > 0 ? Math.min((raisedEth / targetEth) * 100, 100) : 0;
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  });

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white font-nunito">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column: Image and Description */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div className="relative overflow-hidden rounded-[48px] shadow-2xl border-8 border-white group">
              <img 
                src={campaign.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000"} 
                alt={campaign.title || "Campaign Header Image"} 
                fetchpriority="high"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-8 left-8">
                <Badge className="bg-white/90 backdrop-blur-md text-sage-800 text-xs font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg border-none">
                  {campaign.category ? campaign.category.replace(/_/g, ' ') : 'Initiative'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-6 px-4">
              <h1 className="text-5xl md:text-6xl font-fraunces font-thin text-sage-800 leading-tight">
                {campaign.title}
              </h1>
              
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sage-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                       {campaign.creatorId?.avatar ? (
                         <img src={campaign.creatorId.avatar} alt="Creator avatar" loading="lazy" className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-sage-800 font-bold">{campaign.creatorId?.name?.charAt(0) || 'O'}</span>
                       )}
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase tracking-widest text-earth-800/60 font-bold">Organizer</span>
                       <span className="text-sm font-bold text-sage-800">{campaign.creatorId?.name || 'UnityGive Team'}</span>
                    </div>
                 </div>
                 <Separator orientation="vertical" className="h-10 bg-sage-800/10" />
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-earth-800/60 font-bold">Status</span>
                    <Badge variant="outline" className="text-xs border-sage-800/20 text-sage-800 capitalize">
                      {campaign.status?.toLowerCase() || 'active'}
                    </Badge>
                 </div>
              </div>

              <div className="mt-8 text-lg font-extralight text-earth-900 leading-relaxed whitespace-pre-line">
                {campaign.description}
              </div>

              {/* Milestones Section */}
              <div className="mt-16 flex flex-col gap-10">
                <h3 className="text-3xl font-fraunces font-thin text-sage-800">Impact Milestones</h3>
                <div className="flex flex-col gap-6">
                  {campaign.milestones?.map((milestone, index) => (
                    <div key={index} className="bg-white/40 backdrop-blur-sm p-8 rounded-[32px] border border-white/50 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-white/60">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${milestone.isApproved ? 'bg-sage-800 text-white' : 'bg-sage-100 text-sage-800'}`}>
                             {index + 1}
                          </div>
                          <div className="flex flex-col gap-1">
                             <h4 className="text-xl font-light text-sage-800">{milestone.title || `Phase ${index + 1}`}</h4>
                             <p className="text-sm font-extralight text-earth-900/70">
                                Target: {formatter.format(Number(milestone.amount) / 1e18)} ETH
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          {milestone.isApproved ? (
                            <Badge className="bg-sage-800/10 text-sage-800 border-none px-4 py-2 rounded-full flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Verified & Released
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-sage-800/20 text-sage-800/60 px-4 py-2 rounded-full">
                              Pending Impact Proof
                            </Badge>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Donation Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 flex flex-col gap-8">
              <div className="bg-[#e5e3d6] p-10 rounded-[48px] shadow-xl border border-white/50 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-5xl font-fraunces font-thin text-sage-800 tabular-nums">
                      {formatter.format(raisedEth)}
                      <span className="text-2xl ml-2 font-nunito uppercase tracking-tighter opacity-60">ETH</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-light text-sage-800/70">
                    <span>raised of {formatter.format(targetEth)} ETH goal</span>
                    <span className="tabular-nums">{Math.round(progress)}%</span>
                  </div>
                </div>

                <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sage-800 rounded-full transition-[width] duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <div className="relative group">
                    <input 
                      type="number" 
                      placeholder="0.1" 
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full bg-white/60 border border-sage-800/10 rounded-full py-5 px-8 focus:outline-none focus:ring-2 focus:ring-sage-800/20 text-xl font-light text-sage-800 transition-colors"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sage-800/40 font-bold">ETH</span>
                  </div>

                  {!user ? (
                    <Button onClick={() => navigate('/login')} className="w-full bg-sage-800 hover:bg-sage-900 text-white rounded-full py-8 text-xl shadow-lg transition-transform active:scale-[0.98]">
                      Login to Donate
                    </Button>
                  ) : (
                    <Button onClick={handleDonate} disabled={isDonating} className="w-full bg-sage-800 hover:bg-sage-900 text-white rounded-full py-8 text-xl shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70">
                      {isDonating ? "Processing…" : "Donate Now"}
                    </Button>
                  )}
                  
                  <p className="text-center text-[12px] font-extralight text-earth-900/60 px-4">
                    By donating, you agree to our terms. Funds are held in a transparent smart contract and released only upon verified impact milestones.
                  </p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white/40 backdrop-blur-sm p-8 rounded-[32px] border border-white/50 flex flex-col gap-6">
                 <div className="flex gap-4">
                    <span className="material-symbols-outlined text-earth-500">verified_user</span>
                    <div className="flex flex-col gap-1">
                       <h5 className="text-sm font-bold text-sage-800">Blockchain Secured</h5>
                       <p className="text-xs font-extralight text-earth-900/70">Your donation is tracked and protected by Ethereum smart contracts.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <span className="material-symbols-outlined text-earth-500">assignment_turned_in</span>
                    <div className="flex flex-col gap-1">
                       <h5 className="text-sm font-bold text-sage-800">Milestone Based</h5>
                       <p className="text-xs font-extralight text-earth-900/70">Funds are released only when our team provides immutable proof of impact.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetails;
