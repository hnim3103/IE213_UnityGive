import React, { useMemo } from 'react';
import CampaignCard from './CampaignCard';
import axios from 'axios';
import useSWR from 'swr';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const ActiveCampaigns = () => {
  const fetcher = url => axios.get(url).then(res => res.data);
  const { data: allCampaigns = [], error, isLoading: loading } = useSWR('http://localhost:5000/api/campaigns', fetcher);

  const { displayItems, campaignsBuffer } = useMemo(() => {
    if (!allCampaigns) return { displayItems: [], campaignsBuffer: [] };
    const activeData = allCampaigns.filter(item => item.status === 'ACTIVE');
    const display = activeData.slice(0, 3);
    return { displayItems: display, campaignsBuffer: activeData };
  }, [allCampaigns]);

  const itemCount = campaignsBuffer.length;
  const colCount = displayItems.length >= 3 ? 3 : displayItems.length;

  return (
    <section className="bg-sage-section py-32 px-8 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-fraunces font-thin text-sage-800 leading-tight tracking-tight">
              Active Fundraising Campaigns
            </h2>
            <p className="text-earth-900 font-nunito font-extralight text-lg max-w-xl">
              Choose campaigns aligned with your values and start your journey of sowing seeds of hope today.
            </p>
          </div>

          <Link to="/campaigns" className="group shrink-0">
            <Button variant="ghost" className="text-earth-500 hover:text-earth-500 hover:bg-earth-500/5 px-0 font-nunito flex items-center gap-2 text-lg font-light transition-all">
              View all campaigns
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full max-w-[380px] bg-sage-50/50 rounded-[32px] h-[524px] animate-pulse border border-sage-800/5" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-10">
            {displayItems.length > 0 ? (
              displayItems.map((campaign, index) => (
                <div key={campaign._id} className={`w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[${index * 150}ms]`}>
                  <CampaignCard campaign={campaign} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center font-nunito font-extralight text-earth-800/60 bg-white/30 rounded-[64px] border-2 border-dashed border-sage-800/10">
                <span className="material-symbols-outlined text-4xl mb-4 block opacity-40">eco</span>
                Currently, there are no active campaigns. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default ActiveCampaigns;
