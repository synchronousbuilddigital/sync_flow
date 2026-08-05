import { Camera, Globe, PlayCircle, Play as Youtube, Briefcase, ChevronDown, Download } from "lucide-react"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

const followerData = [
  { date: 'Jul 3', followers: 641, following: 700 },
  { date: 'Jul 7', followers: 642, following: 701 },
  { date: 'Jul 11', followers: 642, following: 701 },
  { date: 'Jul 15', followers: 643, following: 702 },
  { date: 'Jul 19', followers: 644, following: 703 },
  { date: 'Jul 23', followers: 645, following: 703 },
  { date: 'Jul 27', followers: 647, following: 704 },
  { date: 'Jul 31', followers: 648, following: 705 },
  { date: 'Aug 4', followers: 649, following: 706 },
]

const balanceData = [
  { date: 'Jul 3', gained: 1, lost: 0 },
  { date: 'Jul 7', gained: 2, lost: -1 },
  { date: 'Jul 11', gained: 0, lost: 0 },
  { date: 'Jul 15', gained: 1, lost: 0 },
  { date: 'Jul 19', gained: 3, lost: -2 },
  { date: 'Jul 23', gained: 1, lost: 0 },
  { date: 'Jul 27', gained: 4, lost: -2 },
  { date: 'Jul 31', gained: 2, lost: -1 },
  { date: 'Aug 4', gained: 1, lost: 0 },
]

const genderData = [
  { name: 'Male', value: 45 },
  { name: 'Female', value: 50 },
  { name: 'Unknown', value: 5 },
]

const ageData = [
  { age: '13-17', value: 10 },
  { age: '18-24', value: 45 },
  { age: '25-34', value: 30 },
  { age: '35-44', value: 10 },
  { age: '45-54', value: 3 },
  { age: '55+', value: 2 },
]

const countryData = [
  { name: 'United States', value: 40 },
  { name: 'United Kingdom', value: 20 },
  { name: 'Australia', value: 15 },
  { name: 'Canada', value: 15 },
  { name: 'Germany', value: 10 },
]

const COLORS = ['#8B5CF6', '#F472B6', '#94A3B8']

export function AccountAnalytics({ network, account }: { network: string, account: string }) {
  
  const getNetworkIcon = () => {
    switch(network) {
      case 'Instagram': return <Camera className="w-5 h-5 text-pink-500" />
      case 'Facebook': return <Globe className="w-5 h-5 text-blue-600" />
      case 'TikTok': return <PlayCircle className="w-5 h-5 text-slate-800" />
      case 'YouTube': return <Youtube className="w-5 h-5 text-red-500" />
      case 'LinkedIn': return <Briefcase className="w-5 h-5 text-[#0A66C2]" />
      default: return <Camera className="w-5 h-5 text-slate-500" />
    }
  }

  const getNetworkTheme = () => {
    switch(network) {
      case 'Instagram': return { bg: 'bg-gradient-to-br from-fuchsia-600/10 via-pink-500/10 to-orange-500/10', border: 'border-pink-200' }
      case 'Facebook': return { bg: 'bg-blue-50', border: 'border-blue-200' }
      case 'TikTok': return { bg: 'bg-slate-100', border: 'border-slate-200' }
      case 'YouTube': return { bg: 'bg-red-50', border: 'border-red-200' }
      case 'LinkedIn': return { bg: 'bg-sky-50', border: 'border-sky-200' }
      default: return { bg: 'bg-slate-50', border: 'border-slate-200' }
    }
  }

  const theme = getNetworkTheme()

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Banner */}
      <div className={`${theme.bg} rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-100/50`}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center ${theme.border} border shadow-sm`}>
            {getNetworkIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{network} Analytics</h1>
            <p className="text-sm font-medium text-slate-600 mt-1">Detailed performance metrics for <span className="font-bold text-slate-800">@{account}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white text-slate-700 font-medium hover:bg-slate-50 border-slate-200">
            Last 30 Days <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white text-slate-700 hover:bg-slate-50 border-slate-200">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Community Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Community</h2>
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Main Chart */}
          <div className="flex-1 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Growth</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={followerData}>
                  <defs>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI Sidebar */}
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
          </div>
        </div>

        {/* Balance Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Balance of Followers</h3>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="gained" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="lost" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Demographics Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Demographics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gender */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full mb-2">Gender</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div><span className="text-xs font-semibold text-slate-600">Male</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#F472B6]"></div><span className="text-xs font-semibold text-slate-600">Female</span></div>
            </div>
          </div>

          {/* Age */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full mb-6">Age</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Followers by country */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full mb-2">Followers by Country</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {countryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][i%5]}}></div>
                  <span className="text-xs font-medium text-slate-600">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Followers by city */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider w-full mb-6">Followers by City</h3>
            <div className="space-y-4">
              {[
                { city: 'New York, United States', percent: '15.4%' },
                { city: 'London, United Kingdom', percent: '8.2%' },
                { city: 'Sydney, Australia', percent: '5.1%' },
                { city: 'Toronto, Canada', percent: '4.8%' },
                { city: 'Berlin, Germany', percent: '3.7%' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-slate-700">{item.city}</span>
                  <span className="text-sm font-bold text-slate-900">{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
