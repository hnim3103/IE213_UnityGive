import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
  const { title, description, totalGoalAmount, currentAmount, softCapAmount, category, image, _id } = campaign;
  
  // Format the wei string amounts into ETH numbers
  const targetEth = totalGoalAmount ? Number(totalGoalAmount) / 1e18 : 0;
  const raisedEth = currentAmount ? Number(currentAmount) / 1e18 : 0;
  const softCapEth = softCapAmount ? Number(softCapAmount) / 1e18 : 0;

  const progress = targetEth > 0 ? Math.min((raisedEth / targetEth) * 100, 100) : 0;
  const softCapProgress = targetEth > 0 ? Math.min((softCapEth / targetEth) * 100, 100) : 0;

  return (
    <Card className="overflow-hidden border-none shadow-[0px_10px_30px_-5px_rgba(69,87,59,0.08)] hover:shadow-[0px_20px_40px_-10px_rgba(69,87,59,0.12)] transition-[transform,box-shadow,colors] duration-500 bg-sage-50 rounded-bl-[24px] rounded-br-[40px] rounded-tl-[32px] rounded-tr-[16px] flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative h-60 overflow-hidden">
        <img 
          src={image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000"} 
          alt={title} 
          width="380"
          height="240"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-sage-800 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            {category ? category.replace(/_/g, ' ') : ''}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <CardHeader className="p-8 pb-3 flex-grow">
        <h3 className="text-2xl font-fraunces font-thin text-sage-800 line-clamp-1 leading-tight group-hover:text-earth-500 transition-colors duration-300" title={title}>
          {title}
        </h3>
        <p className="text-earth-900 font-nunito font-extralight text-sm mt-3 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </CardHeader>

      <CardContent className="p-8 py-3 flex flex-col gap-4">
        {/* Progress Stats */}
        <div className="flex justify-between items-end font-nunito">
          <span className="text-[14px] font-light text-earth-500">
            {Math.round(progress)}% Funded
          </span>
          <span className="text-[14px] font-light text-sage-800">
            {raisedEth.toLocaleString(undefined, { maximumFractionDigits: 3 })} ETH / <span className="opacity-60">{targetEth.toLocaleString(undefined, { maximumFractionDigits: 3 })} ETH</span>
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-sage-400 rounded-full overflow-hidden relative" title={softCapEth > 0 ? `Soft Cap: ${softCapEth} ETH` : ""}>
          <div 
            className="h-full bg-sage-800 rounded-full transition-all duration-1000 ease-out absolute top-0 left-0 z-10"
            style={{ width: `${progress}%` }}
          />
          {softCapProgress > 0 && (
             <div 
               className="h-full w-1 bg-[#ffc38f] absolute top-0 z-20"
               style={{ left: `${softCapProgress}%` }}
               title={`Soft Cap: ${softCapEth} ETH`}
             />
          )}
        </div>
      </CardContent>

      {/* Footer Action */}
      <CardFooter className="p-8 pt-4 mt-auto">
        <Link to={`/campaigns/${_id}`} className="w-full">
            <Button className="w-full bg-sage-400 hover:bg-sage-200 text-sage-800 rounded-full py-6 font-nunito font-light transition-[colors,transform] active:scale-[0.98] border-none shadow-none">
              Donate Now
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
