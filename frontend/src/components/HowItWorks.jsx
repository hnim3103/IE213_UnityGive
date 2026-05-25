import React from 'react';
import { Wallet, Heart, ShieldCheck, TrendingUp } from 'lucide-react';

const StepCard = ({ id, title, description, icon: Icon }) => (
  <div 
    className="group relative flex flex-col items-center p-8 bg-white/40 backdrop-blur-sm rounded-[40px] border border-white/60 hover:bg-white/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sage-200/50"
    role="listitem"
  >
    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-sage-800 text-sage-50 rounded-full flex items-center justify-center font-fraunces text-xl shadow-lg border-4 border-sage-bg">
      {id}
    </div>
    
    <div className="mt-4 mb-6 p-5 bg-sage-100 rounded-2xl text-sage-800 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
      <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
    </div>

    <h3 className="text-2xl font-fraunces text-sage-900 mb-4 text-center">
      {title}
    </h3>
    
    <p className="text-earth-900/90 font-nunito font-light leading-relaxed text-center text-sm md:text-base">
      {description}
    </p>

    {/* Decorative background element */}
    <div className="absolute inset-0 bg-gradient-to-br from-sage-200/20 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
  </div>
);

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Connect & Secure",
      description: "Link your Web3 wallet seamlessly. We prioritize your security and data privacy from the very first step.",
      icon: Wallet
    },
    {
      id: 2,
      title: "Discover Purpose",
      description: "Explore campaigns that align with your values. From education to environment, find where your seeds will grow best.",
      icon: Heart
    },
    {
      id: 3,
      title: "Sow with Confidence",
      description: "Your donation is held in a transparent smart contract, locked until verified milestones are achieved.",
      icon: ShieldCheck
    },
    {
      id: 4,
      title: "Witness the Growth",
      description: "Track real-time progress and see exactly how your contribution is making a tangible difference in the world.",
      icon: TrendingUp
    }
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-sage-bg font-nunito" aria-labelledby="how-it-works-title">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-200/30 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-earth-100/50 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <span className="inline-block px-4 py-1.5 bg-sage-800/10 text-sage-800 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
            Our Process
          </span>
          <h2 id="how-it-works-title" className="text-5xl md:text-6xl font-fraunces text-sage-900 tracking-tight">
            The Sowing <span className="italic font-light">Journey</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-earth-900/80 font-light">
            Transparency isn't just a feature; it's our foundation. Follow these four simple steps to start making a verified impact.
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pt-10"
          role="list"
        >
          {steps.map((step) => (
            <StepCard key={step.id} {...step} />
          ))}
        </div>

        {/* Visual Connector for Desktop */}
        <div className="hidden lg:block absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-800/10 to-transparent -z-20" />
      </div>
    </section>
  );
};

export default HowItWorks;
