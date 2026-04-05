import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ImpactStats from '../components/ImpactStats';
import TrustSecurity from '../components/TrustSecurity';

const About = () => {
  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white font-nunito">
      <Navbar />

      <section className="bg-sage-section pt-32 pb-20 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-fraunces font-thin text-sage-800 mb-6">
            Our Mission & Vision
          </h1>
          <p className="text-earth-900 font-nunito font-extralight text-xl max-w-2xl mx-auto">
            UnityGive was born from a simple idea: that trust should be the foundation of every donation.
          </p>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="flex flex-col gap-8">
            <h2 className="text-4xl font-fraunces font-thin text-sage-800">Why Blockchain?</h2>
            <p className="text-lg font-extralight text-earth-900 leading-relaxed">
              Traditional fundraising often lacks transparency. Donors give money but rarely see the direct impact or know exactly how their funds are used.
            </p>
            <p className="text-lg font-extralight text-earth-900 leading-relaxed">
              We leverage Ethereum smart contracts to ensure that every dollar is accounted for. Funds are locked in transparent contracts and only released when we provide immutable "Proof of Impact" on IPFS for each milestone of a project.
            </p>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-sage-800/5 rounded-[48px] rotate-3 -z-10" />
             <img 
               src="https://images.unsplash.com/photo-1559027615-cd9373496677?auto=format&fit=crop&q=80&w=1000" 
               alt="Team Working" 
               className="rounded-[48px] shadow-2xl"
             />
          </div>
        </div>
      </section>

      <ImpactStats />
      
      <section className="py-24 px-8 bg-sage-50">
         <div className="max-w-7xl mx-auto text-center flex flex-col gap-12">
            <h2 className="text-4xl font-fraunces font-thin text-sage-800">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: "Transparency", desc: "Every transaction and milestone is verifiable on the blockchain." },
                 { title: "Accountability", desc: "Funds are only released upon proven results and impact." },
                 { title: "Community", desc: "Connecting hearts across the world to create lasting change." }
               ].map((value, i) => (
                 <div key={i} className="bg-white p-10 rounded-[32px] shadow-sm border border-sage-800/5 flex flex-col gap-4">
                    <h3 className="text-2xl font-light text-sage-800">{value.title}</h3>
                    <p className="font-extralight text-earth-900/70">{value.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <TrustSecurity />

      <Footer />
    </div>
  );
};

export default About;
