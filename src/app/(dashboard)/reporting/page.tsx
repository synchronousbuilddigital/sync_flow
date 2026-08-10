"use client";

import { useState, useEffect } from "react";
import { 
  Users, Eye, MousePointerClick, Heart,
  Globe, TrendingUp, Play, FileText
} from "lucide-react";
import { getAccounts, type SocialAccount } from "@/app/actions/accounts";
import { getThreadsAnalytics } from "@/app/actions/analytics";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

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
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  const loadAccounts = async () => {
    const brandId = localStorage.getItem("activeBrandId");
    if (brandId) {
      const data = await getAccounts(brandId);
      if (data && data.length > 0) {
        setAccounts(data);
        if (!activeAccount) setActiveAccount(data[0].id);
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

  useEffect(() => {
    if (activeAccount) {
      loadAnalytics(activeAccount);
    }
  }, [activeAccount]);

  const loadAnalytics = async (accountId: string) => {
    setIsAnalyticsLoading(true);
    setAnalyticsData(null);
    try {
      const selectedAcc = accounts.find(a => a.id === accountId);
      if (selectedAcc && selectedAcc.network === 'Threads') {
         const data = await getThreadsAnalytics(accountId);
         if (data.error) {
           toast.error(data.error);
         }
         setAnalyticsData(data);
      } else {
         // Fallback mock data for other networks until implemented
         const mockData = await getThreadsAnalytics(accountId); 
         setAnalyticsData(mockData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const selectedAccount = accounts.find(a => a.id === activeAccount);
  const brandColor = selectedAccount ? (NETWORK_COLORS[selectedAccount.network] || '#4f46e5') : '#4f46e5';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-full pb-20">
      
      {/* Header Tabs Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 pt-6 pb-2 flex justify-between items-start">
           <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Analytics Dashboard</h1>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                Real-time insights and performance metrics for your connected accounts.
                {analyticsData?.isMock && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded font-bold">MOCK DATA</span>}
              </p>
           </div>
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
      {isLoading || isAnalyticsLoading ? (
        <div className="p-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>
      ) : selectedAccount && analyticsData ? (
        <div className="max-w-[1400px] mx-auto px-8 pt-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
           
           {/* Top Metric Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Followers" value={(analyticsData.followers || 0).toLocaleString()} trend="+0.0%" icon={<Users />} color={brandColor} />
              <StatCard title="Total Likes" value={(analyticsData.likes || 0).toLocaleString()} trend="+0.0%" icon={<Heart />} color={brandColor} />
              <StatCard title="Total Replies" value={(analyticsData.replies || 0).toLocaleString()} trend="+0.0%" icon={<MousePointerClick />} color={brandColor} />
              <StatCard title="Posts Analyzed" value={(analyticsData.topPosts?.length || 0).toString()} trend="Recent" icon={<Eye />} color={brandColor} />
           </div>

           {/* Charts and Data Area */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <div>
                     <h3 className="text-lg font-bold text-slate-800">Audience Growth</h3>
                     <p className="text-xs text-slate-500 mt-1">Current audience size (Historical data starts collecting today)</p>
                   </div>
                   <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer">
                     <option>Last 7 Days</option>
                   </select>
                 </div>
                 
                 <div className="flex-1 min-h-[350px] w-full mt-4">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={analyticsData?.isMock ? MOCK_CHART_DATA : [
                        { name: 'Mon', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Tue', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Wed', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Thu', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Fri', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Sat', followers: analyticsData?.followers || 0, engagement: 0 },
                        { name: 'Sun', followers: analyticsData?.followers || 0, engagement: 0 },
                      ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                 <h3 className="text-lg font-bold text-slate-800 mb-1">Recent Posts</h3>
                 <p className="text-xs text-slate-500 mb-6">Metrics for recent content</p>
                 
                 <div className="space-y-4 flex-1">
                    {analyticsData.topPosts && analyticsData.topPosts.length > 0 ? analyticsData.topPosts.map((post: any) => (
                      <div key={post.id} className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer group" onClick={() => post.permalink && window.open(post.permalink, '_blank')}>
                         {post.thumbnail ? (
                           <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                              <img src={post.thumbnail} alt="post" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                           </div>
                         ) : (
                           <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6 text-slate-400" />
                           </div>
                         )}
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-2 leading-relaxed">
                             {post.caption}
                           </p>
                           <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
                              <span className="flex items-center gap-1.5"><Heart className="w-3 h-3 text-pink-500" fill="currentColor" /> {post.likes || 0}</span>
                              <span className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-blue-500" /> {post.views || 0}</span>
                              <span className="flex items-center gap-1.5"><MousePointerClick className="w-3 h-3 text-emerald-500" /> {post.replies || 0}</span>
                           </div>
                         </div>
                      </div>
                    )) : (
                      <div className="text-sm text-slate-400 text-center py-10">No recent posts found.</div>
                    )}
                 </div>
                 
                 <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors border border-slate-200 shadow-sm">
                   View Detailed Metrics
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
