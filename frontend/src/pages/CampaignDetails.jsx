import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';
import { ethers } from 'ethers';
import UnityGive from '../lib/UnityGive.json';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { API_BASE } from '../lib/api';

const fetcher = url => axios.get(url).then(res => res.data);

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, error, isLoading: loading, mutate } = useSWR(`${API_BASE}/api/campaigns/${id}`, fetcher);
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);
  const [user, setUser] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  // Governance state
  const [onChainMilestones, setOnChainMilestones] = useState([]);
  const [proofInputs, setProofInputs] = useState({});
  const [governanceLoading, setGovernanceLoading] = useState({});
  const [hasVotedMap, setHasVotedMap] = useState({});
  const [isHybridCouncil, setIsHybridCouncil] = useState(false);
  const [topDonorsList, setTopDonorsList] = useState([]);

  const getContract = async (withSigner = false) => {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (!contractAddress) throw new Error('Contract address not configured.');
    if (withSigner) {
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, UnityGive.abi, signer);
    }
    return new ethers.Contract(contractAddress, UnityGive.abi, provider);
  };


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // Detect connected wallet
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length > 0) setWalletAddress(accounts[0].toLowerCase());
      });
      window.ethereum.on('accountsChanged', accounts => {
        setWalletAddress(accounts[0]?.toLowerCase() || null);
      });
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
        toast.error("Project is not synced with Blockchain.");
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

      const toastId = toast.loading("Waiting for wallet confirmation...");

      let tx;
      try {
        tx = await contract.donate(onChainId, { value: parsedAmount });
      } catch (err) {
        toast.dismiss(toastId);
        throw err;
      }

      toast.loading("Transaction submitted. Waiting for confirmation...", { id: toastId });

      // Record as PENDING immediately after getting the txHash.
      const token = localStorage.getItem("token");
      fetch(`${API_BASE}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          donorId: user?._id || user?.id,
          amount: parsedAmount.toString(), // Wei string
          status: "pending",
          txHash: tx.hash
        })
      }).catch(err => console.error("Failed to post pending donation:", err));

      await tx.wait();

      toast.success('Donation successful!', { id: toastId });
      setDonationAmount('');

      // Optimistic UI update
      const currentWei = BigInt(campaign.currentAmount?.toString().split('.')[0] || "0");
      const newTotalWei = currentWei + parsedAmount;
      mutate({ ...campaign, currentAmount: newTotalWei.toString() }, false);
      
      // Refresh to ensure all data is synced
      setTimeout(() => mutate(), 4000);
    } catch (error) {
      console.error(error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected in MetaMask.');
      } else if (error.message && (error.message.includes('timeout') || error.message.includes('timeout exceeded'))) {
        toast.error('Blockchain network is unresponsive (RPC Timeout). Please try again later.');
      } else if (error.message?.includes('network') || error.message?.includes('chain')) {
        toast.error('Wrong network. Please switch to the correct network in MetaMask.');
      } else if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        toast.error("Transaction failed: Please ensure your wallet is properly connected and has enough ETH.");
      } else {
        toast.error(error.reason || 'Donation failed due to a wallet or network error.');
      }
    } finally {
      setIsDonating(false);
    }
  };

  // Fetch on-chain milestone state & vote status
  useEffect(() => {
    if (!campaign?.onChainCampaignId && campaign?.onChainCampaignId !== 0) return;
    const fetchMilestoneState = async () => {
      try {
        const contract = await getContract();
        if (walletAddress) {
          try {
            const isHybrid = await contract.isHybridCouncilMember(campaign.onChainCampaignId, walletAddress);
            setIsHybridCouncil(isHybrid);
          } catch (e) {
            console.warn("Could not fetch hybrid council status:", e.message);
          }
        }
        const count = Number(await contract.getMilestonesCount(campaign.onChainCampaignId));
        const milestones = [];
        const votedMap = {};
        for (let i = 0; i < count; i++) {
          const m = await contract.getMilestone(campaign.onChainCampaignId, i);
          milestones.push({
            amount: m[0],
            ipfsEvidence: m[1],
            approvalCount: Number(m[2]),
            isApproved: m[3],
            isFunded: m[4],
          });
          // Check if current wallet has voted
          if (walletAddress) {
            const voted = await contract.hasVoted(campaign.onChainCampaignId, i, walletAddress);
            votedMap[i] = voted;
          }
        }
        setOnChainMilestones(milestones);
        setHasVotedMap(votedMap);
      } catch (e) {
        console.warn('Could not load on-chain milestone state:', e.message);
      }
    };
    fetchMilestoneState();
  }, [campaign?.onChainCampaignId, walletAddress]);

  const handleUploadProof = async (milestoneIndex) => {
    const file = proofInputs[milestoneIndex];
    if (!file) { toast.error('Please provide a file or CID'); return; }
    try {
      setGovernanceLoading(p => ({ ...p, [`proof_${milestoneIndex}`]: true }));

      let cid = "";
      if (typeof file === 'string') {
        cid = file.trim();
      } else {
        toast.info('Uploading file to IPFS (Pinata)…');
        const formData = new FormData();
        formData.append('file', file);

        const apiKey = import.meta.env.VITE_PINATA_API_KEY;
        const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

        if (!apiKey || !secretKey) {
          throw new Error("Pinata API keys not configured in .env");
        }

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          headers: {
            'Content-Type': `multipart/form-data;`,
            pinata_api_key: apiKey,
            pinata_secret_api_key: secretKey
          }
        });
        cid = res.data.IpfsHash;
      }

      const toastId = toast.loading('Waiting for wallet confirmation...');
      let tx;
      try {
        tx = await contract.uploadProofOfImpact(campaign.onChainCampaignId, milestoneIndex, cid);
      } catch (err) {
        toast.dismiss(toastId);
        throw err;
      }
      
      toast.loading('Recording CID on-chain. Waiting for confirmation...', { id: toastId });
      await tx.wait();
      toast.success('Proof of Impact recorded successfully!', { id: toastId });
      setProofInputs(p => ({ ...p, [milestoneIndex]: null }));
      // Refresh milestone state
      const m = await contract.getMilestone(campaign.onChainCampaignId, milestoneIndex);
      setOnChainMilestones(prev => prev.map((item, i) => i === milestoneIndex
        ? { ...item, ipfsEvidence: m[1] } : item));
    } catch (e) {
      toast.error(e.code === 4001 ? 'Rejected in MetaMask' : e.reason || e.message);
    } finally {
      setGovernanceLoading(p => ({ ...p, [`proof_${milestoneIndex}`]: false }));
    }
  };

  const handleVote = async (milestoneIndex) => {
    try {
      setGovernanceLoading(p => ({ ...p, [`vote_${milestoneIndex}`]: true }));
      const toastId = toast.loading('Waiting for wallet confirmation...');
      let tx;
      try {
        tx = await contract.voteApproveMilestone(campaign.onChainCampaignId, milestoneIndex);
      } catch (err) {
        toast.dismiss(toastId);
        throw err;
      }
      
      toast.loading('Vote submitted. Waiting for confirmation...', { id: toastId });
      await tx.wait();
      toast.success('Vote recorded on-chain!', { id: toastId });
      // Refresh milestone
      const m = await contract.getMilestone(campaign.onChainCampaignId, milestoneIndex);
      setOnChainMilestones(prev => prev.map((item, i) => i === milestoneIndex
        ? { ...item, approvalCount: Number(m[2]), isApproved: m[3], isFunded: m[4] } : item));
      setHasVotedMap(p => ({ ...p, [milestoneIndex]: true }));
    } catch (e) {
      toast.error(e.code === 4001 ? 'Rejected in MetaMask' : e.reason || e.message);
    } finally {
      setGovernanceLoading(p => ({ ...p, [`vote_${milestoneIndex}`]: false }));
    }
  };

  const handleRefund = async () => {
    try {
      const toastId = toast.loading('Waiting for wallet confirmation...');
      let tx;
      try {
        tx = await contract.refund(campaign.onChainCampaignId);
      } catch (err) {
        toast.dismiss(toastId);
        throw err;
      }
      
      toast.loading('Requesting refund. Waiting for confirmation...', { id: toastId });
      await tx.wait();
      toast.success('Refund successful!', { id: toastId });
    } catch (e) {
      toast.error(e.code === 4001 ? 'Rejected in MetaMask' : e.reason || e.message);
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-32 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-8 w-full">
          <div className="w-full h-[500px] bg-sage-100 rounded-[48px]" />
          <div className="w-2/3 h-12 bg-sage-100 rounded-full" />
          <div className="w-1/2 h-6 bg-sage-100 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    toast.error("Failed to load campaign details");
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-32 text-center">
        <h1 className="text-4xl font-fraunces text-sage-800">Project not found</h1>
        <Link to="/campaigns">
          <Button className="mt-8 bg-sage-800 text-white rounded-full px-8 hover:bg-sage-900 transition-colors">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }


  const targetEth = campaign.totalGoalAmount ? parseFloat(campaign.totalGoalAmount) : 0;

  let raisedEth = 0;
  if (campaign.currentAmount && campaign.currentAmount.toString() !== '0') {
    try {
      // Strip any decimal part first (Wei strings should never have decimals)
      const cleanStr = campaign.currentAmount.toString().split('.')[0] || '0';
      const numericValue = Number(cleanStr);
      // If the value is >= 1e9, it must be stored in Wei (even 0.001 ETH = 1e15 Wei)
      // If it's smaller, it was already converted to ETH (legacy records from fixAmounts.js)
      if (numericValue >= 1e9) {
        raisedEth = parseFloat(ethers.formatEther(BigInt(cleanStr)));
      } else {
        raisedEth = numericValue;
      }
    } catch (err) {
      console.error("Error parsing currentAmount:", err);
      raisedEth = 0;
    }
  }

  const progress = targetEth > 0 ? (raisedEth / targetEth) * 100 : 0;

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 4,
  });

  return (
    <div className="selection:bg-sage-800 selection:text-white font-nunito">
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Image and Description */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div className="relative overflow-hidden rounded-[48px] shadow-2xl border-8 border-white group">
              <img
                src={campaign.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000"}
                alt={campaign.title || "Project Header Image"}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-fraunces font-thin text-sage-800">Impact Milestones</h3>
                  {campaign.onChainCampaignId !== undefined && (
                    <span className="text-[10px] uppercase tracking-widest text-earth-900/50 font-bold bg-white/60 px-3 py-1.5 rounded-full border border-white">
                      On-chain ID #{campaign.onChainCampaignId}
                    </span>
                  )}
                </div>

                {/* Refund button if campaign inactive/deadline passed */}
                {campaign.status !== 'ACTIVE' && walletAddress && (
                  <div className="bg-rose-50 border border-rose-100 rounded-[24px] p-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-rose-700 text-sm">Project ended</p>
                      <p className="text-xs text-rose-600/70 font-light mt-0.5">If you donated and the goal wasn't reached, you may claim a refund.</p>
                    </div>
                    <Button onClick={handleRefund} className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold px-6 py-3 whitespace-nowrap">
                      Claim Refund
                    </Button>
                  </div>
                )}

                <div className="flex flex-col gap-6">
                  {campaign.milestones?.map((milestone, index) => {
                    const onChain = onChainMilestones[index];
                    const isOrg = user && user.role === 'admin';
                    const isCouncil = isHybridCouncil;
                    const hasProof = onChain?.ipfsEvidence && onChain.ipfsEvidence.length > 0;
                    const alreadyVoted = hasVotedMap[index];
                    const requiredVotes = campaign.requiredVotes || 1;

                    return (
                      <div key={index} className="bg-white/50 backdrop-blur-sm rounded-[32px] border border-white/60 overflow-hidden transition-colors hover:bg-white/70">
                        {/* Milestone Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${onChain?.isFunded ? 'bg-teal-600 text-white'
                              : onChain?.isApproved ? 'bg-sage-600 text-white'
                                : 'bg-sage-100 text-sage-800'
                              }`}>
                              {onChain?.isFunded ? (
                                <span className="material-symbols-outlined text-[22px]">check_circle</span>
                              ) : onChain?.isApproved ? (
                                <span className="material-symbols-outlined text-[22px]">task_alt</span>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <h4 className="text-xl font-light text-sage-800">{milestone.title || `Phase ${index + 1}`}</h4>
                              <p className="text-sm font-extralight text-earth-900/70">
                                Target: {formatter.format(parseFloat(milestone.amount))} ETH
                              </p>
                              {onChain && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex gap-1">
                                    {Array.from({ length: requiredVotes }).map((_, vi) => (
                                      <div key={vi} className={`w-3 h-3 rounded-full ${vi < (onChain.approvalCount || 0) ? 'bg-sage-800' : 'bg-sage-200'
                                        }`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-earth-900/50 font-bold uppercase tracking-wide">
                                    {onChain.approvalCount}/{requiredVotes} votes
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {onChain?.isFunded ? (
                              <Badge className="bg-teal-50 text-teal-700 border-none px-4 py-2 rounded-full">
                                <span className="material-symbols-outlined text-sm mr-1">payments</span>
                                Funded
                              </Badge>
                            ) : onChain?.isApproved ? (
                              <Badge className="bg-sage-800/10 text-sage-800 border-none px-4 py-2 rounded-full">
                                <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                Approved
                              </Badge>
                            ) : hasProof ? (
                              <Badge variant="outline" className="border-amber-300 text-amber-700 px-4 py-2 rounded-full">
                                <span className="material-symbols-outlined text-sm mr-1">pending</span>
                                Awaiting Votes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-sage-800/20 text-sage-800/60 px-4 py-2 rounded-full">
                                Pending Proof
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* On-chain evidence & actions */}
                        {onChain && (
                          <div className="border-t border-sage-800/5 px-8 pb-8 pt-6 flex flex-col gap-4">
                            {/* Show existing proof */}
                            {hasProof && (
                              <div className="flex items-center gap-3 bg-sage-50 rounded-2xl px-5 py-3">
                                <span className="material-symbols-outlined text-sage-800 text-[18px]">insert_link</span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] uppercase tracking-widest text-earth-900/40 font-bold">IPFS Proof of Impact</span>
                                  <a
                                    href={`https://ipfs.io/ipfs/${onChain.ipfsEvidence}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-sage-800 hover:underline truncate"
                                  >
                                    {onChain.ipfsEvidence}
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Org: Upload Proof */}
                            {isOrg && !onChain.isApproved && (
                              <div className="flex gap-2">
                                <input
                                  type="file"
                                  onChange={e => setProofInputs(p => ({ ...p, [index]: e.target.files[0] }))}
                                  className="flex-1 bg-white/80 border border-sage-800/10 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-800/30 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sage-50 file:text-sage-800 hover:file:bg-sage-100"
                                />
                                <Button
                                  onClick={() => handleUploadProof(index)}
                                  disabled={governanceLoading[`proof_${index}`]}
                                  className="bg-sage-800 text-white hover:bg-sage-900 rounded-2xl px-5 text-xs font-bold whitespace-nowrap"
                                >
                                  {governanceLoading[`proof_${index}`] ? 'Uploading…' : 'Submit Proof'}
                                </Button>
                              </div>
                            )}

                            {/* Council: Vote */}
                            {isCouncil && !onChain.isApproved && hasProof && (
                              <Button
                                onClick={() => handleVote(index)}
                                disabled={governanceLoading[`vote_${index}`] || alreadyVoted}
                                className={`rounded-2xl text-xs font-bold px-6 py-3 self-start ${alreadyVoted
                                  ? 'bg-sage-100 text-sage-800/50 cursor-not-allowed'
                                  : 'bg-earth-500 hover:bg-earth-600 text-white'
                                  }`}
                              >
                                {governanceLoading[`vote_${index}`] ? 'Submitting…'
                                  : alreadyVoted ? '✓ Already Voted'
                                    : 'Vote to Approve'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                    style={{ width: `${Math.min(progress, 100)}%` }}
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
    </div>
  );
};

export default CampaignDetails;
