import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";
import "./documentPreview.css";

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.assign("/");
};

export default function CertificatePreview() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const { data } = await api.get(`/certificates/preview/${certificateId}`);
        if (!ignore) {
          setCertificate(data.certificate);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, "Could not load this certificate."));
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [certificateId]);

  if (error) {
    return (
      <div className="navyan-doc-screen">
        <DocumentToolbar />
        <div className="navyan-doc-state">
          <h1>Certificate unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="navyan-doc-screen">
        <DocumentToolbar />
        <div className="navyan-doc-state">
          <h1>Preparing certificate</h1>
          <p>Loading the official Navyan certificate preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="navyan-doc-screen">
      <DocumentToolbar />
      <div className="navyan-doc-stage">
        <article className="navyan-certificate-page" aria-label="Navyan internship certificate">
          <div className="certificate-border" />
          <div className="doc-corner-gold cert-gold-left" />
          <div className="doc-corner-navy cert-corner-left" />
          <div className="doc-corner-gold cert-gold-right" />
          <div className="doc-corner-navy cert-corner-right" />
          <img src={halfLogo} alt="" className="certificate-watermark" />

          <img src={fullLogo} alt="Navyan" className="certificate-logo" />
          <div className="certificate-badge">
            Learn
            <br />
            Perform
            <br />
            Grow
          </div>

          <section className="certificate-title">
            <h1>CERTIFICATE</h1>
            <h2>OF INTERNSHIP</h2>
          </section>

          <p className="certificate-presented">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          <div className="certificate-student">{certificate.studentName}</div>

          <p className="certificate-copy">
            For successfully completing the <strong>{certificate.role}</strong> internship
            program at Navyan. During this internship, the individual has shown
            dedication, consistency, and a strong willingness to learn and contribute. We
            appreciate their efforts and wish them success in future endeavors.
          </p>

          <section className="certificate-signatures" aria-label="Authorized signatures">
            <div>
              <div className="signature-mark">Shivanand</div>
              <div className="signature-name">Shivanand Kumar</div>
              <div className="signature-role">Founder</div>
            </div>
            <div className="certificate-seal">
              <img src={halfLogo} alt="Navyan seal" />
            </div>
            <div>
              <div className="signature-mark">Anamika</div>
              <div className="signature-name">Anamika Pandey</div>
              <div className="signature-role">Co-Founder</div>
            </div>
          </section>

          <div className="certificate-qr">
            {certificate.qrCodeDataUrl ? <img src={certificate.qrCodeDataUrl} alt="Verification QR" /> : null}
            <span>
              Verify online
              <br />
              {certificate.certificateId}
            </span>
          </div>

          <div className="certificate-id">
            Issued: {certificate.issueDateStr} | Completed: {certificate.completionDateStr}
          </div>
          <div className="certificate-quote">"Learn, Perform, Grow"</div>
        </article>
      </div>
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="navyan-doc-toolbar">
      <button type="button" onClick={goBack}>
        Back
      </button>
      <button type="button" className="primary-action" onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </div>
  );
}
