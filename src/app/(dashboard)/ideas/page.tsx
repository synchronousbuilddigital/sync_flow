"use client";

import React, { useState, useRef } from "react";
import { Plus, MoreHorizontal, MessageSquare, Image as ImageIcon, Camera, Globe, Briefcase, PlayCircle, Play as Youtube, X, Send, Sparkles, Bot, Check, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getIdeas, addIdea, updateIdeaColumn, Idea as DBIdea } from "@/app/actions/ideas";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ColumnId = string;

interface Idea {
  id: string;
  columnId: ColumnId;
  title: string;
  description?: string;
  network?: 'Instagram' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube';
}

const NETWORKS = {
  Instagram: { icon: Camera, color: "text-pink-500 bg-pink-50" },
  Facebook: { icon: Globe, color: "text-blue-600 bg-blue-50" },
  LinkedIn: { icon: Briefcase, color: "text-sky-600 bg-sky-50" },
  Twitter: { icon: MessageSquare, color: "text-black bg-slate-100" },
  TikTok: { icon: PlayCircle, color: "text-slate-800 bg-slate-100" },
  YouTube: { icon: Youtube, color: "text-red-500 bg-red-50" },
};

const INITIAL_IDEAS: Idea[] = [
  {
    id: "idea-1",
    columnId: "unassigned",
    title: "This is a place to plan your content",
    description: "Save your ideas before converting them into posts. Brainstorm, plan ahead, and collaborate.",
    network: "Instagram"
  },
  {
    id: "idea-2",
    columnId: "unassigned",
    title: "Save inspirations you find online",
    description: "Use browser extensions to save ideas from the web. Highlight text and save it instantly.",
    network: "LinkedIn"
  },
  {
    id: "idea-3",
    columnId: "todo",
    title: "Product Launch Teaser",
    description: "Draft 3 quick teaser videos for the upcoming summer collection launch.",
    network: "TikTok"
  }
];

const INITIAL_COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'unassigned', title: 'Unassigned' },
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

export default function IdeasBoardPage() {
  const [columns, setColumns] = useState<{ id: string; title: string }[]>(INITIAL_COLUMNS);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  React.useEffect(() => {
    const loadIdeas = async () => {
      const brandId = localStorage.getItem("activeBrandId");
      if (!brandId) {
        setIdeas([]);
        setActiveBrandId(null);
        return;
      }
      setActiveBrandId(brandId);
      const data = await getIdeas(brandId);
      if (data) {
        setIdeas(data.map(d => ({
          id: d.id,
          columnId: d.column_id,
          title: d.title,
          description: d.description || undefined,
          network: d.network as any || undefined
        })));
      }
    };

    loadIdeas();
    
    const onBrandChanged = () => loadIdeas();
    window.addEventListener("brandChanged", onBrandChanged);
    return () => window.removeEventListener("brandChanged", onBrandChanged);
  }, []);
  const [draggedIdeaId, setDraggedIdeaId] = useState<string | null>(null);
  const clickStartPosRef = useRef({ x: 0, y: 0 });

  // Add Group State
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      setIsAddingGroup(false);
      return;
    }
    const newCol = {
      id: `col-${Date.now()}`,
      title: newGroupName.trim()
    };
    setColumns([...columns, newCol]);
    setNewGroupName("");
    setIsAddingGroup(false);
  };

  // New Idea Input State
  const [addingToColumn, setAddingToColumn] = useState<ColumnId | null>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");

  // Editing Idea State
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  const handleSaveEdit = () => {
    if (!editingIdea) return;
    setIdeas(prev => prev.map(i => i.id === editingIdea.id ? editingIdea : i));
    setEditingIdea(null);
    toast.success("Idea updated!");
  };

  // AI Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [aiDesigns, setAiDesigns] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSubmit = async () => {
    if (!aiChatInput.trim() || isAiLoading) return;
    
    const userMsg = aiChatInput;
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiChatInput("");
    setIsAiLoading(true);
    setAiDesigns([]);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      
      if (data.reply) {
        setAiMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      }
      if (data.designs) {
        setAiDesigns(data.designs);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to AI");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddAiIdeaToBoard = (design: any) => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      columnId: 'unassigned',
      title: design.caption.split('\\n')[0].substring(0, 40) + '...',
      description: design.caption,
      network: design.network as any
    };
    setIdeas([...ideas, newIdea]);
    toast.success("Idea added to Unassigned column!");
  };

  const handleDragStart = (e: React.DragEvent, ideaId: string) => {
    // Required for Firefox
    e.dataTransfer.setData("text/plain", ideaId);
    e.dataTransfer.effectAllowed = "move";
    
    // Defer state update to avoid Safari/Chrome drag cancellation
    setTimeout(() => {
      setDraggedIdeaId(ideaId);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedIdeaId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData("text/plain") || draggedIdeaId;
    if (!ideaId) return;

    // Optimistic update
    setIdeas(prev => 
      prev.map(idea => 
        idea.id === ideaId ? { ...idea, columnId } : idea
      )
    );
    setDraggedIdeaId(null);
    
    // DB Update
    if (!ideaId.startsWith("temp-")) {
       await updateIdeaColumn(ideaId, columnId);
    }
  };

  const handleAddIdea = async (columnId: ColumnId) => {
    if (!newIdeaTitle.trim() || !activeBrandId) {
      setAddingToColumn(null);
      if (!activeBrandId) toast.error("Please select a brand first.");
      return;
    }
    
    const title = newIdeaTitle;
    setNewIdeaTitle("");
    setAddingToColumn(null);
    
    const res = await addIdea(activeBrandId, title);
    if (res.success && res.data) {
      const d = res.data;
      setIdeas(prev => [...prev, {
        id: d.id,
        columnId: d.column_id,
        title: d.title,
        description: d.description || undefined,
        network: d.network as any || undefined
      }]);
      // If added to a specific column and not unassigned, update it immediately
      if (columnId !== 'unassigned') {
        await updateIdeaColumn(d.id, columnId);
        setIdeas(prev => prev.map(i => i.id === d.id ? { ...i, columnId } : i));
      }
    } else {
      toast.error("Failed to save idea to database.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden bg-[#F8FAFC] relative rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200">
      
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/50">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ideas Board</h1>
            <p className="text-slate-500 text-sm">Brainstorm and organize your content pipeline</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            className="font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all"
            onClick={() => setIsAiOpen(true)}
          >
            Generate Ideas ✨
          </Button>
          <Button className="font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md" onClick={() => setAddingToColumn('unassigned')}>
            <Plus className="w-4 h-4 mr-2" /> New Idea
          </Button>
        </div>
      </div>

      {/* Board Scroll Area */}
      <div className="flex-1 overflow-x-auto p-8">
        <div className="flex items-start gap-6 h-full min-w-max pb-8">
          
          {columns.map(column => {
            const columnIdeas = ideas.filter(i => i.columnId === column.id);

            return (
              <div 
                key={column.id}
                className="w-[320px] shrink-0 flex flex-col bg-slate-100/50 rounded-2xl border border-slate-200/80 max-h-full"
                onDragEnter={(e) => e.preventDefault()}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between shrink-0 border-b border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700">{column.title}</h3>
                    <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                      {columnIdeas.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-full">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {columnIdeas.map(idea => {
                    const NetworkIcon = idea.network ? NETWORKS[idea.network].icon : null;
                    const networkColor = idea.network ? NETWORKS[idea.network].color : "text-slate-400 bg-slate-100";

                    return (
                      <div
                        key={idea.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idea.id)}
                        onDragEnd={handleDragEnd}
                        onMouseDown={(e) => {
                          clickStartPosRef.current = { x: e.clientX, y: e.clientY };
                        }}
                        onMouseUp={(e) => {
                          const dx = Math.abs(e.clientX - clickStartPosRef.current.x);
                          const dy = Math.abs(e.clientY - clickStartPosRef.current.y);
                          if (dx < 5 && dy < 5) {
                            setEditingIdea(idea);
                          }
                        }}
                        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group ${
                          draggedIdeaId === idea.id ? 'opacity-50 scale-95' : 'opacity-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-700 transition-colors">
                            {idea.title}
                          </h4>
                          {NetworkIcon && (
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${networkColor}`}>
                              <NetworkIcon className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        
                        {idea.description && (
                          <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                            {idea.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <ImageIcon className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Draft</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Idea Input */}
                  {addingToColumn === column.id ? (
                    <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-sm ring-2 ring-indigo-500/20">
                      <Input
                        autoFocus
                        value={newIdeaTitle}
                        onChange={(e) => setNewIdeaTitle(e.target.value)}
                        placeholder="Enter idea title..."
                        className="h-8 text-sm bg-slate-50 border-slate-200 mb-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddIdea(column.id);
                          if (e.key === 'Escape') setAddingToColumn(null);
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => setAddingToColumn(null)}>Cancel</Button>
                        <Button size="sm" className="h-7 text-xs px-3 bg-orange-500 hover:bg-orange-600" onClick={() => handleAddIdea(column.id)}>Add</Button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setAddingToColumn(column.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-transparent border-dashed hover:border-orange-200"
                    >
                      <Plus className="w-4 h-4" /> New Idea
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* New Group Column Placeholder */}
          {isAddingGroup ? (
            <div className="w-[320px] shrink-0 h-[200px] flex flex-col items-center justify-center bg-white border border-indigo-200 shadow-sm rounded-2xl p-6">
              <Input
                autoFocus
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="bg-slate-50 border-slate-200 mb-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddGroup();
                  if (e.key === 'Escape') setIsAddingGroup(false);
                }}
              />
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsAddingGroup(false)}>Cancel</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleAddGroup}>Add</Button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsAddingGroup(true)}
              className="w-[320px] shrink-0 h-[200px] flex items-center justify-center bg-transparent border-2 border-dashed border-slate-300 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition-colors group"
            >
              <span className="font-bold text-slate-500 group-hover:text-indigo-600 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Group
              </span>
            </div>
          )}

        </div>
      </div>

      {/* AI Side Panel */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
              onClick={() => setIsAiOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[450px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">AI Ideas Generator</h3>
                    <p className="text-xs text-slate-500">Brainstorm with your assistant</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsAiOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {aiMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <Bot className="w-12 h-12 text-indigo-200 mb-4" />
                    <h4 className="font-bold text-slate-700 mb-2">What should we brainstorm?</h4>
                    <p className="text-sm text-slate-500">I can help you come up with viral concepts, engaging questions, or full content calendars.</p>
                  </div>
                )}
                
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {msg.role === 'user' ? <span className="text-xs font-bold">You</span> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-sm bg-white border border-slate-200 shadow-sm flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* AI Designs */}
                {aiDesigns.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {aiDesigns.map(design => (
                      <div key={design.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-colors">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
                              {design.network}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-4">{design.caption}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => handleAddAiIdeaToBoard(design)}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold border border-indigo-200 h-8"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add to Board
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                <div className="relative flex items-end gap-2">
                  <Textarea 
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Ask for an idea..."
                    className="min-h-[50px] max-h-[150px] resize-none pr-12 text-sm bg-white text-slate-900 border-slate-200 rounded-xl py-3 shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiSubmit();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAiSubmit}
                    disabled={isAiLoading || !aiChatInput.trim()}
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-lg p-0 bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Idea Dialog */}
      <Dialog open={!!editingIdea} onOpenChange={(open) => !open && setEditingIdea(null)}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white gap-0 border-slate-200 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-6 pr-8">
              <DialogTitle className="text-lg font-bold text-slate-800">Edit Idea</DialogTitle>
              <div className="flex items-center gap-2">
                <select 
                  className="h-8 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 px-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  value={editingIdea?.columnId || ''}
                  onChange={(e) => setEditingIdea(prev => prev ? { ...prev, columnId: e.target.value } : null)}
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
                <select
                  className="h-8 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 px-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  value={editingIdea?.network || ''}
                  onChange={(e) => setEditingIdea(prev => prev ? { ...prev, network: e.target.value as any } : null)}
                >
                  <option value="">No Network</option>
                  {Object.keys(NETWORKS).map(net => (
                    <option key={net} value={net}>{net}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col p-8 space-y-6 min-h-[350px]">
            <input 
              value={editingIdea?.title || ''} 
              onChange={(e) => setEditingIdea(prev => prev ? { ...prev, title: e.target.value } : null)}
              placeholder="Idea title..."
              autoFocus
              className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 p-0 outline-none bg-transparent"
            />
            
            <textarea 
              value={editingIdea?.description || ''} 
              onChange={(e) => setEditingIdea(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="What's your idea about? (Use this space to brainstorm, save links, or write drafts)"
              className="w-full text-base text-slate-600 placeholder:text-slate-400 border-none focus:ring-0 p-0 resize-none outline-none min-h-[140px] leading-relaxed bg-transparent"
            />

            <div className="flex gap-4 pt-4">
              <label className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast.success(`Attached file: ${file.name}`);
                      // Here you would upload to Cloudinary/AWS and save the URL
                    }
                  }} 
                />
                <ImageIcon className="w-6 h-6 mb-2 text-slate-300 group-hover:text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">Drag & drop<br/>or select a file</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-semibold h-9 px-3">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> AI Assistant
            </Button>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold h-9 px-4 hover:bg-slate-100" onClick={() => setEditingIdea(null)}>
                Cancel
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-6 shadow-sm" onClick={handleSaveEdit}>
                Save Idea
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
