import { Cpu } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[60vh] text-slate-800">
      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
        {/* Opposing rotating rings */}
        <div className="absolute inset-0 border-2 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-1.5 border-2 border-blue-500 rounded-full border-b-transparent animate-spin-reverse [animation-duration:1.5s]"></div>
        <Cpu className="w-5 h-5 text-cyan-600 animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        Loading Learning Hub workspace...
      </p>
    </div>
  );
}
