import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    category: "General",
    items: [
      {
        q: "What is UnityGive?",
        a: "UnityGive is a transparent, blockchain-based fundraising platform that ensures your donations are tracked and securely managed through smart contracts."
      },
      {
        q: "How does milestone-based funding work?",
        a: "Unlike traditional platforms that release all funds at once, we hold donations in an escrow smart contract. Funds are only distributed when the organization provides verifiable proof of completing specific project milestones."
      }
    ]
  },
  {
    category: "For Donors",
    items: [
      {
        q: "Do I need a cryptocurrency wallet to donate?",
        a: "Yes, currently you need a Web3 wallet like MetaMask to interact with our smart contracts and process your donation securely on the blockchain."
      },
      {
        q: "How do I track my impact?",
        a: "Your dashboard provides a personalized Impact Feed. Whenever an organization you supported achieves a milestone, the proof is verified on-chain and instantly appears in your feed."
      }
    ]
  },
  {
    category: "Security & Tech",
    items: [
      {
        q: "Are my donations safe?",
        a: "Absolutely. Our smart contracts are immutable and audited. The escrow mechanism ensures that if an organization fails to prove their progress, the remaining funds can be refunded."
      },
      {
        q: "Which blockchain does UnityGive use?",
        a: "We currently operate on the Ethereum blockchain to ensure the highest level of security, decentralization, and consensus for our smart contracts."
      }
    ]
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-white/60 bg-white/40 backdrop-blur-sm rounded-3xl overflow-hidden mb-4 transition-all duration-300 hover:bg-white/60">
      <button 
        className="w-full px-8 py-6 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 group"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-fraunces text-sage-900 text-left group-hover:text-earth-500 transition-colors">{question}</span>
        <div className={`p-2 rounded-full bg-sage-800/10 text-sage-800 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="px-8 pb-6 font-nunito font-light text-earth-900/80 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQPage = () => {
  const [openItem, setOpenItem] = useState(null);

  const handleToggle = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white font-nunito overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sage-200/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/4" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-earth-100/30 rounded-full blur-[100px] -z-10 -translate-x-1/2" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <span className="inline-block px-4 py-1.5 bg-sage-800/10 text-sage-800 text-xs font-bold uppercase tracking-[0.2em] rounded-full">
            Help Center
          </span>
          <h1 className="text-5xl md:text-7xl font-fraunces text-sage-900 leading-[1.1] tracking-tight">
            Frequently Asked <br /> 
            <span className="italic font-light text-earth-500 text-4xl md:text-6xl">Questions</span>
          </h1>
          <p className="text-xl text-earth-900/60 font-light max-w-2xl mx-auto">
            Everything you need to know about our transparent, milestone-based giving platform.
          </p>
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto space-y-16">
          {faqData.map((category, catIndex) => (
            <div key={catIndex} className="space-y-6">
              <h2 className="text-[14px] font-bold font-nunito uppercase tracking-[0.2em] text-earth-800/60 pl-4 border-b border-earth-800/10 pb-4">
                {category.category}
              </h2>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => {
                  const id = `${catIndex}-${itemIndex}`;
                  return (
                    <AccordionItem 
                      key={id}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItem === id}
                      onClick={() => handleToggle(id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto bg-[#f1eee2] rounded-[48px] p-12 shadow-sm border border-white/50 space-y-6 relative overflow-hidden group hover:shadow-xl hover:shadow-sage-800/5 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <h3 className="text-3xl font-fraunces text-sage-900 relative z-10">Still have questions?</h3>
          <p className="text-earth-900/60 font-light relative z-10">Our team is ready to help you navigate your giving journey.</p>
          <button className="mt-4 px-8 py-4 bg-sage-800 text-white rounded-full font-bold shadow-xl shadow-sage-800/20 hover:bg-sage-900 transition-all hover:scale-105 relative z-10 flex items-center gap-3 mx-auto">
            Contact Support
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
