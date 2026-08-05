"use client";

import { useEffect } from "react";
import { BarChart3, LineChart, Users, ArrowUpRight, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function ExportReportPage() {
  // Automatically trigger the print dialog when the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen w-full font-sans text-slate-800 p-8 md:p-12 print:p-0">
      {/* Print-specific styles to force background graphics and colors */}
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          /* Ensure no page breaks inside components */
          .avoid-break { page-break-inside: avoid; }
        }
      `}} />

      <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] print:shadow-none shadow-xl border print:border-none border-slate-200 relative overflow-hidden flex flex-col">
        
        {/* Header Strip */}
        <div className="h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full shrink-0"></div>
        
        <div className="p-12 flex-1">
          {/* Brand Header */}
          <div className="flex flex-row justify-between items-end mb-12 border-b border-slate-100 pb-8 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">SyncFlow</h1>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Social Media Analytics</h2>
              <p className="text-lg text-slate-500 font-medium mt-1">Comprehensive Performance Report</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Generated On</p>
              <p className="text-base font-bold text-slate-800">{format(new Date(), "MMMM d, yyyy")}</p>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="mb-12 avoid-break">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Executive Summary</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100/80 text-blue-600 rounded-lg shrink-0"><Users className="w-4 h-4" /></div>
                  <span className="font-bold text-slate-600 text-sm">Total Audience</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1">1,245.8K</p>
                <div className="flex items-center text-[11px] font-bold text-emerald-500 gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12.4% this month
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-pink-100/80 text-pink-600 rounded-lg shrink-0"><LineChart className="w-4 h-4" /></div>
                  <span className="font-bold text-slate-600 text-sm">Engagement</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1">482.3K</p>
                <div className="flex items-center text-[11px] font-bold text-emerald-500 gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +8.1% this month
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100/80 text-purple-600 rounded-lg shrink-0"><TrendingUp className="w-4 h-4" /></div>
                  <span className="font-bold text-slate-600 text-sm">Impressions</span>
                </div>
                <p className="text-3xl font-black text-slate-900 mb-1">3.2M</p>
                <div className="flex items-center text-[11px] font-bold text-emerald-500 gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +24.5% this month
                </div>
              </div>
            </div>
          </div>

          {/* Network Breakdown */}
          <div className="mb-12 avoid-break">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Network Breakdown</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-200">Network</th>
                    <th className="px-5 py-3 border-b border-slate-200">Followers</th>
                    <th className="px-5 py-3 border-b border-slate-200">Posts</th>
                    <th className="px-5 py-3 border-b border-slate-200">Engagement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700 bg-white">
                  <tr>
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center text-pink-600 font-black text-[10px] shrink-0">IG</div>
                      Instagram
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">452.1K</td>
                    <td className="px-5 py-4">124</td>
                    <td className="px-5 py-4 font-bold text-emerald-500">4.2%</td>
                  </tr>
                  <tr className="bg-slate-50/30">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] font-black text-[10px] shrink-0">IN</div>
                      LinkedIn
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">182.9K</td>
                    <td className="px-5 py-4">42</td>
                    <td className="px-5 py-4 font-bold text-emerald-500">8.9%</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-black/5 flex items-center justify-center text-black font-black text-[10px] shrink-0">X</div>
                      Twitter
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">610.8K</td>
                    <td className="px-5 py-4">450</td>
                    <td className="px-5 py-4 font-bold text-emerald-500">1.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Chart Placeholder */}
          <div className="avoid-break">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Growth Trajectory</h3>
            <div className="h-56 bg-slate-50 rounded-xl border border-slate-200 flex items-end justify-between px-8 pt-12 pb-6 gap-2 relative overflow-hidden">
               <div className="absolute top-6 left-6 flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Audience Growth (Last 10 Months)</span>
               </div>
               {[2, 4, 3, 6, 5, 8, 7, 10, 9, 12].map((h, i) => (
                 <div key={i} className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-sm flex-1" style={{ height: `${h * 10}%` }}></div>
               ))}
            </div>
          </div>

        </div>

        {/* Footer Strip */}
        <div className="p-6 px-12 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 shrink-0 bg-white">
          <p>CONFIDENTIAL & PROPRIETARY</p>
          <p>Generated by SyncFlow Analytics</p>
        </div>

      </div>
    </div>
  );
}
