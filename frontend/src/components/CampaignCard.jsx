import React from 'react';
import { Link } from 'react-router-dom'; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { CAMPAIGN_TYPES, CAMPAIGN_COLORS } from '@/lib/constant';
import { getDaysLeft } from '@/lib/utils';


import clock_icons from "@/assets/clock-solid-full.svg"

const sampleCampaign = {
  _id: "69788773a6ed5ca6d3c9fd4d",
  organization: "697885f0a0decc01de08795d",
  title: "Chắp cánh ước mơ đến trường cho trẻ em vùng cao",
  type: "EDUCATION",
  cover_image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
  story: "Hàng trăm em nhỏ tại điểm trường X đang thiếu sách vở và áo ấm. Chúng tôi kêu gọi sự chung tay của cộng đồng để mang lại mùa đông ấm áp...",
  target_amount: 200000000,
  current_amount: 45000000,
  status: "ACTIVE",
  start_date: "2026-02-01T00:00:00.000Z",
  end_date: "2026-05-01T00:00:00.000Z",
};


const CampaignCard = ({ campaign}) => {
  
  const typeLabel = CAMPAIGN_TYPES?.[campaign.type] || campaign.type;
  const campaignColor = CAMPAIGN_COLORS?.[campaign.type] || CAMPAIGN_COLORS.DEFAULT;

  const daysLeft = getDaysLeft(campaign.end_date);
  
  const percentage = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div className="relative h-60 mb-3">
        <img 
          src={campaign.cover_image_url || "https://placehold.co/600x400"} 
          alt={campaign.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      
        <Badge className={`absolute top-2 left-2 bg-${campaignColor} font-bold uppercase border-none`}>
          {typeLabel}
        </Badge>
      </div>

      <CardHeader>
        <Link to={`/campaigns/${campaign._id}`}>
          <CardTitle className="text-xl font-bold mb-1 line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors h-15">
            {campaign.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-slate-500 text-sm line-clamp-3 h-15">
          {campaign.story}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-black-700 font-bold">{campaign.current_amount.toLocaleString()} VNĐ</span>
            <span className={`text-${campaignColor} font-bold`}>{Math.round(percentage)}%</span>
          </div>
          
          <Progress value={percentage} className="h-2" />
          
          <p className="text-xs text-right text-slate-400">
            Mục tiêu: {campaign.target_amount.toLocaleString()} VNĐ
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-t ml-5 w-85 flex items-center justify-between mb-5">
        <div className="flex items-center gap-0.5">
          <span className="material-symbols-outlined text-slate-400 text-[15px]!">schedule</span>
          <span className="text-xs text-slate-500">Còn ${daysLeft} ngày</span>
        </div>
        <Link to={`/campaigns/${campaign._id}`} className={`text-${campaignColor} font-bold hover:underline`}>
          Quyên góp
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;