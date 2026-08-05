"use client";

import { useState } from "react";
import { 
  UploadCloud, 
  FolderPlus, 
  Filter, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Trash, 
  Download,
  Image as ImageIcon,
  Video,
  FileBox,
  CheckCircle2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const mockFolders = [
  { id: 1, name: "Campaign Assets", count: 24, type: "folder" },
  { id: 2, name: "Instagram Reels", count: 12, type: "folder" },
  { id: 3, name: "Product Shots", count: 85, type: "folder" },
  { id: 4, name: "Logos & Branding", count: 5, type: "folder" },
];

const mockMedia = [
  { id: 1, type: "image", url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80", name: "social-promo.jpg", size: "2.4 MB", date: "Oct 24, 2026" },
  { id: 2, type: "video", url: "https://images.unsplash.com/photo-1518131672697-613bc04afd4d?w=500&q=80", name: "launch-teaser.mp4", size: "14.2 MB", date: "Oct 22, 2026" },
  { id: 3, type: "image", url: "https://images.unsplash.com/photo-1552508744-1696d4464960?w=500&q=80", name: "team-photo.png", size: "4.1 MB", date: "Oct 20, 2026" },
  { id: 4, type: "image", url: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=500&q=80", name: "blog-header.jpg", size: "1.2 MB", date: "Oct 18, 2026" },
  { id: 5, type: "image", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80", name: "setup-desk.jpg", size: "3.5 MB", date: "Oct 15, 2026" },
  { id: 6, type: "image", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80", name: "analytics-graph.png", size: "800 KB", date: "Oct 12, 2026" },
];

export default function MediaLibraryPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSelect = (id: number) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col md:flex-row gap-6">
      {/* Left Sidebar - Folders */}
      <Card className="w-full md:w-64 flex-shrink-0 p-4 border-0 shadow-lg shadow-indigo-500/5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileBox className="w-5 h-5 text-indigo-500" />
            Library
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FolderPlus className="w-4 h-4 text-slate-500" />
          </Button>
        </div>

        <div className="space-y-1 overflow-y-auto pr-2 no-scrollbar">
          <Button variant="secondary" className="w-full justify-start font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            <Grid className="w-4 h-4 mr-3" />
            All Media
            <Badge variant="secondary" className="ml-auto bg-white/50 dark:bg-black/20">142</Badge>
          </Button>
          
          <div className="pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Folders
          </div>
          
          {mockFolders.map((folder) => (
            <Button key={folder.id} variant="ghost" className="w-full justify-start font-normal text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <FolderPlus className="w-4 h-4 mr-3 text-slate-400" />
              {folder.name}
              <span className="ml-auto text-xs text-slate-400">{folder.count}</span>
            </Button>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <Card className="bg-indigo-50/50 dark:bg-indigo-500/5 border-dashed border-indigo-200 dark:border-indigo-500/20 p-4 text-center">
            <div className="mx-auto w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-2">
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="text-sm font-medium mb-1">Storage used</h4>
            <p className="text-xs text-muted-foreground mb-3">4.2 GB of 10 GB</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "42%" }}></div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search media..." 
              className="pl-9 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button 
                variant={view === "grid" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-8 px-2 shadow-none ${view === "grid" ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                onClick={() => setView("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                variant={view === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-8 px-2 shadow-none ${view === "list" ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                onClick={() => setView("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Action Bar when items selected */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelected([])}>
                  <X className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  {selected.length} items selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 h-8">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="destructive" size="sm" className="h-8">
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag and Drop Zone */}
        <div 
          className={`flex-1 overflow-y-auto rounded-xl border-2 border-dashed transition-all duration-200 ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' 
              : 'border-transparent'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          <div className={`grid gap-4 ${
            view === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {mockMedia.map((media, i) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className={`group relative overflow-hidden border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selected.includes(media.id) ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => toggleSelect(media.id)}
                >
                  <div className={`${view === 'grid' ? 'aspect-square' : 'h-16 flex items-center'} relative bg-slate-100 dark:bg-slate-800 overflow-hidden`}>
                    {/* Image Thumbnail */}
                    <img 
                      src={media.url} 
                      alt={media.name} 
                      className={`object-cover ${view === 'grid' ? 'w-full h-full' : 'w-16 h-16'} transition-transform duration-500 group-hover:scale-105`} 
                    />
                    
                    {/* Select Indicator */}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selected.includes(media.id) 
                        ? 'bg-indigo-500 text-white opacity-100' 
                        : 'bg-white/50 backdrop-blur-sm text-transparent opacity-0 group-hover:opacity-100 border border-white'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    {/* Media Type Icon */}
                    <div className="absolute top-2 right-2 w-6 h-6 rounded bg-black/40 backdrop-blur-md flex items-center justify-center text-white">
                      {media.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    </div>

                    {/* Action Menu (Grid view) */}
                    {view === 'grid' && (
                      <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded bg-black/40 backdrop-blur-md text-white hover:bg-black/60">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 ${view === 'list' ? 'flex-1 flex justify-between items-center absolute inset-0 left-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl' : 'bg-white dark:bg-slate-900'}`}>
                    <div className={view === 'list' ? 'pl-4' : ''}>
                      <p className="text-sm font-medium truncate max-w-full" title={media.name}>{media.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{media.size}</p>
                    </div>
                    {view === 'list' && (
                      <div className="flex items-center gap-4 pr-4">
                        <span className="text-xs text-muted-foreground">{media.date}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Empty Drop Zone Indicator */}
            {isDragging && (
              <div className="col-span-full h-48 border-2 border-dashed border-indigo-400 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-500">
                <UploadCloud className="w-8 h-8 mb-2 animate-bounce" />
                <p className="font-medium">Drop files here to upload</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
