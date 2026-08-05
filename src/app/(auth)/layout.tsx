import { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full relative overflow-hidden bg-slate-950">
      {/* Full-screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/login-bg.png" 
          alt="SyncFlow Background" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/10" /> {/* Slight bright overlay */}
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row max-w-[1800px] mx-auto">
        
        {/* Left Side - Branding (Visible on lg screens) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 lg:pl-32 xl:pl-48">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-white/50">
              <svg className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-indigo-950 drop-shadow-sm">SyncFlow</span>
          </div>
          
          <h1 
            className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white"
            style={{ 
              textShadow: "1px 1px 0px #818cf8, 2px 2px 0px #6366f1, 3px 3px 0px #4f46e5, 4px 4px 0px #4338ca, 5px 5px 0px #3730a3, 6px 6px 0px #312e81, 0 15px 30px rgba(0,0,0,0.25)" 
            }}
          >
            SYNC YOUR<br />WORKFLOW
          </h1>
          <p className="text-xl text-indigo-950 max-w-xl font-bold drop-shadow-sm">
            Where Your Team's Productivity Becomes Reality.
          </p>
          <p className="text-base text-indigo-900 mt-4 max-w-md font-medium">
            Embark on a journey where seamless connection and smooth workflows are always within your reach.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center items-center lg:items-start p-6 sm:p-12 lg:pl-20 xl:pl-32">
          {/* Mobile logo header (only visible when left side is hidden) */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
             <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">SyncFlow</span>
          </div>
          
          <div className="w-full max-w-[480px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
