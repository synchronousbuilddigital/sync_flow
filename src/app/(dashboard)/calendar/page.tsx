"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
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
  
  // AI Heatmap Data
  const [aiHeatmap, setAiHeatmap] = useState<HeatmapData | null>(null);

  const [activeFilters, setActiveFilters] = useState({
    Twitter: true,
    LinkedIn: true,
    Instagram: true,
    Facebook: true,
    TikTok: true,
    YouTube: true
  });

  // Fetch posts from Supabase on mount
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts();
        if (data) {
          setDbPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    async function loadAiHeatmap() {
      try {
        // In a real app we might pass the active account profile context here
        const heatmap = await getBestTimeToPost("Generic social media account");
        setAiHeatmap(heatmap);
      } catch (err) {
        console.error("Failed to fetch AI heatmap:", err);
      }
    }
    loadPosts();
    loadAiHeatmap();
  }, []);

  // Handle saving new or updated post to Supabase
  const handleSavePost = async (payload: PostPayload) => {
    try {
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

  // Derive grid positions based on the currently viewed week
  const gridPosts = useMemo(() => {
    return dbPosts.filter(p => p.status !== 'Deleted').map(dbPost => {
      let dayOffset = 0;
      let hour = 12;

      // Use scheduled time if it exists, otherwise fallback to creation time
      const dateToUse = dbPost.scheduled_timestamp 
        ? new Date(dbPost.scheduled_timestamp) 
        : new Date(dbPost.created_at || Date.now());

      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
      
      const diffTime = dateToUse.getTime() - weekStart.getTime();
      dayOffset = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      hour = dateToUse.getHours();

      return {
        id: dbPost.id,
        dayOffset,
        hour,
        title: dbPost.content ? dbPost.content.substring(0, 20) + "..." : "New Post",
        platform: dbPost.network,
        accountName: dbPost.account_name
      };
    });
  }, [dbPosts, currentDate]);

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
      scheduledTimestamp: fullDbPost.scheduled_timestamp || null
    };
  }, [editingPostId, dbPosts]);

  // Update current time every minute to keep the red line accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic days of the week based on currentDate
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const endDate = addDays(startDate, 6);
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startDate, i);
    return {
      dateObj: d,
      short: format(d, 'EEE'),
      date: format(d, 'd MMM'),
    };
  });
  
  const dateRangeLabel = `${format(startDate, 'd')} - ${format(endDate, 'd MMM yyyy')}`;

  const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));

  const handleToggleFilter = (network: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({ ...prev, [network]: !prev[network] }));
  };

  // Helper to generate random heatmap intensity for the "Best time to post" feature
  const getHeatmapOpacity = (dayIdx: number, hourIdx: number) => {
    if (!showHeatmap) return "transparent";
    
    // Default fallback if AI data hasn't loaded yet
    let score = 0;
    if (aiHeatmap && aiHeatmap[dayIdx] && aiHeatmap[dayIdx][hourIdx] !== undefined) {
      score = aiHeatmap[dayIdx][hourIdx];
    }

    if (score >= 0.8) return "rgba(249, 115, 22, 0.25)"; // Orange 500 at 25% (Peak)
    if (score >= 0.4) return "rgba(249, 115, 22, 0.15)"; // Orange 500 at 15% (Good)
    if (score > 0) return "rgba(249, 115, 22, 0.05)";    // Orange 500 at 5% (Okay)
    
    return "transparent";
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
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Planner</h2>
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1">
              <Button onClick={handlePrevWeek} variant="ghost" size="icon" className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm font-semibold w-[140px] text-center text-slate-700">{dateRangeLabel}</span>
              <Button onClick={handleNextWeek} variant="ghost" size="icon" className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white shadow-sm"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={showHeatmap} 
                onCheckedChange={(checked) => setShowHeatmap(checked as boolean)} 
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 border-slate-200"
              />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Best time to post</span>
            </label>
            <div className="flex bg-slate-50 border border-slate-100 rounded-lg p-1">
              <Button 
                variant={view === "weekly" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-8 px-4 rounded-md shadow-none text-xs font-bold transition-all ${view === "weekly" ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                onClick={() => setView("weekly")}
              >
                Weekly
              </Button>
              <Button 
                variant={view === "monthly" ? "default" : "ghost"} 
                size="sm" 
                className={`h-8 px-4 rounded-md shadow-none text-xs font-bold transition-all ${
                  view === "monthly" ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setView("monthly")}
              >
                Monthly
              </Button>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto flex no-scrollbar bg-slate-50/50">
          
          {/* Time Axis (Y) */}
          <div className="w-16 flex-shrink-0 border-r border-slate-200 bg-white sticky left-0 z-20">
            <div className="h-14 border-b border-slate-200 sticky top-0 bg-white z-20 flex items-center justify-center text-xs font-bold text-slate-400">
              GMT+0
            </div>
            {hours.map((hour, i) => (
              <div key={i} className="h-24 border-b border-slate-200 flex flex-col justify-start py-2">
                <span className="text-[10px] font-bold text-slate-400 text-center w-full">{hour}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 flex min-w-[800px]">
            {daysOfWeek.map((day, dayIdx) => {
              const isToday = isSameDay(day.dateObj, now);
              
              // Calculate offset for current time red line (header is 14rem/56px + 24px per hour/min calc)
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              // Each hour block is h-24 which is 6rem = 96px in tailwind
              const pixelsPerHour = 96;
              const timeOffsetPx = (currentHour * pixelsPerHour) + ((currentMinute / 60) * pixelsPerHour);
              
              return (
                <div key={dayIdx} className="flex-1 min-w-[120px] relative bg-white">
                  
                  {/* Day Header (Sticky) */}
                  <div className={`h-14 border-b border-r sticky top-0 z-30 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm ${isToday ? 'border-b-orange-500 border-b-2 border-r-slate-200 shadow-sm' : 'border-slate-200'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-orange-600' : 'text-slate-400'}`}>{day.short}</span>
                    <span className={`text-sm font-bold ${isToday ? 'text-slate-900' : 'text-slate-700'}`}>{day.date}</span>
                  </div>

                  {/* Time Slots */}
                  {hours.map((_, hourIdx) => {
                    const heatColor = getHeatmapOpacity(dayIdx, hourIdx);
                    
                    // Filter posts from live state
                    const slotPosts = gridPosts.filter(p => 
                      p.dayOffset === dayIdx && 
                      p.hour === hourIdx && 
                      activeFilters[p.platform as keyof typeof activeFilters]
                    );
                    
                    return (
                      <div 
                        key={hourIdx} 
                        onClick={() => { setEditingPostId(null); setIsComposerOpen(true); }}
                        className="h-24 border-b border-r border-slate-200 relative group transition-colors hover:bg-slate-50 cursor-pointer"
                        style={{ backgroundColor: heatColor }}
                      >
                        {/* Hover Plus Button */}
                        <div className="absolute inset-0 items-center justify-center hidden group-hover:flex">
                           <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                             <Plus className="w-4 h-4" />
                           </div>
                        </div>

                        {/* Scheduled Posts in this slot */}
                        {slotPosts.length > 0 && (
                          <div className="absolute inset-x-2 top-2 bottom-2 flex flex-col gap-1.5 z-10 pointer-events-none">
                            {slotPosts.map(post => {
                              const meta = NETWORK_META[post.platform] || { color: 'bg-slate-500 text-white', icon: Globe };
                              const PostIcon = meta.icon;

                              return (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  key={post.id} 
                                  onClick={(e) => { e.stopPropagation(); setEditingPostId(post.id); setIsComposerOpen(true); }}
                                  className={`h-full rounded-xl shadow-sm border border-black/5 p-2 flex flex-col pointer-events-auto cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${meta.color}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="bg-white/20 p-1 rounded-md backdrop-blur-sm">
                                      <PostIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                        className="p-1 bg-black/20 hover:bg-red-500/80 rounded-full text-white transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                      <MoreVertical className="w-4 h-4 opacity-70 p-0.5 bg-black/10 rounded-full" />
                                    </div>
                                  </div>
                                  <p className="text-[10px] font-bold leading-tight line-clamp-2 mt-auto mix-blend-overlay">
                                    {post.title}
                                  </p>
                                  {post.accountName && (
                                    <p className="text-[8px] font-medium leading-tight mix-blend-overlay opacity-80 mt-1 truncate">
                                      {post.accountName}
                                    </p>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Current Time Indicator (Red line) */}
                  {isToday && (
                    <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `calc(56px + ${timeOffsetPx}px)` }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 -ml-[5px] ring-4 ring-orange-100 shadow-sm"></div>
                      <div className="h-[2px] bg-orange-500 w-full shadow-sm"></div>
                    </div>
                  )}
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
