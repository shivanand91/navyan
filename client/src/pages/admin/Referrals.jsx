import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const createEmptyForm = () => ({
  ownerName: "",
  code: ""
});

export default function AdminReferrals() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/referrals/admin");
      setCodes(data.codes || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load referral codes.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/referrals/admin", {
        ownerName: form.ownerName,
        code: form.code
      });
      toast.success("Referral code created.");
      setForm(createEmptyForm());
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not create referral code.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    const shouldDelete = window.confirm(
      `Delete referral code "${code.code}"?\n\nExisting applications will keep their referral history, but this code will stop working for future applies.`
    );

    if (!shouldDelete) return;

    setDeletingId(code._id);
    try {
      await api.delete(`/referrals/admin/${code._id}`);
      toast.success("Referral code deleted.");
      load();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Could not delete referral code.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Referral code management
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Generate referral codes for specific people, track how many internship applications came
          through each code, and deactivate them whenever needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="navyan-card grid gap-4 p-5 text-xs md:grid-cols-3">
        <Field label="Person name">
          <Input
            value={form.ownerName}
            onChange={(event) =>
              setForm((current) => ({ ...current, ownerName: event.target.value }))
            }
            placeholder="e.g. Aayushi Singh"
          />
        </Field>
        <Field label="Referral code (optional)">
          <Input
            value={form.code}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                code: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16)
              }))
            }
            placeholder="Auto-generate if blank"
          />
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Creating..." : "Create referral code"}
          </Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active and historical referral codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {codes.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No referral codes yet. Create the first one above.
            </p>
          ) : (
            codes.map((code) => (
              <div
                key={code._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                        {code.code}
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-[#d7deea]">
                        {code.isActive ? "Active" : "Deleted"}
                      </span>
                    </div>
                    <p className="font-display text-xl font-semibold text-slate-900 dark:text-[#f5f7fa]">
                      {code.ownerName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-[#b7c0cc]">
                      {code.usageCount} application{code.usageCount === 1 ? "" : "s"} used this code
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-[#7e8794]">
                      Created on {new Date(code.createdAt).toLocaleDateString()}
                    </span>
                    {code.isActive ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={deletingId === code._id}
                        onClick={() => handleDelete(code)}
                      >
                        {deletingId === code._id ? "Deleting..." : "Delete"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}
