import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import halfLogo from "@/assests/half_logo.png";

const fallbackDocument = {
  studentName: "Candidate Name",
  internshipTitle: "Web Development Intern",
  role: "Web Development Intern",
  durationLabel: "4 Weeks",
  mode: "Remote",
  startDateStr: "09 Apr 2026",
  endDateStr: "07 May 2026",
  issueDateStr: "10 May 2026",
  offerId: "NAV/OFFER/XXXX",
  internshipType: "Merit-Based Internship",
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
        const { data } = await api.get(
          `/applications/offer-letter/${accessToken}/preview`
        );

        if (!ignore) {
          setDocument(data.document || fallbackDocument);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            getApiErrorMessage(
              err,
              "Could not load this offer letter."
            )
          );
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-white p-10 rounded-2xl">
          <h1 className="text-2xl font-bold text-red-600">
            Offer Letter Unavailable
          </h1>

          <p className="mt-4 text-slate-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-white p-10 rounded-2xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Preparing Offer Letter
          </h1>

          <p className="mt-4 text-slate-600">
            Loading official Navyan document...
          </p>
        </div>
      </div>
    );
  }

  const role =
    document.role ||
    document.internshipTitle ||
    "Intern";

  return (
    <div className="min-h-screen bg-[#0b1220] py-10 px-4 print:bg-white">
      <DocumentToolbar />

      <div className="overflow-auto print:overflow-visible">
        <div
          className="
            relative
            mx-auto
            bg-white
            w-[210mm]
            h-[297mm]
            overflow-hidden
            shadow-2xl
            border-[8px]
            border-[#0f2b56]
            print:shadow-none
            print:border-[6px]
          "
        >
          {/* Top Design */}

          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-[#0f2b56] to-[#174ea6] rounded-br-full" />

          <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#d4af37] to-[#f4b400] rounded-bl-full" />

          {/* Bottom Design */}

          <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-[#d4af37] to-[#f4b400] rounded-tr-full" />

          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#0f2b56] to-[#174ea6] rounded-tl-full" />

          {/* Watermark */}

          <img
            src={halfLogo}
            alt=""
            className="
              absolute
              top-1/2
              left-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-72
              opacity-[0.04]
            "
          />

          {/* Header */}

          <div className="relative z-10 px-10 pt-8 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img
                src={halfLogo}
                alt="Navyan"
                className="w-14 h-14"
              />

              <div>
                <h1 className="text-[42px] leading-[42px] font-black text-[#0f2b56]">
                  Navyan
                </h1>

                <p className="text-[13px] text-slate-600 font-medium tracking-wide">
                  Internships and IT Services
                </p>
              </div>
            </div>

            <div className="text-right text-[12px] text-slate-600 leading-5">
              <p>www.navyan.online</p>
              <p>contact@navyan.online</p>
              <p>India</p>
            </div>
          </div>

          {/* Meta */}

          <div className="relative z-10 px-10 mt-8 flex justify-between text-[13px] text-slate-700">
            <div>
              Ref No:
              <span className="font-bold text-[#0f2b56] ml-2">
                {document.offerId}
              </span>
            </div>

            <div>
              Date:
              <span className="font-bold text-[#0f2b56] ml-2">
                {document.issueDateStr}
              </span>
            </div>
          </div>

          {/* Divider */}

          <div className="w-[90%] mx-auto h-[1px] bg-[#d4af37] mt-4" />

          {/* Title */}

          <div className="relative z-10 text-center mt-8">
            <h2 className="text-[44px] font-black tracking-[4px] text-[#0f2b56]">
              OFFER LETTER
            </h2>

            <div className="w-32 h-[3px] bg-[#d4af37] mx-auto mt-3 rounded-full" />
          </div>

          {/* Body */}

          <div className="relative z-10 px-10 mt-8 text-[14px] leading-7 text-slate-700">
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
                {role}
              </span>{" "}
              at{" "}
              <span className="font-bold text-[#0f2b56]">
                Navyan
              </span>.
              We are impressed with your enthusiasm,
              dedication, and passion for learning,
              and we believe you will be a valuable
              addition to our internship program.
            </p>

            {/* Internship Details */}

            <div className="mt-8">
              <h3 className="text-[18px] font-bold text-[#c48b10] uppercase tracking-wide">
                Internship Details
              </h3>

              <div className="grid grid-cols-2 gap-y-3 mt-4">
                <div className="font-semibold">
                  Position
                </div>

                <div>{role}</div>

                <div className="font-semibold">
                  Department
                </div>

                <div>
                  {document.internshipTitle}
                </div>

                <div className="font-semibold">
                  Internship Duration
                </div>

                <div>
                  {document.durationLabel}
                </div>

                <div className="font-semibold">
                  Start Date
                </div>

                <div>
                  {document.startDateStr}
                </div>

                <div className="font-semibold">
                  End Date
                </div>

                <div>
                  {document.endDateStr}
                </div>

                <div className="font-semibold">
                  Internship Type
                </div>

                <div>
                  {document.internshipType}
                </div>

                <div className="font-semibold">
                  Work Mode
                </div>

                <div>
                  {document.mode}
                </div>
              </div>
            </div>

            {/* Responsibilities */}

            <div className="mt-8">
              <h3 className="text-[18px] font-bold text-[#c48b10] uppercase tracking-wide">
                Role & Responsibilities
              </h3>

              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>
                  Work on assigned tasks and projects
                  under project coordinator guidance.
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

            {/* Terms */}

            <div className="mt-8">
              <h3 className="text-[18px] font-bold text-[#c48b10] uppercase tracking-wide">
                Terms & Conditions
              </h3>

              <ol className="list-decimal pl-5 mt-4 space-y-2">
                <li>
                  This internship is for educational
                  and skill development purposes.
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
              We are excited to have you onboard and
              look forward to a productive and rewarding
              learning experience together.
            </p>

            <p className="mt-5">
              Welcome to the{" "}
              <span className="font-bold text-[#0f2b56]">
                Navyan
              </span>{" "}
              family!
            </p>
          </div>

          {/* Signatures */}

          <div className="relative z-10 flex justify-between items-end px-10 mt-12">
            <div className="text-center">
              <div className="text-3xl italic text-slate-800">
                Shivanand
              </div>

              <div className="w-40 h-[1px] bg-[#d4af37] mt-1 mx-auto" />

              <h4 className="mt-2 text-[16px] font-bold text-[#0f2b56]">
                Shivanand Kumar
              </h4>

              <p className="text-[13px] text-[#b8860b] font-semibold tracking-[2px]">
                Founder
              </p>
            </div>

            {/* Seal */}

            <div
              className="
                w-24
                h-24
                rounded-full
                border-[5px]
                border-[#174ea6]
                flex
                items-center
                justify-center
                bg-white
                shadow-lg
              "
            >
              <img
                src={halfLogo}
                alt="seal"
                className="w-12"
              />
            </div>

            <div className="text-center">
              <div className="text-3xl italic text-slate-800">
                Anamika
              </div>

              <div className="w-40 h-[1px] bg-[#d4af37] mt-1 mx-auto" />

              <h4 className="mt-2 text-[16px] font-bold text-[#0f2b56]">
                Anamika Pandey
              </h4>

              <p className="text-[13px] text-[#b8860b] font-semibold tracking-[2px]">
                Co-Founder
              </p>
            </div>
          </div>

          {/* Footer */}

          <div className="absolute bottom-0 left-0 w-full bg-[#0f2b56] text-white py-3 text-center text-[13px] font-medium">
            Learn • Perform • Grow
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex justify-center gap-4 mb-8 print:hidden">
      <button
        type="button"
        onClick={goBack}
        className="
          px-5
          py-2.5
          rounded-lg
          bg-white
          text-slate-900
          font-semibold
          shadow-lg
          hover:scale-105
          transition
        "
      >
        Back
      </button>

      <button
        type="button"
        onClick={() => window.print()}
        className="
          px-5
          py-2.5
          rounded-lg
          bg-gradient-to-r
          from-[#174ea6]
          to-[#0f2b56]
          text-white
          font-semibold
          shadow-lg
          hover:scale-105
          transition
        "
      >
        Print / Save PDF
      </button>
    </div>
  );
}