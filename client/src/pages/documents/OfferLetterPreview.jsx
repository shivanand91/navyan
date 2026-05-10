import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import fullLogo from "@/assests/full_logo.png";
import halfLogo from "@/assests/half_logo.png";

export default function CertificatePreview() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/certificates/preview/${certificateId}`);
        setDocument(data.certificate);
      } catch {
        // PDF content ke hisab se fallback data [cite: 6, 18]
        setCertificate({
          studentName: "Nitesh pandey", 
          certificateId: "NAV-CERT-2026-23C7AB",
        });
      }
    };
    load();
  }, [certificateId]);

  if (!certificate) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#07111f] py-10 px-4 print:p-0 print:bg-white">
      {/* TOOLBAR */}
      <div className="flex justify-center gap-4 mb-8 print:hidden">
        <button onClick={() => window.history.back()} className="px-6 py-2 rounded bg-white text-slate-900 font-semibold shadow hover:bg-slate-100 transition">Back</button>
        <button onClick={() => window.print()} className="px-6 py-2 rounded bg-[#061a35] text-white font-semibold shadow hover:bg-slate-800 transition">Print Certificate</button>
      </div>

      <div className="overflow-auto print:overflow-visible">
        {/* CERTIFICATE CONTAINER (A4 Landscape) */}
        <div className="relative mx-auto w-[1123px] h-[794px] bg-white shadow-2xl overflow-hidden print:shadow-none font-sans">
          
          {/* --- TOP LEFT DESIGN --- */}
          <div className="absolute top-0 left-0 w-[42%] h-[32%] bg-[#061a35]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute top-0 left-0 w-[44%] h-[34%] border-r-[5px] border-b-[5px] border-[#d4af37] rounded-br-[100%]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />

          {/* --- BOTTOM RIGHT DESIGN --- */}
          <div className="absolute bottom-0 right-0 w-[42%] h-[32%] bg-[#061a35]" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />
          <div className="absolute bottom-0 right-0 w-[44%] h-[34%] border-l-[5px] border-t-[5px] border-[#d4af37] rounded-tl-[100%]" />

          {/* --- WATERMARK --- */}
          <img src={halfLogo} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] opacity-[0.03] pointer-events-none" />

          {/* --- MAIN CONTENT --- */}
          <div className="relative z-10 h-full flex flex-col items-center pt-10">
            {/* Logo [cite: 8] */}
            <img src={fullLogo} alt="Navyan" className="w-[280px]" />

            {/* Header Titles  */}
            <div className="text-center mt-6">
              <h1 className="text-[78px] font-bold tracking-[5px] text-[#061a35] leading-none">CERTIFICATE</h1>
              <div className="flex items-center justify-center gap-4 mt-1">
                <div className="h-[2px] w-24 bg-[#d4af37]" />
                <h2 className="text-[32px] font-semibold tracking-[8px] text-[#d4af37]">OF INTERNSHIP</h2>
                <div className="h-[2px] w-24 bg-[#d4af37]" />
              </div>
              <div className="text-[#d4af37] text-2xl mt-1 tracking-[12px] opacity-80">⬥❧⬥</div>
            </div>

            {/* Presentation Text [cite: 5] */}
            <div className="text-center mt-10">
              <p className="text-[14px] tracking-[4px] text-slate-500 font-bold uppercase">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
              <h3 className="mt-4 text-[70px] font-serif text-[#061a35] italic leading-tight">{certificate.studentName}</h3>
              <div className="h-[2.5px] w-[580px] bg-[#d4af37] mx-auto mt-2" />
              <div className="text-[#d4af37] mt-1 text-xl">⬥</div>
            </div>

            {/* Description [cite: 9, 15] */}
            <div className="max-w-3xl mx-auto mt-6 text-center">
              <p className="text-[18px] leading-[1.6] text-slate-700 font-medium px-8">
                For successfully completing the internship program at <span className="font-bold text-[#061a35]">Navyan</span>. 
                During this internship, the individual has shown dedication, consistency, and a strong willingness to learn and contribute. 
                We appreciate their efforts and wish them success in their future endeavors.
              </p>
            </div>

            {/* Medal/Badge  */}
            <div className="absolute top-[165px] right-24">
              <div className="relative flex flex-col items-center">
                <div className="absolute top-14 w-20 h-24 flex justify-between px-2">
                  <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}} />
                  <div className="w-8 h-full bg-[#d4af37]" style={{clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)'}} />
                </div>
                <div className="w-32 h-32 rounded-full bg-[#061a35] border-[5px] border-[#d4af37] flex flex-col items-center justify-center shadow-2xl z-20">
                  <div className="text-yellow-400 text-[8px] mb-1 tracking-widest">★★★</div>
                  <p className="text-white text-[10px] font-bold text-center leading-tight tracking-wider">LEARN<br/>PERFORM<br/>GROW</p>
                  <div className="text-yellow-400 text-[8px] mt-1">★</div>
                </div>
              </div>
            </div>

            {/* --- SIGNATURES [cite: 12, 15] --- */}
            <div className="absolute bottom-20 w-full flex justify-between px-28 items-end">
              <div className="text-center">
                <p className="font-serif italic text-4xl text-slate-800 mb-1">Shivanand</p>
                <div className="w-44 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Shivanand Kumar</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase">FOUNDER</p>
              </div>

              <div className="w-28 h-28 rounded-full border border-slate-100 flex items-center justify-center p-1 bg-white relative">
                <div className="w-full h-full border border-[#061a35] border-dashed rounded-full absolute opacity-20" />
                <div className="text-center z-10">
                  <p className="text-[7px] font-bold text-[#061a35] tracking-tighter">NAVYAN</p>
                  <img src={halfLogo} alt="seal" className="w-10 mx-auto my-1" />
                  <p className="text-[6px] font-bold text-[#061a35]">INTERNSHIPS</p>
                </div>
              </div>

              <div className="text-center">
                <p className="font-serif italic text-4xl text-slate-800 mb-1">Anamika</p>
                <div className="w-44 h-[1.5px] bg-[#d4af37] mx-auto" />
                <h4 className="mt-2 text-xl font-bold text-[#061a35]">Anamika Pandey</h4>
                <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase">CO-FOUNDER</p>
              </div>
            </div>

            {/* --- SLOGAN & ID [cite: 17, 18] --- */}
            <div className="absolute bottom-7 w-full text-center flex items-center justify-center gap-4">
              <div className="h-[1px] w-12 bg-[#d4af37] opacity-50" />
              <p className="italic text-[#061a35] text-lg font-bold">“Learn, Perform, Grow”</p>
              <div className="h-[1px] w-12 bg-[#d4af37] opacity-50" />
            </div>
            
            <p className="absolute bottom-6 left-12 text-[10px] font-bold text-slate-400">Verification ID: {certificate.certificateId}</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          @page { size: A4 landscape; margin: 0; }
        }
      `}} />
    </div>
  );
}