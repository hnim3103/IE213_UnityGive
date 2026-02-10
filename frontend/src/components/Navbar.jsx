import React from 'react' // Removed useState
import white_logo from '/donate-heart-logo-white.png'
import black_logo from '/donate-heart-logo-black.png'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  
  // Get the current location (URL)
  const location = useLocation();
  const { pathname } = location;

  const navLinks = [
    { id: "homepage", label: "Trang chủ", path: "/" },
    { id: "campaigns", label: "Dự án", path: "/campaigns" },
    { id: "about", label: "Về chúng tôi", path: "/about" },
    { id: "faqs", label: "Hướng dẫn", path: "/faqs" },
  ];

  // Helper function to check if the link is active
  const isActive = (path) => {
      return pathname === path;
      
  };

  return (
    <div className="navbar flex justify-around p-2 shadow-[0_1px_3px_-2px_black] bg-[#fefefe]">
      {/* Logo Link */}
      <Link style={{textDecoration: 'none'}} to='/'>
        <div className="nav-logo flex items-center gap-0.5">
          <img src={white_logo} className='w-12 border rounded-[14px] bg-primary p-2' alt="logo"/>
          <span className="text-2xl font-bold">Unity<span className="text-primary">Give</span></span>
        </div>
      </Link>

      <ul className="nav-menu flex items-center list-none gap-12.5 text-[16px] font-medium">
        {navLinks.map((item) => (
          <li 
            key={item.id} 
            className={`cursor-pointer h-full flex flex-col justify-center transition-colors duration-200 
              ${isActive(item.path)
                ? "border-b-2 border-primary text-primary"   // Active Styles 
                : "border-none text-slate-600 hover:text-primary" // Inactive Styles 
              }`}
          >
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-login">
        <Link to='/login'>
            <button className='w-28 h-12 outline-none border rounded-full bg-coral text-white font-medium hover:cursor-pointer hover:bg-[#ed1651]'>
                Login
            </button>
        </Link>
      </div>

    </div>
  )
}

export default Navbar