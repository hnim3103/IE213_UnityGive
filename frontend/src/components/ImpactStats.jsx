import React from 'react';

const ImpactStats = () => {
  const stats = [
    {
      label: "Projects Completed",
      value: "148",
      color: "text-sage-800"
    },
    {
      label: "Global Ambassadors",
      value: "165",
      color: "text-earth-500"
    },
    {
      label: "Total Capital Raised",
      value: "3.41B",
      color: "text-sage-800"
    }
  ];

  return (
    <section className="px-8 mb-32">
      <div className="max-w-7xl mx-auto bg-sage-stats rounded-[64px] py-24 px-12 relative overflow-hidden flex flex-col items-center border border-white/50">
        {/* Decorative Radial Gradient Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none scale-150"
          style={{
            background: "radial-gradient(circle at center, #45573b 0%, transparent 70%)"
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 relative z-10 w-full text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-1000">
              <span className={`text-6xl md:text-8xl font-fraunces font-thin ${stat.color} tracking-tight leading-none`}>
                {stat.value}
              </span>
              <span className="text-sm font-nunito font-extralight italic text-earth-900 tracking-[3px] uppercase opacity-60">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
