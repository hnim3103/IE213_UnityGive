import React, { useState } from 'react'
import white_logo from '/donate-heart-logo-white.png'
// import black_logo from '/donate-heart-logo-black.png' // Unused currently, but kept for reference
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  // 1. State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current location
  const location = useLocation();
  const { pathname } = location;

  const navLinks = [
    { id: "homepage", label: "Trang chủ", path: "/" },
    { id: "campaigns", label: "Dự án", path: "/campaigns" },
    { id: "about", label: "Về chúng tôi", path: "/about" },
    { id: "faqs", label: "Hướng dẫn", path: "/faqs" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <div className="sticky top-0 z-50 shadow-[0_1px_3px_-2px_black] bg-[#fefefe]">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* --- LOGO SECTION --- */}
          <Link to='/' className="shrink-0">
            <div className="nav-logo flex items-center gap-2">
              <img src={white_logo} className='w-10 md:w-12 border rounded-[14px] bg-primary p-2' alt="logo" />
              <span className="text-xl md:text-2xl font-bold">Unity<span className="text-primary">Give</span></span>
            </div>
          </Link>

          {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
          <ul className="hidden md:flex items-center gap-8 text-[16px] font-medium">
            {navLinks.map((item) => (
              <li key={item.id} className="relative group h-full flex items-center">
                <Link 
                  to={item.path}
                  className={`transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-primary font-bold"
                      : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {item.label}
                  {/* Optional: Add a small underline indicator for desktop */}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* --- LOGIN BUTTON (Desktop) --- */}
          <div className="hidden md:block">
            <Link to='/login'>
              <button className='px-6 py-2.5 rounded-full bg-coral text-white font-medium hover:cursor-pointer hover:bg-[#ed1651] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'>
                Login
              </button>
            </Link>
          </div>

          {/* --- MOBILE HAMBURGER BUTTON --- */}
          {/* 'md:hidden' means: Show on mobile, hide on medium screens and up */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-primary focus:outline-none"
            >
              <span className="material-symbols-outlined text-3xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#fefefe] border-t border-gray-100 absolute w-full left-0 shadow-lg">
          <ul className="flex flex-col p-4 space-y-4 font-medium text-[16px]">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu when clicked
                  className={`block px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-slate-600 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Mobile Login Button */}
            <li className="pt-2">
               <Link to='/login' onClick={() => setIsMobileMenuOpen(false)}>
                  <button className='w-full py-3 rounded-full bg-coral text-white font-bold hover:bg-[#ed1651] shadow-md'>
                    Login
                  </button>
               </Link>
            </li>
          </ul>
        </div>
      )}

    </div>
  )
}

export default Navbar