import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import {
  Heart,
  Trophy,
  Wallet,
  ExternalLink,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Activity,
  History,
  RefreshCw,
  BarChart3,
  Users,
  Zap,
  MoreVertical,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import { API_BASE } from "../lib/api";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignPage, setCampaignPage] = useState(0);
  const [adminData, setAdminData] = useState({
    users: [],
    campaigns: [],
    donations: [],
    pendingKyc: [],
  });
  const [openUserMenuId, setOpenUserMenuId] = useState(null);
  const [openCampaignMenuId, setOpenCampaignMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminData = async () => {
      try {
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

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [usersRes, campaignsRes, donationsRes, kycRes] =
          await Promise.all([
            fetch(`${API_BASE}/api/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/api/campaigns`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/api/donations`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_BASE}/api/users/kyc/pending`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const usersData = await usersRes.json();
        const campaignsData = await campaignsRes.json();
        const donationsData = await donationsRes.json();
        const kycData = await kycRes.json();

        setAdminData({
          users: Array.isArray(usersData) ? usersData : usersData.users || [],
          campaigns: Array.isArray(campaignsData)
            ? campaignsData
            : campaignsData.campaigns || [],
          donations: Array.isArray(donationsData)
            ? donationsData
            : donationsData.donations || [],
          pendingKyc: Array.isArray(kycData) ? kycData : [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading admin data:", error);
        setLoading(false);
      }
    };

    loadAdminData();
  }, [navigate]);

  const handleUpdateCampaign = async (id, currentStatus) => {
    // Basic cycle: ACTIVE -> PAUSED -> CANCELLED (or similar)
    // For simplicity, we just trigger a confirm for PAUSE/CANCEL based on current
    let newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    if (
      newStatus === "PAUSED" &&
      !window.confirm("Are you sure you want to pause this campaign?")
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update campaign");
      toast.success(`Campaign ${newStatus.toLowerCase()}`);

      setAdminData((prev) => ({
        ...prev,
        campaigns: prev.campaigns.map((c) =>
          c._id === id ? { ...c, status: newStatus } : c,
        ),
      }));
      setOpenCampaignMenuId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateUser = async (id, actionType, currentValue) => {
    let payload = {};
    if (actionType === "role") {
      const newRole = currentValue === "admin" ? "donor" : "admin";
      if (
        !window.confirm(`Are you sure you want to change role to ${newRole}?`)
      )
        return;
      payload = { role: newRole };
    } else if (actionType === "status") {
      const newStatus = currentValue === "active" ? "suspended" : "active";
      if (
        !window.confirm(`Are you sure you want to mark user as ${newStatus}?`)
      )
        return;
      payload = { status: newStatus };
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${id}/manage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      toast.success("User updated");

      setAdminData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u._id === id ? { ...u, ...payload } : u)),
      }));
      setOpenUserMenuId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-xl bg-sage-800/10 animate-pulse rounded-full" />
        </div>
        <h2 className="mt-8 font-fraunces text-2xl text-sage-900">
          Loading Admin Dashboard…
        </h2>
      </div>
    );
  }

  if (!user || adminData.campaigns.length === 0) return null;

  // ETH price for conversion
  const ETH_PRICE_USD = 2500;

  // Calculate stats from data
  const totalDonationsETH = (
    adminData.donations.reduce((sum, d) => {
      const amount = Number(d.amount || 0);
      const converted =
        d.method === "crypto" ? amount / 1e18 : amount / ETH_PRICE_USD;
      return sum + converted;
    }, 0) || 0
  ).toFixed(3);

  const adminStats = [
    {
      label: "Total Campaigns",
      value: adminData.campaigns.length,
      icon: BarChart3,
      textClass: "text-sage-800",
      bgClass: "bg-sage-100",
      borderClass: "border-sage-200",
    },
    {
      label: "Active Users",
      value: adminData.users.length,
      icon: Users,
      textClass: "text-earth-500",
      bgClass: "bg-earth-100",
      borderClass: "border-earth-200",
    },
    {
      label: "Total Donations",
      value: `${totalDonationsETH} ETH`,
      icon: Zap,
      textClass: "text-teal-700",
      bgClass: "bg-teal-50",
      borderClass: "border-teal-100",
    },
    {
      label: "Donation Count",
      value: adminData.donations.length,
      icon: Heart,
      textClass: "text-rose-600",
      bgClass: "bg-rose-50",
      borderClass: "border-rose-100",
    },
  ];

  const myCampaigns = adminData.campaigns.map((campaign) => {
    const campaignDonations = adminData.donations.filter(
      (d) =>
        d.campaignId === campaign._id || d.campaignId?._id === campaign._id,
    );
    const totalDonated = (
      campaignDonations.reduce((acc, donation) => {
        const amount = Number(donation.amount || 0);
        const converted =
          donation.method === "crypto" ? amount / 1e18 : amount / ETH_PRICE_USD;
        return acc + converted;
      }, 0) || 0
    ).toFixed(3);

    const targetEth = parseFloat(campaign.totalGoalAmount || 0);
    const raisedWei =
      campaign.currentAmount && campaign.currentAmount !== "0"
        ? BigInt(campaign.currentAmount.toString().split(".")[0])
        : 0n;
    const raisedEth =
      raisedWei > 0n ? parseFloat((Number(raisedWei) / 1e18).toFixed(6)) : 0;
    const progress =
      targetEth > 0
        ? Math.min(100, Math.round((raisedEth / targetEth) * 100))
        : 0;

    return {
      id: campaign._id,
      title: campaign.title,
      image: campaign.image,
      donated: totalDonated ? `${totalDonated} ETH` : "0 ETH",
      category: campaign.category || "COMMUNITY",
      status: campaign.status || "ACTIVE",
      progress,
      currentMilestone: campaign.currentMilestone || "Fundraising",
      priority: campaign.priority || "MEDIUM",
    };
  });

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white flex flex-col font-nunito overflow-hidden">
      {/* Hero Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-earth-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 py-16 relative z-10 space-y-16">
        {/* Profile Header */}
        <section className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 pb-10 border-b border-sage-800/10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group perspective">
              <div className="w-32 h-32 rounded-[40px] bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User profile avatar"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-fraunces text-sage-800 uppercase">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-sage-800 text-white p-2.5 rounded-2xl shadow-xl border-2 border-sage-bg transform transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <span className="inline-block px-3 py-1 bg-sage-800/10 text-sage-800 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
                System Administrator
              </span>
              <h1 className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
                Welcome back, <br className="hidden md:block" />
                <span className="italic font-light text-earth-500">
                  {user.name.split(" ")[0]}
                </span>
              </h1>
              <p className="text-earth-900/60 max-w-md font-light text-lg">
                Monitor all campaigns, users, and donations from your admin
                dashboard
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="rounded-full px-8 py-6 border-sage-800/20 text-sage-800 hover:bg-sage-800/5 transition-colors font-bold"
            >
              Admin Settings
            </Button>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full mt-12 animate-in fade-in duration-700 items-start">
          {/* Main Content Area */}
          <div className="flex-grow min-w-0">
            {activeTab === "overview" && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {adminStats.map((stat, i) => (
                  <div
                    key={i}
                    className={`bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border ${stat.borderClass} shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500 relative overflow-hidden`}
                  >
                    <div
                      className={`absolute -right-4 -top-4 w-32 h-32 rounded-full ${stat.bgClass} opacity-50 blur-3xl group-hover:scale-150 transition-transform duration-700`}
                    />

                    <div
                      className={`w-14 h-14 rounded-2xl ${stat.bgClass} ${stat.textClass} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 mb-6 shadow-sm border border-white`}
                    >
                      <stat.icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-earth-900/50">
                        {stat.label}
                      </span>
                      <p
                        className={`text-4xl font-fraunces ${stat.textClass} tracking-tight`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {activeTab === "campaigns" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-fraunces text-sage-900 flex items-center gap-3">
                      Managed Campaigns
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-earth-500"></span>
                      </span>
                    </h2>
                    <Button
                      onClick={() => navigate("/create-campaign")}
                      className="bg-sage-800 text-white rounded-xl shadow-sm hover:bg-sage-900 text-xs px-4 border border-sage-900/10 transition-colors py-2 font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px] mr-1.5 align-middle">
                        add
                      </span>
                      Create Campaign
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-sage-800/60">
                      {campaignPage * 3 + 1}-
                      {Math.min((campaignPage + 1) * 3, myCampaigns.length)} of{" "}
                      {myCampaigns.length}
                    </span>
                    <Button
                      onClick={() =>
                        setCampaignPage(Math.max(0, campaignPage - 1))
                      }
                      disabled={campaignPage === 0}
                      variant="ghost"
                      className="p-2 hover:bg-sage-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} className="rotate-180" />
                    </Button>
                    <Button
                      onClick={() =>
                        setCampaignPage(
                          Math.min(
                            Math.ceil(myCampaigns.length / 3) - 1,
                            campaignPage + 1,
                          ),
                        )
                      }
                      disabled={
                        campaignPage >= Math.ceil(myCampaigns.length / 3) - 1
                      }
                      variant="ghost"
                      className="p-2 hover:bg-sage-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </Button>
                    <Button
                      onClick={() => navigate("/admin/campaigns")}
                      variant="ghost"
                      className="ml-2 px-3 py-1.5 text-xs font-bold text-sage-800 hover:bg-sage-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      View All
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {myCampaigns
                    .slice(campaignPage * 3, (campaignPage + 1) * 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
                          {/* Campaign Image */}
                          <div className="w-full md:w-40 h-40 flex-shrink-0 rounded-3xl overflow-hidden bg-gradient-to-br from-sage-200 to-earth-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Heart size={48} className="text-sage-800/20" />
                              </div>
                            )}
                          </div>

                          {/* Campaign Info */}
                          <div className="flex flex-col md:flex-row justify-between gap-8 flex-grow">
                            <div className="space-y-5 flex-grow">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 bg-sage-800/5 text-sage-800 border border-sage-800/10 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-earth-900/50 uppercase tracking-[0.2em]">
                                  <Activity
                                    size={12}
                                    className="text-earth-500"
                                  />
                                  {item.status}
                                </span>
                              </div>
                              <h3 className="text-2xl font-fraunces text-sage-900 leading-tight group-hover:text-earth-500 transition-colors">
                                {item.title}
                              </h3>
                              <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-earth-900/60 font-light text-sm">
                                    Campaign Progress
                                  </span>
                                  <span className="font-bold text-sage-800 bg-sage-100 px-3 py-1 rounded-full text-xs">
                                    {item.progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={item.progress}
                                  className="h-2.5 bg-sage-200/50"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col justify-between items-start md:items-end gap-6 min-w-[200px] border-t md:border-t-0 md:border-l border-sage-800/10 pt-6 md:pt-0 md:pl-8">
                              <div className="text-left md:text-right w-full">
                                <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-earth-900/40 mb-2">
                                  Total Donations
                                </span>
                                <span className="text-3xl font-fraunces text-sage-900">
                                  {item.donated || "ETH0"}
                                </span>
                              </div>
                              <div className="flex gap-2 w-full relative">
                                <Button
                                  onClick={() =>
                                    navigate("/campaigns/" + item.id)
                                  }
                                  variant="outline"
                                  className="flex-grow rounded-2xl border-sage-800/20 text-sage-800 text-[10px] font-bold uppercase tracking-[0.1em] py-5 hover:bg-sage-800 hover:text-white transition-colors shadow-sm whitespace-nowrap px-4"
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  className="px-3 rounded-2xl border-sage-800/20 text-sage-800 hover:bg-sage-800 hover:text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenCampaignMenuId(
                                      openCampaignMenuId === item.id
                                        ? null
                                        : item.id,
                                    );
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </Button>

                                {openCampaignMenuId === item.id && (
                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-sage-800/10 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                      onClick={() =>
                                        handleUpdateCampaign(
                                          item.id,
                                          item.status,
                                        )
                                      }
                                      className="w-full text-left px-4 py-3 text-sm font-bold text-sage-900 hover:bg-sage-50 transition-colors flex items-center gap-2"
                                    >
                                      {item.status === "ACTIVE" ? (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-earth-500"></span>{" "}
                                          Pause Campaign
                                        </>
                                      ) : (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>{" "}
                                          Reactivate Campaign
                                        </>
                                      )}
                                    </button>
                                    {/* We can add cancel here as well if the backend supports CANCELLED */}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "kyc" && adminData.pendingKyc.length > 0 && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-fraunces text-sage-900 flex items-center gap-3">
                      Pending Approvals
                      <span className="flex items-center justify-center bg-coral text-white text-xs font-bold w-6 h-6 rounded-full">
                        {adminData.pendingKyc.length}
                      </span>
                    </h2>
                    <p className="text-sm text-earth-900/60 font-light mt-2">
                      Review organization documents before granting verification
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminData.pendingKyc.map((org) => (
                    <div
                      key={org._id}
                      className="bg-white/60 backdrop-blur-xl border-l-[6px] border-l-coral p-6 rounded-[32px] shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sage-900">
                            {org.name}
                          </h3>
                          <p className="text-xs text-earth-900/60">
                            {org.email}
                          </p>
                        </div>
                      </div>
                      <div className="bg-sage-50 rounded-2xl border border-sage-200 p-4 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sage-800">
                          Submitted Documents
                        </span>
                        <ul className="mt-2 space-y-1">
                          {(org.kycDocuments || []).map((doc, idx) => (
                            <li key={idx}>
                              <a
                                href={doc}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 text-xs hover:underline flex items-center gap-1 break-all"
                              >
                                <ExternalLink size={12} /> {doc}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `${API_BASE}/api/users/kyc/${org._id}/status`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                  body: JSON.stringify({ status: "approved" }),
                                },
                              );
                              if (!res.ok) throw new Error("Failed to approve");
                              toast.success("Organization verified!");
                              setAdminData((prev) => ({
                                ...prev,
                                pendingKyc: prev.pendingKyc.filter(
                                  (k) => k._id !== org._id,
                                ),
                              }));
                            } catch (err) {
                              toast.error(err.message);
                            }
                          }}
                          className="flex-1 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-bold"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              const res = await fetch(
                                `${API_BASE}/api/users/kyc/${org._id}/status`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                  },
                                  body: JSON.stringify({ status: "rejected" }),
                                },
                              );
                              if (!res.ok) throw new Error("Failed to reject");
                              toast.success("Application rejected.");
                              setAdminData((prev) => ({
                                ...prev,
                                pendingKyc: prev.pendingKyc.filter(
                                  (k) => k._id !== org._id,
                                ),
                              }));
                            } catch (err) {
                              toast.error(err.message);
                            }
                          }}
                          variant="outline"
                          className="flex-1 rounded-full text-coral border-coral border hover:bg-coral/10 font-bold"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {activeTab === "kyc" && adminData.pendingKyc.length === 0 && (
              <div className="flex flex-col items-center justify-center p-16 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white text-center">
                <ShieldCheck size={48} className="text-sage-800/20 mb-4" />
                <h3 className="text-xl font-fraunces text-sage-900">
                  No Pending Verifications
                </h3>
                <p className="text-earth-900/60 font-light mt-2">
                  All organization KYC requests have been processed.
                </p>
              </div>
            )}

            {activeTab === "users" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-fraunces text-sage-900">
                      User Management
                    </h2>
                    <p className="text-sm text-earth-900/60 font-light mt-2">
                      Manage permissions and community roles
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-sage-800/10 font-bold uppercase text-[11px] tracking-[0.2em] text-earth-900/50 bg-white/30 sticky top-0 z-10">
                    <div className="col-span-4">User</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-3">Activity</div>
                    <div className="col-span-2">Action</div>
                  </div>

                  {/* Table Body - Scrollable */}
                  <div className="divide-y divide-sage-800/10 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-sage-300 scrollbar-track-transparent">
                    {(adminData.users || []).map((userItem, index) => {
                      // Determine role display
                      const getRoleDisplay = (user) => {
                        if (user.role === "admin") return "Admin";
                        if (user.role === "moderator") return "Moderator";
                        return "Donor";
                      };

                      // Determine role colors
                      const getRoleColor = (user) => {
                        if (user.role === "admin")
                          return "bg-earth-100 text-earth-700";
                        if (user.role === "moderator")
                          return "bg-sage-100 text-sage-700";
                        return "bg-teal-50 text-teal-700";
                      };

                      // Get avatar color
                      const getAvatarColor = () => {
                        const colors = [
                          "bg-earth-500",
                          "bg-sage-400",
                          "bg-teal-500",
                          "bg-rose-500",
                        ];
                        return colors[index % colors.length];
                      };

                      return (
                        <div
                          key={userItem._id}
                          className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-white/50 transition-colors group items-center"
                        >
                          {/* User Info */}
                          <div className="col-span-4 flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full ${getAvatarColor(userItem)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                            >
                              {userItem.name
                                .split(" ")
                                .map((n) => n.charAt(0))
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sage-900 text-sm flex items-center gap-1.5">
                                {userItem.name}
                                {userItem.isVerified && (
                                  <CheckCircle2
                                    className="text-sage-600"
                                    size={14}
                                  />
                                )}
                              </p>
                              <p className="text-[11px] text-earth-900/60 font-light">
                                {userItem.email}
                              </p>
                            </div>
                          </div>

                          {/* Role */}
                          <div className="col-span-3">
                            <span
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] ${getRoleColor(userItem)}`}
                            >
                              {getRoleDisplay(userItem)}
                            </span>
                          </div>

                          {/* Activity */}
                          <div className="col-span-3">
                            <p className="text-[11px] text-earth-900/60 font-light flex items-center gap-1.5">
                              <Activity size={12} className="text-earth-500" />
                              Just now
                            </p>
                          </div>

                          {/* Action */}
                          <div className="col-span-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenUserMenuId(
                                  openUserMenuId === userItem._id
                                    ? null
                                    : userItem._id,
                                );
                              }}
                              className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-800"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openUserMenuId === userItem._id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-sage-800/10 overflow-hidden z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                  onClick={() =>
                                    handleUpdateUser(
                                      userItem._id,
                                      "role",
                                      userItem.role,
                                    )
                                  }
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-sage-900 hover:bg-sage-50 transition-colors flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    verified_user
                                  </span>
                                  {userItem.role === "admin"
                                    ? "Remove Admin"
                                    : "Make Admin"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateUser(
                                      userItem._id,
                                      "status",
                                      userItem.status || "active",
                                    )
                                  }
                                  className="w-full text-left px-4 py-3 text-sm font-bold text-sage-900 hover:bg-coral/10 hover:text-coral transition-colors flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    block
                                  </span>
                                  {userItem.status === "suspended"
                                    ? "Reactivate User"
                                    : "Suspend User"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
