"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight, ArrowDownRight, Users, MessageSquare, Heart, Share2, Eye } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { name: 'Jan', followers: 4000, engagement: 2400, reach: 2400 },
  { name: 'Feb', followers: 4500, engagement: 1398, reach: 2210 },
  { name: 'Mar', followers: 5200, engagement: 9800, reach: 2290 },
  { name: 'Apr', followers: 6100, engagement: 3908, reach: 2000 },
  { name: 'May', followers: 6500, engagement: 4800, reach: 2181 },
  { name: 'Jun', followers: 7200, engagement: 3800, reach: 2500 },
  { name: 'Jul', followers: 8400, engagement: 4300, reach: 2100 },
];

const platformData = [
  { name: 'Instagram', value: 45, color: '#E1306C' },
  { name: 'Twitter', value: 25, color: '#1DA1F2' },
  { name: 'LinkedIn', value: 20, color: '#0A66C2' },
  { name: 'Facebook', value: 10, color: '#1877F2' },
];

const stats = [
  { title: "Total Reach", value: "2.4M", change: "+14.2%", icon: Eye, trend: "up" },
  { title: "Total Engagement", value: "142.3K", change: "+5.4%", icon: MessageSquare, trend: "up" },
  { title: "Total Likes", value: "84.2K", change: "-2.1%", icon: Heart, trend: "down" },
  { title: "Total Shares", value: "12.4K", change: "+12.5%", icon: Share2, trend: "up" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground mt-1">Detailed performance metrics across all your channels.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <CalendarDateRangePicker /> - Placeholder for Date Range component */}
          <Button variant="outline" className="h-10">
            Jan 1, 2026 - Jan 31, 2026
          </Button>
          <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4 py-2">Overview</TabsTrigger>
          <TabsTrigger value="audience" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4 py-2">Audience</TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4 py-2">Engagement</TabsTrigger>
          <TabsTrigger value="content" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm px-4 py-2">Content Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                      <stat.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs mt-1 flex items-center font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {stat.change} vs last period
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            {/* Main Chart */}
            <Card className="col-span-full md:col-span-5 border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Audience Growth</CardTitle>
                <CardDescription>
                  Your total followers across all platforms over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="followers" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Side breakdown */}
            <Card className="col-span-full md:col-span-2 border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
                <CardDescription>Followers by network.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {platformData.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{platform.name}</span>
                        <span className="text-slate-500 font-semibold">{platform.value}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${platform.value}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-2 rounded-full" 
                          style={{ backgroundColor: platform.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
