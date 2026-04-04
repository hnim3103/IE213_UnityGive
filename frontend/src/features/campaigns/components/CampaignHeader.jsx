import React from 'react';
import { Badge } from '../../../components/ui/badge';

const CampaignHeader = ({ campaign, organization }) => {
  const { title, category, image, description } = campaign;

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb / Category */}
      <div className="flex items-center gap-4">
        <Badge className="bg-sage-800 text-white border-none font-nunito font-light px-6 py-2 rounded-full uppercase tracking-[0.2em] text-[10px]">
          {category ? category.replace(/_/g, ' ') : 'General'}
        </Badge>
        <span className="text-earth-400 font-nunito text-xs uppercase tracking-widest font-bold">Campaign Details</span>
      </div>

      {/* Title */}
      <h1 className="text-5xl md:text-7xl font-fraunces font-thin text-sage-800 leading-[1.1] tracking-tight">
        {title}
      </h1>

      {/* Main Image */}
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-bl-[80px] rounded-br-[40px] rounded-tl-[32px] rounded-tr-[120px] shadow-2xl shadow-sage-800/10 group">
        <img 
          src={image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000"} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/40 to-transparent opacity-60" />
      </div>

      {/* Organization and Brief */}
      <div className="flex flex-col md:flex-row gap-12 items-start mt-4">
        <div className="flex items-center gap-5 min-w-[300px]">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-sage-100 p-1 bg-white shadow-sm">
            <img 
              src={organization?.logo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Org"} 
              alt={organization?.name} 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-earth-500 font-bold font-nunito">Organized by</span>
            <div className="flex items-center gap-2">
                <h4 className="text-xl font-fraunces font-thin text-sage-800">{organization?.name || "UnityGive Foundation"}</h4>
                {organization?.isVerified && (
                    <span className="material-symbols-outlined text-green-600 text-[18px]" title="Verified Organization">verified</span>
                )}
            </div>
          </div>
        </div>

        <div className="flex-grow">
          <p className="text-2xl font-nunito font-extralight text-earth-900 leading-relaxed italic border-l-4 border-sage-200 pl-8">
            "{description?.slice(0, 180)}..."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;