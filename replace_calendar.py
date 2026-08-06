import re

with open("src/app/(dashboard)/calendar/page.tsx", "r") as f:
    content = f.read()

# 1. Update date-fns imports
content = re.sub(
    r'import \{ format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay \} from "date-fns";',
    'import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";',
    content
)

# 2. Update gridPosts and other hooks
old_grid_posts = """  // Derive grid positions based on the currently viewed week
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
  }, [dbPosts, currentDate]);"""

new_grid_posts = """  // Derive grid positions based on the currently viewed month
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
  }, [dbPosts]);"""

content = content.replace(old_grid_posts, new_grid_posts)

# 3. Update Calendar Setup Logic (lines ~198 to ~235)
old_calendar_setup = """  // Compute dynamic days of the week based on currentDate
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
  };"""

new_calendar_setup = """  // Compute dynamic month calendar days
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
  };"""

content = content.replace(old_calendar_setup, new_calendar_setup)

# 4. Replace Header and Grid Rendering (Lines 387 to 552)
old_main_area_start = """        {/* Calendar Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 bg-white">"""

old_main_area_end = """                  {/* Current Time Indicator (Red line) */}
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
        </div>"""

new_calendar_block = """        {/* Calendar Header */}
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
        </div>"""

# Replace between old_main_area_start and old_main_area_end
start_idx = content.find(old_main_area_start)
end_idx = content.find(old_main_area_end) + len(old_main_area_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_calendar_block + content[end_idx:]
    with open("src/app/(dashboard)/calendar/page.tsx", "w") as f:
        f.write(content)
    print("Successfully replaced calendar layout!")
else:
    print("Error: Could not find block to replace.")
    print("Start index:", start_idx)
    print("End index:", end_idx)
