import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Users, Eye, Target, Camera, Globe, PlayCircle } from "lucide-react"
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { name: 'W1', followers: 69400 },
  { name: 'W2', followers: 69800 },
  { name: 'W3', followers: 70100 },
  { name: 'W4', followers: 70500 },
  { name: 'W5', followers: 71200 },
  { name: 'W6', followers: 71800 },
  { name: 'Now', followers: 72400 },
]

export function GlobalSummary() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#EEF2FF] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Understand what works and make data-driven decisions</h2>
          <p className="text-slate-600 font-medium">Analyze your community, the reach of your posts and your ad campaigns from a single dashboard.</p>
        </div>
        <Button 
          onClick={() => toast.success("Connecting to social networks API...")}
          className="bg-[#272535] hover:bg-black text-white shrink-0 rounded-lg px-6 shadow-md transition-all"
        >
          Connect social networks
        </Button>
      </div>

      {/* Main 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Community Growth */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col min-h-[480px]">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 pr-4">
              <h3 className="text-lg font-semibold text-slate-800">How your community grows</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Track the evolution of your followers across all your networks from one place.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
          <div className="flex-1 mt-auto relative bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 pb-24 flex flex-col justify-end overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
               <span className="text-xl font-bold">∞</span>
               <span className="text-[10px] font-bold uppercase text-slate-400">Metricool</span>
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white shadow-sm border border-slate-100 rounded-lg p-2 px-3 text-center">
               <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Growth</p>
               <p className="text-sm font-bold text-slate-800">+12.4%</p>
               <p className="text-[9px] text-[#00A651] font-bold">vs last month</p>
            </div>

            <div className="h-[200px] w-full mt-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}}
                    activeDot={{r: 6, fill: '#8B5CF6', strokeWidth: 0}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="absolute bottom-4 left-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Followers</p>
              <p className="text-xl font-bold text-slate-800">69.4K</p>
              <p className="text-[10px] text-[#00A651] font-bold">+1.5K month</p>
            </div>
          </div>
        </div>

        {/* Card 2: Reach */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col min-h-[480px]">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 pr-4">
              <h3 className="text-lg font-semibold text-slate-800">The real reach of your posts</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Discover the reach of your posts on each network and which content performs best.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-slate-600" />
            </div>
          </div>

          <div className="flex-1 mt-auto relative bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 pt-12 pb-24 flex flex-col justify-end">
            <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
               <span className="text-xl font-bold">∞</span>
               <span className="text-[10px] font-bold uppercase text-slate-400">Metricool</span>
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white shadow-sm border border-slate-100 rounded-lg p-2 px-3 text-center">
               <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Reach</p>
               <p className="text-sm font-bold text-slate-800">124K</p>
               <p className="text-[9px] text-[#00A651] font-bold">this month</p>
            </div>

            <div className="space-y-4 mt-6">
              {/* Instagram Bar */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Reel - Behind the scenes</span>
                    <span>28.4K</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>

              {/* Facebook Bar */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Carousel - Product launch</span>
                    <span>19.1K</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              {/* TikTok Bar */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Video - Tutorial</span>
                    <span>12.7K</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Top post</p>
              <p className="text-xl font-bold text-slate-800">38.2K</p>
              <p className="text-[10px] text-[#00A651] font-bold">+24% vs avg</p>
            </div>
          </div>
        </div>

        {/* Card 3: Ad Campaigns */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col min-h-[480px]">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2 pr-4">
              <h3 className="text-lg font-semibold text-slate-800">Your ad campaigns, at a glance</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Analyze the performance of your ads across all platforms without switching screens.
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
          </div>

          <div className="flex-1 mt-auto relative bg-white border border-slate-100 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 pt-12 pb-24 flex flex-col justify-end">
            <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
               <span className="text-xl font-bold">∞</span>
               <span className="text-[10px] font-bold uppercase text-slate-400">Metricool</span>
            </div>
            <div className="absolute top-4 right-4 z-10 bg-white shadow-sm border border-slate-100 rounded-lg p-2 px-3 text-center">
               <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Spend</p>
               <p className="text-sm font-bold text-slate-800">$1.2K</p>
               <p className="text-[9px] text-[#00A651] font-bold">this month</p>
            </div>

            <div className="space-y-4 mt-6">
              {/* Ad 1 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-600">
                  FB
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Summer Sale</span>
                    <span className="text-[#00A651]">4.2x</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              {/* Ad 2 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-500">
                  G
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Brand Awareness</span>
                    <span className="text-[#00A651]">3.1x</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>

              {/* Ad 3 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-800">
                  TT
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span>Promo Launch</span>
                    <span className="text-[#00A651]">2.8x</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">ROAS</p>
              <p className="text-xl font-bold text-slate-800">3.4x</p>
              <p className="text-[10px] text-[#00A651] font-bold">+0.6 vs avg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
