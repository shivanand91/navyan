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
          studentName: "Anamika pandey",
          role: "Intern",
          startDate: "01 April 2026",
          endDate: "01 May 2026",
          certificateId: "NAV-CERT-2026-F4CD39",
        });
      }
    };
    load();
  }, [certificateId]);

  if (!certificate) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#07111f] py-10 px-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* TOOLBAR */}
      <div className="flex gap-4 mb-8 print:hidden">
        <button onClick={() => window.history.back()} className="px-6 py-2 rounded bg-white text-slate-900 font-bold shadow hover:bg-slate-100 transition">Back</button>
        <button onClick={() => window.print()} className="px-6 py-2 rounded bg-[#061a35] text-white font-bold shadow hover:bg-slate-800 transition">Print / Download PDF</button>
      </div>

      {/* CERTIFICATE CONTAINER */}
      <div className="overflow-auto w-full flex justify-center print:block">
        <div
          id="certificate-content"
          className="relative bg-white shadow-2xl overflow-hidden print:shadow-none"
          style={{ 
            width: "297mm", 
            height: "210mm", 
            minWidth: "297mm", 
            position: "relative",
            backgroundColor: "white"
          }}
        >
          {/* --- BORDER DESIGN --- */}
          <div className="absolute inset-[30px] border-[8px] border-[#d4af37] rounded-[40px] z-20 pointer-events-none" />

          {/* --- WATERMARK --- */}
          <img src={halfLogo} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] opacity-[0.03] pointer-events-none z-0" />

          {/* --- MAIN CONTENT --- */}
          <div className="relative z-10 h-full w-full flex flex-col items-center pt-14 px-24">
            
            {/* Header Branding */}
            <div className="flex items-center gap-4">
              <img src={halfLogo} alt="Logo" className="w-14 h-14" />
              <div className="flex flex-col">
                <h1 className="text-5xl font-black text-[#061a35] tracking-tighter leading-none">Navyan</h1>
                <p className="text-[10px] font-bold text-[#061a35] tracking-[2px] uppercase opacity-80 mt-1">Internships and IT Services</p>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center mt-12">
              <h1 className="text-[90px] font-bold tracking-[8px] text-[#061a35] leading-none">CERTIFICATE</h1>
              <div className="flex items-center justify-center gap-6 mt-1">
                <div className="h-[2px] w-32 bg-[#d4af37]" />
                <h2 className="text-[32px] font-semibold tracking-[8px] text-[#d4af37] uppercase">Of Internship</h2>
                <div className="h-[2px] w-32 bg-[#d4af37]" />
              </div>
              {/* Decorative Diamonds */}
              <div className="text-[#d4af37] text-2xl mt-1 tracking-[10px]">⬥ ☙ ⬥</div>
            </div>

            {/* Recipient Name */}
            <div className="text-center mt-2 w-full">
              <p className="text-[14px] tracking-[4px] text-slate-500 font-bold uppercase mb-2">This Certificate is Proudly Presented To</p>
              <h3 className="text-[42px] font-serif text-[#061a35] italic leading-none">{certificate.studentName}</h3>
              <div className="h-[2.5px] w-[700px] bg-[#d4af37] mx-auto mt-2" />
            </div>

            {/* Description */}
            <div className="max-w-[900px] mx-auto mt-2 text-center">
              <p className="text-[20px] leading-[1.6] text-slate-700 font-medium px-4">
                For successfully completing the <span className="font-bold text-[#061a35]">{certificate.role}</span> internship program at <span className="font-bold text-[#061a35]">Navyan</span>. 
                The internship was conducted from <span className="font-bold text-[#061a35]">{certificate.startDate}</span> to <span className="font-bold text-[#061a35]">{certificate.endDate}</span>.
                During this period, the individual has shown dedication, consistency, and a strong willingness to learn and contribute. 
              </p>
            </div>

            {/* Badge (Floating Right) */}
            <div className="absolute top-[220px] right-[100px] z-30">
               <div className="relative flex flex-col items-center">
                  {/* Ribbons */}
                  <div className="absolute top-14 w-20 h-32 flex justify-between px-2">
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                    <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                  </div>
                  {/* Circle Badge */}
                  <div className="w-32 h-32 rounded-full bg-[#061a35] border-[5px] border-[#d4af37] flex flex-col items-center justify-center shadow-2xl z-20">
                    <div className="text-yellow-400 text-[10px] mb-1">★★★</div>
                    <p className="text-white text-[11px] font-bold leading-tight text-center tracking-[2px]">LEARN<br/>PERFORM<br/>GROW</p>
                    <div className="text-yellow-400 text-[10px] mt-1">★</div>
                  </div>
               </div>
            </div>

            {/* FOOTER: SIGNATURES & SEAL */}
            <div className="absolute bottom-[80px] w-full flex justify-between items-end px-36">
              {/* Left Sign */}
              <div className="text-center">
                <p className="font-serif italic text-2xl text-slate-800 mb-2">Shivanand</p>
                <div className="w-48 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-lg font-bold text-[#061a35] uppercase tracking-wide">Shivanand Kumar</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase opacity-70">Founder</p>
              </div>

              {/* Central Seal */}
              <div className="flex flex-col items-center mt-2 mb-[-20px]">
                <div className="w-28 h-28 rounded-full border border-slate-200 p-1 bg-white relative flex items-center justify-center shadow-sm">
                  <div className="absolute inset-0 border border-dashed border-[#061a35] opacity-20 rounded-full" />
                  <div className="text-center z-10">
                    <p className="text-[7px] font-black text-[#061a35] tracking-widest">NAVYAN</p>
                    <img src={halfLogo} alt="seal" className="w-9 mx-auto my-1" />
                    <p className="text-[6px] font-bold text-slate-500">INTERNSHIPS</p>
                  </div>
                </div>
                {/* Motto */}
                <div className="flex items-center gap-3 mt-2">
                   <div className="h-[1px] w-12 bg-[#d4af37]" />
                   <p className="italic text-[#061a35] text-lg font-bold">“Learn, Perform, Grow”</p>
                   <div className="h-[1px] w-12 bg-[#d4af37]" />
                </div>
              </div>

              {/* Right Sign */}
              <div className="text-center">
                <p className="font-serif italic text-2xl text-slate-800 mb-2">Anamika</p>
                <div className="w-48 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-lg font-bold text-[#061a35] uppercase tracking-wide">Anamika Pandey</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase opacity-70">Co-Founder</p>
              </div>
            </div>

            {/* Verification ID (Bottom Left) */}
            <p className="absolute bottom-[40px] left-[60px] text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
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
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          #certificate-content {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            border: none !important;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}