import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-sage-footer py-32 px-6 sm:px-12 font-nunito rounded-t-[80px] border-t border-sage-800/5 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage-800/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-20">
          
          {/* Brand Section */}
          <div className="md:col-span-5 space-y-10">
            <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
              <span className="text-4xl font-fraunces italic text-sage-900 tracking-tight">Unity<span className="text-earth-500 font-light">Give</span></span>
            </Link>
            <p className="text-lg font-light text-earth-900/60 leading-relaxed max-w-sm">
              Reimagining the future of philanthropy through cryptographic trust and community-led governance.
            </p>
            <div className="flex gap-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Instagram, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="p-3 bg-white rounded-2xl text-sage-800/40 hover:text-sage-800 hover:shadow-xl transition-all duration-300 border border-sage-800/5"
                >
                  <social.icon size={20} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-earth-900/40">Platform</h4>
              <nav className="flex flex-col gap-5">
                <Link to="/campaigns" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Explore Projects</Link>
                <Link to="/how-it-works" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">How it Works</Link>
                <Link to="/about" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Our Mission</Link>
              </nav>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-earth-900/40">Legal</h4>
              <nav className="flex flex-col gap-5">
                <Link to="/privacy" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Privacy Policy</Link>
                <Link to="/terms" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Terms of Service</Link>
                <Link to="/security" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Security Protocol</Link>
              </nav>
            </div>

            <div className="space-y-8 col-span-2 sm:col-span-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-earth-900/40">Support</h4>
              <nav className="flex flex-col gap-5">
                <Link to="/faqs" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Support Center</Link>
                <Link to="/contact" className="text-earth-900/60 hover:text-sage-900 transition-colors font-medium">Contact Us</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-sage-800/5 flex flex-col sm:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-earth-900/30 uppercase tracking-[0.2em]">
            © 2026 UnityGive. Built with <Heart size={10} className="inline text-coral fill-current mx-1" /> for the block.
          </p>
          <div className="flex items-center gap-3 grayscale opacity-30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-earth-900">Deployed on Ethereum</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
