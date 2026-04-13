import React, { useEffect, useState } from 'react';
import CampaignCard from './CampaignCard';
import api from '../lib/api';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const ActiveCampaigns = () => {
  const [campaignsBuffer, setCampaignsBuffer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/api/campaigns');
      
      // js-combine-iterations: Filter and set data directly
      const activeData = response.data.filter(item => item.status === 'ACTIVE');
      setCampaignsBuffer(activeData);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // rerender-derived-state-no-effect: Logic is correctly outside effects now
  const displayItems = campaignsBuffer.slice(0, 3);

  return (
    <section className="bg-sage-section py-32 px-8 overflow-hidden relative" aria-labelledby="initiatives-title">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 id="initiatives-title" className="text-4xl md:text-5xl font-fraunces font-thin text-sage-800 leading-tight tracking-tight">
              Our Ongoing Initiatives
            </h2>
            <p className="text-earth-900 font-nunito font-extralight text-lg max-w-xl">
              Support our various projects and see exactly how your donation makes an impact at every milestone.
            </p>
          </div>

          <Link to="/campaigns" className="group shrink-0">
            <Button variant="ghost" className="text-earth-500 hover:text-earth-500 hover:bg-earth-500/5 px-0 font-nunito flex items-center gap-2 text-lg font-light transition-all">
              View all projects
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full max-w-[380px] bg-sage-50/50 rounded-[32px] h-[524px] animate-pulse border border-sage-800/10" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-10">
            {displayItems.length > 0 ? (
              displayItems.map((campaign, index) => (
                <div key={campaign._id} className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                  <CampaignCard campaign={campaign} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center font-nunito font-extralight text-earth-800/60 bg-white/30 rounded-[64px] border-2 border-dashed border-sage-800/10 w-full">
                <span className="material-symbols-outlined text-4xl mb-4 block opacity-40" aria-hidden="true">eco</span>
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
