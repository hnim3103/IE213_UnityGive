import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import { Button } from '../components/ui/button';
import { CAMPAIGN_TYPES } from '../lib/constant';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaigns');
        setCampaigns(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesCategory = activeCategory === 'ALL' || campaign.category === activeCategory;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status Logic
    let matchesStatus = true;
    if (activeStatus !== 'All') {
      if (activeStatus === 'Ending Soon') {
        if (campaign.status === 'ACTIVE' && campaign.endDate) {
          const daysLeft = (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24);
          matchesStatus = daysLeft >= 0 && daysLeft <= 7;
        } else {
          matchesStatus = false;
        }
      } else {
        matchesStatus = campaign.status === activeStatus.toUpperCase();
      }
    }

    return matchesCategory && matchesSearch && matchesStatus;
  });

  const categories = ['ALL', ...Object.keys(CAMPAIGN_TYPES)];

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-sage-section pt-32 pb-20 px-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-fraunces font-thin text-sage-800 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Our Initiatives
          </h1>
          <p className="text-earth-900 font-nunito font-extralight text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            Transparent, milestone-based projects where every contribution is tracked and verified.
          </p>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="py-10 px-8 bg-sage-bg top-20 z-40 border-b border-sage-800/10 backdrop-blur-md bg-sage-bg/95">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">

          <div className="flex flex-col gap-8 flex-grow">
            {/* Project Type */}
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-earth-800/70 font-nunito">
                Campaign Type
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-nunito font-medium transition-all whitespace-nowrap ${activeCategory === cat
                        ? "bg-sage-800 text-white shadow-md shadow-sage-800/20"
                        : "bg-[#efece4] text-sage-800 hover:bg-[#e6e2d6] border border-transparent"
                      }`}
                  >
                    {cat === 'ALL' ? 'All' : CAMPAIGN_TYPES[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-earth-800/70 font-nunito">
                Current Status
              </span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Draft', 'Active', 'Paused', 'Completed', 'Failed', 'Refunding', 'Cancelled', 'Ending Soon'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className={`px-5 py-2.5 rounded-full text-sm font-nunito font-medium transition-all whitespace-nowrap ${activeStatus === status
                        ? "bg-sage-800 text-white shadow-md shadow-sage-800/20"
                        : "bg-[#efece4] text-sage-800 hover:bg-[#e6e2d6] border border-transparent"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:max-w-xs mt-2 group shrink-0">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-sage-800/40 text-xl group-focus-within:text-earth-500 transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/60 border border-sage-800/10 rounded-full font-nunito focus:outline-none focus:ring-2 focus:ring-earth-500/20 focus:bg-white transition-all text-sage-800 shadow-sm hover:shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Campaign Listing Grid */}
      <section className="py-24 px-8 min-h-[400px]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-wrap justify-center gap-10">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-full max-w-[380px] bg-sage-50/50 rounded-[32px] h-[524px] animate-pulse border border-sage-800/5" />
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredCampaigns.map((campaign, index) => (
                <div key={campaign._id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center font-nunito font-extralight text-earth-800/60 bg-white/30 rounded-[64px] border-2 border-dashed border-sage-800/10 max-w-4xl mx-auto">
              <span className="material-symbols-outlined text-5xl mb-6 block opacity-40">eco</span>
              <h3 className="text-2xl font-fraunces mb-2">No campaigns found</h3>
              <p>Try adjusting your filters or search keywords to find what you're looking for.</p>
              <Button
                onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
                variant="ghost"
                className="mt-6 text-earth-500 hover:text-earth-600 font-light"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Campaigns;
