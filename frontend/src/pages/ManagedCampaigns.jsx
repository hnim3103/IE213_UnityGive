import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Search, Plus, ArrowLeft } from "lucide-react";
import { CAMPAIGN_TYPES } from "../lib/constant";
import { toast } from "sonner";

const ManagedCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } else {
      navigate("/login");
      return;
    }

    const loadCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
        setLoading(false);
      } catch (error) {
        console.error("Error loading campaigns:", error);
        toast.error("Failed to load campaigns");
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [navigate]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "ALL" || campaign.category === filterCategory;

    const matchesStatus =
      filterStatus === "ALL" || campaign.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-xl bg-sage-800/10 animate-pulse rounded-full" />
        </div>
        <h2 className="mt-8 font-fraunces text-2xl text-sage-900">
          Loading Campaigns…
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white flex flex-col font-nunito overflow-hidden">
      <Navbar />

      {/* Hero Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-earth-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 relative z-10 space-y-12">
        {/* Back Button */}
        <Button
          onClick={() => navigate("/admin/dashboard")}
          variant="ghost"
          className="p-2 hover:bg-sage-100 rounded-full transition-colors mb-4"
        >
          <ArrowLeft size={20} className="text-sage-800" />
        </Button>

        {/* Header */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 bg-earth-100 text-earth-800 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
                Admin Control Panel
              </span>
              <h1 className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
                Managed <br />
                <span className="italic font-light text-earth-500">
                  Campaigns
                </span>
              </h1>
              <p className="text-earth-900/60 font-light mt-4">
                View, edit, and manage all fundraising campaigns
              </p>
            </div>
            <Button
              onClick={() => navigate("/admin/campaigns/create")}
              className="bg-sage-800 hover:bg-sage-900 text-white px-8 py-6 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Plus size={18} />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/40"
            />
            <input
              type="text"
              placeholder="Search campaigns by title or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/60 backdrop-blur-xl border border-white rounded-3xl focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/40 shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-earth-800/70 font-nunito">
              Campaign Type
            </span>
            <div className="flex flex-wrap gap-2">
              {["ALL", ...Object.keys(CAMPAIGN_TYPES)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-nunito font-medium transition-colors whitespace-nowrap shadow-sm ${
                    filterCategory === cat
                      ? "bg-sage-800 text-white shadow-md shadow-sage-800/20"
                      : "bg-earth-100/60 text-sage-800 hover:bg-earth-100 border border-transparent"
                  }`}
                >
                  {cat === "ALL" ? "All" : CAMPAIGN_TYPES[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-earth-800/70 font-nunito">
              Status
            </span>
            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "ACTIVE", "COMPLETED", "CLOSED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2.5 rounded-full text-sm font-nunito font-medium transition-colors whitespace-nowrap shadow-sm ${
                      filterStatus === status
                        ? "bg-sage-800 text-white shadow-md shadow-sage-800/20"
                        : "bg-earth-100/60 text-sage-800 hover:bg-earth-100 border border-transparent"
                    }`}
                  >
                    {status === "ALL"
                      ? "All Status"
                      : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-earth-900/60 font-light">
          Showing {filteredCampaigns.length} of {campaigns.length} campaigns
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden group cursor-pointer"
                onClick={() =>
                  navigate(`/admin/campaigns/${campaign._id}/edit`)
                }
              >
                {/* Campaign Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-sage-200 to-earth-100">
                  {campaign.image ? (
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage-800/20">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-white text-sage-800 border border-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                      {campaign.category || "OTHER"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full ${
                        campaign.status === "ACTIVE"
                          ? "bg-white text-earth-600 border border-white"
                          : campaign.status === "PENDING"
                            ? "bg-white text-amber-600 border border-white"
                            : "bg-white text-sage-800 border border-white"
                      }`}
                    >
                      {campaign.status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-fraunces text-sage-900 line-clamp-2 group-hover:text-earth-500 transition-colors h-[56px] overflow-hidden">
                    {campaign.title}
                  </h3>

                  <p className="text-sm text-earth-900/60 font-light line-clamp-2">
                    {campaign.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-3 border-t border-sage-800/10 pt-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-900/60">Goal Amount</span>
                      <span className="font-bold text-sage-900">
                        {(Number(campaign.totalGoalAmount) / 1e18).toFixed(2)}{" "}
                        ETH
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-earth-900/60">Current Amount</span>
                      <span className="font-bold text-earth-500">
                        {(Number(campaign.currentAmount) / 1e18).toFixed(2)} ETH
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/campaigns/${campaign._id}/edit`);
                    }}
                    className="w-full bg-sage-800 hover:bg-sage-900 text-white rounded-2xl py-3 font-bold uppercase tracking-[0.15em] text-xs transition-colors mt-4"
                  >
                    Edit Campaign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-fraunces text-sage-900">
                No campaigns found
              </h3>
              <p className="text-earth-900/60 font-light">
                {searchTerm ||
                filterCategory !== "ALL" ||
                filterStatus !== "ALL"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first campaign to get started"}
              </p>
              {searchTerm === "" &&
                filterCategory === "ALL" &&
                filterStatus === "ALL" && (
                  <Button
                    onClick={() => navigate("/admin/campaigns/create")}
                    className="mt-6 bg-sage-800 hover:bg-sage-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-[0.15em] text-xs"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Campaign
                  </Button>
                )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ManagedCampaigns;
