import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        console.error("Failed to parse user data");
      }
    }
    return null;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { id: "homepage", label: "Home", path: "/" },
    { id: "campaigns", label: "Projects", path: "/campaigns" },
    { id: "about", label: "About Us", path: "/about" },
    { id: "faq", label: "FAQ", path: "/faq" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-sage-50/80 border-b border-sage-800/10 font-nunito">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-instrument italic text-sage-800">
              UnityGive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`text-[15px] transition-colors duration-200 relative pb-1 ${
                    isActive(item.path)
                      ? "text-sage-800 font-bold border-b-2 border-earth-500"
                      : "text-sage-800/70 hover:text-sage-800"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-sage-800/5 transition-colors outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-sage-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sage-800 font-bold uppercase">
                        {user.name ? user.name.charAt(0) : "U"}
                      </span>
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sage-800/10 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-sage-800/5 mb-1">
                      <p className="text-sm font-bold text-sage-800 truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-[11px] text-sage-800/60 truncate">
                        {user.email || ""}
                      </p>
                    </div>
                    <Link
                      to={
                        user?.role === "admin"
                          ? "/admin/dashboard"
                          : "/dashboard"
                      }
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-sage-800/80 hover:bg-sage-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        dashboard
                      </span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-coral hover:bg-coral/5 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sage-800 hover:text-sage-800 hover:bg-sage-800/5 px-6 rounded-full font-medium transition-colors"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-sage-600 hover:bg-sage-700 text-sage-100 px-8 rounded-full font-medium shadow-[0px_10px_30px_-10px_rgba(69,87,59,0.3)] transition-transform hover:-translate-y-[1px]">
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-sage-800 hover:opacity-80 transition-opacity"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X size={32} aria-hidden="true" />
              ) : (
                <Menu size={32} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen ? (
        <div className="md:hidden bg-sage-50 border-t border-sage-800/5 absolute w-full left-0 shadow-xl animate-in fade-in slide-in-from-top-4">
          <ul className="flex flex-col p-8 space-y-6">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg block ${
                    isActive(item.path)
                      ? "text-sage-800 font-bold"
                      : "text-sage-800/70"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 flex flex-col gap-4 border-t border-sage-800/10 mt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-sage-800/5">
                    <div className="w-12 h-12 rounded-full bg-sage-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="User profile avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sage-800 font-bold text-lg uppercase">
                          {user.name ? user.name.charAt(0) : "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sage-800">
                        {user.name || "User"}
                      </span>
                      <span className="text-sm text-sage-800/60 capitalize">
                        {user.role || "Donor"}
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full py-6 text-sage-800 rounded-full font-bold flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">
                        dashboard
                      </span>
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full py-6 border-sage-800/20 text-sage-800 rounded-full font-bold flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full py-6 border-sage-800/20 text-sage-800 rounded-full font-bold"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full py-6 bg-sage-800 text-white rounded-full font-bold shadow-lg">
                      Signup
                    </Button>
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
