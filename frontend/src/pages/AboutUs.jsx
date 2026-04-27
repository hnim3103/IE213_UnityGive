import React from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import founderImg from '../assets/hnim.jpg';

const AboutUs = () => {
  const milestones = [
    {
      year: "Web3 v2",
      title: "DAO Governance",
      desc: "Launched our DAO-governed architecture, empowering a council of trusted members to oversee all campaigns.",
      icon: "account_tree"
    },
    {
      year: "Transparency",
      title: "Milestone-Based Logic",
      desc: "Introduced smart contract logic that releases funds only upon verification of IPFS-stored Proof of Impact.",
      icon: "security"
    },
    {
      year: "Security",
      title: "Multi-Sig Protection",
      desc: "Implemented a cryptographic multi-sig voting system to eliminate 'rug pulls' and ensure funds reach their destination.",
      icon: "vpn_key"
    }
  ];

  const pillars = [
    {
      title: "DAO Council",
      desc: "A custom council of auditors and top donors who cryptographically vote to approve milestone-based fund releases.",
      items: ["On-chain Voting", "Milestone Oversight", "Campaign Auditing"],
      bg: "bg-sage-100"
    },
    {
      title: "Verified Orgs",
      desc: "Reputable organizations must submit immutable IPFS Proof of Impact (images, docs) to request funding.",
      items: ["IPFS Documentation", "KYC/KYB Verification", "Milestone Reporting"],
      bg: "bg-earth-100"
    },
    {
      title: "Protected Donors",
      desc: "Donors are protected by a smart contract that ensures their contributions are released only when work is verified.",
      items: ["Zero Blind Trust", "Refund Mechanisms", "Full Ledger Tracking"],
      bg: "bg-sage-400/20"
    }
  ];

  const team = [
    {
      name: "Nguyen Hoang Nhut Minh",
      role: "Founder & Web3 Strategist",
      desc: "Leading the shift from traditional giving to decentralized social impact with 15+ minutes in tech.",
      img: founderImg
    },
    {
      name: "Nguyen Thi Hoang Yen",
      role: "Head of DAO Community",
      desc: "Expert in building transparent ecosystems and sustainable CSR governance models.",
      img: "https://i.pravatar.cc/300?img=32"
    },
    {
      name: "Bui Duc Huy",
      role: "CTO & Blockchain Lead",
      desc: "Architect of UnityGive's multi-sig logic and former lead at a major cloud platform.",
      img: "https://i.pravatar.cc/300?img=12"
    },
    {
      name: "Nguyen Huu Huy",
      role: "COO & Governance Lead",
      desc: "Ensuring regulatory compliance and strict milestone-based auditing for every project.",
      img: "https://i.pravatar.cc/300?img=44"
    }
  ];

  return (
    <div className="selection:bg-sage-800 selection:text-white font-nunito overflow-x-hidden">

      {/* 1. Technical Narrative Header */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-earth-500 font-instrument italic text-2xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">The UnityGive Standard</h3>
          <h1 className="text-5xl md:text-7xl font-fraunces font-thin text-sage-800 leading-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Nurturing Trust through <br />
            <span className="italic font-normal text-earth-500">Decentralized Governance</span>
          </h1>
          <div className="w-20 h-0.5 bg-earth-500/30 mx-auto mb-8" />
          <p className="text-xl md:text-2xl font-light text-earth-900/80 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            UnityGive is a state-of-the-art decentralized platform. We leverage Web3 to ensure your donations are no longer released blindly, but through a milestone-based, multi-sig smart contract architecture.
          </p>
        </div>
      </section>

      {/* 2. The Tech Journey (Blockchain Milestones) */}
      <section className="py-16 bg-sage-800 text-sage-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <span className="material-symbols-outlined text-4xl text-earth-500">{m.icon}</span>
                <div className="flex flex-col">
                  <span className="text-earth-500 font-bold tracking-widest text-sm uppercase">{m.year}</span>
                  <h4 className="text-xl font-fraunces italic mb-2">{m.title}</h4>
                  <p className="text-sm font-extralight opacity-80 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The DAO Ecosystem (Pillars) */}
      <section className="py-24 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-fraunces text-sage-800 mb-4">A Multi-Sig Ecosystem</h2>
            <p className="text-earth-900/60 font-light max-w-2xl mx-auto">Our platform removes the need for blind faith. Every fund release is a cryptographic agreement between the council and the community.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className={`${p.bg} p-12 rounded-[48px] border border-white/40 shadow-sm flex flex-col gap-6 transition-transform hover:-translate-y-2 duration-500`}>
                <h3 className="text-2xl font-fraunces italic text-sage-800">{p.title}</h3>
                <p className="text-earth-900 font-extralight leading-relaxed">{p.desc}</p>
                <ul className="mt-auto space-y-3">
                  {p.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-earth-900/70 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-earth-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Decentralized Values */}
      <section className="py-24 bg-[#f2efe0]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-fraunces font-thin text-sage-800 mb-8 leading-tight">
              A New Era of <br />
              <span className="italic font-normal text-earth-500">Giving Responsibility</span>
            </h2>
            <p className="text-lg text-earth-900 font-extralight leading-relaxed mb-10">
              We focus on <strong>Zero Blind Trust</strong>. By requiring IPFS Proof of Impact for every milestone, we ensure that every dollar contributed is backed by immutably stored evidence of real-world change.
            </p>
            <Link to="/campaigns">
              <Button className="bg-sage-800 hover:bg-sage-900 text-white px-10 py-7 rounded-full text-lg shadow-xl shadow-sage-800/20 transition-all">
                View On-Chain Projects
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[
              { t: "Transparency", d: "100% of transactions and votes are recorded on the Ethereum blockchain.", i: "account_balance" },
              { t: "Milestone Releases", d: "Funds are released in phases, strictly after a council vote confirms project progress.", i: "checklist" },
              { t: "IPFS Immutability", d: "Evidence and reports are stored on IPFS, preventing any retrospective modification of data.", i: "storage" },
              { t: "Smart Security", d: "Open-source smart contracts audited to prevent fraud and protect the donation pool.", i: "verified" }
            ].map((v, i) => (
              <div key={i} className="flex gap-6 p-8 bg-white/50 rounded-3xl border border-white hover:bg-white transition-all group">
                <div className="w-12 h-12 shrink-0 bg-sage-800/5 rounded-xl flex items-center justify-center group-hover:bg-earth-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{v.i}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-sage-800 mb-1">{v.t}</h4>
                  <p className="text-earth-900/60 font-extralight text-sm leading-relaxed">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Founder Team Section */}
      <section className="py-24 bg-sage-bg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h3 className="text-earth-500 font-instrument italic text-xl mb-2">Our People</h3>
            <h2 className="text-4xl md:text-5xl font-fraunces text-sage-800">The Architects of UnityGive</h2>
            <div className="w-24 h-1 bg-earth-500/10 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <div key={i} className="group flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden rounded-[40px] border-4 border-white shadow-xl transition-transform duration-500 group-hover:-translate-y-3">
                  <img src={member.img} alt={member.name} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-sage-800/10 group-hover:bg-transparent transition-colors" />
                </div>
                <h4 className="text-xl font-fraunces italic text-sage-800 text-center">{member.name}</h4>
                <p className="text-earth-500 font-bold text-[10px] uppercase tracking-[2px] mt-2 mb-4">{member.role}</p>
                <p className="text-earth-900/60 font-extralight text-xs text-center leading-relaxed max-w-[200px]">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Technical Stack & Partners */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b border-earth-500/10 pb-24">
            <div>
              <h2 className="text-3xl font-fraunces text-sage-800 mb-6 italic">Powered by Web3 Infrastructure</h2>
              <p className="text-earth-900/70 font-extralight leading-relaxed">
                UnityGive is built on a foundation of cryptographic trust. We utilize decentralized protocols to ensure your support is delivered exactly where it matters, with no intermediaries.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 grayscale opacity-60">
              <div className="flex flex-col items-center gap-2 p-6 border border-earth-500/10 rounded-2xl">
                <span className="material-symbols-outlined text-3xl">token</span>
                <span className="text-[12px] font-bold tracking-[2px] uppercase">Ethereum v6</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 border border-earth-500/10 rounded-2xl">
                <span className="material-symbols-outlined text-3xl">data_object</span>
                <span className="text-[12px] font-bold tracking-[2px] uppercase">Solidity</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 border border-earth-500/10 rounded-2xl">
                <span className="material-symbols-outlined text-3xl">link</span>
                <span className="text-[12px] font-bold tracking-[2px] uppercase">IPFS Protocol</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 border border-earth-500/10 rounded-2xl">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
                <span className="text-[12px] font-bold tracking-[2px] uppercase">Smart Audit</span>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl font-fraunces italic font-light text-sage-800 mb-8">Aligned with Industry Standards</h2>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-earth-900/40 font-bold italic text-xl">
              <span>Web3 V2 Standard</span>
              <span>DAO Council</span>
              <span>Milestone Funding</span>
              <span>Proof of Impact</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
