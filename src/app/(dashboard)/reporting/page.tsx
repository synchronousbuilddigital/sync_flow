"use client";

import { useState, useEffect } from "react";
import { 
  Users, Eye, MousePointerClick, Heart,
  Globe, TrendingUp, Play
} from "lucide-react";
import { getAccounts, type SocialAccount } from "@/app/actions/accounts";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Icons for the Networks
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full flex items-center justify-center text-white font-serif font-bold italic ${className || 'w-5 h-5 bg-blue-600 text-xs'}`}>f</div>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center text-white font-black rounded-sm ${className || 'w-5 h-5 bg-black text-[10px]'}`}>X</div>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-sm flex items-center justify-center text-white font-bold ${className || 'w-5 h-5 bg-[#0A66C2] text-xs'}`}>in</div>
);

const NETWORK_ICONS: Record<string, any> = {
  'Instagram': InstagramIcon,
  'Facebook': FacebookIcon,
  'Twitter': TwitterIcon,
  'LinkedIn': LinkedinIcon,
  'TikTok': Play,
  'YouTube': Play,
  'Threads': TwitterIcon // Using X style for threads, or generic
};

const NETWORK_COLORS: Record<string, string> = {
  'Instagram': '#E1306C',
  'Facebook': '#1877F2',
  'Twitter': '#000000',
  'LinkedIn': '#0A66C2',
  'TikTok': '#0f172a',
  'YouTube': '#ef4444',
  'Threads': '#000000'
};

const MOCK_CHART_DATA = [
  { name: 'Mon', followers: 4000, engagement: 2400 },
  { name: 'Tue', followers: 4200, engagement: 1398 },
  { name: 'Wed', followers: 4600, engagement: 9800 },
  { name: 'Thu', followers: 5100, engagement: 3908 },
  { name: 'Fri', followers: 5900, engagement: 4800 },
  { name: 'Sat', followers: 6400, engagement: 3800 },
  { name: 'Sun', followers: 7100, engagement: 4300 },
];

export default function ReportingDashboard() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = async () => {
    const brandId = localStorage.getItem("activeBrandId");
    if (brandId) {
      const data = await getAccounts(brandId);
      if (data && data.length > 0) {
        setAccounts(data);
        setActiveAccount(data[0].id);
      } else {
        setAccounts([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccounts();
    const handleBrandChange = () => loadAccounts();
    window.addEventListener('brand-changed', handleBrandChange);
    return () => window.removeEventListener('brand-changed', handleBrandChange);
  }, []);

  const selectedAccount = accounts.find(a => a.id === activeAccount);
  const brandColor = selectedAccount ? (NETWORK_COLORS[selectedAccount.network] || '#4f46e5') : '#4f46e5';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-full pb-20">
      
      {/* Header Tabs Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 pt-6 pb-2">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mb-4">
              Real-time insights and performance metrics for your connected accounts.
            </p>
        </div>
        
        {/* Dynamic Account Tabs */}
        <div className="px-8 pb-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {accounts.length > 0 ? accounts.map((acc) => {
             const isActive = activeAccount === acc.id;
             return (
               <button
                 key={acc.id}
                 onClick={() => setActiveAccount(acc.id)}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap shrink-0 border ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
               >
                 <div className={`${isActive ? 'text-white' : ''}`}>
                   {React.createElement(NETWORK_ICONS[acc.network] || Globe, { className: 'w-4 h-4' })}
                 </div>
                 <span>{acc.account_handle}</span>
               </button>
             );
          }) : (
            !isLoading && <div className="text-sm font-medium text-slate-400 py-2">No accounts connected to this brand yet.</div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      {isLoading ? (
        <div className="p-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
      ) : selectedAccount ? (
        <div className="max-w-[1400px] mx-auto px-8 pt-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
           
           {/* Top Metric Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Followers" value="24.5K" trend="+12.5%" icon={<Users />} color={brandColor} />
              <StatCard title="Impressions" value="1.2M" trend="+45.2%" icon={<Eye />} color={brandColor} />
              <StatCard title="Profile Clicks" value="8,409" trend="+5.4%" icon={<MousePointerClick />} color={brandColor} />
              <StatCard title="Engagement Rate" value="4.8%" trend="-1.2%" icon={<Heart />} color={brandColor} isNegative />
           </div>

           {/* Charts and Data Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="text-lg font-bold text-slate-800">Audience Growth</h3>
                     <p className="text-xs text-slate-500 mt-1">Followers gained over time</p>
                   </div>
                   <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                     <option>Last 7 Days</option>
                     <option>Last 30 Days</option>
                     <option>This Year</option>
                   </select>
                 </div>
                 
                 <div className="flex-1 min-h-[350px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                         <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor={brandColor} stopOpacity={0.3}/>
                           <stop offset="95%" stopColor={brandColor} stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                         itemStyle={{ color: '#0f172a' }}
                       />
                       <Area type="monotone" dataKey="followers" stroke={brandColor} strokeWidth={4} fillOpacity={1} fill="url(#colorFollowers)" activeDot={{ r: 6, strokeWidth: 0, fill: brandColor }} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Top Performing Posts Sidebar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                 <h3 className="text-lg font-bold text-slate-800 mb-1">Top Posts</h3>
                 <p className="text-xs text-slate-500 mb-6">Highest engagement this week</p>
                 
                 <div className="space-y-4 flex-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer group">
                         <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                            <img src={`https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200&sig=${i}`} alt="post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 leading-relaxed">
                             {i === 1 ? "5 proven strategies to increase your productivity and get more done..." : "Behind the scenes at our new headquarters! Check out the office..."}
                           </p>
                           <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
                              <span className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-pink-500" fill="currentColor" /> {Math.floor(Math.random() * 5000) + 1000}</span>
                              <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-blue-500" /> {Math.floor(Math.random() * 20000) + 5000}</span>
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>
                 
                 <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors border border-slate-200 shadow-sm">
                   View All Analytics
                 </button>
              </div>

           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400">
           <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-slate-300" />
           </div>
           <h3 className="text-xl font-bold text-slate-700 mb-2">No Accounts Connected</h3>
           <p className="text-sm font-medium text-slate-500 max-w-sm text-center">
             Connect your social media accounts to view your unified analytics dashboard.
           </p>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, trend, icon, color, isNegative = false }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 group hover:shadow-md hover:border-slate-300 transition-all cursor-default">
       <div className="flex justify-between items-start mb-4">
         <div className="p-3.5 rounded-xl bg-slate-50 text-slate-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-inner" style={{ color: color }}>
           {React.cloneElement(icon, { className: "w-5 h-5" })}
         </div>
         <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-full shadow-sm ${isNegative ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
           {isNegative ? '↓' : '↑'} {trend}
         </div>
       </div>
       <div>
         <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
         <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h4>
       </div>
    </div>
  );
}
