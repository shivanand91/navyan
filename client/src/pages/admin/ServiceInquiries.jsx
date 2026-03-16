import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statuses = [
  "New",
  "Contacted",
  "Meeting Scheduled",
  "Proposal Sent",
  "Closed Won",
  "Closed Lost"
];

export default function ServiceInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/service-inquiries/admin");
      setInquiries(data.inquiries || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatus = async (id, status) => {
    setUpdatingId(id + status);
    try {
      await api.patch(`/service-inquiries/admin/${id}`, { status });
      toast.success("Status updated.");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Service inquiries</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Manage all product and service leads from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {inquiries.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No inquiries yet.</p>
          ) : (
            inquiries.map((inq) => (
              <div
                key={inq._id}
                className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {inq.name} ·{" "}
                    <span className="text-slate-500 dark:text-slate-400">{inq.company || "Individual"}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {inq.service} · {inq.email} · {inq.phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-slate-50">
                    {inq.status}
                  </span>
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === inq._id + status}
                      onClick={() => handleStatus(inq._id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
