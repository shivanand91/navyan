import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import halfLogo from "@/assests/half_logo.png";

export default function CertificatePreview() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/certificates/preview/${certificateId}`);
        setCertificate(data.certificate);
      } catch (err) {
        setCertificate({
          studentName: "Nitesh Pandey",
          role: "Web Development",
          startDate: "01 April 2026",
          endDate: "01 May 2026",
          certificateId: "NAV-CERT-2026-23C7AB",
        });
      }
    };
    load();
  }, [certificateId]);

  if (!certificate) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#07111f] py-10 px-4 print:p-0 print:bg-white">
      <DocumentToolbar />

      <div className="flex justify-center items-center overflow-auto print:block print:overflow-visible">
        {/* CERTIFICATE CONTAINER */}
        <div
          id="certificate-content"
          className="relative mx-auto w-full max-w-[1123px] bg-white shadow-2xl overflow-hidden print:shadow-none print:block print:overflow-visible"
          style={{ width: "297mm", minHeight: "210mm", padding: 0 }}
        >
          {/* --- CURVED MAIN BORDER --- */}
          <div className="absolute inset-6 border-[8px] border-[#d4af37] rounded-[30px] z-20 pointer-events-none shadow-inner" />
          <div className="absolute inset-8 border-[2px] border-[#061a35] rounded-[24px] z-20 pointer-events-none opacity-20" />

          {/* --- WATERMARK --- */}
          <img src={halfLogo} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] opacity-[0.03] pointer-events-none" />

          {/* --- CONTENT --- */}
          <div className="relative z-10 h-full flex flex-col items-center pt-16">
            
            {/* BRANDING HEADER (Half Logo + Text) */}
            <div className="flex items-center gap-4">
              <img src={halfLogo} alt="Logo" className="w-16 h-16" />
              <div className="flex flex-col">
                <h1 className="text-5xl font-black text-[#061a35] tracking-tighter leading-none">Navyan</h1>
                <p className="text-sm mt-1 font-bold text-[#061a35] tracking-[2px] uppercase opacity-80">Internships and IT Services</p>
              </div>
            </div>

            {/* Main Titles */}
            <div className="text-center mt-8">
              <h1 className="text-[78px] font-bold tracking-[6px] text-[#061a35] leading-none">CERTIFICATE</h1>
              <div className="flex items-center justify-center gap-4 mt-1">
                <div className="h-[2px] w-24 bg-[#d4af37]" />
                <h2 className="text-[34px] font-semibold tracking-[8px] text-[#d4af37]">OF INTERNSHIP</h2>
                <div className="h-[2px] w-24 bg-[#d4af37]" />
              </div>
              <div className="text-[#d4af37] text-2xl mt-1 tracking-[12px] leading-none">⬥❧⬥</div>
            </div>

            {/* Proudly Presented To */}
            <div className="text-center mt-2">
              <p className="text-[15px] tracking-[4px] text-slate-500 font-bold uppercase">This Certificate is Proudly Presented To</p>
              <h3 className="mt-2 text-[42px] font-serif text-[#061a35] italic leading-tight">{certificate.studentName}</h3>
              <div className="h-[2.5px] w-[580px] bg-[#d4af37] mx-auto mt-1" />
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto mt-2 text-center px-10">
              <p className="text-[20px] leading-relaxed text-slate-700 font-medium">
                For successfully completing the <span className="font-bold text-[#061a35]">{certificate.role}</span> internship program at <span className="font-bold text-[#061a35]">Navyan</span>. 
                The internship was conducted from <span className="font-bold text-[#061a35]">{certificate.startDate}</span> to <span className="font-bold text-[#061a35]">{certificate.endDate}</span>.
                During this period, the individual has shown dedication, consistency, and a strong willingness to learn and contribute. 
              </p>
            </div>

            {/* Badge/Medal (Top Right Floating) */}
            <div className="absolute top-[180px] right-[110px] scale-110 z-30">
               <div className="relative flex flex-col items-center">
                  <div className="absolute top-14 w-20 h-28 flex justify-between px-2">
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                  </div>
                  <div className="w-32 h-32 rounded-full bg-[#061a35] border-[5px] border-[#d4af37] flex flex-col items-center justify-center shadow-2xl z-20">
                    <div className="text-yellow-400 text-[8px] flex gap-0.5 mb-1">★★★</div>
                    <p className="text-white text-[10px] font-bold leading-tight text-center tracking-widest">LEARN<br/>PERFORM<br/>GROW</p>
                    <div className="text-yellow-400 text-[8px] mt-1">★</div>
                  </div>
               </div>
            </div>

            {/* --- SIGNATURES --- */}
            <div className="absolute bottom-20 w-full flex justify-between px-32 items-end">
              <div className="text-center">
                <p className="font-serif italic text-xl text-slate-800 mb-1">Shivanand</p>
                <div className="w-44 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Shivanand Kumar</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase leading-none">Founder</p>
              </div>

              <div className="w-28 h-28 rounded-full mt-1 border border-slate-100 flex items-center justify-center p-1 bg-white relative">
                <div className="w-full h-full border border-[#061a35] border-dashed rounded-full absolute opacity-20" />
                <div className="text-center z-10">
                   <p className="text-[7px] font-bold text-[#061a35]">NAVYAN</p>
                   <img src={halfLogo} alt="seal" className="w-10 mx-auto my-1" />
                   <p className="text-[6px] font-bold text-[#061a35]">INTERNSHIPS</p>
                </div>
              </div>

              <div className="text-center">
                <p className="font-serif italic text-xl text-slate-800 mb-1">Anamika</p>
                <div className="w-44 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Anamika Pandey</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase leading-none">Co-Founder</p>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="absolute bottom-10 w-full text-center flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-[#d4af37]" />
              <p className="italic text-[#061a35] text-lg font-bold">“Learn, Perform, Grow”</p>
              <div className="h-[1px] w-12 bg-[#d4af37]" />
            </div>
            
            <p className="absolute bottom-10 left-16 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Verification ID: {certificate.certificateId}
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: A4 landscape; 
            margin: 0; 
          }
          body { 
            margin: 0;
            padding: 0;
            background: white !important; 
            -webkit-print-color-adjust: exact; 
            color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          #certificate-content {
            width: 297mm !important;
            min-height: 210mm !important;
            max-width: 100% !important;
            height: auto !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex justify-center gap-4 mb-8 print:hidden">
      <button onClick={() => window.history.back()} className="px-6 py-2 rounded bg-white text-slate-900 font-semibold shadow hover:bg-slate-100 transition">Back</button>
      <button onClick={() => window.print()} className="px-6 py-2 rounded bg-[#061a35] text-white font-semibold shadow hover:bg-slate-800 transition">Print Certificate</button>
    </div>
  );
}