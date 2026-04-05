import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Menu, X, LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const navLinks = [
    { id: "homepage", label: "Home", path: "/" },
    { id: "campaigns", label: "Projects", path: "/campaigns" },
    { id: "about", label: "About Us", path: "/about" },
    { id: "how-it-works", label: "How it Works", path: "/how-it-works" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-sage-800/5 font-nunito transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-24">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02] active:scale-95">
            <span className="text-3xl font-fraunces italic text-sage-900 tracking-tight">Unity<span className="text-earth-500 font-light">Give</span></span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-12">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 relative py-2 group/link ${isActive(item.path)
                      ? "text-sage-900"
                      : "text-earth-900/40 hover:text-sage-900"
                    }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-earth-500 transition-all duration-300 ${isActive(item.path) ? "w-full" : "w-0 group-hover/link:w-full"}`} />
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6 pl-6 border-l border-sage-800/10">
                <div className="flex items-center gap-4 group cursor-default">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-sage-900 leading-tight group-hover:text-earth-500 transition-colors">{user.name || "User"}</span>
                    <span className="text-[10px] text-earth-900/40 uppercase font-bold tracking-widest leading-tight">{user.role || "Donor"}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sage-800/5 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center transition-all group-hover:shadow-md group-hover:scale-105">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={20} className="text-sage-800" />
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="text-earth-900/40 hover:text-coral hover:bg-coral/5 rounded-full p-2 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-sage-900 hover:text-sage-900 hover:bg-sage-800/5 px-8 py-6 rounded-full font-bold uppercase tracking-widest text-xs transition-all">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-sage-800 hover:bg-sage-900 text-white px-8 py-6 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-sage-800/20 transition-all hover:scale-105 active:scale-95">
                    Join Community
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-sage-900 bg-sage-800/5 rounded-2xl hover:bg-sage-800/10 transition-all"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-sage-800/5 absolute w-full left-0 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <ul className="flex flex-col p-8 space-y-4">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-fraunces p-4 rounded-2xl block transition-all ${isActive(item.path)
                      ? "bg-sage-800 text-white shadow-lg"
                      : "text-sage-900 hover:bg-sage-800/5"
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-6 flex flex-col gap-4 border-t border-sage-800/5 mt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-4 py-4 px-6 rounded-3xl bg-sage-800/5">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-sage-800/5 shadow-sm overflow-hidden flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} className="text-sage-800" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-sage-900 leading-tight">{user.name || "User"}</span>
                      <span className="text-xs text-earth-900/40 uppercase tracking-widest font-bold">{user.role || "Donor"}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="w-full py-8 bg-coral/10 text-coral hover:bg-coral hover:text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    <LogOut className="mr-2" size={18} />
                    Logout Account
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full py-8 border-sage-800/10 text-sage-900 rounded-full font-bold uppercase tracking-widest text-xs">
                      <LogIn className="mr-2" size={18} />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full py-8 bg-sage-800 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-sage-800/20">
                      <UserPlus className="mr-2" size={18} />
                      Join
                    </Button>
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}

    </nav>
  )
}

export default Navbar
