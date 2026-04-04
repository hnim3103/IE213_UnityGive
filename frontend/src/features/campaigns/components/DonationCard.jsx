import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

const DonationCard = ({ campaign, onDonate }) => {
  const [donationAmount, setDonationAmount] = useState('');
  
  const { 
    totalGoalAmount, 
    currentAmount, 
    softCapAmount, 
    status, 
    endDate 
  } = campaign;

  const targetEth = totalGoalAmount ? Number(totalGoalAmount) / 1e18 : 0;
  const raisedEth = currentAmount ? Number(currentAmount) / 1e18 : 0;
  const softCapEth = softCapAmount ? Number(softCapAmount) / 1e18 : 0;
  const progress = targetEth > 0 ? Math.min((raisedEth / targetEth) * 100, 100) : 0;
  const softCapProgress = targetEth > 0 ? (softCapEth / targetEth) * 100 : 0;

  const handleDonate = () => {
    if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    onDonate(donationAmount);
  };

  const daysLeft = endDate ? Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card className="sticky top-24 border-none shadow-[0px_20px_60px_-10px_rgba(69,87,59,0.1)] bg-white rounded-bl-[40px] rounded-br-[24px] rounded-tl-[16px] rounded-tr-[32px] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <Badge className="bg-sage-50 text-sage-800 border-none font-nunito font-light px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">
            {status}
          </Badge>
          <div className="flex items-center gap-2 text-earth-500 font-nunito text-sm">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            <span className="font-light">{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-fraunces font-thin text-sage-800">
                    {raisedEth.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
                <span className="text-xl font-fraunces font-thin text-sage-400">ETH</span>
            </div>
            <div className="flex justify-between items-center text-sm font-nunito font-extralight text-earth-500">
                <span>Raised of {targetEth.toLocaleString()} ETH goal</span>
                <span className="font-light text-sage-800">{Math.round(progress)}%</span>
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 py-4 flex flex-col gap-8">
        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-sage-50 rounded-full overflow-hidden relative shadow-inner">
          <div 
            className="h-full bg-sage-800 rounded-full transition-all duration-1000 ease-out absolute top-0 left-0 z-10"
            style={{ width: `${progress}%` }}
          />
          {softCapProgress > 0 && softCapProgress < 100 && (
            <div 
              className="h-full w-1 bg-orange-200 absolute top-0 z-20"
              style={{ left: `${softCapProgress}%` }}
              title={`Soft Cap: ${softCapEth} ETH`}
            />
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-sage-bg/30 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-earth-500 font-bold font-nunito">Donors</span>
                <span className="text-xl font-fraunces font-thin text-sage-800">124</span>
            </div>
            <div className="bg-sage-bg/30 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-earth-500 font-bold font-nunito">Soft Cap</span>
                <span className="text-xl font-fraunces font-thin text-sage-800">{softCapEth.toLocaleString()} ETH</span>
            </div>
        </div>

        {/* Donation Input */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="relative group">
            <input 
              type="number" 
              placeholder="0.01" 
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full bg-sage-50 border-none rounded-[20px] py-4 pl-12 pr-16 text-sage-800 font-nunito focus:ring-2 focus:ring-sage-200 transition-all outline-none"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-sage-400 group-focus-within:text-sage-800 transition-colors">
              payments
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-fraunces font-thin text-sage-400">ETH</span>
          </div>
          <Button 
            onClick={handleDonate}
            className="w-full bg-sage-800 hover:bg-sage-700 text-white rounded-full py-7 font-nunito font-light text-lg transition-all active:scale-[0.98] border-none shadow-xl shadow-sage-800/20"
          >
            Sow a Seed of Hope
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-4 flex flex-col gap-3">
        <p className="text-[11px] text-center font-nunito font-extralight text-earth-500 leading-relaxed">
            Your donation is secured by smart contracts. Funds are only released when milestones are approved by the council.
        </p>
      </CardFooter>
    </Card>
  );
};

export default DonationCard;