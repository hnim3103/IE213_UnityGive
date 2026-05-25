import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { API_BASE } from "../lib/api"
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
    };

    fetchNotifications();
    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read", error);
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-sage-800/5 transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6 text-sage-800" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-sage-800/10 py-2 z-50">
          <div className="px-4 py-3 border-b border-sage-800/5 flex justify-between items-center">
            <h3 className="font-bold text-sage-800">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-sage-800/80">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b border-sage-800/5 last:border-0 hover:bg-sage-50 transition-colors ${!notif.isRead ? "bg-sage-50/50" : ""}`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                  }}
                >
                  <p className="text-sm text-sage-800 mb-2">{notif.message}</p>

                  {notif.type === "MILESTONE_APPROVAL" && notif.metadata?.campaignId && (
                    <Link
                      to={`/campaigns/${notif.metadata.campaignId._id}`}
                      className="text-xs font-bold text-earth-500 hover:underline inline-block"
                      onClick={() => setIsOpen(false)}
                    >
                      View Campaign →
                    </Link>
                  )}

                  <div className="text-[10px] text-sage-800/40 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
