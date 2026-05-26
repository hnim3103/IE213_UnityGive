import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Trash2, X, Plus, Layout, Target, DollarSign, Calendar, Upload, ArrowLeft } from "lucide-react";
import { CAMPAIGN_TYPES } from "../lib/constant";
import { API_BASE } from "../lib/api";

const EditCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      setUser(parsedUser);
    } else {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalGoalAmount: "",
    softCapAmount: "",
    category: "OTHER",
    image: "",
    startDate: "",
    endDate: "",
    requiredVotes: 1,
    councilMembers: [],
    milestones: [],
    status: "PENDING",
  });

  const [newMilestone, setNewMilestone] = useState({ title: "", amount: "" });
  const [newCouncilMember, setNewCouncilMember] = useState("");

  // Load campaign data
  useEffect(() => {
    if (!id) return;

    const loadCampaign = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        const campaigns = Array.isArray(data) ? data : data.campaigns || [];
        const campaign = campaigns.find((c) => c._id === id);

        if (campaign) {
          setFormData({
            title: campaign.title || "",
            description: campaign.description || "",
            totalGoalAmount: campaign.totalGoalAmount || "",
            softCapAmount: campaign.softCapAmount || "",
            category: campaign.category || "OTHER",
            image: campaign.image || "",
            startDate: campaign.startDate
              ? campaign.startDate.split("T")[0]
              : "",
            endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
            requiredVotes: campaign.requiredVotes || 1,
            councilMembers: campaign.councilMembers || [],
            milestones: campaign.milestones || [],
            status: campaign.status || "PENDING",
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading campaign:", error);
        toast.error("Failed to load campaign");
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.amount) {
      toast.error("Please fill in both milestone title and amount.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: newMilestone.title,
          amount: newMilestone.amount,
          isApproved: false,
          isFunded: false,
        },
      ],
    }));
    setNewMilestone({ title: "", amount: "" });
  };

  const removeMilestone = (index) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const addCouncilMember = () => {
    if (!newCouncilMember) return;
    if (!newCouncilMember.startsWith("0x") || newCouncilMember.length !== 42) {
      toast.error("Invalid Ethereum address.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      councilMembers: [...prev.councilMembers, newCouncilMember],
    }));
    setNewCouncilMember("");
  };

  const removeCouncilMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      councilMembers: prev.councilMembers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.totalGoalAmount ||
      !formData.softCapAmount ||
      !formData.image
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.startDate && formData.endDate) {
      const startTs = new Date(formData.startDate).getTime();
      const endTs = new Date(formData.endDate).getTime();
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayTs = today.getTime();
      
      if (endTs <= startTs) {
        toast.error("End date must be after the start date.");
        return;
      }
      if (endTs <= todayTs) {
        toast.error("End date must be in the future.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/api/campaigns/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        toast.success("Project updated successfully!");
        navigate("/admin/campaigns");
      } else {
        toast.error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("An error occurred while updating the campaign");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-xl bg-sage-800/10 animate-pulse rounded-full" />
        </div>
        <h2 className="mt-8 font-fraunces text-2xl text-sage-900">
          Loading Campaign…
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white flex flex-col font-nunito">
      <Navbar />

      {/* Hero Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-earth-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 lg:px-8 py-16 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate("/admin/campaigns")}
            variant="ghost"
            className="p-2 hover:bg-sage-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-sage-800" />
          </Button>
          <div>
            <span className="inline-block px-3 py-1 bg-earth-100 text-earth-800 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-2">
              Admin Control Panel
            </span>
            <h1 className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
              Edit <br />
              <span className="italic font-light text-earth-500">Project</span>
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* General Information */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sage-800 flex items-center justify-center text-white shadow-lg shadow-sage-800/20">
                <Layout size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Clean Water for Africa"
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors appearance-none"
                >
                  {Object.keys(CAMPAIGN_TYPES).map((key) => (
                    <option key={key} value={key}>
                      {CAMPAIGN_TYPES[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Share the story and impact of this campaign…"
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-[32px] focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20 resize-none"
                  required
                ></textarea>
              </div>

              <div className="md:col-span-2 space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Cover Image URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/…"
                    className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-900/20">
                    <Upload size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors appearance-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Funding & Schedule */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-earth-500 flex items-center justify-center text-white shadow-lg shadow-earth-500/20">
                <DollarSign size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">
                Funding & Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Total Goal Amount (Wei)
                </label>
                <input
                  type="number"
                  name="totalGoalAmount"
                  value={formData.totalGoalAmount}
                  onChange={handleInputChange}
                  placeholder="1000000000000000000"
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Soft Cap Amount (Wei)
                </label>
                <input
                  type="number"
                  name="softCapAmount"
                  value={formData.softCapAmount}
                  onChange={handleInputChange}
                  placeholder="500000000000000000"
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  disabled
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/30 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] uppercase tracking-widest text-earth-900/50 font-extrabold px-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Milestones */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Target size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">
                Milestones
              </h2>
            </div>

            {formData.milestones.length > 0 && (
              <div className="space-y-3">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-sage-50/50 p-4 rounded-2xl border border-sage-200"
                  >
                    <div>
                      <p className="font-bold text-sage-900">
                        {milestone.title}
                      </p>
                      <p className="text-sm text-earth-900/80">
                        {milestone.amount} Wei
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      variant="ghost"
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
              />
              <input
                type="number"
                placeholder="Amount (Wei)"
                value={newMilestone.amount}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, amount: e.target.value })
                }
                className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
              />
              <Button
                type="button"
                onClick={addMilestone}
                variant="outline"
                className="w-full rounded-2xl py-4 border-sage-800 text-sage-800 font-bold uppercase tracking-[0.15em] text-xs hover:bg-sage-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Milestone
              </Button>
            </div>
          </section>

          {/* Council Members */}
          <section className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <ShieldCheck size={18} />
              </div>
              <h2 className="text-2xl font-fraunces text-sage-900">
                Council Members
              </h2>
            </div>

            {formData.councilMembers.length > 0 && (
              <div className="space-y-3">
                {formData.councilMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-sage-50/50 p-4 rounded-2xl border border-sage-200 break-all"
                  >
                    <p className="font-mono text-sm text-sage-900">{member}</p>
                    <Button
                      type="button"
                      onClick={() => removeCouncilMember(index)}
                      variant="ghost"
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg flex-shrink-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ethereum address (0x...)"
                value={newCouncilMember}
                onChange={(e) => setNewCouncilMember(e.target.value)}
                className="w-full px-6 py-4 text-sage-900 bg-sage-50/50 border border-sage-200 rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/20"
              />
              <Button
                type="button"
                onClick={addCouncilMember}
                variant="outline"
                className="w-full rounded-2xl py-4 border-sage-800 text-sage-800 font-bold uppercase tracking-[0.15em] text-xs hover:bg-sage-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Council Member
              </Button>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              type="button"
              onClick={() => navigate("/admin/campaigns")}
              variant="outline"
              className="flex-1 rounded-2xl py-6 border-sage-800 text-sage-800 font-bold uppercase tracking-[0.15em] text-xs hover:bg-sage-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-sage-800 hover:bg-sage-900 text-white rounded-2xl py-6 font-bold uppercase tracking-[0.15em] text-xs transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              {isSaving ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditCampaign;
