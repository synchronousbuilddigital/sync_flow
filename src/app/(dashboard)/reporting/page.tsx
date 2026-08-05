"use client";

import { useState } from "react";
import { 
  FileText, LineChart, LayoutGrid, BarChart3, 
  Lock, Download, Settings, RefreshCw, Sparkles, Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateReportPPT } from "@/lib/ppt-generator";

export default function ReportingPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLookerModalOpen, setIsLookerModalOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'ppt'>('pdf');

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-full pb-20">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Reporting</h1>
        <p className="text-sm text-slate-500">
          Turn your data into reports or dashboards ready to analyze, share, or present to your clients.
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 animate-in fade-in duration-500">
        
        {/* Unlock Advanced Banner */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h2 className="text-[17px] font-bold text-slate-800 mb-1">Unlock advanced dashboards and cross-brand analytics</h2>
            <p className="text-sm text-slate-600 mb-2">Create advanced dashboards and compare performance across multiple brands in a single view</p>
            <p className="text-xs italic text-slate-500">Includes Campaign Dashboards and Metricool Studio</p>
          </div>
          <button className="shrink-0 bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-5 rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start md:self-auto">
            <div className="bg-yellow-400 p-1 rounded-full"><Lock className="w-3 h-3 text-yellow-900" /></div>
            Unlock advanced features
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">Reports</h3>
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed line-clamp-3">
                Generate pre-designed reports with data from the social networks you choose for a specific period. Customize them with your logo and colors, and export them as PDF or PPT.
              </p>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors mb-8"
              >
                Create report
              </button>
            </div>
            
            {/* Visual Graphic 1 */}
            <div className="mt-auto relative h-[220px] bg-slate-50/50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6 pt-12">
              {/* PDF Document Graphic */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-6 top-8 w-40 bg-white rounded-xl shadow-lg border border-slate-100 p-3 -rotate-6 z-10"
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                   <div className="flex items-center gap-1.5">
                     <div className="w-4 h-4 bg-pink-500 rounded flex items-center justify-center text-[8px] font-black text-white">PDF</div>
                     <span className="text-[10px] font-bold text-slate-700">Generate</span>
                   </div>
                </div>
                <div className="flex items-end gap-1 mb-3 h-12">
                   <div className="w-1/4 bg-blue-100 h-1/3 rounded-t-sm"></div>
                   <div className="w-1/4 bg-blue-200 h-2/3 rounded-t-sm"></div>
                   <div className="w-1/4 bg-blue-400 h-full rounded-t-sm"></div>
                   <div className="w-1/4 bg-blue-500 h-4/5 rounded-t-sm"></div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[8px] text-slate-400">Followers</p>
                    <p className="text-xs font-bold text-slate-700">8.680 K</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400">Likes</p>
                    <p className="text-xs font-bold text-slate-700">99.099 K</p>
                  </div>
                </div>
              </motion.div>

              {/* PPT Document Graphic */}
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute right-6 bottom-4 w-36 bg-white rounded-xl shadow-lg border border-slate-100 p-3 rotate-3 z-20"
              >
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-1.5">
                     <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center text-[8px] font-black text-white">PPT</div>
                     <span className="text-[10px] font-bold text-slate-700">Generate</span>
                   </div>
                </div>
                <div className="h-10 w-full rounded border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 mb-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 border-[3px] border-orange-400 border-t-transparent border-r-transparent"></div>
                </div>
                <div>
                  <p className="text-[8px] text-slate-400">Posts</p>
                  <p className="text-xs font-bold text-slate-700">112 K</p>
                </div>
              </motion.div>
              
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5" /> Report ready
              </div>
            </div>
          </div>

          {/* Card 2: Campaign Dashboards */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">Campaign dashboards</h3>
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <LineChart className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed line-clamp-3">
                Group content by campaign or topic, manually or automatically. Analyze their combined performance to measure the real impact of each action.
              </p>
              <Link href="/reporting/campaigns">
                <button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors mb-8 flex items-center gap-2">
                  View Campaigns
                </button>
              </Link>
            </div>
            
            {/* Visual Graphic 2 */}
            <div className="mt-auto relative h-[220px] bg-slate-50/50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
               <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 h-32 relative mt-8">
                 <div className="flex justify-between items-end h-12 px-2 border-b border-slate-100 pb-2 mb-2 gap-2">
                   {[3,5,2,7,4,6,8,5].map((h, i) => (
                     <div key={i} className="w-full bg-orange-200 rounded-t-sm" style={{ height: `${h*10}%` }}></div>
                   ))}
                 </div>
                 <div className="absolute inset-0 top-12 left-2 right-2 pointer-events-none">
                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                      <path d="M0 25 Q 15 5, 30 20 T 60 10 T 100 20" fill="none" stroke="#60A5FA" strokeWidth="2" />
                    </svg>
                 </div>
                 <div className="flex justify-between px-2">
                   <div><p className="text-[8px] text-slate-400">Impressions</p><p className="text-[10px] font-bold">36.986 K</p></div>
                   <div><p className="text-[8px] text-slate-400">Reach</p><p className="text-[10px] font-bold">44.566 K</p></div>
                   <div><p className="text-[8px] text-slate-400">Interactions</p><p className="text-[10px] font-bold">90.231 K</p></div>
                 </div>
                 
                 {/* Floating Badges */}
                 <div className="absolute -top-6 -left-2 bg-white rounded-lg shadow-md border border-slate-100 p-2 z-10 rotate-[-4deg]">
                    <p className="text-[8px] text-slate-400">Impressions</p>
                    <p className="text-sm font-black text-blue-500">22596</p>
                 </div>
                 <div className="absolute -top-4 -right-2 bg-white rounded-lg shadow-md border border-slate-100 p-2 z-10 rotate-[4deg]">
                    <p className="text-[8px] text-slate-400">Engagement</p>
                    <p className="text-sm font-black text-emerald-500">36992</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Card 3: Metricool Studio */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">Metricool Studio</h3>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed line-clamp-3">
                Create custom views without technical skills. Choose which charts, metrics, and insights to display for one brand or multiple at once.
              </p>
              <Link href="/reporting/studio">
                <button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors mb-8 flex items-center gap-2">
                  Open Studio
                </button>
              </Link>
            </div>
            
            {/* Visual Graphic 3 */}
            <div className="mt-auto relative h-[220px] bg-slate-50/50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
               <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 h-36 relative mt-4">
                 
                 {/* Calendar Grid Mockup */}
                 <div className="grid grid-cols-5 gap-1.5 mb-2 mt-4">
                   {[...Array(20)].map((_, i) => (
                     <div key={i} className="aspect-square bg-slate-50 rounded flex items-center justify-center">
                       {i === 7 && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                       {i === 12 && <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold shadow-sm">15</div>}
                       {i === 18 && <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>}
                     </div>
                   ))}
                 </div>
                 
                 {/* Floating Elements */}
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap z-20">
                    <Sparkles className="w-2.5 h-2.5" /> AI Prompt
                 </div>
                 
                 <div className="absolute top-10 -left-6 bg-white rounded-lg shadow-lg border border-slate-100 p-2 w-24 -rotate-6 z-10">
                    <div className="h-6 w-full border-b border-slate-100 relative">
                       <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                         <path d="M0 25 L 30 15 L 60 20 L 100 5" fill="none" stroke="#F472B6" strokeWidth="2" />
                       </svg>
                    </div>
                 </div>

                 <div className="absolute bottom-2 -right-4 bg-white rounded-lg shadow-lg border border-slate-100 p-2 w-16 h-16 flex items-center justify-center rotate-3 z-10">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-l-red-500 border-t-yellow-400 border-r-blue-500 rotate-45"></div>
                 </div>
               </div>
            </div>
          </div>

          {/* Card 4: Looker Studio */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-800">Looker Studio</h3>
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed line-clamp-3">
                Connect your data to Looker Studio and build dashboards with complete freedom in design, structure, and visualization.
              </p>
              <button 
                onClick={() => setIsLookerModalOpen(true)}
                className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors mb-8 flex items-center gap-2"
              >
                Connect Looker Studio
              </button>
            </div>
            
            {/* Visual Graphic 4 */}
            <div className="mt-auto relative h-[220px] bg-slate-50/50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
               <div className="w-full bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 h-36 relative mt-4 flex flex-col">
                 <div className="flex justify-between items-end h-16 px-1 border-b border-slate-100 pb-2 mb-2 gap-3 relative mt-auto">
                   {[4,7,3,8,9,5].map((h, i) => (
                     <div key={i} className="w-full bg-teal-400 rounded-t-sm" style={{ height: `${h*10}%` }}></div>
                   ))}
                   {/* Trend Line Overlay */}
                   <svg viewBox="0 0 100 40" className="absolute inset-0 w-full h-full -top-4 pointer-events-none" preserveAspectRatio="none">
                      <path d="M 8 30 L 25 15 L 42 25 L 58 5 L 75 8 L 92 20" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
                      <circle cx="58" cy="5" r="2" fill="#3B82F6" />
                   </svg>
                 </div>
                 
                 <div className="flex justify-between px-1 text-[7px] text-slate-400 font-bold uppercase">
                   <span>Apr 17</span><span>May 7</span><span>May 27</span>
                 </div>

                 {/* Floating Badges */}
                 <div className="absolute top-2 -left-2 bg-white rounded-lg shadow-lg border border-slate-100 p-2 z-10 w-20">
                    <p className="text-[10px] font-black text-slate-800">112.4 K</p>
                    <p className="text-[7px] text-teal-500 font-bold">↑ 24.3% this week</p>
                 </div>
                 <div className="absolute top-14 -right-2 bg-white rounded-lg shadow-lg border border-slate-100 p-2 z-10 w-20">
                    <p className="text-[7px] text-slate-400">Following</p>
                    <p className="text-[10px] font-black text-slate-800">179.9 K</p>
                 </div>
               </div>
            </div>
          </div>

        </div>

        {/* Hashtag Tracker Bottom Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-8 relative isolate">
           <div className="max-w-2xl relative z-10">
             <h2 className="text-xl font-bold text-slate-800 mb-2">Hashtag Tracker</h2>
             <p className="text-sm text-slate-500 mb-6 leading-relaxed">
               Monitor and analyze the use of a hashtag on X or Instagram and get data on its performance.
             </p>
             <div className="flex items-end gap-1 mb-4">
               <span className="text-xl font-bold text-slate-900">25€</span>
               <span className="text-sm text-slate-500 pb-0.5">/day</span>
             </div>
             <Button variant="outline" className="border-slate-300 font-bold">
               More information
             </Button>
           </div>
           
           {/* Decorative Background Graphic */}
           <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none z-0 translate-x-1/4 translate-y-1/4">
              <Hash className="w-96 h-96 text-indigo-500 rotate-12" />
           </div>
        </div>

      </div>

      {/* Report Configuration Modal (Interactive Feature) */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Generate Report</h3>
                    <p className="text-xs text-slate-500">Configure your professional analytics report.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Date Range</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                    <option>Last 30 Days</option>
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Year to Date</option>
                    <option>Custom Range...</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label 
                      onClick={() => setReportFormat('pdf')}
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${reportFormat === 'pdf' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input type="radio" name="format" checked={reportFormat === 'pdf'} readOnly className="hidden" />
                      <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-[8px] font-black text-white">PDF</div>
                      <span className={`text-sm font-bold ${reportFormat === 'pdf' ? 'text-indigo-900' : 'text-slate-600'}`}>PDF Report</span>
                    </label>
                    <label 
                      onClick={() => setReportFormat('ppt')}
                      className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${reportFormat === 'ppt' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input type="radio" name="format" checked={reportFormat === 'ppt'} readOnly className="hidden" />
                      <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-[8px] font-black text-white">PPT</div>
                      <span className={`text-sm font-bold ${reportFormat === 'ppt' ? 'text-indigo-900' : 'text-slate-600'}`}>PPT Export</span>
                    </label>
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Included Networks</label>
                   <div className="flex flex-wrap gap-2">
                     {['Instagram', 'Twitter', 'LinkedIn', 'Facebook'].map(net => (
                       <div key={net} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
                         {net}
                       </div>
                     ))}
                   </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => {
                    if (reportFormat === 'pdf') {
                      window.open('/export/report', '_blank');
                    } else {
                      generateReportPPT("Last 30 Days");
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-bold gap-2"
                >
                   <Download className="w-4 h-4" /> Download Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Looker Studio API Key Modal */}
      <AnimatePresence>
        {isLookerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Looker Studio Setup</h3>
                    <p className="text-xs text-slate-500">Connect your data to Google Looker.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsLookerModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                  <p className="text-sm text-orange-800 font-medium leading-relaxed">
                    Use this secure API Key to connect your account using our Looker Studio Community Connector. Keep this key safe.
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Connection URL</label>
                  <div className="flex">
                    <input 
                      readOnly 
                      value="https://api.syncflow.com/v1/looker-connector" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-l-lg p-3 text-sm font-medium text-slate-600 outline-none" 
                    />
                    <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 rounded-r-lg font-bold text-xs transition-colors">Copy</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Secure API Key</label>
                  <div className="flex">
                    <input 
                      readOnly 
                      value="api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-l-lg p-3 text-sm font-medium text-slate-800 outline-none font-mono" 
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-r-lg font-bold text-xs transition-colors">Copy</button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button className="w-full bg-slate-900 hover:bg-black text-white shadow-sm font-bold" onClick={() => setIsLookerModalOpen(false)}>
                   Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
