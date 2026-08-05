"use client";

import { useState } from "react";
import { 
  Search, Filter, MoreVertical, Play, Send, Image as ImageIcon, 
  Smile, Paperclip, Plus, Check, MessageCircle, Heart, Share2, Bookmark, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// --- TYPES ---
type Platform = 'instagram' | 'twitter' | 'linkedin' | 'facebook';
type ConversationStatus = 'unresolved' | 'resolved';

interface Message {
  id: string;
  sender: 'user' | 'me';
  content: string;
  timestamp: string;
}

interface PostPreview {
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  caption: string;
  likes: string;
  comments: string;
}

interface Conversation {
  id: string;
  user: {
    username: string;
    initials: string;
    colorClass: string;
  };
  platform: Platform;
  lastMessage: string;
  timestamp: string;
  isUnread: boolean;
  status: ConversationStatus;
  postPreview: PostPreview;
  messages: Message[];
}

// --- MOCK DATA ---
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    user: { username: 'durvita_chauhan', initials: 'DU', colorClass: 'bg-blue-500' },
    platform: 'instagram',
    lastMessage: '🔥🔥',
    timestamp: 'Jan 12, 2026 5:11 PM',
    isUnread: true,
    status: 'unresolved',
    postPreview: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      thumbnail: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      caption: '2v2 Rally 🏸🏸...',
      likes: '12.4K',
      comments: '342'
    },
    messages: [
      { id: 'm1', sender: 'user', content: '🔥🔥', timestamp: 'Jan 12, 2026 5:11 PM' }
    ]
  },
  {
    id: 'c2',
    user: { username: 'sparringplayer', initials: 'SP', colorClass: 'bg-slate-400' },
    platform: 'instagram',
    lastMessage: '👏🔥',
    timestamp: 'Jan 12, 2026 5:41 PM',
    isUnread: false,
    status: 'unresolved',
    postPreview: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
      thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
      caption: 'Game day preparation',
      likes: '8.1K',
      comments: '120'
    },
    messages: [
      { id: 'm1', sender: 'user', content: '👏🔥', timestamp: 'Jan 12, 2026 5:41 PM' }
    ]
  },
  {
    id: 'c3',
    user: { username: 'shubhampu...', initials: 'SH', colorClass: 'bg-blue-600' },
    platform: 'instagram',
    lastMessage: 'Woahhhh ... such a sharp smash !!!!',
    timestamp: 'Jan 12, 2026 3:29 PM',
    isUnread: true,
    status: 'unresolved',
    postPreview: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      thumbnail: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      caption: '2v2 Rally 🏸🏸...',
      likes: '12.4K',
      comments: '342'
    },
    messages: [
      { id: 'm1', sender: 'user', content: 'Woahhhh ... such a sharp smash !!!!', timestamp: 'Jan 12, 2026 3:29 PM' }
    ]
  },
  {
    id: 'c4',
    user: { username: 'jashankzamboj', initials: 'JA', colorClass: 'bg-emerald-500' },
    platform: 'instagram',
    lastMessage: '🔥🔥🔥🔥🔥🔥',
    timestamp: 'Jan 11, 2026 10:18 PM',
    isUnread: false,
    status: 'unresolved',
    postPreview: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      thumbnail: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      caption: '2v2 Rally 🏸🏸...',
      likes: '12.4K',
      comments: '342'
    },
    messages: [
      { id: 'm1', sender: 'user', content: '🔥🔥🔥🔥🔥🔥', timestamp: 'Jan 11, 2026 10:18 PM' }
    ]
  },
  {
    id: 'c5',
    user: { username: 'priyanshjain_23', initials: 'PR', colorClass: 'bg-pink-500' },
    platform: 'instagram',
    lastMessage: '🙌🙌',
    timestamp: 'Jan 11, 2026 4:43 PM',
    isUnread: false,
    status: 'unresolved',
    postPreview: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      thumbnail: 'https://images.unsplash.com/photo-1628198733230-22c60c6d59b2?auto=format&fit=crop&q=80&w=600',
      caption: '2v2 Rally 🏸🏸...',
      likes: '12.4K',
      comments: '342'
    },
    messages: [
      { id: 'm1', sender: 'user', content: '🙌🙌', timestamp: 'Jan 11, 2026 4:43 PM' }
    ]
  }
];


// --- COMPONENT ---
export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'unresolved' | 'unread' | 'all'>('unread');
  const [activePlatform, setActivePlatform] = useState<Platform | 'all'>('instagram');
  const [activeConvId, setActiveConvId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [replyText, setReplyText] = useState("");

  const activeConv = MOCK_CONVERSATIONS.find(c => c.id === activeConvId);

  // Filter conversations based on tab and platform
  const filteredConvs = MOCK_CONVERSATIONS.filter(c => {
    if (activePlatform !== 'all' && c.platform !== activePlatform) return false;
    if (activeTab === 'unread') return c.isUnread;
    if (activeTab === 'unresolved') return c.status === 'unresolved';
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-160px)] w-full bg-slate-50 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      
      {/* LEFT SIDEBAR: Conversation List */}
      <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0">
        
        {/* Brand Selector Header */}
        <div className="p-4 border-b border-slate-200 flex justify-center items-center">
          <DropdownMenu>
            <DropdownMenuTrigger 
              className="flex items-center gap-2 hover:bg-slate-100 text-slate-700 rounded-full px-4 py-2 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {activePlatform === 'instagram' && <InstagramIcon className="w-5 h-5 text-pink-500" />}
              {activePlatform === 'facebook' && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-xs italic">f</div>}
              {activePlatform === 'twitter' && <div className="w-5 h-5 bg-black flex items-center justify-center text-white font-black text-[10px] rounded-sm">X</div>}
              {activePlatform === 'linkedin' && <div className="w-5 h-5 bg-[#0A66C2] rounded-sm flex items-center justify-center text-white font-bold text-xs">in</div>}
              {activePlatform === 'all' && <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-[10px]">ALL</div>}
              <span className="font-bold capitalize">{activePlatform}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-xl shadow-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Platform</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActivePlatform('all')} className="cursor-pointer font-semibold py-2">
                  <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-[10px] mr-3">ALL</div>
                  All Platforms
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePlatform('instagram')} className="cursor-pointer font-semibold py-2">
                  <InstagramIcon className="w-5 h-5 text-pink-500 mr-3" />
                  Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePlatform('facebook')} className="cursor-pointer font-semibold py-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-xs italic mr-3">f</div>
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePlatform('twitter')} className="cursor-pointer font-semibold py-2">
                  <div className="w-5 h-5 bg-black flex items-center justify-center text-white font-black text-[10px] rounded-sm mr-3">X</div>
                  Twitter (X)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePlatform('linkedin')} className="cursor-pointer font-semibold py-2">
                  <div className="w-5 h-5 bg-[#0A66C2] rounded-sm flex items-center justify-center text-white font-bold text-xs mr-3">in</div>
                  LinkedIn
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Connect New</DropdownMenuLabel>
                
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-brand-modal', { detail: { title: 'Instagram' } }))} className="cursor-pointer text-slate-500 hover:text-slate-900 py-2">
                  <Plus className="w-4 h-4 mr-3" />
                  Connect Instagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-brand-modal', { detail: { title: 'Facebook' } }))} className="cursor-pointer text-slate-500 hover:text-slate-900 py-2">
                  <Plus className="w-4 h-4 mr-3" />
                  Connect Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('open-brand-modal', { detail: { title: 'LinkedIn' } }))} className="cursor-pointer text-slate-500 hover:text-slate-900 py-2">
                  <Plus className="w-4 h-4 mr-3" />
                  Connect LinkedIn
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        {/* Search & Filter */}
        <div className="p-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversation..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('unresolved')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider relative ${activeTab === 'unresolved' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Unresolved
            {activeTab === 'unresolved' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider relative ${activeTab === 'unread' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Unread
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-3 right-6"></div>
            {activeTab === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider relative ${activeTab === 'all' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></div>}
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => setActiveConvId(conv.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex gap-3 relative group ${activeConvId === conv.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${conv.user.colorClass}`}>
                  {conv.user.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <InstagramIcon className="w-2.5 h-2.5 text-pink-500" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className={`text-sm truncate pr-2 ${conv.isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {conv.user.username}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">{conv.timestamp}</span>
                </div>
                <div className="flex items-start gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className={`text-xs truncate ${conv.isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                    {conv.lastMessage}
                  </p>
                </div>
              </div>

              {/* Checkmark icon for unresolved */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 shadow-sm">
                   <Check className="w-3.5 h-3.5" />
                 </button>
              </div>

            </div>
          ))}
          {filteredConvs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Active Thread View */}
      <div className="flex-1 flex flex-col bg-white">
        
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${activeConv.user.colorClass}`}>
                  {activeConv.user.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">{activeConv.user.username}</h3>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    <MessageCircle className="w-3 h-3" /> Comment
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Thread Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              
              {/* Post Preview Card */}
              <div className="max-w-[340px] w-full bg-black rounded-2xl overflow-hidden shadow-lg mb-8 relative border border-slate-200 group">
                <div className="relative aspect-[9/16] bg-slate-900 flex items-center justify-center">
                  <img src={activeConv.postPreview.thumbnail} alt="Post preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  
                  {/* Play Button Overlay for Videos */}
                  {activeConv.postPreview.type === 'video' && (
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors z-10 border border-white/30 shadow-xl">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  )}

                  {/* Post Stats Overlay */}
                  <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white">
                     <div className="flex flex-col items-center gap-1">
                       <Heart className="w-7 h-7 hover:text-pink-500 cursor-pointer transition-colors" />
                       <span className="text-xs font-bold drop-shadow-md">{activeConv.postPreview.likes}</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                       <MessageCircle className="w-7 h-7 hover:text-slate-300 cursor-pointer transition-colors" />
                       <span className="text-xs font-bold drop-shadow-md">{activeConv.postPreview.comments}</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                       <Share2 className="w-7 h-7 hover:text-slate-300 cursor-pointer transition-colors" />
                       <span className="text-xs font-bold drop-shadow-md">0</span>
                     </div>
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-600 overflow-hidden border border-white">
                         <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Me" />
                       </div>
                       <span className="text-sm font-bold text-white drop-shadow-md">vaasu_31</span>
                     </div>
                     <p className="text-xs text-white/90 drop-shadow-md line-clamp-2">{activeConv.postPreview.caption}</p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="w-full max-w-[600px] flex flex-col gap-6">
                {activeConv.messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${msg.sender === 'user' ? activeConv.user.colorClass : 'bg-indigo-600'}`}>
                      {msg.sender === 'user' ? activeConv.user.initials : 'ME'}
                    </div>
                    <div className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                        msg.sender === 'me' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' 
                          : 'bg-indigo-50/80 border border-indigo-100 text-slate-800 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 mt-1.5 ml-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Reply Composer */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="max-w-[800px] mx-auto border border-slate-200 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden flex flex-col">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to comment..." 
                  className="w-full p-4 min-h-[80px] resize-none focus:outline-none text-sm text-slate-700 bg-transparent"
                ></textarea>
                <div className="flex items-center justify-between p-3 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-200/50 hover:text-slate-600">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-200/50 hover:text-slate-600">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-slate-200/50 hover:text-slate-600">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400">{replyText.length}/2200</span>
                    <Button 
                      className={`rounded-full shadow-sm font-bold gap-2 ${replyText.length > 0 ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      Send <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-medium">Select a conversation to view thread</p>
          </div>
        )}

      </div>
    </div>
  );
}
