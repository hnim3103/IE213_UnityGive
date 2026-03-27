import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Connect Wallet",
      description: "Log in securely with your personal MetaMask or Web3 wallet to start transactions.",
      icon: "account_balance_wallet",
    },
    {
      id: 2,
      title: "Choose a Project",
      description: "Find impactful social projects that resonate with your heart and values.",
      icon: "favorite",
    },
    {
      id: 3,
      title: "Track Transparency",
      description: "Monitor the fund utilization and actual results directly on the blockchain.",
      icon: "visibility",
    }
  ];

  return (
    <section className="bg-sage-bg py-32 px-8 overflow-hidden relative font-nunito">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        {/* Header Section */}
        <div className="text-center max-w-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-fraunces font-thin text-sage-800 leading-tight tracking-tight">
            The Sowing Journey
          </h2>
          <p className="text-lg font-extralight text-earth-900 leading-relaxed">
            With just a few simple steps, you are contributing to creating a better world.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative w-full">
          {/* Dashed Line Connection (Desktop Only) */}
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-sage-800/10 -z-0" />
          
          {steps.map((step, index) => (
            <div key={step.id} className={`flex flex-col items-center text-center gap-10 relative z-10 group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[${index * 200}ms]`}>
              {/* Icon Container with Custom Shape */}
              <div className="w-24 h-24 bg-[#f1eee2] rounded-bl-[32px] rounded-br-[48px] rounded-tl-[40px] rounded-tr-[24px] flex items-center justify-center shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)] transition-all duration-500 group-hover:bg-sage-100 group-hover:-translate-y-2 group-hover:rotate-2 group-hover:shadow-lg">
                <span className="material-symbols-outlined text-sage-800 text-3xl font-extralight group-hover:scale-110 transition-transform">
                  {step.icon}
                </span>
              </div>
              
              {/* Text Content */}
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-light text-sage-800 group-hover:text-earth-500 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-[16px] font-extralight text-earth-900 leading-relaxed max-w-[280px] mx-auto opacity-80">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
