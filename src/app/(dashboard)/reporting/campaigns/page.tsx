"use client";

import { LineChart, ArrowLeft, ArrowUpRight, Megaphone, Users, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CampaignsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-full pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/reporting">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800 rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Campaign Dashboards</h1>
            <p className="text-sm text-slate-500">
              Measure the combined performance of your cross-brand marketing campaigns.
            </p>
          </div>
        </div>
        <Button className="bg-slate-900 hover:bg-black text-white shadow-sm font-bold">
           + New Campaign
        </Button>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 animate-in fade-in duration-500 space-y-6">
        
        {/* Active Campaign Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Summer Sale 2026</h3>
                  <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Campaign
                  </p>
                </div>
             </div>
             <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 outline-none">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
             </select>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Reach</p>
                <div className="flex items-end gap-3">
                   <p className="text-3xl font-black text-slate-900">1.2M</p>
                   <p className="text-xs font-bold text-emerald-500 mb-1">+14%</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Impressions</p>
                <div className="flex items-end gap-3">
                   <p className="text-3xl font-black text-slate-900">4.5M</p>
                   <p className="text-xs font-bold text-emerald-500 mb-1">+22%</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Conversions</p>
                <div className="flex items-end gap-3">
                   <p className="text-3xl font-black text-slate-900">8,402</p>
                   <p className="text-xs font-bold text-emerald-500 mb-1">+5%</p>
                </div>
              </div>
           </div>
           
           {/* Chart Mockup */}
           <div className="h-72 w-full bg-slate-50 rounded-xl border border-slate-100 p-6 flex flex-col justify-between">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                 <span>1.5M</span>
                 <span>1.0M</span>
                 <span>500K</span>
                 <span>0</span>
              </div>
              <div className="relative flex-1 my-4">
                 <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <path d="M0 10 L100 10 M0 20 L100 20 M0 30 L100 30" stroke="#f1f5f9" strokeWidth="0.5" fill="none" />
                    {/* Data line */}
                    <path d="M 0 30 Q 15 15, 30 25 T 60 10 T 100 5" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 0 35 Q 15 25, 30 30 T 60 20 T 100 15" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                 </svg>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 pl-4 pr-2">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
           </div>
        </div>

        {/* Empty state for other campaigns */}
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
           <Target className="w-12 h-12 text-slate-300 mb-4" />
           <h3 className="text-lg font-bold text-slate-700 mb-2">Track another campaign</h3>
           <p className="text-sm text-slate-500 max-w-md mb-6">Group your posts into logical campaigns to measure their exact return on investment.</p>
           <Button variant="outline" className="border-slate-300 text-slate-700 font-bold">
              Create Campaign
           </Button>
        </div>

      </div>
    </div>
  );
}
