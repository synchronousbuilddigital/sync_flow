import re

with open("src/components/dashboard/account-analytics.tsx", "r") as f:
    content = f.read()

# Add imports
old_imports = """import { Button } from "@/components/ui/button\""""
new_imports = """import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getYouTubeAnalytics, type ChannelAnalytics } from "@/app/actions/analytics\""""
content = content.replace(old_imports, new_imports)

# Add state and useEffect inside AccountAnalytics
old_func_start = "export function AccountAnalytics({ network, account }: { network: string, account: string }) {"
new_func_start = """export function AccountAnalytics({ network, account }: { network: string, account: string }) {
  const [realStats, setRealStats] = useState<ChannelAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      if (network === 'YouTube') {
        const brandId = localStorage.getItem("activeBrandId");
        if (brandId) {
          setIsLoading(true);
          const stats = await getYouTubeAnalytics(brandId);
          setRealStats(stats);
          setIsLoading(false);
        }
      }
    }
    fetchStats();
  }, [network]);"""
content = content.replace(old_func_start, new_func_start)

# Replace KPI Sidebar
old_kpi = """          {/* KPI Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-l border-slate-100 p-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               <p className="text-2xl font-bold text-slate-800">649</p>
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">Followers</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               <p className="text-2xl font-bold text-slate-800">706</p>
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">Following</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               <p className="text-2xl font-bold text-slate-800">124</p>
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">Posts</p>
            </div>
          </div>"""

new_kpi = """          {/* KPI Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-l border-slate-100 p-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               {isLoading ? <div className="h-8 w-16 bg-slate-200 animate-pulse mx-auto rounded"></div> : <p className="text-2xl font-bold text-slate-800">{realStats ? realStats.followers.toLocaleString() : "649"}</p>}
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">{network === 'YouTube' ? 'Subscribers' : 'Followers'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               {isLoading ? <div className="h-8 w-16 bg-slate-200 animate-pulse mx-auto rounded"></div> : <p className="text-2xl font-bold text-slate-800">{realStats ? realStats.views.toLocaleString() : "706"}</p>}
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">{network === 'YouTube' ? 'Total Views' : 'Following'}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
               {isLoading ? <div className="h-8 w-16 bg-slate-200 animate-pulse mx-auto rounded"></div> : <p className="text-2xl font-bold text-slate-800">{realStats ? realStats.posts.toLocaleString() : "124"}</p>}
               <p className="text-[11px] font-bold uppercase text-slate-500 mt-1">{network === 'YouTube' ? 'Videos' : 'Posts'}</p>
            </div>
          </div>"""

content = content.replace(old_kpi, new_kpi)

with open("src/components/dashboard/account-analytics.tsx", "w") as f:
    f.write(content)
print("Updated analytics UI")
