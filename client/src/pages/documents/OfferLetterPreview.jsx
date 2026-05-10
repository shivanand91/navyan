import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import halfLogo from "@/assests/half_logo.png";

export default function OfferLetterPreview() {
  const { accessToken } = useParams();

  const [document, setDocument] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          `/applications/offer-letter/${accessToken}/preview`
        );

        setDocument(data.document);
      } catch {
        setDocument({
          studentName: "Candidate Name",
          internshipTitle: "Backend Development",
          role: "Intern",
          durationLabel: "4 Weeks",
          mode: "Remote",
          startDateStr: "09 Apr 2026",
          endDateStr: "07 May 2026",
          issueDateStr: "10 May 2026",
          offerId: "NAV-OFFER-2026-4977BB",
          internshipType: "Merit-based Internship",
        });
      }
    };

    load();
  }, [accessToken]);

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-4 print:bg-white">
      {/* TOP ACTIONS */}

      <div className="flex justify-center gap-4 mb-6 print:hidden">
        <button
          onClick={() => window.history.back()}
          className="bg-white border border-slate-300 px-5 py-2 rounded-lg font-medium shadow-sm"
        >
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="bg-[#0f2b56] text-white px-5 py-2 rounded-lg font-medium shadow-sm"
        >
          Print / Save PDF
        </button>
      </div>

      {/* A4 PAGE */}

      <div
        className="
          mx-auto
          bg-white
          relative
          overflow-hidden
          shadow-xl
          print:shadow-none
        "
        style={{
          width: "210mm",
          minHeight: "297mm",
        }}
      >
        {/* BORDER */}

        <div className="absolute inset-[12px] border-[5px] border-[#0f2b56]" />

        {/* TOP RIGHT DESIGN */}

        <div className="absolute top-0 right-0 w-28 h-28 bg-[#0f2b56]" />

        <div
          className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]"
          style={{
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          }}
        />

        {/* BOTTOM LEFT DESIGN */}

        <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#0f2b56]" />

        <div
          className="absolute bottom-0 left-0 w-20 h-20 bg-[#d4af37]"
          style={{
            clipPath: "polygon(0 100%, 0 0, 100% 100%)",
          }}
        />

        {/* HEADER */}

        <div className="relative z-10 px-14 pt-10 flex justify-between">
          <div className="flex items-center gap-4">
            <img
              src={halfLogo}
              alt="logo"
              className="w-16 h-16"
            />

            <div>
              <h1 className="text-[52px] leading-[52px] font-black text-[#0f2b56]">
                Navyan
              </h1>

              <p className="text-[16px] text-slate-600">
                Internships and IT Services
              </p>
            </div>
          </div>

          <div className="text-right text-[14px] leading-7 text-slate-700">
            <p>www.navyan.online</p>
            <p>contact@navyan.online</p>
            <p>India</p>
          </div>
        </div>

        {/* META */}

        <div className="relative z-10 px-14 mt-6 flex justify-between text-[15px] text-slate-700">
          <div>
            Ref No:
            <span className="font-semibold ml-2 text-[#0f2b56]">
              {document.offerId}
            </span>
          </div>

          <div>
            Date:
            <span className="font-semibold ml-2 text-[#0f2b56]">
              {document.issueDateStr}
            </span>
          </div>
        </div>

        {/* LINE */}

        <div className="mx-14 mt-4 border-b border-[#d4af37]" />

        {/* TITLE */}

        <div className="text-center mt-8">
          <h2 className="text-[46px] font-black tracking-[4px] text-[#0f2b56]">
            OFFER LETTER
          </h2>

          <div className="w-36 h-[2px] bg-[#d4af37] mx-auto mt-3" />
        </div>

        {/* BODY */}

        <div className="px-14 mt-8 text-[15px] leading-8 text-slate-800">
          <p>
            Dear{" "}
            <span className="font-bold text-[#0f2b56]">
              {document.studentName}
            </span>,
          </p>

          <p className="mt-5 font-semibold">
            Congratulations!
          </p>

          <p className="mt-5">
            We are pleased to offer you the position of{" "}
            <span className="font-bold text-[#0f2b56]">
              {document.role}
            </span>{" "}
            at Navyan. We are impressed with your
            enthusiasm, skills, passion, and dedication,
            and we believe you will be a valuable
            addition to our internship program.
          </p>

          {/* DETAILS */}

          <div className="mt-8">
            <h3 className="text-[#c48b10] text-[18px] font-bold uppercase tracking-wide">
              Internship Details
            </h3>

            <div className="grid grid-cols-2 gap-y-2 mt-4">
              <div className="font-semibold">
                Position
              </div>
              <div>{document.role}</div>

              <div className="font-semibold">
                Department
              </div>
              <div>{document.internshipTitle}</div>

              <div className="font-semibold">
                Internship Duration
              </div>
              <div>{document.durationLabel}</div>

              <div className="font-semibold">
                Start Date
              </div>
              <div>{document.startDateStr}</div>

              <div className="font-semibold">
                End Date
              </div>
              <div>{document.endDateStr}</div>

              <div className="font-semibold">
                Internship Type
              </div>
              <div>{document.internshipType}</div>

              <div className="font-semibold">
                Work Mode
              </div>
              <div>{document.mode}</div>
            </div>
          </div>

          {/* RESPONSIBILITIES */}

          <div className="mt-8">
            <h3 className="text-[#c48b10] text-[18px] font-bold uppercase tracking-wide">
              Role & Responsibilities
            </h3>

            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>
                Work on assigned tasks and projects under
                project coordinator guidance.
              </li>

              <li>
                Collaborate with the team to deliver
                quality work.
              </li>

              <li>
                Maintain professionalism and commitment
                throughout the internship.
              </li>

              <li>
                Learn practical industry-level skills.
              </li>
            </ul>
          </div>

          {/* TERMS */}

          <div className="mt-8">
            <h3 className="text-[#c48b10] text-[18px] font-bold uppercase tracking-wide">
              Terms & Conditions
            </h3>

            <ol className="list-decimal pl-5 mt-4 space-y-2">
              <li>
                This internship is for educational and
                skill development purposes.
              </li>

              <li>
                Confidentiality of company information
                must be maintained.
              </li>

              <li>
                Any misconduct may result in termination.
              </li>

              <li>
                Certificate will be awarded upon
                successful completion.
              </li>
            </ol>
          </div>

          <p className="mt-8">
            We are excited to have you onboard and look
            forward to a productive and rewarding journey
            together.
          </p>

          <p className="mt-5">
            Welcome to the{" "}
            <span className="font-bold text-[#0f2b56]">
              Navyan
            </span>{" "}
            family!
          </p>
        </div>

        {/* SIGNATURES */}

        <div className="px-14 mt-12 flex justify-between items-end">
          <div className="text-center">
            <div className="text-[38px] italic text-slate-800">
              Shivanand
            </div>

            <div className="w-44 border-b border-[#d4af37]" />

            <h4 className="mt-2 font-bold text-[#0f2b56]">
              Shivanand Kumar
            </h4>

            <p className="text-sm text-slate-600">
              Founder
            </p>
          </div>

          {/* SEAL */}

          <div className="w-24 h-24 rounded-full border-[4px] border-[#0f2b56] flex items-center justify-center">
            <img
              src={halfLogo}
              alt="seal"
              className="w-12"
            />
          </div>

          <div className="text-center">
            <div className="text-[38px] italic text-slate-800">
              Anamika
            </div>

            <div className="w-44 border-b border-[#d4af37]" />

            <h4 className="mt-2 font-bold text-[#0f2b56]">
              Anamika Pandey
            </h4>

            <p className="text-sm text-slate-600">
              Co-Founder
            </p>
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-10 bg-[#0f2b56] text-white text-center py-3 text-sm font-medium">
          Learn • Perform • Grow
        </div>
      </div>
    </div>
  );
}