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
        const { data } = await api.get(`/applications/offer-letter/${accessToken}/preview`);
        setDocument(data.document);
      } catch {
        // Fallback data for preview
        setDocument({
          studentName: "Candidate Name",
          internshipTitle: "Development",
          role: "Web Development Intern",
          durationLabel: "4 Weeks / 3 Months / 6 Months",
          mode: "Remote / Hybrid / On-site",
          startDateStr: "[Start Date]",
          endDateStr: "[End Date]",
          issueDateStr: "20 May 2024",
          offerId: "NAV/2024/OL/XXXX",
        });
      }
    };
    load();
  }, [accessToken]);

  if (!document) return <div className="flex justify-center mt-20">Loading...</div>;

  return (
    <div className="bg-slate-200 min-h-screen py-10 print:p-0 print:bg-white">
      {/* ACTIONS - Hidden during print */}
      <div className="flex justify-center gap-4 mb-6 print:hidden">
        <button 
          onClick={() => window.history.back()} 
          className="bg-white border border-slate-300 px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-50"
        >
          Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-[#0b2347] text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-[#153461]"
        >
          Print / Save PDF
        </button>
      </div>

      {/* A4 PAGE CONTAINER */}
      <div 
        className="mx-auto bg-white shadow-2xl print:shadow-none relative overflow-hidden" 
        style={{ width: "210mm", height: "297mm", padding: "0" }}
      >
        {/* CORNER DESIGN ELEMENTS (Reference Image Style) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0b2347]" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}></div>
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#d4a017]" style={{ clipPath: "polygon(100% 0, 20% 0, 100% 80%)" }}></div>
        
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0b2347]" style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#d4a017]" style={{ clipPath: "polygon(0 20%, 0 100%, 80% 100%)" }}></div>

        {/* HEADER SECTION */}
        <div className="px-16 pt-14 flex justify-between relative z-10">
          <div className="flex items-center gap-4">
            <img src={halfLogo} alt="logo" className="w-20" />
            <div>
              <h1 className="text-5xl font-black text-[#0b2347] tracking-tight">Navyan</h1>
              <div className="h-[2px] bg-[#d4a017] w-full mt-1"></div>
              <p className="text-[14px] font-bold text-[#0b2347] mt-1">Internships and IT Services</p>
            </div>
          </div>
          <div className="text-right text-[12px] text-[#0b2347] font-semibold leading-relaxed">
            <p className="text-sm font-black mb-1">NAVYAN</p>
            <p>Internships and IT Services</p>
            <div className="mt-2 flex flex-col items-end gap-1 font-medium">
              <span className="flex items-center gap-2">🌐 www.navyan.online</span>
              <span className="flex items-center gap-2">✉️ contact@navyan.online</span>
              <span className="flex items-center gap-2">📍 India</span>
            </div>
          </div>
        </div>

        {/* REF & DATE */}
        <div className="px-16 mt-12 flex justify-between text-[14px] font-bold text-slate-700 relative z-10">
          <p>Ref. No.: {document.offerId}</p>
          <p>Date: {document.issueDateStr}</p>
        </div>
        <div className="mx-16 mt-1 border-b border-[#d4a017]"></div>

        {/* TITLE */}
        <div className="text-center mt-8 relative z-10">
          <h2 className="text-4xl font-black text-[#0b2347] tracking-[4px]">OFFER LETTER</h2>
          <div className="flex justify-center items-center gap-3 mt-2">
             <div className="h-[2px] w-10 bg-[#d4a017]"></div>
             <span className="text-[#d4a017] text-xl">⬥</span>
             <div className="h-[2px] w-10 bg-[#d4a017]"></div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="px-16 mt-8 text-[14px] leading-relaxed text-slate-900 relative z-10">
          <p className="text-[15px]"><span className="font-bold">Dear {document.studentName},</span></p>
          
          <p className="mt-4 font-bold text-[#0b2347] text-[16px]">Congratulations!</p>
          
          <p className="mt-3">
            We are pleased to offer you the position of <span className="font-bold text-[#0b2347]">{document.role}</span> at <span className="font-bold text-[#0b2347]">Navyan (Internships and IT Services)</span>. 
            We were impressed with your skills, passion, and enthusiasm, and we believe you will be a great addition to our team.
          </p>

          {/* INTERNSHIP DETAILS */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-[#d4a017] rounded shadow-sm text-white text-[12px]">💼</span>
              <h3 className="text-[#d4a017] font-black uppercase tracking-wider">Internship Details</h3>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-y-1.5 ml-4">
              <span className="font-bold text-slate-800">Position</span> <span className="text-slate-700">: {document.role}</span>
              <span className="font-bold text-slate-800">Department</span> <span className="text-slate-700">: {document.internshipTitle}</span>
              <span className="font-bold text-slate-800">Internship Duration</span> <span className="text-slate-700">: {document.durationLabel}</span>
              <span className="font-bold text-slate-800">Start Date</span> <span className="text-slate-700">: {document.startDateStr}</span>
              <span className="font-bold text-slate-800">End Date</span> <span className="text-slate-700">: {document.endDateStr}</span>
              <span className="font-bold text-slate-800">Work Mode</span> <span className="text-slate-700">: {document.mode}</span>
            </div>
          </div>

          {/* ROLE & RESPONSIBILITIES */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-[#d4a017] rounded shadow-sm text-white text-[12px]">👤</span>
              <h3 className="text-[#d4a017] font-black uppercase tracking-wider">Role & Responsibilities</h3>
            </div>
            <ul className="list-disc pl-10 space-y-1 text-slate-700">
              <li>Work on assigned tasks and projects as per the guidance of the project coordinator.</li>
              <li>Collaborate with the team to deliver high-quality results.</li>
              <li>Learn, implement, and contribute innovative ideas.</li>
              <li>Maintain professionalism, discipline, and commitment throughout the internship.</li>
            </ul>
          </div>

          {/* TERMS & CONDITIONS */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-[#d4a017] rounded shadow-sm text-white text-[12px]">📄</span>
              <h3 className="text-[#d4a017] font-black uppercase tracking-wider">Terms & Conditions</h3>
            </div>
            <ol className="list-decimal pl-10 space-y-1 text-slate-700">
              <li>This internship is purely for educational and skill development purposes.</li>
              <li>You are expected to maintain confidentiality of all company information.</li>
              <li>Any misconduct or failure to meet expectations may result in termination of the internship.</li>
              <li>Upon successful completion, you will be awarded a Certificate of Internship.</li>
            </ol>
          </div>

          <p className="mt-8">We are excited to have you on board and look forward to a productive and rewarding journey together.</p>
          <p className="mt-2 font-bold text-lg">Welcome to the <span className="text-[#0b2347]">Navyan</span> family!</p>
        </div>

        {/* SIGNATURES SECTION */}
        <div className="px-16 mt-12 flex justify-between items-end relative z-10">
          <div className="text-center">
            <p className="font-serif italic text-3xl text-slate-800 mb-1">Shivanand</p>
            <div className="w-44 h-[2px] bg-[#d4a017] mx-auto mb-2"></div>
            <h4 className="font-bold text-[#0b2347] text-lg">Shivanand Kumar</h4>
            <p className="text-xs font-bold text-slate-500 uppercase">Founder</p>
            <p className="text-xs text-slate-400">Navyan</p>
          </div>

          {/* CENTRAL SEAL */}
          <div className="w-28 h-28 rounded-full border-[3px] border-[#0b2347] flex items-center justify-center relative bg-white shadow-sm">
            <div className="absolute inset-1 border border-dashed border-[#0b2347] rounded-full opacity-30"></div>
            <div className="text-center z-10">
               <p className="text-[10px] font-black text-[#0b2347] tracking-tighter">NAVYAN</p>
               <img src={halfLogo} className="w-8 mx-auto my-1 contrast-125" alt="seal-logo"/>
               <p className="text-[8px] font-bold text-[#0b2347]">INTERNSHIPS</p>
            </div>
          </div>

          <div className="text-center">
            <p className="font-serif italic text-3xl text-slate-800 mb-1">Anamika</p>
            <div className="w-44 h-[2px] bg-[#d4a017] mx-auto mb-2"></div>
            <h4 className="font-bold text-[#0b2347] text-lg">Anamika Pandey</h4>
            <p className="text-xs font-bold text-slate-500 uppercase">Co-Founder</p>
            <p className="text-xs text-slate-400">Navyan</p>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="absolute bottom-0 w-full bg-[#0b2347] text-white py-4 flex justify-around items-center text-[11px] px-16 font-bold">
          <span className="flex items-center gap-2">🌐 WWW.NAVYAN.ONLINE</span>
          <span className="flex items-center gap-2">✉️ CONTACT@NAVYAN.ONLINE</span>
          <span className="flex items-center gap-2">📍 INDIA</span>
        </div>
      </div>

      {/* Global CSS for Print Formatting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
}