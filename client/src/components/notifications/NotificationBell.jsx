import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Inbox, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications");
      return response.data;
    },
    refetchInterval: 2 * 60 * 1000 // Poll for notifications every 2 minutes
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refetch();
    }
  };

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notifications/mark-read");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          notifications: old.notifications.map((n) => ({ ...n, isRead: true }))
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["notifications"], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const clickNotificationMutation = useMutation({
    mutationFn: async (notification) => {
      if (!notification.isRead) {
        await api.post("/notifications/mark-read", { id: notification._id });
      }
    },
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old) => {
        if (!old) return old;
        const wasUnread = !notification.isRead;
        return {
          ...old,
          unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
          notifications: old.notifications.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["notifications"], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (notification) => {
    clickNotificationMutation.mutate(notification);
    setIsOpen(false);
    if (notification.link) {
      if (notification.link.startsWith("http")) {
        window.open(notification.link, "_blank");
      } else {
        navigate(notification.link);
      }
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
