import React from 'react';

const TrustSecurity = () => {
  const partners = [
    { name: "MetaMask Verified", icon: "verified_user" },
    { name: "Smart Contract Audited", icon: "security" },
    { name: "Ethereum Foundation", icon: "token" }
  ];

  return (
    <section className="py-24 px-8 flex flex-col items-center gap-14 font-nunito bg-sage-bg">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-[12px] font-extralight text-earth-900 tracking-[5px] uppercase opacity-50 text-center">
          Secured by leading partners
        </h3>
      </div>
      
      <div className="flex flex-wrap justify-center gap-12 md:gap-32 opacity-40 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
        {partners.map((partner, index) => (
          <div key={index} className="flex items-center gap-4 group cursor-default transition-all hover:opacity-100">
            <span className="material-symbols-outlined text-4xl font-extralight text-sage-800 group-hover:scale-110 transition-transform">
              {partner.icon}
            </span>
            <span className="text-lg md:text-xl font-extralight text-sage-900 tracking-wide">
              {partner.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustSecurity;
