import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";

const fallbackDocument = {
  studentName: "Candidate Name",
  internshipTitle: "Web Development Intern",
  role: "Web Development Intern",
  durationLabel: "4 Weeks",
  mode: "Remote",
  startDateStr: "Start Date",
  endDateStr: "End Date",
  issueDateStr: "Issue Date",
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <DocumentToolbar />

        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-red-600">
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <DocumentToolbar />

        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-slate-900">
            Preparing Offer Letter
          </h1>

          <p className="mt-4 text-slate-600">
            Loading the official Navyan offer letter preview.
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
    <div className="min-h-screen bg-[#07111f] py-10 px-4">
      <DocumentToolbar />

      <div className="overflow-auto">
        <div
          className="
            relative
            mx-auto
            bg-white
            w-[1123px]
            min-h-[1587px]
            rounded-xl
            overflow-hidden
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            border-[12px]
            border-[#0f2b56]
          "
        >
          {/* Decorative Background */}

          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-gradient-to-br from-[#0f2b56] via-[#174ea6] to-[#f4b400] rounded-br-[220px]" />

          <div className="absolute bottom-0 right-0 w-[320px] h-[320px] bg-gradient-to-tl from-[#0f2b56] via-[#174ea6] to-[#f4b400] rounded-tl-[220px]" />

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
              w-[420px]
              opacity-[0.04]
            "
          />

          {/* Header */}

          <div className="relative z-10 flex justify-between items-start px-16 pt-14">
            <img
              src={fullLogo}
              alt="Navyan"
              className="w-[340px]"
            />

            <div className="text-right">
              <h2 className="text-[#0f2b56] font-bold text-3xl">
                NAVYAN
              </h2>

              <p className="text-slate-600 mt-2">
                Internships and IT Services
              </p>

              <div className="mt-6 text-slate-600 text-lg leading-9">
                <p>www.navyan.online</p>
                <p>contact@navyan.online</p>
                <p>India</p>
              </div>
            </div>
          </div>

          {/* Ref + Date */}

          <div className="relative z-10 flex justify-between px-16 mt-14 text-xl text-slate-700 font-medium">
            <div>
              Ref No:{" "}
              <span className="font-bold text-[#0f2b56]">
                {document.offerId}
              </span>
            </div>

            <div>
              Date:{" "}
              <span className="font-bold text-[#0f2b56]">
                {document.issueDateStr}
              </span>
            </div>
          </div>

          {/* Title */}

          <div className="relative z-10 text-center mt-16">
            <h1 className="text-[72px] font-black tracking-[8px] text-[#0f2b56]">
              OFFER LETTER
            </h1>

            <div className="w-[300px] h-[4px] bg-[#d4af37] mx-auto mt-5 rounded-full" />
          </div>

          {/* Content */}

          <div className="relative z-10 px-20 mt-16">
            <p className="text-2xl text-slate-700 leading-[52px]">
              Dear{" "}
              <span className="font-bold text-[#0f2b56]">
                {document.studentName}
              </span>,
            </p>

            <p className="mt-10 text-2xl text-slate-700 leading-[52px]">
              Congratulations!
            </p>

            <p className="mt-10 text-[25px] leading-[54px] text-slate-700">
              We are pleased to offer you the position of{" "}
              <span className="font-bold text-[#0f2b56]">
                {role}
              </span>{" "}
              at{" "}
              <span className="font-bold text-[#0f2b56]">
                Navyan
              </span>.
              We are impressed with your skills,
              enthusiasm, and dedication, and we believe
              you will be a valuable addition to our
              internship program and learning community.
            </p>

            {/* Internship Details */}

            <div className="mt-16">
              <h2 className="text-[36px] font-bold text-[#0f2b56] border-b-4 border-[#d4af37] inline-block pb-3">
                Internship Details
              </h2>

              <div className="grid grid-cols-2 gap-y-8 mt-10 text-[23px]">
                <div className="font-semibold text-slate-700">
                  Position
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {role}
                </div>

                <div className="font-semibold text-slate-700">
                  Department
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.internshipTitle}
                </div>

                <div className="font-semibold text-slate-700">
                  Duration
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.durationLabel}
                </div>

                <div className="font-semibold text-slate-700">
                  Start Date
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.startDateStr}
                </div>

                <div className="font-semibold text-slate-700">
                  End Date
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.endDateStr}
                </div>

                <div className="font-semibold text-slate-700">
                  Internship Type
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.internshipType}
                </div>

                <div className="font-semibold text-slate-700">
                  Work Mode
                </div>

                <div className="text-[#0f2b56] font-bold">
                  {document.mode}
                </div>
              </div>
            </div>

            {/* Responsibilities */}

            <div className="mt-20">
              <h2 className="text-[36px] font-bold text-[#0f2b56] border-b-4 border-[#d4af37] inline-block pb-3">
                Role & Responsibilities
              </h2>

              <ul className="mt-10 space-y-6 text-[24px] leading-[50px] text-slate-700 list-disc pl-10">
                <li>
                  Work on assigned tasks and projects under
                  the guidance of the project coordinator.
                </li>

                <li>
                  Collaborate with the team to deliver
                  professional and high-quality outcomes.
                </li>

                <li>
                  Maintain professionalism, discipline, and
                  commitment throughout the internship.
                </li>

                <li>
                  Learn practical industry-level skills and
                  contribute innovative ideas.
                </li>
              </ul>
            </div>

            {/* Terms */}

            <div className="mt-20">
              <h2 className="text-[36px] font-bold text-[#0f2b56] border-b-4 border-[#d4af37] inline-block pb-3">
                Terms & Conditions
              </h2>

              <ol className="mt-10 space-y-6 text-[24px] leading-[50px] text-slate-700 list-decimal pl-10">
                <li>
                  This internship is intended for educational
                  and skill development purposes.
                </li>

                <li>
                  Confidentiality of all company information
                  must be maintained.
                </li>

                <li>
                  Any misconduct or violation of internship
                  policies may result in termination.
                </li>

                <li>
                  A Certificate of Internship will be awarded
                  upon successful completion.
                </li>
              </ol>
            </div>

            {/* Welcome */}

            <p className="mt-20 text-[25px] leading-[54px] text-slate-700">
              We are excited to have you onboard and look
              forward to a productive and successful journey
              together.
              Welcome to the{" "}
              <span className="font-bold text-[#0f2b56]">
                Navyan
              </span>{" "}
              family.
            </p>
          </div>

          {/* Signatures */}

          <div className="relative z-10 flex justify-between items-center px-20 mt-28">
            <div className="text-center">
              <div className="text-[54px] italic text-slate-800">
                Shivanand
              </div>

              <div className="w-[240px] h-[2px] bg-[#d4af37] mx-auto" />

              <h4 className="mt-4 text-[28px] font-bold text-[#0f2b56]">
                Shivanand Kumar
              </h4>

              <p className="text-[#b8860b] font-semibold tracking-[3px]">
                Founder
              </p>
            </div>

            {/* Seal */}

            <div
              className="
                w-[190px]
                h-[190px]
                rounded-full
                border-[10px]
                border-[#174ea6]
                flex
                items-center
                justify-center
                bg-white
                shadow-2xl
              "
            >
              <img
                src={halfLogo}
                alt="seal"
                className="w-[95px]"
              />
            </div>

            <div className="text-center">
              <div className="text-[54px] italic text-slate-800">
                Anamika
              </div>

              <div className="w-[240px] h-[2px] bg-[#d4af37] mx-auto" />

              <h4 className="mt-4 text-[28px] font-bold text-[#0f2b56]">
                Anamika Pandey
              </h4>

              <p className="text-[#b8860b] font-semibold tracking-[3px]">
                Co-Founder
              </p>
            </div>
          </div>

          {/* Footer */}

          <div
            className="
              relative
              z-10
              mt-20
              bg-[#0f2b56]
              text-white
              py-8
              flex
              justify-center
              gap-16
              text-xl
              font-medium
            "
          >
            <span>www.navyan.online</span>
            <span>contact@navyan.online</span>
            <span>India</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        type="button"
        onClick={goBack}
        className="
          px-6
          py-3
          rounded-xl
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
          px-6
          py-3
          rounded-xl
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