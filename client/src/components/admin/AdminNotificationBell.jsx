import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { io } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

const socketOrigin = () => api.defaults.baseURL.replace(/\/api$/, "");

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["admin-notifications"], queryFn: async () => (await api.get("/admin/notifications", { params: { limit: 12 } })).data, refetchInterval: 60000 });
  const notifications = query.data?.notifications || [];
  const unreadCount = query.data?.unreadCount || 0;

  useEffect(() => {
    const token = localStorage.getItem("navyan_access_token");
    if (!token) return undefined;
    const socket = io(socketOrigin(), { withCredentials: true, auth: { token }, transports: ["websocket", "polling"] });
    socket.on("admin:activity", (activity) => {
      queryClient.setQueryData(["admin-notifications"], (current) => {
        if (!current || !activity.isNotification) return current;
        return { ...current, unreadCount: current.unreadCount + 1, notifications: [activity, ...current.notifications].slice(0, 12) };
      });
      queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
      queryClient.invalidateQueries({ queryKey: ["admin-activity-counts"] });
    });
    return () => socket.close();
  }, [queryClient]);

  useEffect(() => {
    const close = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const markAll = useMutation({ mutationFn: () => api.patch("/admin/notifications/read-all"), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }) });
  const markOne = useMutation({ mutationFn: (id) => api.patch(`/admin/notifications/${id}/read`), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }) });
  const openNotification = (notification) => {
    if (!notification.isRead) markOne.mutate(notification._id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return <div className="relative" ref={ref}>
    <button type="button" onClick={() => { setOpen((value) => !value); if (!open) query.refetch(); }} className="relative rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-2.5 text-[color:var(--text-secondary)] transition hover:bg-primary/5 hover:text-primary" aria-label="Admin notifications">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-elevated)] p-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-3"><div><p className="font-display text-sm font-semibold">Notifications</p><p className="text-xs text-[color:var(--text-muted)]">{unreadCount} new activities</p></div>{unreadCount > 0 && <button type="button" onClick={() => markAll.mutate()} className="flex items-center gap-1 text-xs text-primary"><CheckCheck className="h-3.5 w-3.5" />Mark all read</button>}</div>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">{notifications.length ? notifications.map((item) => <button type="button" key={item._id} onClick={() => openNotification(item)} className={`block w-full rounded-xl p-3 text-left ${item.isRead ? "hover:bg-primary/5" : "bg-primary/5"}`}><p className="text-xs font-semibold">{item.title}</p><p className="mt-1 text-xs text-[color:var(--text-secondary)]">{item.message}</p><p className="mt-1 text-[10px] text-[color:var(--text-muted)]">{new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></button>) : <div className="py-8 text-center text-xs text-[color:var(--text-muted)]"><Inbox className="mx-auto mb-2 h-7 w-7" />No notifications yet.</div>}</div>
      <button type="button" onClick={() => { setOpen(false); navigate("/admin/activity"); }} className="mt-3 w-full border-t border-[color:var(--border)] pt-3 text-xs font-medium text-primary">View all activity</button>
    </div>}
  </div>;
}
