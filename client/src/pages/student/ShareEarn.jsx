import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, IndianRupee, Share2, WalletCards, Sparkles, CheckCircle2 } from "lucide-react";
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

  const load = async () => {
    try {
      const result = await api.get("/share-earn/wallet", { cache: false });
      setData(result.data);
    } catch {
      toast.error("Could not load your earnings.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const requestWithdrawal = async (event) => {
    event.preventDefault();
    const reqAmount = Number(amount);

    if (reqAmount < 50) {
      toast.error("Minimum withdrawal amount is ₹50.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/share-earn/withdrawals", { amount: reqAmount, upiId });
      toast.success("Withdrawal request received.");
      setAmount("");
      setUpiId("");
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not request withdrawal.");
    } finally {
      setSubmitting(false);
    }
  };

  const wallet = data?.wallet || {};
  const minWithdrawal = data?.minimumWithdrawal || 50;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[18px] border border-primary/20 bg-gradient-to-br from-primary/15 via-[color:var(--card)] to-amber-400/10 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Share & Earn Rewards</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-textPrimary">Share internships. Earn rewards.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-textSecondary">
          Generate a custom link for any internship and share with your friends. Earn instant rewards when they complete enrollment:
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center rounded-lg bg-background/80 px-3 py-1.5 border border-[color:var(--border)] text-xs font-semibold text-textPrimary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            4-Weeks Internship: <span className="ml-1 font-bold text-emerald-600">₹10</span>
          </div>
          <div className="flex items-center rounded-lg bg-background/80 px-3 py-1.5 border border-[color:var(--border)] text-xs font-semibold text-textPrimary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            3-Months Internship: <span className="ml-1 font-bold text-emerald-600">₹50</span>
          </div>
          <div className="flex items-center rounded-lg bg-background/80 px-3 py-1.5 border border-[color:var(--border)] text-xs font-semibold text-textPrimary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            6-Months Internship: <span className="ml-1 font-bold text-emerald-600">₹100</span>
          </div>
        </div>

        <Link to="/internships" className="mt-5 inline-flex">
          <Button>
            <Share2 className="mr-2 h-4 w-4" />
            Explore internships to share
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Available Balance", wallet.availableBalance, IndianRupee],
          ["Pending Withdrawal", wallet.pendingBalance, Clock3],
          ["Total Earned", wallet.totalEarned, WalletCards],
          ["Total Withdrawn", wallet.totalWithdrawn, ArrowRight]
        ].map(([label, value, Icon]) => (
          <div key={label} className="navyan-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-textMuted">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-textPrimary">{money(value)}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.35fr]">
        <form onSubmit={requestWithdrawal} className="navyan-card space-y-4 p-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-textPrimary">Withdraw earnings</h2>
            <p className="mt-1 text-sm text-textSecondary">
              Minimum withdrawal: <span className="font-bold text-textPrimary">{money(minWithdrawal)}</span>. Available:{" "}
              <span className="font-bold text-emerald-600">{money(wallet.availableBalance)}</span>
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-textSecondary">UPI ID for Payout</label>
            <Input
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="e.g. yourname@upi or 9876543210@paytm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-textSecondary">Withdrawal Amount (Min ₹50)</label>
            <Input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="50"
              step="1"
              placeholder="Enter amount (min ₹50)"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || wallet.availableBalance < minWithdrawal}
            className="w-full"
          >
            {submitting ? "Submitting request..." : "Request UPI Withdrawal"}
          </Button>
        </form>

        <div className="navyan-card p-5">
          <h2 className="font-display text-xl font-semibold text-textPrimary">Your rewards history</h2>
          <div className="mt-4 space-y-3">
            {data?.transactions?.length ? (
              data.transactions.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--border)] p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{item.description || "Share & Earn reward"}</p>
                    <p className="mt-1 text-xs text-textMuted">
                      {new Date(item.createdAt).toLocaleDateString()} · {item.status}
                    </p>
                  </div>
                  <span
                    className={
                      item.type === "CREDIT"
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-bold text-textPrimary"
                    }
                  >
                    {item.type === "CREDIT" ? "+" : "-"}
                    {money(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-textSecondary">
                Your successful share rewards will appear here.
              </p>
            )}
          </div>
        </div>
      </section>

      {data?.withdrawals?.length ? (
        <section className="navyan-card p-5">
          <h2 className="font-display text-xl font-semibold text-textPrimary">Withdrawal history & UTR tracking</h2>
          <div className="mt-4 space-y-3">
            {data.withdrawals.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 rounded-xl border border-[color:var(--border)] p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-textPrimary">{money(item.amount)}</span>
                    <span className="text-textMuted">to</span>
                    <span className="font-mono text-xs text-textSecondary">{item.upiId}</span>
                  </div>
                  {item.transactionReference ? (
                    <div className="mt-1 flex items-center text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                      UTR / Bank Ref: <span className="ml-1 font-bold">{item.transactionReference}</span>
                    </div>
                  ) : null}
                  <p className="mt-1 text-xs text-textMuted">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : item.status === "REJECTED"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {item.status === "COMPLETED" ? "Paid (Verified)" : item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
