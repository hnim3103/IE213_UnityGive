import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, MoreVertical, Search, ShieldCheck, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { API_BASE } from "../lib/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Close menu on outside click
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleUpdateUser = async (id, payload) => {
    const desc = payload.role ? `role to ${payload.role}` : `status to ${payload.status}`;
    if (!window.confirm(`Change ${desc}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/${id}/manage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, ...payload } : u)));
      toast.success("User updated successfully");
      setOpenMenuId(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || (u.status || "active") === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avatarColors = [
    "bg-sage-700", "bg-earth-500", "bg-teal-600", "bg-rose-500", "bg-amber-600",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-sage-bg">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-earth-900/40">Admin Panel</span>
          <h1 className="text-4xl font-fraunces text-sage-900 mt-1">
            User <span className="italic font-light text-earth-500">Management</span>
          </h1>
          <p className="text-earth-900/60 font-light mt-1 text-sm">Manage roles and permissions for all platform users</p>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white px-5 py-3 rounded-2xl shadow-sm">
          <Users size={16} className="text-sage-800" />
          <span className="text-sm font-bold text-sage-900">{users.length} Total Users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-900/40" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white rounded-2xl text-sm focus:outline-none focus:border-sage-800 transition-colors placeholder:text-earth-900/40"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "donor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors uppercase tracking-wider ${
                filterRole === r
                  ? "bg-sage-800 text-white"
                  : "bg-white/60 text-sage-800 hover:bg-white/80 border border-white"
              }`}
            >
              {r === "ALL" ? "All Roles" : r}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["ALL", "active", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors uppercase tracking-wider ${
                filterStatus === s
                  ? "bg-sage-800 text-white"
                  : "bg-white/60 text-sage-800 hover:bg-white/80 border border-white"
              }`}
            >
              {s === "ALL" ? "All Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-sage-800/10 bg-white/30 text-[11px] font-bold uppercase tracking-[0.2em] text-earth-900/50">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-1">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={40} className="text-sage-800/20 mb-4" />
            <p className="text-sage-900 font-fraunces text-xl">No users found</p>
            <p className="text-earth-900/50 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map((u, index) => (
            <div
              key={u._id}
              className="grid grid-cols-12 gap-4 px-8 py-5 hover:bg-white/50 transition-colors group items-center border-b border-sage-800/5 last:border-none"
            >
              {/* User Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                  {getInitials(u.name)}
                </div>
                <div>
                  <p className="font-bold text-sage-900 text-sm">{u.name}</p>
                  <p className="text-xs text-earth-900/50 font-light truncate max-w-[160px]">
                    {u.walletAddress ? `${u.walletAddress.slice(0, 8)}...` : "No wallet"}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  u.role === "admin"
                    ? "bg-sage-800/10 text-sage-800"
                    : "bg-earth-100 text-earth-700"
                }`}>
                  {u.role === "admin" && <ShieldCheck size={11} />}
                  {u.role || "donor"}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  (u.status || "active") === "active"
                    ? "bg-teal-50 text-teal-700"
                    : "bg-rose-50 text-rose-600"
                }`}>
                  {(u.status || "active") === "active" ? <CheckCircle size={11} /> : <Ban size={11} />}
                  {u.status || "active"}
                </span>
              </div>

              {/* Email */}
              <div className="col-span-3">
                <p className="text-sm text-earth-900/60 font-light truncate">{u.email || "—"}</p>
              </div>

              {/* Actions */}
              <div className="col-span-1 relative opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === u._id ? null : u._id);
                  }}
                  className="p-2 hover:bg-sage-100 rounded-full transition-colors text-sage-800"
                >
                  <MoreVertical size={16} />
                </button>

                {openMenuId === u._id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-sage-800/10 z-30 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      onClick={() => handleUpdateUser(u._id, { role: u.role === "admin" ? "donor" : "admin" })}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-sage-900 hover:bg-sage-50 transition-colors flex items-center gap-2"
                    >
                      {u.role === "admin" ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => handleUpdateUser(u._id, { status: (u.status || "active") === "active" ? "suspended" : "active" })}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-rose-50 transition-colors flex items-center gap-2 text-rose-600"
                    >
                      {(u.status || "active") === "suspended" ? <CheckCircle size={15} /> : <Ban size={15} />}
                      {(u.status || "active") === "suspended" ? "Reactivate" : "Suspend User"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
