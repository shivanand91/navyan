import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";

export default function CertificatePreview() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/certificates/preview/${certificateId}`);
        setCertificate(data.certificate);
      } catch (err) {
        setCertificate({
          studentName: "Your Name",
          role: "Web Development",
          certificateId: "NAV-CERT-2026-XXXX",
        });
      }
    };
    load();
  }, [certificateId]);

  if (!certificate) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#07111f] py-10 px-4 print:p-0 print:bg-white">
      <DocumentToolbar />

      <div className="overflow-auto print:overflow-visible">
        {/* CERTIFICATE CONTAINER (A4 Landscape) */}
        <div
          id="certificate-content"
          className="relative mx-auto w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden print:shadow-none"
        >
          {/* --- DESIGN CORNERS --- */}
          {/* Top Left Dark Polygon */}
          <div 
            className="absolute top-0 left-0 w-[45%] h-[35%] bg-[#061a35]" 
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
          />
          {/* Top Left Gold Curve/Line */}
          <div 
            className="absolute top-0 left-0 w-[48%] h-[38%] border-r-[6px] border-b-[6px] border-[#d4af37] rounded-br-[100%]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', background: 'transparent' }}
          />

          {/* Bottom Right Dark Polygon */}
          <div 
            className="absolute bottom-0 right-0 w-[45%] h-[35%] bg-[#061a35]" 
            style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
          />
          {/* Bottom Right Gold Curve */}
          <div 
            className="absolute bottom-0 right-0 w-[48%] h-[38%] border-l-[6px] border-t-[6px] border-[#d4af37] rounded-tl-[100%]"
          />

          {/* --- WATERMARK --- */}
          <img
            src={halfLogo}
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] opacity-[0.03] pointer-events-none"
          />

          {/* --- CONTENT --- */}
          <div className="relative z-10 h-full flex flex-col items-center pt-12">
            {/* Logo */}
            <img src={fullLogo} alt="Navyan" className="w-[300px]" />

            {/* Main Titles */}
            <div className="text-center mt-6">
              <h1 className="text-[72px] font-serif tracking-[4px] text-[#061a35] font-bold">
                CERTIFICATE
              </h1>
              <div className="flex items-center justify-center gap-4 -mt-2">
                <div className="h-[2px] w-24 bg-[#d4af37]" />
                <h2 className="text-[32px] font-sans tracking-[6px] text-[#d4af37] font-semibold">
                  OF INTERNSHIP
                </h2>
                <div className="h-[2px] w-24 bg-[#d4af37]" />
              </div>
              <div className="text-[#d4af37] text-2xl mt-1">⬥ &nbsp; ❧ &nbsp; ⬥</div>
            </div>

            {/* Proudly Presented To */}
            <div className="text-center mt-8">
              <p className="text-[16px] tracking-[3px] text-slate-500 font-bold uppercase">
                This Certificate is Proudly Presented To
              </p>
              <h3 className="mt-4 text-[75px] font-serif text-[#061a35] italic">
                {certificate.studentName}
              </h3>
              <div className="h-[2px] w-[600px] bg-[#d4af37] mx-auto mt-2" />
              <div className="text-[#d4af37] mt-1">⬥</div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mt-6 text-center">
              <p className="text-[19px] leading-relaxed text-slate-700 font-medium px-4">
                For successfully completing the internship program at <span className="font-bold">Navyan</span>.
                During this internship, the individual has shown dedication, consistency,
                and a strong willingness to learn and contribute.
                We appreciate their efforts and wish them success in their future endeavors.
              </p>
            </div>

            {/* Badge/Medal (Top Right Floating) */}
            <div className="absolute top-[160px] right-20">
               <div className="relative flex flex-col items-center">
                  {/* Medal Ribbons */}
                  <div className="absolute top-16 w-20 h-28 flex justify-between px-2">
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                  </div>
                  {/* Medal Circle */}
                  <div className="w-36 h-36 rounded-full bg-[#061a35] border-[6px] border-[#d4af37] flex flex-col items-center justify-center shadow-lg z-20">
                    <div className="text-yellow-400 text-[10px] flex gap-0.5 mb-1">★★★</div>
                    <p className="text-white text-[11px] font-bold leading-tight text-center">
                      LEARN<br/>PERFORM<br/>GROW
                    </p>
                    <div className="text-yellow-400 text-[10px] mt-1">★</div>
                  </div>
               </div>
            </div>

            {/* --- FOOTER SIGNATURES --- */}
            <div className="absolute bottom-20 w-full flex justify-between px-28 items-end">
              {/* Founder */}
              <div className="text-center">
                <p className="font-serif italic text-4xl text-slate-800 mb-2">Shivanand</p>
                <div className="w-48 h-[1.5px] bg-slate-400 mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Shivanand Kumar</h4>
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Founder</p>
              </div>

              {/* Seal */}
              <div className="w-32 h-32 rounded-full border-[2px] border-slate-300 flex items-center justify-center p-1 bg-white relative">
                <div className="w-full h-full border-[1px] border-[#061a35] rounded-full border-dashed absolute animate-[spin_20s_linear_infinite]" />
                <div className="text-center z-10">
                   <p className="text-[7px] font-bold text-[#061a35]">NAVYAN</p>
                   <img src={halfLogo} alt="seal" className="w-10 mx-auto my-1" />
                   <p className="text-[6px] font-bold text-[#061a35]">INTERNSHIPS</p>
                </div>
              </div>

              {/* Co-Founder */}
              <div className="text-center">
                <p className="font-serif italic text-4xl text-slate-800 mb-2">Anamika</p>
                <div className="w-48 h-[1.5px] bg-slate-400 mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Anamika Pandey</h4>
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Co-Founder</p>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="absolute bottom-6 w-full text-center flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-[#d4af37]" />
              <p className="italic text-[#061a35] text-lg font-semibold">
                “Learn, Perform, Grow”
              </p>
              <div className="h-[1px] w-12 bg-[#d4af37]" />
            </div>
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
        onClick={() => window.history.back()}
        className="px-6 py-2 rounded bg-white text-slate-900 font-semibold shadow hover:bg-slate-100 transition"
      >
        Back
      </button>
      <button
        onClick={() => window.print()}
        className="px-6 py-2 rounded bg-[#061a35] text-white font-semibold shadow hover:bg-slate-800 transition"
      >
        Print / Save PDF
      </button>
    </div>
  );
}