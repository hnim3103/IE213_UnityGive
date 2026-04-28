import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import useSWR from "swr";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { API_BASE } from "../lib/api";
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
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";

const fetcher = async (url) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "An error occurred");
  return data;
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userData, setUserData] = useState({
    campaigns: [],
    donations: [],
  });
  const navigate = useNavigate();

  const { data: dashboardData, isLoading: dashboardLoading } = useSWR(
    `${API_BASE}/api/users/profile/dashboard`,
    fetcher,
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error("Failed to parse user data", error);
            navigate("/login");
            return;
          }
        } else {
          navigate("/login");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [campaignsRes, donationsRes] = await Promise.all([
          fetch(`${API_BASE}/api/campaigns`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/donations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const campaignsData = await campaignsRes.json();
        const donationsData = await donationsRes.json();

        setUserData({
          campaigns: Array.isArray(campaignsData)
            ? campaignsData
            : campaignsData.campaigns || [],
          donations: Array.isArray(donationsData)
            ? donationsData
            : donationsData.donations || [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, API_BASE]);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0].toLowerCase();

      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No authorization token found. Please sign in again.");

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to link wallet to profile.");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Wallet successfully connected!");
    } catch (error) {
      console.error(error);
      if (error.code === 4001) {
        toast.error("You rejected the MetaMask connection request.");
      } else {
        toast.error(
          error.message || "An error occurred while connecting your wallet.",
        );
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
          <div className="absolute inset-0 blur-xl bg-sage-800/10 animate-pulse rounded-full" />
        </div>
        <h2 className="mt-8 font-fraunces text-2xl text-sage-900">
          Loading your Dashboard…
        </h2>
      </div>
    );
  }

  if (!user || !dashboardData) return null;
  const myDonations = userData.donations.filter((d) => {
    const currentDonorId =
      d.donorId?._id || d.donorId?.id || d.donorId || d.userId?._id || d.userId;
    const currentUserId = user?._id || user?.id;

    const isMatch = String(currentDonorId) === String(currentUserId);
    return isMatch;
  });


  // Use ethers.formatEther() to safely convert Wei strings — Number() loses precision on large ints
  const totalDonated = (
    myDonations.reduce((sum, d) => {
      try { return sum + parseFloat(ethers.formatEther(d.amount?.toString().split(".")[0] || "0")); }
      catch { return sum; }
    }, 0) || 0
  ).toFixed(3);

  const supportedProjectIds = new Set(
    myDonations.map((d) => {
      return String(d.campaignId?._id || d.campaignId?.id || d.campaignId);
    }),
  );

  const activeCampaigns = userData.campaigns.filter(
    (c) => c.status === "active" || c.status === "ACTIVE",
  ).length;

  const stats = [
    {
      label: "Total Donated",
      value: `${totalDonated || 0} ETH`,
      icon: Wallet,
      textClass: "text-sage-800",
      bgClass: "bg-sage-100",
      borderClass: "border-sage-200",
    },
    {
      label: "Campaigns Supported",
      value: `${supportedProjectIds.size || 0} Campaigns`,
      icon: Heart,
      textClass: "text-earth-500",
      bgClass: "bg-earth-100",
      borderClass: "border-earth-200",
    },
    {
      label: "Active Projects",
      value: `${activeCampaigns || 0} Campaigns`,
      icon: Trophy,
      textClass: "text-teal-700",
      bgClass: "bg-teal-50",
      borderClass: "border-teal-100",
    },
  ];

  const myCampaignsRaw = dashboardData.myCampaigns || [];
  const myCampaigns = myCampaignsRaw.map((item) => {
    const campaignDonations = myDonations.filter(
      (d) =>
        String(d.campaignId?._id || d.campaignId?.id || d.campaignId) ===
        String(item.id || item._id),
    );

    const totalDonatedToCampaign = campaignDonations.reduce((sum, d) => {
      try { return sum + parseFloat(ethers.formatEther(d.amount?.toString().split(".")[0] || "0")); }
      catch { return sum; }
    }, 0);

    return {
      ...item,
      donated:
        totalDonatedToCampaign > 0
          ? `${totalDonatedToCampaign.toFixed(3)} ETH`
          : "0.000 ETH",
    };
  });

  const impactFeed = dashboardData.impactFeed || [];

  return (
    <div className="selection:bg-sage-800 selection:text-white flex flex-col font-nunito overflow-hidden">
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
                {user.role === "admin"
                  ? "System Administrator"
                  : "Verified Donor"}
              </span>
              <h1 className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
                Welcome back, <br className="hidden md:block" />
                <span className="italic font-light text-earth-500">
                  {user.name.split(" ")[0]}
                </span>
              </h1>
              {user.walletAddress ? (
                <button
                  onClick={() => toast.info("Edit Wallet panel coming soon!")}
                  className="flex items-center gap-3 text-earth-900/60 bg-white/40 hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/60 w-fit mx-auto md:mx-0 transition-colors group cursor-pointer"
                >
                  <Wallet
                    size={16}
                    className="group-hover:text-earth-500 transition-colors"
                  />
                  <span className="text-xs font-bold tracking-widest font-mono group-hover:text-earth-500 transition-colors">
                    {user.walletAddress.substring(0, 6)}…
                    {user.walletAddress.substring(
                      user.walletAddress.length - 4,
                    )}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-sage-800 ml-2 bg-white px-2 py-0.5 rounded-full shadow-sm">
                    Edit Wallet
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="flex items-center gap-3 text-earth-900/60 bg-white/40 hover:bg-white/60 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/60 w-fit mx-auto md:mx-0 transition-colors group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <RefreshCw
                      size={12}
                      className="text-sage-800 animate-spin"
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  )}
                  <span className="text-xs font-bold tracking-widest uppercase">
                    {isConnecting ? "Connecting…" : "No wallet connected"}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-white ml-2 bg-sage-800 hover:bg-sage-900 px-3 py-1 rounded-full shadow-sm transition-colors">
                    Connect Wallet
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="rounded-full px-8 py-6 border-sage-800/20 text-sage-800 hover:bg-sage-800/5 transition-colors font-bold"
            >
              Profile Settings
            </Button>
            <Button
              onClick={() => navigate("/campaigns")}
              className="bg-sage-800 hover:bg-sage-900 text-white rounded-full px-8 py-6 shadow-xl shadow-sage-800/20 transition-transform hover:-translate-y-1 font-bold"
            >
              Explore Campaigns
            </Button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {stats.map((stat, i) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-fraunces text-sage-900 flex items-center gap-3">
                My Supported Campaigns
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-earth-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-earth-500"></span>
                </span>
              </h2>
              <Button
                onClick={() => toast.info("Donation history log coming soon!")}
                variant="ghost"
                className="text-sage-800/60 hover:text-sage-800 font-bold uppercase tracking-widest text-[11px] group"
              >
                View History{" "}
                <ChevronRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {myCampaigns.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[40px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/90 transition-colors duration-500 group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-5 flex-grow">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 bg-sage-800/5 text-sage-800 border border-sage-800/10 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-earth-900/50 uppercase tracking-[0.2em]">
                          <Activity size={12} className="text-earth-500" />
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-fraunces text-sage-900 leading-tight group-hover:text-earth-500 transition-colors">
                        {item.title}
                      </h3>
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-earth-900/60 font-light text-sm">
                            Campaign Growth
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
                          My Contribution
                        </span>
                        <span className="text-3xl font-fraunces text-sage-900">
                          {item.donated}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate("/campaigns/" + item.id)}
                        variant="outline"
                        className="w-full rounded-2xl border-sage-800/20 text-sage-800 text-xs font-bold uppercase tracking-[0.15em] py-6 hover:bg-sage-800 hover:text-white transition-colors shadow-sm"
                      >
                        Track Impact
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-sage-800/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-earth-900/60">
                      <TrendingUp size={16} className="text-earth-500" />
                      <span className="text-sm font-light">
                        Currently in{" "}
                        <strong className="text-sage-800 font-bold">
                          {item.currentMilestone}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-sage-400">
                      On Track
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            <h2 className="text-3xl font-fraunces text-sage-900 hidden lg:block">
              Impact Feed
            </h2>

            <div className="bg-[#f1eee2] p-10 rounded-[48px] border border-white/60 shadow-inner space-y-10 relative overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-earth-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 space-y-8">
                {impactFeed.map((event) => (
                  <div key={event.id} className="relative pl-10 group">
                    <div className="absolute left-[3px] top-[4px] bottom-[-32px] w-0.5 bg-sage-800/10 last:hidden" />
                    <div
                      className={`absolute -left-0 top-[2px] w-6 h-6 rounded-full border-4 border-[#f1eee2] ${event.type === "success" ? "bg-earth-500" : "bg-sage-400"} shadow-sm group-hover:scale-125 transition-transform duration-300`}
                    />

                    <div className="space-y-2 bg-white/30 backdrop-blur-sm p-4 rounded-3xl border border-white/50 group-hover:bg-white/60 transition-colors">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-earth-900/40">
                        {event.time}
                      </span>
                      <h4 className="font-bold text-sage-900 text-sm leading-tight flex items-start gap-2">
                        {event.project}
                      </h4>
                      <p className="text-xs font-light text-earth-900/70 leading-relaxed font-nunito">
                        {event.event}
                      </p>
                      <button
                        onClick={() =>
                          toast.success(
                            "Redirecting to external block explorer...",
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-sage-800 hover:text-earth-500 transition-colors pt-2"
                      >
                        View Chain Proof <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-sage-800/10 relative z-10">
                <div className="bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm flex gap-4 items-start">
                  <div className="p-2 bg-earth-50 rounded-full text-earth-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-sage-900 block">
                      DAO Verified
                    </span>
                    <p className="text-xs font-light text-earth-900/70 leading-relaxed">
                      All feed events are pulled from on-chain logs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="font-bold text-sage-800 mb-6 uppercase tracking-widest text-[11px]">
                Quick Overview
              </h3>
              <ul className="space-y-3">
                {[
                  { icon: Award, label: "My Badges", count: "3 Earned" },
                  {
                    icon: History,
                    label: "Donation History",
                    count: "View Log",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Privacy Settings",
                    count: "Public",
                  },
                ].map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => toast.info(`${item.label} coming soon!`)}
                      className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-sage-50 text-earth-900/70 hover:text-sage-800 transition-colors border border-transparent hover:border-sage-800/10 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-sage-800/5 p-2 rounded-2xl text-sage-800 group-hover:scale-110 transition-transform">
                          <item.icon size={18} />
                        </div>
                        <span className="text-sm font-bold">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-earth-500/60 font-mono tracking-wider">
                        {item.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
