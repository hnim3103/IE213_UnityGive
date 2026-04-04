import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignHeader from '../features/campaigns/components/CampaignHeader';
import DonationCard from '../features/campaigns/components/DonationCard';
import MilestoneTimeline from '../features/campaigns/components/MilestoneTimeline';
import { toast } from 'sonner';

const CampaignDetail = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/campaigns/${id}`);
      setCampaign(res.data);
      
      if (res.data.orgId) {
        // Assume we have an endpoint for org details or it's populated
        // For now, let's try to fetch if not populated
        if (typeof res.data.orgId === 'object') {
          setOrganization(res.data.orgId);
        } else {
            const orgRes = await axios.get(`http://localhost:5000/api/organizations/${res.data.orgId}`);
            setOrganization(orgRes.data);
        }
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (amount) => {
    // This will be implemented with Web3 later
    toast.success(`Processing donation of ${amount} ETH...`);
    // Placeholder for contract interaction
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
        <span className="mt-4 font-fraunces font-thin text-sage-800 text-2xl">Loading the Seeds of Hope...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-sage-bg flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-4xl font-fraunces font-thin text-sage-800 mb-4">Campaign Not Found</h2>
            <p className="font-nunito font-extralight text-earth-900 max-w-md">The project you are looking for might have been removed or the link is incorrect.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-8 py-20 flex flex-col gap-24">
        {/* Top Section */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <CampaignHeader campaign={campaign} organization={organization} />
        </section>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {/* Story / About */}
            <div className="flex flex-col gap-8">
              <h3 className="text-4xl font-fraunces font-thin text-sage-800 underline decoration-sage-200 underline-offset-8">About the Project</h3>
              <div className="text-earth-900 font-nunito font-extralight text-lg leading-loose space-y-6">
                {campaign.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <MilestoneTimeline milestones={campaign.milestones} />

            {/* Ambassadors / Council Info */}
            <div className="bg-white/50 backdrop-blur-md p-12 rounded-[48px] border border-white/50 shadow-sm flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-sage-800 text-3xl">account_balance</span>
                    <h3 className="text-3xl font-fraunces font-thin text-sage-800">Governance & Trust</h3>
                </div>
                <p className="text-earth-900 font-nunito font-extralight text-md leading-relaxed">
                    This campaign is governed by a decentralized multi-sig council. Every milestone requires 
                    <span className="font-bold text-sage-800"> {campaign.requiredVotes} out of {campaign.councilMembers?.length || 'a set'} </span> 
                    votes to release funds. This ensures maximum transparency and accountability for your donation.
                </p>
                {campaign.councilMembers && campaign.councilMembers.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-earth-500 font-bold font-nunito">Council Members</span>
                        <div className="flex flex-wrap gap-3">
                            {campaign.councilMembers.map((addr, i) => (
                                <div key={i} className="bg-sage-50 px-4 py-2 rounded-full text-xs font-nunito font-light text-sage-800 border border-sage-100">
                                    {addr.slice(0, 6)}...{addr.slice(-4)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
            <DonationCard campaign={campaign} onDonate={handleDonate} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CampaignDetail;