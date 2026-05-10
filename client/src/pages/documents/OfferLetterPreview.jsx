import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";
import "./documentPreview.css";

const fallbackDocument = {
  studentName: "Candidate Name",
  internshipTitle: "Web Development Intern",
  role: "Web Development Intern",
  durationLabel: "4 weeks",
  mode: "Remote",
  startDateStr: "Start Date",
  endDateStr: "End Date",
  issueDateStr: "Issue Date",
  offerId: "NAV/OFFER/XXXX",
  internshipType: "Merit-based internship"
};

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.assign("/");
};

export default function OfferLetterPreview() {
  const { accessToken } = useParams();
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const { data } = await api.get(`/applications/offer-letter/${accessToken}/preview`);
        if (!ignore) {
          setDocument(data.document || fallbackDocument);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, "Could not load this offer letter."));
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [accessToken]);

  if (error) {
    return (
      <div className="navyan-doc-screen">
        <DocumentToolbar />
        <div className="navyan-doc-state">
          <h1>Offer letter unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="navyan-doc-screen">
        <DocumentToolbar />
        <div className="navyan-doc-state">
          <h1>Preparing offer letter</h1>
          <p>Loading the official Navyan document preview.</p>
        </div>
      </div>
    );
  }

  const role = document.role || document.internshipTitle || "Intern";

  return (
    <div className="navyan-doc-screen">
      <DocumentToolbar />
      <div className="navyan-doc-stage">
        <article className="navyan-offer-page" aria-label="Navyan internship offer letter">
          <div className="doc-corner-gold offer-gold-top" />
          <div className="doc-corner-navy offer-corner-top" />
          <div className="doc-corner-gold offer-gold-bottom" />
          <div className="doc-corner-navy offer-corner-bottom" />

          <header className="offer-header">
            <img src={fullLogo} alt="Navyan" className="offer-logo" />
            <div className="offer-contact-card">
              <strong>NAVYAN</strong>
              <span>Internships and IT Services</span>
              <br />
              <span>www.navyan.online</span>
              <br />
              <span>contact@navyan.online</span>
              <br />
              <span>India</span>
            </div>
          </header>

          <div className="offer-meta">
            <span>Ref. No.: {document.offerId}</span>
            <span>Date: {document.issueDateStr}</span>
          </div>

          <section className="offer-title">
            <h1>OFFER LETTER</h1>
            <div className="title-rule">NAVYAN</div>
          </section>

          <section className="offer-body">
            <p>
              <strong>Dear {document.studentName},</strong>
            </p>
            <p>
              <strong>Congratulations!</strong>
            </p>
            <p>
              We are pleased to offer you the position of <strong>{role}</strong> at{" "}
              <strong>Navyan (Internships and IT Services)</strong>. We are impressed with
              your skills, passion, and enthusiasm, and we believe you will be a great
              addition to our learning community.
            </p>

            <div className="offer-section">
              <h2>Internship Details</h2>
              <div className="offer-details-grid">
                <span>Position</span>
                <span>: {role}</span>
                <span>Department</span>
                <span>: {document.internshipTitle || role}</span>
                <span>Internship Duration</span>
                <span>: {document.durationLabel}</span>
                <span>Start Date</span>
                <span>: {document.startDateStr}</span>
                <span>End Date</span>
                <span>: {document.endDateStr}</span>
                <span>Internship Type</span>
                <span>: {document.internshipType}</span>
                <span>Work Mode</span>
                <span>: {document.mode || "Remote"}</span>
              </div>
            </div>

            <div className="offer-section">
              <h2>Role & Responsibilities</h2>
              <ul className="offer-list">
                <li>Work on assigned tasks and projects as per project coordinator guidance.</li>
                <li>Collaborate with the team to deliver clean, high-quality results.</li>
                <li>Learn, implement, and contribute disciplined engineering ideas.</li>
                <li>Maintain professionalism and commitment throughout the internship.</li>
              </ul>
            </div>

            <div className="offer-section">
              <h2>Terms & Conditions</h2>
              <ol className="offer-list">
                <li>This internship is for educational and skill development purposes.</li>
                <li>You are expected to maintain confidentiality of company information.</li>
                <li>Any misconduct or failure to meet expectations may lead to termination.</li>
                <li>Upon successful completion, you will receive a Certificate of Internship.</li>
              </ol>
            </div>

            <p>
              We are excited to have you on board and look forward to a productive and
              rewarding journey together. Welcome to the <strong>Navyan</strong> family!
            </p>
          </section>

          <section className="offer-signatures" aria-label="Authorized signatures">
            <div>
              <div className="signature-mark">Shivanand</div>
              <div className="signature-name">Shivanand Kumar</div>
              <div className="signature-role">Founder, Navyan</div>
            </div>
            <div className="offer-seal">
              <img src={halfLogo} alt="Navyan seal" />
            </div>
            <div>
              <div className="signature-mark">Anamika</div>
              <div className="signature-name">Anamika Pandey</div>
              <div className="signature-role">Co-Founder, Navyan</div>
            </div>
          </section>

          <footer className="offer-footer">
            <span>www.navyan.online</span>
            <span>contact@navyan.online</span>
            <span>India</span>
          </footer>
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
