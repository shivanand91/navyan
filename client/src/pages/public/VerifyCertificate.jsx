import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useSearchParams } from "react-router-dom";

export default function VerifyCertificate() {
  const { certificateId: routeCertificateId } = useParams();
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialValue = routeCertificateId || searchParams.get("cid") || "";
    if (initialValue) {
      setCertificateId(initialValue);
    }
  }, [routeCertificateId, searchParams]);

  useEffect(() => {
    const initialValue = routeCertificateId || searchParams.get("cid");
    if (initialValue) {
      handleVerify(null, initialValue);
    }
  }, [routeCertificateId, searchParams]);

  const handleVerify = async (e, requestedId = certificateId) => {
    e?.preventDefault();
    if (!requestedId) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.get(`/certificates/verify/${requestedId}`);
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="navyan-section">
      <div className="mx-auto max-w-xl px-4 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Verify a Navyan certificate
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enter the unique certificate ID printed on the document to confirm its
            authenticity.
          </p>
        </div>

        <form onSubmit={handleVerify} className="navyan-card space-y-4 p-5">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Certificate ID
            </label>
            <Input
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="e.g. NAV-INT-2026-XXXX"
            />
          </div>
          <Button type="submit" disabled={loading || !certificateId}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        {result && (
          <div className="navyan-card p-5 text-sm">
            {result.valid ? (
              <div className="space-y-1 text-slate-700 dark:text-slate-200">
                <p className="font-semibold text-emerald-700">
                  This certificate is valid and issued by Navyan.
                </p>
                <p>Student: {result.certificate.fullName}</p>
                <p>Role: {result.certificate.role}</p>
                <p>Duration: {result.certificate.durationKey}</p>
                <p>Issued on: {new Date(result.certificate.completionDate).toDateString()}</p>
                {result.certificate.verifyUrl && (
                  <a
                    href={result.certificate.verifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block pt-2 text-primary"
                  >
                    Open verification link
                  </a>
                )}
              </div>
            ) : (
              <p className="text-rose-600 font-medium">
                We could not verify this certificate. Please check the ID and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
