import React, { useEffect, useState } from 'react';
import CampaignCard from '@/components/CampaignCard';
import { getFavorites } from '@/lib/favouriteService';

const Favorites = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      setLoading(false);
      return;
    }

    getFavorites(uid).then(data => {
      setCampaigns(data.campaigns || []);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  if (!campaigns.length) return <div className="p-6">Bạn chưa có chiến dịch yêu thích nào.</div>;

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map(c => (
        <CampaignCard key={c._id} campaign={c} />
      ))}
    </div>
  );
};

export default Favorites;
