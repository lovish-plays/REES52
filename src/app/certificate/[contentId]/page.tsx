"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, Award, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getItemMetadata } from "@/lib/projectMetadata";

interface PageProps {
  params: Promise<{ contentId: string }>;
}

export default function CertificatePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;
  const { user, claimCertificate, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cert, setCert] = useState<any>(null);
  const [courseName, setCourseName] = useState("");
  const [claiming, setClaiming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch or auto-claim certificate on mount
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError("Please sign in to view certificates.");
      setClaiming(false);
      return;
    }

    const loadCertificate = async () => {
      try {
        setClaiming(true);
        // Find course details
        const progress = user.progress?.[contentId];
        
        // Find title from items list
        // Since we don't have direct database lookup here, we will try to look it up in user's enrolled videos/unlocked ebooks, 
        // or check common seed titles, or use dynamic metadata titles.
        let name = "Robotics & STEM Specialist Module";
        if (contentId === "44444444-4444-4444-4444-444444444441") name = "Arduino Uno Setup and Blink Tutorial";
        if (contentId === "44444444-4444-4444-4444-444444444442") name = "4WD Smart Robot Car Chassis Assembly";
        if (contentId === "44444444-4444-4444-4444-444444444443") name = "Interfacing DHT11 Temperature Sensor";
        if (contentId === "33333333-3333-3333-3333-333333333331") name = "Getting Started with Arduino Uno R3";
        if (contentId === "33333333-3333-3333-3333-333333333332") name = "DIY 4WD Smart Car Building Guide";
        if (contentId === "33333333-3333-3333-3333-333333333333") name = "Comprehensive Sensors Handbook (37-in-1)";
        setCourseName(name);

        const existingCert = user.certificates?.find((c: any) => c.courseId === contentId);
        
        if (existingCert) {
          setCert(existingCert);
          setClaiming(false);
        } else if (progress && progress.percentage === 100) {
          // Claim new certificate!
          const claimRes = await claimCertificate(contentId, name);
          if (claimRes.success && claimRes.certificate) {
            setCert(claimRes.certificate);
          } else {
            setError(claimRes.error || "Failed to generate certificate record.");
          }
          setClaiming(false);
        } else {
          setError("You have not completed this course module to 100% yet.");
          setClaiming(false);
        }
      } catch (err) {
        console.error("Error claiming certificate:", err);
        setError("An unexpected error occurred.");
        setClaiming(false);
      }
    };

    loadCertificate();
  }, [user, authLoading, contentId, claimCertificate]);

  // 2. Draw certificate on Canvas for rendering & export
  useEffect(() => {
    if (!cert || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-resolution dimensions (A4 Landscape ratio)
    canvas.width = 1200;
    canvas.height = 850;

    // Drawing context setup
    // 1. Background Fill
    ctx.fillStyle = "#FCFAF2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Outer Border (Double Lines)
    ctx.strokeStyle = "#0891B2"; // Cyan-600
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = "#0F172A"; // Slate-900
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    // Corner Accents (Decorative Boxes)
    const corners = [
      [48, 48],
      [canvas.width - 64, 48],
      [48, canvas.height - 64],
      [canvas.width - 64, canvas.height - 64]
    ];
    ctx.fillStyle = "#0891B2";
    corners.forEach(([x, y]) => {
      ctx.fillRect(x - 8, y - 8, 16, 16);
    });

    // 3. Watermark Emblem in background
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 4. Header Branding text
    ctx.fillStyle = "#0F172A";
    ctx.textAlign = "center";
    
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("ROBOTICS EMBEDDED EDUCATION SERVICES", canvas.width / 2, 110);
    
    ctx.fillStyle = "#0891B2";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("REES52", canvas.width / 2, 160);

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("CREDENTIAL VALIDATION RECORD", canvas.width / 2, 185);

    // 5. Main Title Certificate of Completion
    ctx.fillStyle = "#0F172A";
    ctx.font = "normal italic 26px serif";
    ctx.fillText("This is to certify that", canvas.width / 2, 275);

    // User Name
    ctx.fillStyle = "#0891B2";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(cert.userName?.toUpperCase() || user?.name?.toUpperCase(), canvas.width / 2, 345);

    // Divider Line
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 375);
    ctx.lineTo(canvas.width / 2 + 200, 375);
    ctx.stroke();

    // Achievement text
    ctx.fillStyle = "#334155";
    ctx.font = "normal italic 18px serif";
    ctx.fillText("has successfully completed all requirements for the module", canvas.width / 2, 420);

    // Course Name
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(cert.courseName, canvas.width / 2, 475);

    // Date
    const formattedDate = new Date(cert.completionDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    ctx.fillStyle = "#64748B";
    ctx.font = "normal italic 16px serif";
    ctx.fillText(`completed on ${formattedDate}`, canvas.width / 2, 530);

    // Signature Area Left
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 680);
    ctx.lineTo(400, 680);
    ctx.stroke();
    
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("REES52 EDUCATION BOARD", 300, 705);
    ctx.fillStyle = "#64748B";
    ctx.font = "11px sans-serif";
    ctx.fillText("Authorized Signatory", 300, 725);

    // Signature Area Right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 400, 680);
    ctx.lineTo(canvas.width - 200, 680);
    ctx.stroke();
    
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("LEARNING PROGRAM DIRECTOR", canvas.width - 300, 705);
    ctx.fillStyle = "#64748B";
    ctx.font = "11px sans-serif";
    ctx.fillText("Authorized Verification", canvas.width - 300, 725);

    // Verification ID Bottom Center
    ctx.fillStyle = "#64748B";
    ctx.font = "11px sans-serif";
    ctx.fillText(`Credential Serial ID: ${cert.id}`, canvas.width / 2, 785);
  }, [cert, user]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `REES52-Certificate-${contentId}.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || claiming) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-xs font-black text-slate-500">Preparing your certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[70vh] text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">Access Restrained</h2>
        <p className="text-xs text-slate-650 font-semibold leading-relaxed uppercase">{error}</p>
        <div className="pt-2 flex flex-col w-full gap-2">
          <Link href="/" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 lg:py-12 flex flex-col gap-6 text-slate-800 animate-fade-in relative z-10 print:p-0 print:m-0 print:bg-white print:max-w-none">
      
      {/* Back Button (Hidden on Print) */}
      <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors w-fit text-xs font-bold uppercase tracking-wider print:hidden">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Learning Space</span>
      </Link>

      {/* Intro Header Details (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700 shadow-[0_0_12px_rgba(6,182,212,0.08)]">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" /> VERIFIED CREDENTIAL
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-wide mt-2">
            Course Completion Certificate
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-semibold">
            Congratulations! You have completed 100% of <span className="text-slate-850 font-black">{courseName}</span>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-md shadow-cyan-600/10 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-md transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Certificate View Frame */}
      <div className="w-full flex justify-center bg-slate-200/50 p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-inner overflow-x-auto print:p-0 print:border-none print:shadow-none print:bg-white print:rounded-none">
        
        {/* HTML Canvas (Hidden on layout, used for image export) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Printable/HTML Display version of certificate (Matches A4 landscape ratio) */}
        <div 
          id="certificate-print-view"
          className="relative w-full max-w-[850px] aspect-[1.414/1] bg-[#FCFAF2] border-[12px] border-cyan-600 p-8 sm:p-12 flex flex-col justify-between shadow-2xl rounded-2xl select-none border-double print:shadow-none print:border-cyan-600 print:rounded-none print:w-screen print:h-screen print:max-w-none print:p-16"
        >
          {/* Accent borders inside */}
          <div className="absolute inset-2 border-2 border-slate-900 pointer-events-none rounded-lg" />
          
          {/* Corner points */}
          <div className="absolute top-1 left-1 w-3 h-3 bg-cyan-600 rounded-full" />
          <div className="absolute top-1 right-1 w-3 h-3 bg-cyan-600 rounded-full" />
          <div className="absolute bottom-1 left-1 w-3 h-3 bg-cyan-600 rounded-full" />
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-cyan-600 rounded-full" />

          {/* Top Logo and Header */}
          <div className="text-center space-y-1 relative z-10">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700">
              Robotics Embedded Education Services
            </span>
            <div className="flex items-center justify-center gap-1.5 text-cyan-600 py-1">
              <Award className="w-6 h-6 animate-pulse" />
              <span className="text-xl sm:text-2xl font-black tracking-widest">REES52</span>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Credential Verification Record
            </span>
          </div>

          {/* Mid Section: Recipient Detail */}
          <div className="text-center space-y-3 relative z-10 py-4 sm:py-6">
            <span className="text-xs sm:text-sm italic font-serif text-slate-600">
              This is to certify that
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide text-cyan-600 leading-tight">
              {cert.userName}
            </h2>
            <div className="w-1/3 border-t border-slate-350 mx-auto" />
            <p className="text-xs sm:text-sm text-slate-700 italic font-serif max-w-md mx-auto leading-relaxed">
              has successfully completed all requirements for the learning module
            </p>
            <h3 className="text-sm sm:text-lg font-black uppercase text-slate-900 tracking-wider leading-snug px-4">
              {cert.courseName}
            </h3>
          </div>

          {/* Bottom section: Signatures & Verification Code */}
          <div className="space-y-6 relative z-10">
            
            <div className="text-center">
              <span className="text-[10px] sm:text-xs text-slate-500 italic font-serif">
                completed on{" "}
                <span className="font-sans font-bold uppercase text-[9px] sm:text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-150 ml-1">
                  {new Date(cert.completionDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="w-32 sm:w-44 border-t border-slate-300 mx-auto" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 block">
                  REES52 Education Board
                </span>
                <span className="text-[7.5px] sm:text-[8px] text-slate-500 uppercase font-semibold">
                  Authorized Signatory
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="w-32 sm:w-44 border-t border-slate-300 mx-auto" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 block">
                  Learning Program Director
                </span>
                <span className="text-[7.5px] sm:text-[8px] text-slate-500 uppercase font-semibold">
                  Authorized Verification
                </span>
              </div>
            </div>

            <div className="text-center border-t border-slate-200/40 pt-4 flex items-center justify-between text-[7px] sm:text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Secure Digital Credentials</span>
              <span className="text-slate-500 font-extrabold">Credential ID: {cert.id}</span>
              <span>REES52 Academy</span>
            </div>

          </div>

          {/* Background Decorative Crest Pattern overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
            <Award className="w-[300px] h-[300px] text-slate-950" />
          </div>

        </div>

      </div>

      {/* Sharing Details (Hidden on Print) */}
      <div className="bg-cyan-50 border border-cyan-200/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 print:hidden">
        <div className="p-2 bg-cyan-100 rounded-xl text-cyan-600 flex-shrink-0">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-cyan-900">
            Share Your Achievement!
          </h4>
          <p className="text-[11px] text-cyan-800 leading-relaxed font-semibold">
            This certificate records completion of the named REES52 Academy course. Certificate ID <code className="bg-cyan-200/50 px-1.5 py-0.5 rounded font-black tracking-widest text-[10px]">{cert.id}</code> helps match the certificate to the saved Academy completion record. It is not a degree, professional licence, or government-accredited qualification.
          </p>
        </div>
      </div>

    </div>
  );
}
