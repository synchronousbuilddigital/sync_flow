"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  Smile, Image as ImageIcon, Video, Hash, Wand2, 
  Calendar as CalendarIcon, Send, Clock, Globe,
  MoreHorizontal, MessageCircle, Heart, Share, Bookmark
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const platforms = [
  { id: "twitter", name: "Twitter", color: "bg-black text-white dark:bg-white dark:text-black", icon: "𝕏" },
  { id: "linkedin", name: "LinkedIn", color: "bg-[#0A66C2] text-white", icon: "in" },
  { id: "instagram", name: "Instagram", color: "bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] text-white", icon: "IG" },
];

export default function CreatePostPage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "instagram"]);
  const [date, setDate] = useState<Date>();

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      
      {/* Editor Section */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Post</h2>
          <p className="text-muted-foreground mt-1">Compose and schedule content across your platforms.</p>
        </div>

        {/* Platform Selection */}
        <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Select Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? `${platform.color} shadow-md`
                      : `bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`
                  }`}
                >
                  <span className="font-bold">{platform.icon}</span>
                  {platform.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Composer */}
        <Card className="border-0 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex flex-col flex-1">
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with your audience?"
              className="flex-1 border-0 rounded-none resize-none bg-transparent focus-visible:ring-0 text-lg p-6 min-h-[250px]"
            />
            
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full">
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full">
                  <Smile className="w-5 h-5" />
                </Button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full">
                  <Hash className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-full group relative">
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="absolute -top-8 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">AI Writer</span>
                </Button>
              </div>
              
              <div className="text-xs font-medium text-slate-400">
                <span className={content.length > 280 ? "text-rose-500" : ""}>{content.length}</span> / 280
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publish Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-white dark:bg-slate-900",
                      !date && "text-muted-foreground"
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Schedule for later</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
            
            {date && (
              <Button variant="ghost" size="icon" className="text-slate-500" onClick={() => setDate(undefined)}>
                <span className="sr-only">Clear date</span>
                &times;
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none">Save Draft</Button>
            <Button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
              {date ? <><Clock className="w-4 h-4 mr-2" /> Schedule</> : <><Send className="w-4 h-4 mr-2" /> Publish Now</>}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 px-1">Live Preview</h3>
        
        <Tabs defaultValue="twitter" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>
          
          <TabsContent value="twitter" className="mt-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4 pt-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                    <div>
                      <p className="text-sm font-bold leading-none">SocialFlow <span className="font-normal text-slate-500">@socialflow &middot; 1m</span></p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-slate-500" />
                </div>
                
                <p className="text-sm whitespace-pre-wrap font-normal" style={{ wordBreak: 'break-word' }}>
                  {content || "Your amazing tweet will appear here..."}
                </p>

                <div className="flex items-center justify-between text-slate-500 mt-4 max-w-md">
                  <MessageCircle className="w-[18px] h-[18px]" />
                  <div className="flex items-center gap-1.5"><Share className="w-[18px] h-[18px]" /></div>
                  <div className="flex items-center gap-1.5"><Heart className="w-[18px] h-[18px]" /></div>
                  <div className="flex items-center gap-1.5"><svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg></div>
                  <div className="flex items-center gap-1.5"><Bookmark className="w-[18px] h-[18px]" /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="instagram" className="mt-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm max-w-[350px] mx-auto">
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                     <div className="w-full h-full bg-white dark:bg-black rounded-full"></div>
                  </div>
                  <p className="text-sm font-semibold">socialflow</p>
                </div>
                <MoreHorizontal className="w-5 h-5" />
              </CardHeader>
              <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Heart className="w-6 h-6" />
                    <MessageCircle className="w-6 h-6" style={{ transform: "scaleX(-1)" }} />
                    <Send className="w-6 h-6" />
                  </div>
                  <Bookmark className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">1,024 likes</p>
                <p className="text-sm"><span className="font-semibold">socialflow</span> {content || "Caption goes here..."}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
