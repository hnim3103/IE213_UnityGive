import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';
import { CAMPAIGN_TYPES } from '../lib/constant';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.amount) {
      toast.error("Please fill in both milestone title and amount.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...newMilestone, isApproved: false, isFunded: false }]
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
    if (!newCouncilMember) return;
    if (!newCouncilMember.startsWith('0x') || newCouncilMember.length !== 42) {
      toast.error("Invalid Ethereum address.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      councilMembers: [...prev.councilMembers, newCouncilMember]
    }));
    setNewCouncilMember('');
  };

  const removeCouncilMember = (index) => {
    setFormData(prev => ({
      ...prev,
      councilMembers: prev.councilMembers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.totalGoalAmount || !formData.softCapAmount || !formData.image) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const payload = {
        ...formData,
        creatorId: user._id
      };

      const res = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create campaign.");
      }

      toast.success("Campaign created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
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
              <span className="italic font-light text-earth-500">Campaign</span>
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
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Campaign Title</label>
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
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                    required
                  />
                  <Calendar size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-earth-900/20 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">End Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                    required
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
                    max={formData.councilMembers.length || 1}
                    value={formData.requiredVotes}
                    onChange={handleInputChange}
                    className="w-32 px-6 py-4 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                  />
                  <p className="text-[10px] text-earth-900/40 px-2">Number of council members required to approve a milestone funding request.</p>
                </div>
              </div>

              <div className="h-px bg-sage-800/10 w-full" />

              {/* Milestones */}
              <div className="space-y-6">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">Campaign Milestones</label>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-7">
                    <input 
                      type="text"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
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
                By clicking create, this campaign will be saved as a draft. You will need to deploy it to the blockchain later.
              </p>
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto min-w-[280px] py-8 bg-sage-800 hover:bg-sage-900 text-white rounded-full text-lg shadow-xl shadow-sage-800/20 transition-transform hover:-translate-y-1 active:scale-[0.98] font-bold disabled:opacity-70"
            >
              {isLoading ? 'Processing…' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateCampaign;
