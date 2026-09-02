import { useEffect, useState } from "react";
import { IndianRupee, Link2, UsersRound, WalletCards, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminShareEarn() {
  const [overview, setOverview] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [references, setReferences] = useState({});

  const load = async () => {
    try {
      const [overviewRes, withdrawalRes, rewardRes] = await Promise.all([
        api.get("/share-earn/admin/overview", { cache: false }),
        api.get("/share-earn/admin/withdrawals", { cache: false }),
        api.get("/share-earn/admin/rewards", { cache: false })
      ]);
      setOverview(overviewRes.data);
      setWithdrawals(withdrawalRes.data.withdrawals || []);
      setRewards(rewardRes.data.rewards || []);
    } catch {
      toast.error("Could not load Share & Earn management.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const utr = references[id]?.trim();
    if (status === "COMPLETED" && !utr) {
      toast.error("Please enter the UTR / Transaction Reference number before marking payout as Paid.");
      return;
    }

    try {
      await api.patch(`/share-earn/admin/withdrawals/${id}`, {
        status,
        transactionReference: utr
      });
      toast.success(status === "COMPLETED" ? "Payout marked as Paid successfully!" : "Withdrawal updated.");
      load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update withdrawal.");
    }
  };

  const rewardTotal = overview?.rewards?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const pendingWithdrawals =
    overview?.withdrawals
      ?.filter((item) => ["PENDING", "PROCESSING"].includes(item._id))
      .reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Share & Earn</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-textPrimary">Earnings management</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Rewards generated", rewardTotal, IndianRupee],
          ["Pending withdrawals", pendingWithdrawals, WalletCards],
          ["Share links", overview?.totalLinks || 0, Link2],
          ["Active sharers", overview?.activeSharers || 0, UsersRound]
        ].map(([label, value, Icon]) => (
          <div key={label} className="navyan-card p-5">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-textMuted">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-textPrimary">
              {label.includes("₹") || label.includes("Rewards") || label.includes("withdrawals")
                ? money(value)
                : value}
            </p>
          </div>
        ))}
      </div>

      <section className="navyan-card overflow-x-auto p-5">
        <h2 className="font-display text-xl font-semibold text-textPrimary">Withdrawal requests</h2>
        <table className="mt-4 min-w-[760px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-textMuted">
            <tr>
              <th className="pb-3">Student</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">UPI ID</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">UTR / Ref No</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => (
              <tr key={item._id} className="border-t border-[color:var(--border)]">
                <td className="py-3">
                  <p className="font-semibold text-textPrimary">{item.user?.fullName}</p>
                  <p className="text-xs text-textMuted">{item.user?.email}</p>
                </td>
                <td className="font-bold text-textPrimary">{money(item.amount)}</td>
                <td className="font-mono text-xs text-textSecondary">{item.upiId}</td>
                <td>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : item.status === "REJECTED"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {item.status === "COMPLETED" ? "Paid" : item.status}
                  </span>
                </td>
                <td className="py-3 font-mono text-xs">
                  {item.transactionReference ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.transactionReference}
                    </span>
                  ) : ["PENDING", "PROCESSING"].includes(item.status) ? (
                    <Input
                      className="h-8 w-44 text-xs font-mono"
                      placeholder="Enter 12-digit UTR"
                      value={references[item._id] || ""}
                      onChange={(event) =>
                        setReferences((current) => ({
                          ...current,
                          [item._id]: event.target.value
                        }))
                      }
                    />
                  ) : (
                    <span className="text-textMuted">—</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {["PENDING", "PROCESSING"].includes(item.status) ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(item._id, "PROCESSING")}
                        >
                          Process
                        </Button>
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => updateStatus(item._id, "COMPLETED")}
                        >
                          Mark Paid
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => updateStatus(item._id, "REJECTED")}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold text-textMuted">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" /> Finalized
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 ? (
          <p className="py-8 text-center text-sm text-textSecondary">No withdrawal requests yet.</p>
        ) : null}
      </section>

      <section className="navyan-card overflow-x-auto p-5">
        <h2 className="font-display text-xl font-semibold text-textPrimary">Recent share rewards</h2>
        <table className="mt-4 min-w-[680px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-textMuted">
            <tr>
              <th className="pb-3">Sharer</th>
              <th className="pb-3">Student joined</th>
              <th className="pb-3">Internship</th>
              <th className="pb-3">Reward</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((item) => (
              <tr key={item._id} className="border-t border-[color:var(--border)]">
                <td className="py-3 font-semibold text-textPrimary">{item.user?.fullName}</td>
                <td>{item.referredUser?.fullName}</td>
                <td>{item.internship?.title}</td>
                <td className="font-bold text-emerald-600">+{money(item.amount)}</td>
                <td>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rewards.length === 0 ? (
          <p className="py-8 text-center text-sm text-textSecondary">No successful share enrollments yet.</p>
        ) : null}
      </section>
    </div>
  );
}
