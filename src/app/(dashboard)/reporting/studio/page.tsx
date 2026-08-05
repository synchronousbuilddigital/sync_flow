"use client";

import { LayoutGrid, ArrowLeft, Plus, Move } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudioPage() {
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
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Metricool Studio</h1>
            <p className="text-sm text-slate-500">
              Build completely custom dashboards. Drag, drop, and resize your widgets.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 font-bold bg-white">
             Save Dashboard
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold gap-2">
             <Plus className="w-4 h-4" /> Add Widget
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 animate-in fade-in duration-500">
        
        {/* Studio Canvas Grid */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[120px]">
          
          {/* Large Chart Widget (Span 8 cols, 3 rows) */}
          <div className="col-span-12 md:col-span-8 row-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-move">
                 <Move className="w-4 h-4" />
               </button>
             </div>
             <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6">Cross-platform Audience Growth</h3>
             <div className="h-[calc(100%-3rem)] w-full flex items-end justify-between gap-2 pb-4">
               {[4, 5, 3, 6, 8, 7, 9, 11, 10, 12].map((h, i) => (
                 <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h * 8}%` }}></div>
               ))}
             </div>
          </div>
          
          {/* Small Stat Widget (Span 4 cols, 1 row) */}
          <div className="col-span-12 md:col-span-4 row-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group flex flex-col justify-center">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-move">
                 <Move className="w-4 h-4" />
               </button>
             </div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Followers</p>
             <div className="flex items-end gap-3">
               <p className="text-4xl font-black text-slate-900">892.4K</p>
               <span className="text-sm font-bold text-emerald-500 mb-1">+12%</span>
             </div>
          </div>

          {/* Medium Pie Chart Widget (Span 4 cols, 2 rows) */}
          <div className="col-span-12 md:col-span-4 row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group flex flex-col items-center justify-center">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-move">
                 <Move className="w-4 h-4" />
               </button>
             </div>
             <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider absolute top-6 left-6">Demographics</h3>
             <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 border-t-purple-500 border-r-pink-500 border-b-blue-500 relative rotate-45 mt-4">
                <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                   <span className="text-lg font-black text-slate-700">Gen Z</span>
                </div>
             </div>
          </div>

          {/* List Widget (Span 4 cols, 2 rows) */}
          <div className="col-span-12 md:col-span-4 row-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-move">
                 <Move className="w-4 h-4" />
               </button>
             </div>
             <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Top Performing Posts</h3>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-3 w-3/4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* List Widget (Span 4 cols, 2 rows) */}
          <div className="col-span-12 md:col-span-4 row-span-2 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-purple-300 hover:text-purple-500 transition-colors cursor-pointer group">
             <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
             <p className="text-sm font-bold">Add New Widget</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
