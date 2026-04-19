import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Building2, FileText } from "lucide-react";
import { API_BASE } from "../lib/api";

const AdminVerifications = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users/kyc/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPending(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Failed to load KYC applications");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleKyc = async (id, status) => {
    const label = status === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this application?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/users/kyc/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed to ${label} application`);
      toast.success(`Application ${status}`);
      setPending((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-sage-200 border-t-sage-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-sage-bg">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sage-200/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-earth-900/40">Admin Panel</span>
          <h1 className="text-4xl font-fraunces text-sage-900 mt-1">
            Organization <span className="italic font-light text-earth-500">Verifications</span>
          </h1>
          <p className="text-earth-900/60 font-light mt-1 text-sm">Review and approve KYC submissions from organizations</p>
        </div>
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white px-5 py-3 rounded-2xl shadow-sm">
          <ShieldCheck size={16} className="text-earth-500" />
          <span className="text-sm font-bold text-sage-900">{pending.length} Pending</span>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-white shadow-sm flex flex-col items-center justify-center py-28 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-teal-600" />
          </div>
          <h3 className="text-2xl font-fraunces text-sage-900">All Clear!</h3>
          <p className="text-earth-900/50 font-light mt-2">No pending KYC applications at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pending.map((org) => (
            <div
              key={org._id}
              className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6"
            >
              {/* Org Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-earth-100 flex items-center justify-center flex-shrink-0">
                  <Building2 size={22} className="text-earth-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sage-900 text-lg">{org.name}</h3>
                  <p className="text-sm text-earth-900/60 font-light truncate">{org.email}</p>
                  <span className="mt-2 inline-block px-3 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    Pending KYC
                  </span>
                </div>
              </div>

              {/* Documents */}
              {org.kycDocuments && org.kycDocuments.length > 0 ? (
                <div className="border-t border-sage-800/10 pt-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-earth-900/40">Submitted Documents</p>
                  {org.kycDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 bg-sage-50 rounded-xl px-4 py-2.5">
                      <FileText size={14} className="text-sage-800 flex-shrink-0" />
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sage-800 font-medium hover:underline truncate"
                      >
                        Document {i + 1}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-sage-800/10 pt-4">
                  <p className="text-sm text-earth-900/40 font-light italic">No documents uploaded.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleKyc(org._id, "approved")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-sage-800 text-white font-bold text-sm hover:bg-sage-900 transition-colors shadow-sm shadow-sage-800/20"
                >
                  <ShieldCheck size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleKyc(org._id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 border border-rose-100 transition-colors"
                >
                  <ShieldOff size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
