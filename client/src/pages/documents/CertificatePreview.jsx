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
    <div className="min-h-screen bg-[#07111f] py-4 md:py-10 px-2 print:p-0 print:bg-white">
      <DocumentToolbar />

      <div className="flex justify-center items-center overflow-x-auto print:block">
        {/* CERTIFICATE CONTAINER */}
        <div
          id="certificate-content"
          className="relative mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:block"
          style={{ 
            width: "297mm", 
            height: "210mm", 
            minWidth: "297mm", // Prevents shrinking on mobile view
            position: "relative"
          }}
        >
          {/* --- CURVED MAIN BORDER --- */}
          <div className="absolute inset-4 md:inset-6 border-[6px] md:border-[8px] border-[#d4af37] rounded-[20px] md:rounded-[30px] z-20 pointer-events-none" />

          {/* --- WATERMARK --- */}
          <img src={halfLogo} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] opacity-[0.04] pointer-events-none z-0" />

          {/* --- CONTENT WRAPPER --- */}
          <div className="relative z-10 h-full flex flex-col justify-between py-12 px-20">
            
            {/* Header */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <img src={halfLogo} alt="Logo" className="w-12 h-12" />
                <div className="flex flex-col">
                  <h1 className="text-4xl font-black text-[#061a35] tracking-tighter leading-none">Navyan</h1>
                  <p className="text-[10px] font-bold text-[#061a35] tracking-[2px] uppercase opacity-80">Internships and IT Services</p>
                </div>
              </div>

              <div className="text-center mt-6">
                <h1 className="text-[60px] font-bold tracking-[4px] text-[#061a35] leading-tight">CERTIFICATE</h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1.5px] w-16 bg-[#d4af37]" />
                  <h2 className="text-[28px] font-semibold tracking-[6px] text-[#d4af37]">OF INTERNSHIP</h2>
                  <div className="h-[1.5px] w-16 bg-[#d4af37]" />
                </div>
              </div>
            </div>

            {/* Recipient Section */}
            <div className="text-center">
              <p className="text-[13px] tracking-[3px] text-slate-500 font-bold uppercase">This Certificate is Proudly Presented To</p>
              <h3 className="mt-2 text-[48px] font-serif text-[#061a35] italic leading-tight">{certificate.studentName}</h3>
              <div className="h-[2px] w-1/2 bg-[#d4af37] mx-auto mt-1" />
            </div>

            {/* Body Text */}
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[18px] leading-relaxed text-slate-700">
                For successfully completing the <span className="font-bold text-[#061a35]">{certificate.role}</span> internship program at <span className="font-bold text-[#061a35]">Navyan</span>. 
                The internship was conducted from <span className="font-bold text-[#061a35]">{certificate.startDate}</span> to <span className="font-bold text-[#061a35]">{certificate.endDate}</span>.
                During this period, the individual has shown dedication, consistency, and a strong willingness to learn and contribute. 
              </p>
            </div>

            {/* Footer Section: Signatures & Seal */}
            <div className="flex justify-between items-end px-10 relative">
              <div className="text-center w-48">
                <p className="font-serif italic text-lg text-slate-800">Shivanand</p>
                <div className="h-[1px] bg-[#d4af37] w-full my-1" />
                <h4 className="text-md font-bold text-[#061a35]">Shivanand Kumar</h4>
                <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Founder</p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center mb-[-10px]">
                 <div className="w-24 h-24 rounded-full border border-dashed border-[#061a35]/30 flex items-center justify-center p-2 bg-white shadow-sm">
                    <div className="text-center">
                      <p className="text-[6px] font-black text-[#061a35]">NAVYAN</p>
                      <img src={halfLogo} alt="seal" className="w-8 mx-auto my-1" />
                      <p className="text-[5px] font-bold text-slate-500 uppercase">Verified</p>
                    </div>
                 </div>
                 <p className="mt-4 italic text-[#061a35] text-sm font-bold">“Learn, Perform, Grow”</p>
              </div>

              <div className="text-center w-48">
                <p className="font-serif italic text-lg text-slate-800">Anamika</p>
                <div className="h-[1px] bg-[#d4af37] w-full my-1" />
                <h4 className="text-md font-bold text-[#061a35]">Anamika Pandey</h4>
                <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Co-Founder</p>
              </div>
            </div>

            {/* Verification ID */}
            <p className="absolute bottom-8 left-12 text-[9px] font-mono text-slate-400">
              ID: {certificate.certificateId}
            </p>

            {/* Badge - Positioned relative to the main container */}
            <div className="absolute top-40 right-20">
               <div className="relative flex flex-col items-center scale-90">
                  <div className="absolute top-10 w-16 h-24 flex justify-between px-1">
                    <div className="w-6 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                    <div className="w-6 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}}></div>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-[#061a35] border-[4px] border-[#d4af37] flex flex-col items-center justify-center shadow-xl z-20">
                    <p className="text-white text-[8px] font-bold leading-tight text-center tracking-tighter">OFFICIAL<br/>CERTIFIED</p>
                  </div>
               </div>
            </div>
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
            -webkit-print-color-adjust: exact !important; 
          }
          .print\\:hidden { display: none !important; }
          #certificate-content {
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex justify-center gap-4 mb-6 print:hidden">
      <button onClick={() => window.history.back()} className="px-5 py-2 rounded bg-white text-slate-900 text-sm font-bold shadow hover:bg-slate-100">Back</button>
      <button onClick={() => window.print()} className="px-5 py-2 rounded bg-yellow-500 text-[#061a35] text-sm font-bold shadow hover:bg-yellow-400">Download / Print PDF</button>
    </div>
  );
}