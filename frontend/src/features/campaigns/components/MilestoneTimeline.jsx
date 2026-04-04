import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

const MilestoneTimeline = ({ milestones }) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      <h3 className="text-3xl font-fraunces font-thin text-sage-800">Campaign Milestones</h3>
      <div className="relative pl-8 border-l-2 border-sage-200 ml-4 flex flex-col gap-12">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-500 
              ${milestone.isFunded ? 'bg-sage-800 border-sage-800 scale-125 shadow-[0_0_15px_rgba(69,87,59,0.3)]' : 
                milestone.isApproved ? 'bg-sage-400 border-sage-400' : 'bg-white border-sage-200 group-hover:border-sage-400'}`} 
            />
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h4 className={`text-xl font-fraunces font-thin ${milestone.isFunded ? 'text-sage-800' : 'text-sage-600'}`}>
                  {milestone.title || `Milestone ${index + 1}`}
                </h4>
                <div className="flex gap-2">
                  {milestone.isFunded && (
                    <Badge className="bg-sage-800/10 text-sage-800 border-none hover:bg-sage-800/20 px-3 py-1 font-nunito font-light rounded-full text-[10px] uppercase tracking-wider">
                      Funded
                    </Badge>
                  )}
                  {milestone.isApproved && !milestone.isFunded && (
                    <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 font-nunito font-light rounded-full text-[10px] uppercase tracking-wider">
                      Approved
                    </Badge>
                  )}
                  {!milestone.isApproved && (
                    <Badge className="bg-sage-100 text-sage-500 border-none px-3 py-1 font-nunito font-light rounded-full text-[10px] uppercase tracking-wider">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-earth-900 font-nunito font-extralight text-sm leading-relaxed max-w-xl">
                {milestone.description || "Project impact assessment and resource allocation for this phase."}
              </p>
              
              <div className="flex items-center gap-6 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-earth-500 font-nunito font-bold">Target</span>
                  <span className="text-sage-800 font-fraunces font-thin">{(Number(milestone.amount) / 1e18).toLocaleString()} ETH</span>
                </div>
                
                {milestone.ipfsEvidence && (
                  <a 
                    href={`https://ipfs.io/ipfs/${milestone.ipfsEvidence}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-earth-500 hover:text-earth-800 transition-colors duration-300 font-nunito text-xs group/link"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="border-b border-earth-500/30 group-hover:border-earth-800">View Proof of Impact</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneTimeline;