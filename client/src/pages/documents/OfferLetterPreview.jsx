import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import halfLogo from "@/assests/half_logo.png"; // Make sure this is your 'N' icon

export default function OfferLetterPreview() {
  const { accessToken } = useParams();
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/applications/offer-letter/${accessToken}/preview`);
        setDocument(data.document);
      } catch {
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
      {/* ACTIONS */}
      <div className="flex justify-center gap-4 mb-6 print:hidden">
        <button onClick={() => window.history.back()} className="bg-white border px-6 py-2 rounded shadow-sm">Back</button>
        <button onClick={() => window.print()} className="bg-[#0b2347] text-white px-6 py-2 rounded shadow-sm">Print Offer Letter</button>
      </div>

      {/* A4 PAGE */}
      <div className="mx-auto bg-white shadow-2xl print:shadow-none relative overflow-hidden" 
           style={{ width: "210mm", height: "297mm", padding: "0" }}>
        
        {/* DESIGN ELEMENTS (Top Right & Bottom Left Triangles) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0b2347] print:bg-[#0b2347]" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017] print:bg-[#d4a017]" style={{ clipPath: "polygon(100% 0, 20% 0, 100% 80%)" }}></div>
        
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0b2347] print:bg-[#0b2347]" style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4a017] print:bg-[#d4a017]" style={{ clipPath: "polygon(0 20%, 0 100%, 80% 100%)" }}></div>

        {/* HEADER SECTION */}
        <div className="px-16 pt-12 flex justify-between relative z-10">
          <div className="flex items-center gap-3">
            <img src={halfLogo} alt="logo" className="w-20" />
            <div>
              <h1 className="text-5xl font-bold text-[#0b2347] tracking-tight">Navyan</h1>
              <div className="h-0.5 bg-[#d4a017] w-full my-1"></div>
              <p className="text-xs font-semibold text-[#0b2347]">Internships and IT Services</p>
            </div>
          </div>
          <div className="text-right text-[12px] text-[#0b2347] font-medium leading-tight">
            <p className="font-bold text-sm">NAVYAN</p>
            <p>Internships and IT Services</p>
            <div className="mt-2 flex flex-col items-end gap-1">
              <span className="flex items-center gap-1">🌐 www.navyan.online</span>
              <span className="flex items-center gap-1">✉️ contact@navyan.online</span>
              <span className="flex items-center gap-1">📍 India</span>
            </div>
          </div>
        </div>

        {/* REF & DATE */}
        <div className="px-16 mt-10 flex justify-between text-sm font-semibold text-slate-700 relative z-10">
          <p>Ref. No.: {document.offerId}</p>
          <p>Date: {document.issueDateStr}</p>
        </div>
        <div className="mx-16 mt-1 border-b border-[#d4a017]"></div>

        {/* TITLE */}
        <div className="text-center mt-1">
          <h2 className="text-3xl font-bold text-[#0b2347] tracking-widest">OFFER LETTER</h2>
          <div className="flex justify-center items-center gap-2 mt-1">
             <div className="h-[1px] w-8 bg-[#d4a017]"></div>
             <span className="text-[#d4a017]">⬥</span>
             <div className="h-[1px] w-8 bg-[#d4a017]"></div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="px-16 mt-1 text-[13.5px] leading-relaxed text-slate-900">
          <p className="font-bold">Dear {document.studentName}, <span className="font-bold text-[#0b2347]">Congratulations!</span> </p>
          
          <p className="mt-1">
            We are pleased to offer you the position of <span className="font-bold text-[#0b2347]">{document.role}</span> at <span className="font-bold text-[#0b2347]">Navyan (Internships and IT Services)</span>. 
            We were impressed with your skills, passion, and enthusiasm, and we believe you will be a great addition to our team.
          </p>

          {/* INTERNSHIP DETAILS SECTION */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-[#d4a017] rounded text-white text-[10px]">💼</span>
              <h3 className="text-[#d4a017] font-bold uppercase tracking-wide">Internship Details</h3>
            </div>
            <div className="grid grid-cols-[160px_1fr] gap-y-1 ml-2">
              <span className="font-bold">Position</span> : {document.role}
              <span className="font-bold">Department</span> : {document.internshipTitle}
              <span className="font-bold">Internship Duration</span> : {document.durationLabel}
              <span className="font-bold">Start Date</span> : {document.startDateStr}
              <span className="font-bold">End Date</span> : {document.endDateStr}
              <span className="font-bold">Work Mode</span> : {document.mode}
            </div>
          </div>

          {/* ROLE & RESPONSIBILITIES */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-[#d4a017] rounded text-white text-[10px]">👤</span>
              <h3 className="text-[#d4a017] font-bold uppercase tracking-wide">Role & Responsibilities</h3>
            </div>
            <ul className="list-disc pl-7 space-y-1">
              <li>Work on assigned tasks and projects as per the guidance of the project coordinator.</li>
              <li>Collaborate with the team to deliver high-quality results.</li>
              <li>Learn, implement, and contribute innovative ideas.</li>
              <li>Maintain professionalism, discipline, and commitment throughout the internship.</li>
            </ul>
          </div>

          {/* TERMS & CONDITIONS */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-[#d4a017] rounded text-white text-[10px]">📄</span>
              <h3 className="text-[#d4a017] font-bold uppercase tracking-wide">Terms & Conditions</h3>
            </div>
            <ol className="list-decimal pl-7 space-y-1">
              <li>This internship is purely for educational and skill development purposes.</li>
              <li>You are expected to maintain confidentiality of all company information.</li>
              <li>Any misconduct or failure to meet expectations may result in termination of the internship.</li>
              <li>Upon successful completion, you will be awarded a Certificate of Internship.</li>
            </ol>
          </div>

          <p className="mt-2">We are excited to have you on board and look forward to a productive and rewarding journey together.</p>
          <p className="mt-2 font-bold">Welcome to the <span className="text-[#0b2347]">Navyan</span> family!</p>
        </div>

        {/* SIGNATURES SECTION */}
        <div className="px-16 mt-10 flex justify-between items-center relative z-10">
          <div className="text-center">
            <p className="font-serif italic text-2xl text-slate-700">Shivanand</p>
            <div className="w-32 h-[1px] bg-slate-400 mx-auto my-1"></div>
            <p className="font-bold text-[#0b2347]">Shivanand Kumar</p>
            <p className="text-xs text-slate-500">Founder</p>
            <p className="text-xs text-slate-500">Navyan</p>
          </div>

          {/* SEAL */}
          <div className="relative flex items-center justify-center">
             <div className="w-24 h-24 rounded-full border-2 border-[#0b2347] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border-[6px] border-[#0b2347] opacity-10 rounded-full"></div>
                <div className="text-[10px] font-bold text-[#0b2347] text-center leading-none">
                   <p className="tracking-tighter">NAVYAN</p>
                   <img src={halfLogo} className="w-6 mx-auto my-1" alt="seal-logo"/>
                   <p className="text-[8px]">INTERNSHIPS</p>
                </div>
             </div>
          </div>

          <div className="text-center">
            <p className="font-serif italic text-2xl text-slate-700">Anamika</p>
            <div className="w-32 h-[1px] bg-slate-400 mx-auto my-1"></div>
            <p className="font-bold text-[#0b2347]">Anamika Pandey</p>
            <p className="text-xs text-slate-500">Co-Founder</p>
            <p className="text-xs text-slate-500">Navyan</p>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="absolute bottom-0 w-full bg-[#0b2347] text-white py-1 flex justify-around items-center text-[10px] px-16">
          <span className="flex items-center gap-1">🌐 www.navyan.online</span>
          <span className="flex items-center gap-1">✉️ contact@navyan.online</span>
          <span className="flex items-center gap-1">📍 India</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: none; margin: 0; padding: 0; }
          .print\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}