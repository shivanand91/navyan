import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/certificates/me");
        setCertificates(data.certificates || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certificates</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          All your Navyan internship certificates stay here permanently with public
          verification links.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Issued certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {certificates.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              Once you complete an internship, your certificate will appear here with a
              public verification link.
            </p>
          ) : (
            certificates.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{c.role}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Duration: {c.durationKey} · Issued on{" "}
                    {new Date(c.completionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <a
                    href={c.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary"
                  >
                    Download
                  </a>
                  <Link
                    to={`/verify-certificate?cid=${c.certificateId}`}
                    className="text-[11px] text-slate-500 underline dark:text-slate-400"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
