import React, { useEffect, useState } from 'react';
import CampaignCard from './CampaignCard';
import axios from 'axios';
import { Button } from './ui/button';
import { Link } from 'react-router';

const ActiveCampaigns = () => {
  const [campaignsBuffer, setCampaignsBuffer] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/campaigns');
      
      const allCampaigns = response.data;

      const activeData = allCampaigns.filter(item => item.status === 'ACTIVE');
      setCampaignsBuffer(activeData);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = campaignsBuffer.length;
  const colCount = itemCount >= 3 ? 3 : itemCount

  return (
    <div className='items-center flex flex-col mx-auto py-20 px-4'> 
      <div className='text-center mb-16'>
        <h2 className='font-bold text-3xl'>Các Chiến Dịch Đang Hoạt Động</h2>
        <p className='text-slate-500 text-lg mt-2'>
            Hãy chọn một dự án gần gũi với trái tim bạn.
        </p>
      </div>   

      {loading ? (
        <div className="text-center">Đang tải...</div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${colCount} gap-8`}>
          {itemCount > 0 ? (
            campaignsBuffer.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))
          ) : (
            <div className="col-span-3 text-center text-slate-400">
              Hiện không có chiến dịch nào đang hoạt động.
            </div>
          )}
        </div>
      )}
      <Link to = "/campaigns">
        <Button className="mt-10" variant='outline'>Khám phá tất cả các chiến dịch</Button>
      </Link>
    </div>
  )
}

export default ActiveCampaigns;