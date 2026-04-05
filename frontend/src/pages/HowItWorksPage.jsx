import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';
import { CheckCircle2, Clock, Lock, ArrowRight } from 'lucide-react';

const MilestoneItem = ({ title, status, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/80 group hover:bg-white/80 transition-all duration-300">
    <div className={`p-3 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <h4 className="font-fraunces text-sage-900 text-lg">{title}</h4>
      <p className="text-xs font-nunito font-bold uppercase tracking-widest text-earth-500/60 mt-1">{status}</p>
    </div>
    <ArrowRight className="text-sage-300 group-hover:translate-x-1 transition-transform" size={20} />
  </div>
);

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white font-nunito overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-earth-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-fraunces text-sage-900 mb-8 leading-[1.1]">
            Transparent <span className="italic font-light text-sage-600">Sowing</span>, <br />
            Verified <span className="italic font-light text-earth-500">Growth</span>.
          </h1>
          <p className="text-xl md:text-2xl text-earth-900/60 font-light max-w-3xl mx-auto leading-relaxed">
            We've reimagined giving. By leveraging blockchain technology, we ensure every seed you sow reaches its intended destination, one milestone at a time.
          </p>
        </div>
      </section>

      {/* Main Process Section */}
      <HowItWorks />

      {/* Phased Funding Deep Dive */}
      <section className="py-32 px-6 bg-sage-section relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 bg-earth-500/10 text-earth-800 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
                Safe-Release Mechanism
              </span>
              <h2 className="text-4xl md:text-5xl font-fraunces text-sage-900 leading-tight">
                Phased Funding for <br />
                <span className="italic font-light">Absolute Accountability</span>
              </h2>
              <div className="space-y-6 text-lg text-earth-900/70 font-light leading-relaxed">
                <p>
                  Traditional platforms release all funds at once, often with little oversight. At UnityGive, we believe in earned trust.
                </p>
                <p>
                  Each campaign is structured into <strong>Milestones</strong>. Funds are held in a secure escrow smart contract and only released when the organization provides verifiable proof of progress.
                </p>
              </div>
              
              <div className="pt-4">
                <button className="flex items-center gap-3 px-8 py-4 bg-sage-800 text-sage-50 rounded-full hover:bg-sage-900 transition-colors shadow-lg shadow-sage-800/20 group">
                  <span className="font-semibold tracking-wide">Learn about Smart Contracts</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="relative">
              {/* Decorative Card Background */}
              <div className="absolute inset-0 bg-earth-500/5 rounded-[60px] -rotate-3 scale-105 -z-10" />
              
              <div className="bg-[#f1eee2] p-10 md:p-14 rounded-[50px] shadow-inner border border-white/40 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <MilestoneItem 
                  title="Milestone 1: Resource Acquisition" 
                  status="Released & Verified" 
                  icon={CheckCircle2} 
                  colorClass="bg-sage-100 text-sage-800"
                />
                <MilestoneItem 
                  title="Milestone 2: Community Setup" 
                  status="Pending Proof Submission" 
                  icon={Clock} 
                  colorClass="bg-earth-100 text-earth-800"
                />
                <MilestoneItem 
                  title="Milestone 3: Final Delivery" 
                  status="Locked in Escrow" 
                  icon={Lock} 
                  colorClass="bg-sage-200/50 text-sage-400"
                />

                <div className="mt-4 p-6 bg-sage-800/5 rounded-3xl border border-sage-800/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-sage-800 uppercase tracking-tighter">Total Campaign Progress</span>
                    <span className="text-sm font-fraunces text-sage-800">33%</span>
                  </div>
                  <div className="h-2 bg-sage-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sage-800 rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          <h2 className="text-4xl md:text-5xl font-fraunces text-sage-900 leading-tight">
            Ready to plant a <span className="italic font-light">seed of change?</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-sage-800 text-sage-50 rounded-full hover:bg-sage-900 transition-all hover:scale-105 shadow-xl shadow-sage-800/20 font-bold tracking-wide">
              Explore Campaigns
            </button>
            <button className="px-10 py-5 bg-white text-sage-800 border border-sage-800/20 rounded-full hover:bg-sage-50 transition-all font-bold tracking-wide">
              How it Works (Video)
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
