import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/certificates/admin");
        setCertificates(data.certificates || []);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Certificate Registry</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          All issued completion certificates with verification status and download links.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Issued certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {certificates.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No certificates have been issued yet.</p>
          ) : (
            certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-[#2a2a36] dark:bg-[#1d1d29]/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {certificate.fullName} ·{" "}
                    <span className="text-slate-500 dark:text-slate-400">{certificate.role}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {certificate.certificateId} · Issued{" "}
                    {new Date(certificate.issueDate || certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                    {certificate.verificationStatus}
                  </span>
                  <a href={certificate.pdfUrl} target="_blank" rel="noreferrer" className="text-primary">
                    Download PDF
                  </a>
                  {certificate.verifyUrl && (
                    <a href={certificate.verifyUrl} target="_blank" rel="noreferrer" className="text-primary">
                      Verify
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
