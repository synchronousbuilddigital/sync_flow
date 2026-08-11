"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, ChevronRight, Plus, 
  Settings,
  MoreVertical, MessageCircle as Twitter, Briefcase as Linkedin, Camera as Instagram, Globe as Facebook, Globe, X, AlertCircle, GripVertical, PlayCircle, Play as Youtube
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

import { PostComposer, PostPayload } from "@/components/dashboard/post-composer";
import { ListView } from "@/components/dashboard/planner/list-view";
import { DeletedView } from "@/components/dashboard/planner/deleted-view";
import { AutolistsView } from "@/components/dashboard/planner/autolists-view";
import { LibraryView } from "@/components/dashboard/planner/library-view";
import { getPosts, createPost, updatePost, deletePost, restorePost, hardDeletePost } from "@/app/actions/posts";
import { getBestTimeToPost, type HeatmapData } from "@/app/actions/ai";
import { useMemo } from "react";

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const mockDrafts = [
  { id: 1, text: "Check out our new feature! 🎉", platform: "twitter" },
  { id: 2, text: "5 ways to increase your productivity...", platform: "linkedin" },
  { id: 3, text: "Behind the scenes at HQ! 📸", platform: "instagram" },
];

const NETWORK_META: Record<string, { color: string, icon: any }> = {
  'Instagram': { color: "bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white", icon: Instagram },
  'Facebook': { color: "bg-[#1877F2] text-white", icon: Facebook },
  'TikTok': { color: "bg-slate-800 text-white", icon: PlayCircle },
  'YouTube': { color: "bg-red-500 text-white", icon: Youtube },
  'LinkedIn': { color: "bg-[#0A66C2] text-white", icon: Linkedin },
  'Twitter': { color: "bg-black text-white", icon: Twitter },
  'Threads': { color: "bg-slate-900 text-white", icon: Twitter },
};

export default function CalendarPage() {
  // Tab State
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'library' | 'autolists' | 'deleted'>('calendar');

  const [view, setView] = useState<"weekly" | "monthly">("weekly");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  
  // Real Database Posts State
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  
  // AI Heatmap Data
  const [aiHeatmap, setAiHeatmap] = useState<HeatmapData | null>(null);

  const [activeFilters, setActiveFilters] = useState({
    Twitter: true,
    LinkedIn: true,
    Instagram: true,
    Facebook: true,
    TikTok: true,
    YouTube: true,
    Threads: true
  });

  // Fetch posts from Supabase on mount and brand change
  useEffect(() => {
    async function loadPosts() {
      try {
        const brandId = localStorage.getItem("activeBrandId");
        if (!brandId) {
          setDbPosts([]);
          setActiveBrandId(null);
          return;
        }
        setActiveBrandId(brandId);
        const data = await getPosts(brandId);
        if (data) {
          setDbPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    async function loadAiHeatmap() {
      try {
        const heatmap = await getBestTimeToPost("Generic social media account");
        setAiHeatmap(heatmap);
      } catch (err) {
        console.error("Failed to fetch AI heatmap:", err);
      }
    }
    loadPosts();
    loadAiHeatmap();

    const onBrandChanged = () => loadPosts();
    window.addEventListener("brandChanged", onBrandChanged);
    return () => window.removeEventListener("brandChanged", onBrandChanged);
  }, []);

  // Handle saving new or updated post to Supabase
  const handleSavePost = async (payload: PostPayload) => {
    try {
      if (!payload.brandId) {
        toast.error("Please select a brand first.");
        return;
      }
      if (payload.id) {
        // Update existing post
        const updatedDbPost = await updatePost(payload.id, payload);
        setDbPosts(prev => prev.map(p => p.id === payload.id ? updatedDbPost : p));
        toast.success("Post updated successfully!");
      } else {
        // Create new post
        const newDbPost = await createPost(payload);
        setDbPosts(prev => [newDbPost, ...prev]);
        toast.success("Post created successfully!");
      }
      setIsComposerOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      setDbPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'Deleted' } : p));
      toast.success("Post deleted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const handleRestorePost = async (id: string) => {
    try {
      await restorePost(id);
      const post = dbPosts.find(p => p.id === id);
      const newStatus = post?.scheduled_timestamp ? 'Scheduled' : 'Published';
      setDbPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast.success("Post restored!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore post");
    }
  };

  const handleHardDeletePost = async (id: string) => {
    try {
      await hardDeletePost(id);
      setDbPosts(prev => prev.filter(p => p.id !== id));
      toast.success("Post permanently deleted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  // Derive grid positions based on the currently viewed month
  const gridPosts = useMemo(() => {
    return dbPosts.filter(p => p.status !== 'Deleted').map(dbPost => {
      // Use scheduled time if it exists, otherwise fallback to creation time
      const dateToUse = dbPost.scheduled_timestamp 
        ? new Date(dbPost.scheduled_timestamp) 
        : new Date(dbPost.created_at || Date.now());

      return {
        id: dbPost.id,
        date: dateToUse,
        timeStr: format(dateToUse, "hh:mm a"),
        title: dbPost.content ? dbPost.content.substring(0, 30) + "..." : "New Post",
        platform: dbPost.network,
        accountName: dbPost.account_name
      };
    });
  }, [dbPosts]);

  // Derive initial data for the composer if editing an existing post
  const editingPostData = useMemo(() => {
    if (!editingPostId) return undefined;
    const fullDbPost = dbPosts.find(p => p.id === editingPostId);
    if (!fullDbPost) return undefined;
    
    return {
      id: fullDbPost.id,
      network: fullDbPost.network as any,
      accountName: fullDbPost.account_name,
      postType: fullDbPost.post_type as any,
      content: fullDbPost.content || "",
      mediaUrls: fullDbPost.media_urls || [],
      scheduledTimestamp: fullDbPost.scheduled_timestamp || null,
      brandId: activeBrandId || "",
      status: fullDbPost.status,
      networkPostId: fullDbPost.network_post_id
    };
  }, [editingPostId, dbPosts]);

  // Update current time every minute to keep the red line accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic month calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const dateRangeLabel = format(currentDate, 'MMMM yyyy');

  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleToggleFilter = (network: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({ ...prev, [network]: !prev[network] }));
  };

  // Helper for daily heatmap intensity
  const getDayHeatmap = (date: Date) => {
    if (!showHeatmap) return null;
    const dayOfWeek = date.getDay();
    const peakTimes = ["16:00", "09:00", "12:00", "18:00", "15:00", "20:00", "14:00"];
    const intensity = [0.8, 0.3, 0.1, 0.9, 0.4, 0.7, 0.2]; // Mock intensities
    
    const score = intensity[dayOfWeek];
    if (score > 0.5) return { time: peakTimes[dayOfWeek], bg: "radial-gradient(circle at center, rgba(254, 215, 170, 0.5) 0%, transparent 70%)" };
    if (score > 0.2) return { time: peakTimes[dayOfWeek], bg: "radial-gradient(circle at center, rgba(254, 215, 170, 0.2) 0%, transparent 70%)" };
    return null;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-[1600px] mx-auto w-full">
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 px-6 h-14 bg-white sticky top-0 z-30 mb-6">
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`h-full text-sm font-semibold border-b-2 px-1 transition-colors ${activeTab === 'calendar' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Calendar
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`h-full text-sm font-semibold border-b-2 px-1 transition-colors ${activeTab === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          List
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={`h-full text-sm font-semibold border-b-2 px-1 transition-colors ${activeTab === 'library' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Posts library
        </button>
        <button 
          onClick={() => setActiveTab('autolists')}
          className={`h-full text-sm font-semibold border-b-2 px-1 transition-colors ${activeTab === 'autolists' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Autolists
        </button>
        <button 
          onClick={() => setActiveTab('deleted')}
          className={`h-full text-sm font-semibold border-b-2 px-1 transition-colors ${activeTab === 'deleted' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Deleted posts
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6 mx-auto w-full overflow-hidden pb-4 px-6">
          
          {/* Left Sidebar - Planner Controls */}
      <Card className="w-full md:w-72 flex-shrink-0 border border-slate-100/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white rounded-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <Button 
            onClick={() => { setEditingPostId(null); setIsComposerOpen(true); }} 
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl h-11"
          >
            <Plus className="w-5 h-5 mr-2" /> Create New Post
          </Button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-8">
          {/* Networks Filter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Networks</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.Twitter}
                  onCheckedChange={() => handleToggleFilter('Twitter')}
                  id="net-tw" 
                  className="data-checked:bg-black data-checked:border-black border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-slate-700" /> Twitter
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.LinkedIn}
                  onCheckedChange={() => handleToggleFilter('LinkedIn')}
                  id="net-in" 
                  className="data-checked:bg-[#0A66C2] data-checked:border-[#0A66C2] border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.Instagram}
                  onCheckedChange={() => handleToggleFilter('Instagram')}
                  id="net-ig" 
                  className="data-checked:bg-pink-500 data-checked:border-pink-500 border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.Facebook}
                  onCheckedChange={() => handleToggleFilter('Facebook')}
                  id="net-fb" 
                  className="data-checked:bg-[#1877F2] data-checked:border-[#1877F2] border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.TikTok}
                  onCheckedChange={() => handleToggleFilter('TikTok')}
                  id="net-tk" 
                  className="data-checked:bg-slate-800 data-checked:border-slate-800 border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-slate-800" /> TikTok
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.YouTube}
                  onCheckedChange={() => handleToggleFilter('YouTube')}
                  id="net-yt" 
                  className="data-checked:bg-red-500 data-checked:border-red-500 border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" /> YouTube
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <Checkbox 
                  checked={activeFilters.Threads as boolean | undefined}
                  onCheckedChange={() => handleToggleFilter('Threads')}
                  id="net-threads" 
                  className="data-checked:bg-slate-900 data-checked:border-slate-900 border-slate-200" 
                />
                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-slate-900" /> Threads
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drafts (Unscheduled)</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-bold border-none text-xs">3</Badge>
            </div>
            <div className="space-y-2">
              {mockDrafts.map(draft => (
                <div key={draft.id} className="p-3 text-sm rounded-xl border border-slate-100 bg-slate-50 cursor-move hover:border-orange-200 hover:shadow-sm hover:bg-orange-50/50 transition-all group">
                  <div className="flex items-start gap-2.5">
                    {draft.platform === 'twitter' && <Twitter className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-black transition-colors" />}
                    {draft.platform === 'linkedin' && <Linkedin className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-[#0A66C2] transition-colors" />}
                    {draft.platform === 'instagram' && <Instagram className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-pink-500 transition-colors" />}
                    <span className="line-clamp-2 text-slate-600 font-medium">{draft.text}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-orange-600 font-semibold hover:text-orange-700 hover:bg-orange-50 h-9 rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Add Draft
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-100/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Calendar Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <Button onClick={handlePrevMonth} variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-md"><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 min-w-[150px] text-center">{dateRangeLabel}</h2>
            <Button onClick={handleNextMonth} variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-md"><ChevronRight className="w-4 h-4" /></Button>
            <Button onClick={handleToday} variant="outline" size="sm" className="ml-2 h-8 px-4 border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm">Today</Button>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center space-x-3 cursor-pointer bg-orange-50/50 border border-orange-200/60 rounded-full px-4 py-1.5 transition-colors hover:bg-orange-50">
              <span className="text-xs font-bold text-orange-600 flex items-center gap-1.5">
                🔥 Best Posting Hours Heatmap
              </span>
              <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center ${showHeatmap ? 'bg-orange-500' : 'bg-slate-300'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${showHeatmap ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
              <Checkbox 
                checked={showHeatmap} 
                onCheckedChange={(checked) => setShowHeatmap(checked as boolean)} 
                className="hidden"
              />
            </label>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              Peak Engagement: <span className="flex items-center gap-1 text-slate-700"><span className="text-orange-500">🔥</span> Best (16:00 - 19:00)</span>
            </div>

            <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 ml-2">
              <Button 
                variant={view === "monthly" ? "default" : "ghost"} 
                size="sm" 
                className={`h-7 px-4 rounded-md shadow-none text-xs font-bold transition-all ${
                  view === "monthly" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setView("monthly")}
              >
                Month
              </Button>
              <Button 
                variant={view === "weekly" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-7 px-4 rounded-md shadow-none text-xs font-bold transition-all ${view === "weekly" ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                onClick={() => setView("weekly")}
              >
                Week
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid (Month View) */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-white shrink-0">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-3 text-center text-[11px] font-extrabold text-slate-500 tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)] bg-slate-100 gap-[1px]">
            {calendarDays.map((day, dayIdx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, now);
              const heatmap = getDayHeatmap(day);
              
              // Filter posts for this specific day
              const dayPosts = gridPosts.filter(p => 
                isSameDay(p.date, day) && 
                activeFilters[p.platform as keyof typeof activeFilters]
              );
              
              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => { setEditingPostId(null); setIsComposerOpen(true); }}
                  className={`bg-white p-2 flex flex-col gap-1 relative group cursor-pointer transition-colors hover:bg-slate-50/80 overflow-hidden ${!isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  {/* Heatmap Background */}
                  {heatmap && isCurrentMonth && (
                    <div className="absolute inset-0 pointer-events-none" style={{ background: heatmap.bg }} />
                  )}

                  <div className="flex items-start justify-between relative z-10">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white' : 'text-slate-700'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Heatmap Pill */}
                    {heatmap && isCurrentMonth && (
                      <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md border border-orange-200/50 flex items-center gap-0.5">
                        <span className="text-[10px]">🔥</span> {heatmap.time}
                      </span>
                    )}
                  </div>

                  {/* Scheduled Posts */}
                  <div className="flex flex-col gap-1.5 mt-1 relative z-10 overflow-y-auto no-scrollbar">
                    {dayPosts.map(post => {
                      const meta = NETWORK_META[post.platform] || { color: 'bg-slate-500 text-white', icon: Globe };
                      const PostIcon = meta.icon;
                      
                      return (
                        <div 
                          key={post.id}
                          onClick={(e) => { e.stopPropagation(); setEditingPostId(post.id); setIsComposerOpen(true); }}
                          className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 shadow-sm bg-white hover:shadow-md transition-all hover:border-slate-300"
                        >
                          <div className={`w-5 h-5 rounded flex shrink-0 items-center justify-center ${meta.color}`}>
                            <PostIcon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 leading-none mb-0.5">{post.timeStr}</span>
                            <span className="text-[11px] font-semibold text-slate-700 truncate leading-tight">{post.title}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Hover Add Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[1px] pointer-events-none z-20">
                    <div className="w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

        </div>
      )}

      {/* Other Tabs */}
      {activeTab === 'list' && (
        <ListView 
          posts={dbPosts.filter(p => p.status !== 'Deleted')} 
          onEdit={(id) => { setEditingPostId(id); setIsComposerOpen(true); }}
          onDelete={handleDeletePost}
        />
      )}
      {activeTab === 'library' && (
        <LibraryView onOpenComposer={() => { setEditingPostId(null); setIsComposerOpen(true); }} />
      )}
      {activeTab === 'autolists' && (
        <AutolistsView />
      )}
      {activeTab === 'deleted' && (
        <DeletedView 
          posts={dbPosts.filter(p => p.status === 'Deleted')} 
          onRestore={handleRestorePost}
          onHardDelete={handleHardDeletePost}
        />
      )}

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSavePost={handleSavePost}
        initialData={editingPostData}
      />
    </div>
  );
}
