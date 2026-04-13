import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/campaigns/create', label: 'Create Campaign', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-sage-bg selection:bg-sage-800 selection:text-white flex font-nunito">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white/60 backdrop-blur-xl border-r border-white/80 flex flex-col shadow-[4px_0_30px_-10px_rgba(69,87,59,0.08)] sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-8 py-8 border-b border-sage-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sage-800 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-earth-900/50 font-bold">UnityGive</p>
              <p className="text-sm font-bold text-sage-800">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sage-800 text-white shadow-lg shadow-sage-800/20'
                    : 'text-sage-800/70 hover:bg-sage-100 hover:text-sage-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Return to Site */}
        <div className="px-4 pb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-earth-900/50 hover:bg-earth-50 hover:text-earth-900 transition-all group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Site
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
