import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";

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
        const { data } = await api.get(
          `/certificates/preview/${certificateId}`
        );

        if (!ignore) {
          setCertificate(data.certificate);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            getApiErrorMessage(
              err,
              "Could not load this certificate."
            )
          );
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <DocumentToolbar />

        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-red-600">
            Certificate unavailable
          </h1>

          <p className="mt-4 text-slate-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <DocumentToolbar />

        <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-slate-900">
            Preparing Certificate
          </h1>

          <p className="mt-4 text-slate-600">
            Loading the official Navyan certificate preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111f] py-10 px-4">
      <DocumentToolbar />

      <div className="overflow-auto">
        <div
          className="
            relative
            mx-auto
            w-[1123px]
            h-[794px]
            bg-white
            rounded-xl
            overflow-hidden
            shadow-[0_25px_80px_rgba(0,0,0,0.45)]
            border-[12px]
            border-[#0f2b56]
          "
        >
          {/* Decorative Corners */}

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
              w-[380px]
              opacity-[0.05]
            "
          />

          {/* Header */}

          <div className="relative z-10 flex items-start justify-between px-16 pt-12">
            <img
              src={fullLogo}
              alt="Navyan"
              className="w-[320px]"
            />

            <div
              className="
                bg-gradient-to-br
                from-[#0f2b56]
                to-[#174ea6]
                text-white
                px-8
                py-6
                rounded-full
                text-center
                font-semibold
                text-sm
                leading-6
                border-[6px]
                border-[#f4b400]
                shadow-xl
              "
            >
              LEARN
              <br />
              PERFORM
              <br />
              GROW
            </div>
          </div>

          {/* Title */}

          <div className="relative z-10 text-center mt-8">
            <h1
              className="
                text-[82px]
                tracking-[10px]
                font-black
                text-[#0f2b56]
              "
            >
              CERTIFICATE
            </h1>

            <h2
              className="
                text-[38px]
                font-semibold
                tracking-[8px]
                text-[#b8860b]
                mt-2
              "
            >
              OF INTERNSHIP
            </h2>
          </div>

          {/* Presented */}

          <div className="relative z-10 text-center mt-10">
            <p className="text-[18px] tracking-[5px] text-slate-600 font-medium">
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </p>

            <h3
              className="
                mt-8
                text-[68px]
                font-bold
                italic
                text-[#0f2b56]
                border-b-2
                border-[#d4af37]
                inline-block
                px-10
                pb-4
              "
            >
              {certificate.studentName}
            </h3>
          </div>

          {/* Description */}

          <div className="relative z-10 max-w-4xl mx-auto mt-10 text-center px-10">
            <p className="text-[24px] leading-[46px] text-slate-700">
              For successfully completing the{" "}
              <span className="font-bold text-[#0f2b56]">
                {certificate.role}
              </span>{" "}
              internship program at{" "}
              <span className="font-bold text-[#0f2b56]">
                Navyan
              </span>.
              During this internship, the individual has shown
              dedication, consistency, professionalism, and
              a strong willingness to learn and contribute.
              We sincerely appreciate their efforts and wish
              them success in their future career journey.
            </p>
          </div>

          {/* Signatures */}

          <div
            className="
              absolute
              bottom-24
              left-0
              w-full
              flex
              items-center
              justify-between
              px-24
            "
          >
            {/* Founder */}

            <div className="text-center">
              <div className="text-[52px] font-signature text-slate-800">
                Shivanand
              </div>

              <div className="w-[220px] h-[2px] bg-[#d4af37] mx-auto mt-2" />

              <h4 className="mt-3 text-[26px] font-bold text-[#0f2b56]">
                Shivanand Kumar
              </h4>

              <p className="text-[#b8860b] font-semibold tracking-[3px]">
                FOUNDER
              </p>
            </div>

            {/* Seal */}

            <div
              className="
                w-[180px]
                h-[180px]
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
                className="w-[90px]"
              />
            </div>

            {/* Co Founder */}

            <div className="text-center">
              <div className="text-[52px] font-signature text-slate-800">
                Anamika
              </div>

              <div className="w-[220px] h-[2px] bg-[#d4af37] mx-auto mt-2" />

              <h4 className="mt-3 text-[26px] font-bold text-[#0f2b56]">
                Anamika Pandey
              </h4>

              <p className="text-[#b8860b] font-semibold tracking-[3px]">
                CO-FOUNDER
              </p>
            </div>
          </div>

          {/* Footer */}

          <div
            className="
              absolute
              bottom-6
              left-0
              w-full
              flex
              items-center
              justify-between
              px-16
            "
          >
            <div className="text-slate-600 text-sm font-medium">
              Certificate ID:
              <span className="ml-2 text-[#0f2b56] font-bold">
                {certificate.certificateId}
              </span>
            </div>

            <div className="italic text-[#0f2b56] text-xl font-semibold">
              “Learn, Perform, Grow”
            </div>

            <div className="flex items-center gap-3">
              {certificate.qrCodeDataUrl ? (
                <img
                  src={certificate.qrCodeDataUrl}
                  alt="QR"
                  className="w-20 h-20"
                />
              ) : null}
            </div>
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