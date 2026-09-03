import { useQuery } from "@tanstack/react-query";
import { Activity, CreditCard, Eye, UserPlus, WalletCards } from "lucide-react";
import api from "@/lib/axios";

const metricConfig = [["visitors", "Visitors", Eye], ["signups", "New accounts", UserPlus], ["internshipViews", "Internship views", Activity], ["qrGenerated", "QR generated", CreditCard], ["payments", "Verified payments", WalletCards], ["applications", "Applications", Activity], ["enrollments", "Enrollments", UserPlus], ["withdrawals", "Withdrawals", WalletCards]];

export default function AdminActivity() {
  const analytics = useQuery({ queryKey: ["admin-activity-analytics"], queryFn: async () => (await api.get("/admin/activity/analytics")).data });
  const activity = useQuery({ queryKey: ["admin-activity"], queryFn: async () => (await api.get("/admin/activity", { params: { limit: 50 } })).data, refetchInterval: 60000 });
  const funnel = useQuery({ queryKey: ["admin-payment-funnel"], queryFn: async () => (await api.get("/admin/payment-funnel")).data });
  const metrics = analytics.data?.metrics || {};
  return <div className="space-y-6"><div><p className="eyebrow">Operations intelligence</p><h1 className="font-display text-3xl font-semibold">Live activity</h1><p className="mt-2 text-sm text-[color:var(--text-secondary)]">Meaningful product, payment, enrollment, and Share & Earn events from today.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricConfig.map(([key, label, Icon]) => <div key={key} className="navyan-card p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-4 text-2xl font-semibold">{metrics[key] || 0}</p><p className="text-xs text-[color:var(--text-muted)]">{label}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]"><section className="navyan-card p-5"><div className="mb-4 flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /><h2 className="font-display text-lg font-semibold">Live feed</h2></div><div className="space-y-3">{(activity.data?.activities || []).map((item) => <div key={item._id} className="border-b border-[color:var(--border)] pb-3 last:border-0"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-[color:var(--text-secondary)]">{item.message}</p></div><span className="shrink-0 text-[10px] text-[color:var(--text-muted)]">{new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div></div>)}</div></section>
      <section className="navyan-card p-5"><h2 className="font-display text-lg font-semibold">Today’s payment funnel</h2><div className="mt-5 space-y-4">{[["QR generated", "qrGenerated"], ["Payment received", "paymentReceived"], ["Payment verified", "paymentVerified"], ["Enrollment approved", "enrollmentApproved"]].map(([label, key]) => <div key={key}><div className="flex justify-between text-xs"><span>{label}</span><strong>{funnel.data?.[key] || 0}</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--border)]"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ((funnel.data?.[key] || 0) / Math.max(1, funnel.data?.qrGenerated || 0)) * 100)}%` }} /></div></div>)}</div></section></div>
  </div>;
}
