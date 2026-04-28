import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Upload,
  Calendar,
  DollarSign,
  Target,
  Layout,
  Plus,
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { CAMPAIGN_TYPES } from '../lib/constant';
import { API_BASE } from '../lib/api';
import UnityGive from '../lib/UnityGive.json';
import { ensureCorrectNetwork } from '../lib/network';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(''); // 'chain' | 'db' | ''
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalGoalAmount: '',
    softCapAmount: '',
    category: 'OTHER',
    image: '',
    startDate: '',
    endDate: '',
    requiredVotes: 1,
    councilMembers: [],
    milestones: []
  });

  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '' });
  const [newCouncilMember, setNewCouncilMember] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Parse "DD/MM/YYYY" → Date object (returns null on invalid input)
  const parseDMY = (str) => {
    if (!str || str.length !== 10) return null;
    const [dd, mm, yyyy] = str.split('/');
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  };

  // Auto-insert slashes as user types: "1801" → "18/01/"
  const handleDateInput = (e) => {
    const { name } = e.target;
    let raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 2) formatted = raw.slice(0, 2) + '/' + raw.slice(2);
    if (raw.length > 4) formatted = raw.slice(0, 2) + '/' + raw.slice(2, 4) + '/' + raw.slice(4);
    setFormData(prev => ({ ...prev, [name]: formatted }));
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim()) {
      toast.error("Milestone title cannot be empty.");
      return;
    }
    const amt = parseFloat(newMilestone.amount);
    if (!newMilestone.amount || isNaN(amt) || amt <= 0) {
      toast.error("Milestone amount must be a positive number.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: newMilestone.title.trim(), amount: newMilestone.amount, isApproved: false, isFunded: false }]
    }));
    setNewMilestone({ title: '', amount: '' });
  };

  const removeMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const addCouncilMember = () => {
    const addr = newCouncilMember.trim();
    if (!addr) return;
    if (!addr.startsWith('0x') || addr.length !== 42 || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      toast.error("Invalid Ethereum address format.");
      return;
    }
    if (formData.councilMembers.map(a => a.toLowerCase()).includes(addr.toLowerCase())) {
      toast.error("This address is already in the council.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      councilMembers: [...prev.councilMembers, addr]
    }));
    setNewCouncilMember('');
  };

  const removeCouncilMember = (index) => {
    setFormData(prev => {
      const updated = prev.councilMembers.filter((_, i) => i !== index);
      return {
        ...prev,
        councilMembers: updated,
        // Clamp requiredVotes if council shrinks below it
        requiredVotes: Math.min(prev.requiredVotes, updated.length + 5),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Guard: user must be logged in ────────────────────────────────────
    if (!user) {
      toast.error("You must be logged in to create a campaign.");
      return;
    }

    const creatorId = user._id || user.id;
    if (!creatorId) {
      toast.error("Session error: could not identify your account. Please log in again.");
      return;
    }

    // ── Required field checks ─────────────────────────────────────────────
    if (!formData.title.trim()) { toast.error("Project title is required."); return; }
    if (!formData.description.trim()) { toast.error("Project description is required."); return; }
    if (!formData.image.trim()) { toast.error("Cover image URL is required."); return; }
    if (!formData.totalGoalAmount) { toast.error("Hard cap (goal amount) is required."); return; }
    if (!formData.softCapAmount) { toast.error("Soft cap amount is required."); return; }
    if (!formData.startDate) { toast.error("Start date is required."); return; }
    if (!formData.endDate) { toast.error("End date is required."); return; }

    // ── Numeric validations ───────────────────────────────────────────────
    const hardCap = parseFloat(formData.totalGoalAmount);
    const softCap = parseFloat(formData.softCapAmount);

    if (isNaN(hardCap) || hardCap <= 0) {
      toast.error("Hard cap must be a positive number.");
      return;
    }
    if (isNaN(softCap) || softCap <= 0) {
      toast.error("Soft cap must be a positive number.");
      return;
    }
    if (softCap >= hardCap) {
      toast.error(`Soft cap (${softCap} ETH) must be less than hard cap (${hardCap} ETH).`);
      return;
    }

    // ── Date validations ──────────────────────────────────────────────────
    const startDate = parseDMY(formData.startDate);
    const endDate = parseDMY(formData.endDate);

    if (!startDate) {
      toast.error("Start date must be in DD/MM/YYYY format (e.g. 18/01/2026).");
      return;
    }
    if (!endDate) {
      toast.error("End date must be in DD/MM/YYYY format (e.g. 30/12/2026).");
      return;
    }

    const startTs = startDate.getTime();
    const endTs = endDate.getTime();
    const nowTs = Date.now();

    if (endTs <= startTs) {
      toast.error("End date must be after the start date.");
      return;
    }
    if (endTs <= nowTs) {
      toast.error("End date must be in the future.");
      return;
    }

    // ── Governance validations ────────────────────────────────────────────
    const reqVotes = parseInt(formData.requiredVotes, 10);
    if (!reqVotes || reqVotes < 1) {
      toast.error("Required votes must be at least 1.");
      return;
    }
    if (reqVotes > formData.councilMembers.length + 5) {
      toast.error(`Required votes (${reqVotes}) cannot exceed the number of council members and top donors (${formData.councilMembers.length + 5}).`);
      return;
    }

    // ── Milestone validations ─────────────────────────────────────────────
    if (formData.milestones.length === 0) {
      toast.error("You must add at least one milestone.");
      return;
    }

    let goalWei, milestoneWeiAmounts;
    try {
      goalWei = ethers.parseEther(formData.totalGoalAmount.toString());
      milestoneWeiAmounts = formData.milestones.map(m =>
        ethers.parseEther(m.amount.toString())
      );
    } catch {
      toast.error("Invalid ETH amount — please use decimal numbers (e.g. 0.5).");
      return;
    }

    const milestoneSum = milestoneWeiAmounts.reduce((a, b) => a + b, 0n);
    if (milestoneSum !== goalWei) {
      const diff = milestoneSum > goalWei
        ? `${ethers.formatEther(milestoneSum - goalWei)} ETH over`
        : `${ethers.formatEther(goalWei - milestoneSum)} ETH under`;
      toast.error(`Milestone amounts must sum exactly to ${formData.totalGoalAmount} ETH (currently ${diff}).`);
      return;
    }

    try {
      setIsLoading(true);

      // ── Phase 1: Register campaign on-chain ───────────────────────────
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it to create campaigns.");
      }

      setTxStatus('chain');
      toast.info("Step 1/2 — Confirm the transaction in MetaMask…");

      // Ensure the user is on the correct network — auto-switch if not
      await ensureCorrectNetwork();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address not configured (VITE_CONTRACT_ADDRESS).");

      const contract = new ethers.Contract(contractAddress, UnityGive.abi, signer);

      const orgWallet = await signer.getAddress();
      const deadlineTimestamp = BigInt(Math.floor(endTs / 1000));
      const requiredVotesBig = BigInt(reqVotes);

      const tx = await contract.registerCampaign(
        "",
        orgWallet,
        goalWei,
        formData.councilMembers,
        requiredVotesBig,
        milestoneWeiAmounts,
        deadlineTimestamp
      );

      toast.info("Transaction submitted — waiting for confirmation…");
      const receipt = await tx.wait();

      // Extract onChainCampaignId from CampaignRegistered event
      const registeredEvent = receipt.logs
        .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find(e => e?.name === 'CampaignRegistered');

      if (!registeredEvent) throw new Error("Could not read campaign ID from transaction receipt.");
      const onChainCampaignId = Number(registeredEvent.args.campaignId);

      toast.success(`✅ On-chain TX confirmed! Campaign ID: #${onChainCampaignId}`);

      // ── Phase 2: Persist to MongoDB ───────────────────────────────────
      setTxStatus('db');
      toast.info("Step 2/2 — Saving campaign details to database…");

      const payload = {
        ...formData,
        creatorId,
        onChainCampaignId,
        status: 'ACTIVE',
      };

      const res = await fetch(`${API_BASE}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...payload,
          startDate: parseDMY(formData.startDate)?.toISOString(),
          endDate: parseDMY(formData.endDate)?.toISOString(),
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save campaign to database.");

      toast.success("🎉 Campaign created and live on-chain!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected in MetaMask.');
      } else if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        toast.error("Transaction failed: Please ensure your wallet is properly connected and has enough ETH.");
      } else if (error?.code === 'CALL_EXCEPTION') {
        toast.error(`Contract rejected the transaction: ${error?.reason || 'unknown reason'}.`);
      } else {
        toast.error(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
      setTxStatus('');
    }
  };


  return (
    <div className="selection:bg-sage-800 selection:text-white flex flex-col font-nunito">

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sage-800/60 hover:text-sage-800 transition-colors mb-10 font-bold uppercase tracking-widest text-[11px] group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-earth-100 text-earth-800 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
              Admin Control Panel
            </span>
            <h1 className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
              Create a New <br />
              <span className="italic font-light text-earth-500">Project</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/60">
            <div className="w-10 h-10 rounded-2xl bg-earth-500 flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sage-900">Security Check</p>
              <p className="text-xs font-light text-earth-900/60">Verified Admin Session</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* General Information */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sage-800 flex items-center justify-center text-white shadow-lg shadow-sage-800/20">
                <Layout size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">General Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Clean Water for Africa"
                  className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors appearance-none"
                >
                  {Object.keys(CAMPAIGN_TYPES).map(key => (
                    <option key={key} value={key}>{CAMPAIGN_TYPES[key]}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Share the story and impact of this campaign…"
                  className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-[32px] focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20 resize-none"
                  required
                ></textarea>
              </div>

              <div className="md:col-span-2 space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Cover Image URL</label>
                <div className="relative">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/…"
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-900/20">
                    <Upload size={18} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Funding & Schedule */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-earth-500 flex items-center justify-center text-white shadow-lg shadow-earth-500/20">
                <DollarSign size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">Funding & Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Hard Cap Goal (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    name="totalGoalAmount"
                    value={formData.totalGoalAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-earth-900/30">ETH</div>
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Soft Cap Goal (ETH)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    name="softCapAmount"
                    value={formData.softCapAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    required
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-earth-900/30">ETH</div>
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Start Date</label>
                <div className="relative">
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleDateInput}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                  />
                  <Calendar size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-earth-900/20 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">End Date</label>
                <div className="relative">
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleDateInput}
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                  />
                  <Calendar size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-earth-900/20 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Governance & Milestones */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                  <Target size={18} />
                </div>
                <h2 className="text-2xl font-fraunces text-sage-900">Governance & Milestones</h2>
              </div>

              {/* Council Members */}
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Council Members (Wallet Addresses)</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCouncilMember}
                      onChange={(e) => setNewCouncilMember(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCouncilMember())}
                      placeholder="0x…"
                      className="flex-grow px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    />
                    <Button type="button" onClick={addCouncilMember} className="bg-sage-800 hover:bg-sage-900 text-white rounded-2xl px-6 h-auto">
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {formData.councilMembers.map((addr, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-sage-100 text-sage-800 px-4 py-2 rounded-2xl border border-sage-200 text-xs font-mono group">
                      {addr.substring(0, 6)}…{addr.substring(38)}
                      <button type="button" onClick={() => removeCouncilMember(idx)} className="hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.councilMembers.length === 0 && (
                    <p className="text-sm text-earth-900/40 italic px-2">No council members added yet.</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Required Approval Votes</label>
                  <input
                    type="number"
                    name="requiredVotes"
                    min="1"
                    max={formData.councilMembers.length + 5}
                    value={formData.requiredVotes}
                    onChange={handleInputChange}
                    className="w-32 px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                  />
                  <p className="text-[10px] text-earth-900/40 px-2">Number of votes required to approve a milestone funding request.<br /><b>Note:</b> The Top 5 Donors are automatically granted voting rights.</p>
                </div>
              </div>

              <div className="h-px bg-sage-800/10 w-full" />

              {/* Milestones */}
              <div className="space-y-6">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Project Milestones</label>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7">
                    <input
                      type="text"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                      placeholder="Milestone title (e.g. Purchase Equipment)"
                      className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                      placeholder="ETH Amount"
                      className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={addMilestone} className="w-full h-full bg-sage-800 hover:bg-sage-900 text-white rounded-3xl">
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.milestones.map((ms, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-white border border-sage-200 rounded-3xl group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-earth-50 text-earth-500 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sage-900">{ms.title}</p>
                          <p className="text-xs text-earth-500 font-mono">{ms.amount} ETH</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeMilestone(idx)} className="p-2 text-earth-900/20 hover:text-red-500 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  {formData.milestones.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-sage-200 rounded-[32px] flex flex-col items-center justify-center text-earth-900/30">
                      <Target size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">No milestones added yet. Define how funds will be released.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
            <div className="flex items-center gap-4 text-earth-900/60">
              <CheckCircle2 size={24} className="text-earth-500" />
              <p className="text-sm font-light max-w-sm">
                {txStatus === 'chain' && 'Waiting for MetaMask confirmation and blockchain TX...'}
                {txStatus === 'db' && 'Transaction confirmed! Saving to database...'}
                {!txStatus && 'Clicking create will register this campaign on-chain via MetaMask, then save it to the database.'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto min-w-[280px] py-8 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-xl shadow-sage-800/20 transition-transform hover:-translate-y-1 active:scale-[0.98] font-bold disabled:opacity-70"
            >
              {txStatus === 'chain' && (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Waiting for MetaMask…</span>
              )}
              {txStatus === 'db' && (
                <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Saving to Database…</span>
              )}
              {!txStatus && 'Create Campaign'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateCampaign;
