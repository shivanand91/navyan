import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Inbox, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/mark-read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.post("/notifications/mark-read", { id: notification._id });
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setIsOpen(false);
      if (notification.link) {
        if (notification.link.startsWith("http")) {
          window.open(notification.link, "_blank");
        } else {
          navigate(notification.link);
        }
      }
    } catch (err) {
      console.error("Failed to process notification click:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2.5 text-[color:var(--text-secondary)] hover:bg-primary/5 hover:text-primary transition-all duration-200"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[color:var(--sidebar)] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 z-50 w-80 md:w-96 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
            <h5 className="font-display text-sm font-semibold text-[color:var(--text)]">
              Notifications
            </h5>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Inbox className="h-8 w-8 text-[color:var(--text-muted)] mb-2" />
                <p className="text-xs font-medium text-[color:var(--text)]">You're all caught up 🎉</p>
                <p className="text-[10px] text-[color:var(--text-muted)] mt-1">No new announcements.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-all duration-200 border border-transparent ${
                    n.isRead
                      ? "hover:bg-primary/5 text-[color:var(--text-secondary)]"
                      : "bg-primary/5 border-primary/10 hover:bg-primary/10 text-[color:var(--text)]"
                  }`}
                >
                  {!n.isRead && (
                    <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div
                    className={`rounded-lg p-2 shrink-0 ${
                      n.isRead
                        ? "bg-[color:var(--card)] text-[color:var(--text-muted)]"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0 pr-4">
                    <p className="text-xs font-semibold leading-relaxed truncate group-hover:text-primary">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[color:var(--text-secondary)] leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-[color:var(--text-muted)]">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
