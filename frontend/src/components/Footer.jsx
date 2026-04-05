import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-sage-footer py-20 px-8 md:px-24 font-nunito rounded-t-[40px] border-t border-sage-800/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">

        {/* Brand Section */}
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-instrument italic text-sage-800">UnityGive</span>
          <p className="text-[14px] font-extralight text-sage-800/60 tracking-wider">
            © 2026 UnityGive. Nuturing change through the block.
          </p>
        </div>

        {/* Links Section */}
        <nav className="flex flex-wrap justify-center gap-8 md:gap-12">
          <Link to="/privacy" className="text-[14px] font-extralight text-sage-800/60 hover:text-sage-800 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-[14px] font-extralight text-sage-800/60 hover:text-sage-800 transition-colors">
            Terms of Service
          </Link>
          <Link to="/contact" className="text-[14px] font-extralight text-sage-800/60 hover:text-sage-800 transition-colors">
            Contact
          </Link>
        </nav>

      </div>
    </footer>
  );
};

export default Footer;
