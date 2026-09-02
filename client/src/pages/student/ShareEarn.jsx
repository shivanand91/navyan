import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, IndianRupee, Share2, WalletCards } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function ShareEarn() {
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const load = async () => { try { const result = await api.get("/share-earn/wallet", { cache: false }); setData(result.data); } catch { toast.error("Could not load your earnings."); } };
  useEffect(() => { load(); }, []);
  const requestWithdrawal = async (event) => {
    event.preventDefault(); setSubmitting(true);
    try { await api.post("/share-earn/withdrawals", { amount: Number(amount), upiId }); toast.success("Withdrawal request received."); setAmount(""); setUpiId(""); load(); }
    catch (error) { toast.error(error?.response?.data?.message || "Could not request withdrawal."); }
    finally { setSubmitting(false); }
  };
  const wallet = data?.wallet || {};
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[18px] border border-primary/20 bg-gradient-to-br from-primary/15 via-[color:var(--card)] to-amber-400/10 p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Share & Earn</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-textPrimary">Share internships. Earn money.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-textSecondary">Generate a link for any internship, share it with friends, and earn when an eligible student successfully joins.</p>
      <Link to="/internships" className="mt-5 inline-flex"><Button><Share2 className="mr-2 h-4 w-4" />Explore internships</Button></Link>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Available', wallet.availableBalance, IndianRupee], ['Pending', wallet.pendingBalance, Clock3], ['Total earned', wallet.totalEarned, WalletCards], ['Withdrawn', wallet.totalWithdrawn, ArrowRight]].map(([label, value, Icon]) => <div key={label} className="navyan-card p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-textMuted">{label}</p><p className="mt-1 font-display text-3xl font-bold text-textPrimary">{money(value)}</p></div>)}
    </section>
    <section className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
      <form onSubmit={requestWithdrawal} className="navyan-card space-y-4 p-5">
        <div><h2 className="font-display text-xl font-semibold text-textPrimary">Withdraw earnings</h2><p className="mt-1 text-sm text-textSecondary">Minimum withdrawal: {money(data?.minimumWithdrawal || 50)}. Available: {money(wallet.availableBalance)}</p></div>
        <Input value={upiId} onChange={(event) => setUpiId(event.target.value)} placeholder="yourname@upi" required />
        <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="50" step="1" placeholder="Amount" required />
        <Button type="submit" disabled={submitting || wallet.availableBalance < (data?.minimumWithdrawal || 50)} className="w-full">{submitting ? "Requesting..." : "Request withdrawal"}</Button>
      </form>
      <div className="navyan-card p-5"><h2 className="font-display text-xl font-semibold text-textPrimary">Your earnings</h2><div className="mt-4 space-y-3">{data?.transactions?.length ? data.transactions.map((item) => <div key={item._id} className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] p-3"><div><p className="text-sm font-semibold text-textPrimary">{item.description || "Share & Earn reward"}</p><p className="mt-1 text-xs text-textMuted">{new Date(item.createdAt).toLocaleDateString()} · {item.status}</p></div><span className={item.type === "CREDIT" ? "font-bold text-emerald-600" : "font-bold text-textPrimary"}>{item.type === "CREDIT" ? "+" : "-"}{money(item.amount)}</span></div>) : <p className="py-10 text-center text-sm text-textSecondary">Your successful share rewards will appear here.</p>}</div></div>
    </section>
    {data?.withdrawals?.length ? <section className="navyan-card p-5"><h2 className="font-display text-xl font-semibold text-textPrimary">Withdrawal history</h2><div className="mt-4 space-y-2">{data.withdrawals.map((item) => <div key={item._id} className="flex items-center justify-between text-sm"><span>{money(item.amount)} to {item.upiId}</span><span className="font-semibold text-textSecondary">{item.status}</span></div>)}</div></section> : null}
  </div>;
}
