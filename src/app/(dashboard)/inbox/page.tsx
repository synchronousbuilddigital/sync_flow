"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, Play, Send, Image as ImageIcon, 
  Smile, Paperclip, Check, MessageCircle, Heart, Share2, ChevronDown, Globe
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
import { getAccounts, type SocialAccount } from "@/app/actions/accounts";
import React from "react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full flex items-center justify-center text-white font-serif font-bold italic ${className || 'w-5 h-5 bg-blue-600 text-xs'}`}>f</div>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center text-white font-black rounded-sm ${className || 'w-5 h-5 bg-black text-[10px]'}`}>X</div>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-sm flex items-center justify-center text-white font-bold ${className || 'w-5 h-5 bg-[#0A66C2] text-xs'}`}>in</div>
);

const NETWORK_ICONS: Record<string, any> = {
  'Instagram': InstagramIcon,
  'Facebook': FacebookIcon,
  'Twitter': TwitterIcon,
  'LinkedIn': LinkedinIcon,
  'TikTok': Play,
  'YouTube': Play,
  'Threads': TwitterIcon
};

// --- TYPES ---
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
  network: string;
  lastMessage: string;
  timestamp: string;
  isUnread: boolean;
  status: ConversationStatus;
  postPreview: PostPreview;
  messages: Message[];
}

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'unresolved' | 'unread' | 'all'>('all');
  const [activeAccount, setActiveAccount] = useState<string | 'all'>('all');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = async () => {
    const brandId = localStorage.getItem("activeBrandId");
    if (brandId) {
      const data = await getAccounts(brandId);
      if (data) setAccounts(data);
    } else {
      setAccounts([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccounts();
    
    // Listen for custom event when brand changes
    const handleBrandChange = () => {
      loadAccounts();
    };
    
    window.addEventListener('brand-changed', handleBrandChange);
    return () => window.removeEventListener('brand-changed', handleBrandChange);
  }, []);

  // Currently we do not fetch real live DMs, so the list starts empty.
  const filteredConvs: Conversation[] = [];
  const activeConv = filteredConvs.find(c => c.id === activeConvId);

  const activeAccountData = accounts.find(a => a.account_handle === activeAccount);

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
              {activeAccount === 'all' ? (
                <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-[10px]">ALL</div>
              ) : activeAccountData ? (
                React.createElement(NETWORK_ICONS[activeAccountData.network] || Globe, { className: 'w-5 h-5' })
              ) : (
                <Globe className="w-5 h-5 text-slate-400" />
              )}
              
              <span className="font-bold truncate max-w-[120px]">
                {activeAccount === 'all' ? 'All Accounts' : activeAccount}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 rounded-xl shadow-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveAccount('all')} className="cursor-pointer font-semibold py-2">
                  <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-[10px] mr-3">ALL</div>
                  All Accounts
                </DropdownMenuItem>
                
                {accounts.map(acc => (
                  <DropdownMenuItem key={acc.id} onClick={() => setActiveAccount(acc.account_handle)} className="cursor-pointer font-semibold py-2">
                    <div className="mr-3">
                      {React.createElement(NETWORK_ICONS[acc.network] || Globe, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm">{acc.account_handle}</span>
                      <span className="text-[10px] text-slate-400">{acc.network}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                
                {accounts.length === 0 && !isLoading && (
                   <div className="px-2 py-3 text-xs text-slate-500 text-center">No accounts connected</div>
                )}
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
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-3 right-6 hidden"></div>
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
              <div className="relative shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${conv.user.colorClass}`}>
                  {conv.user.initials}
                </div>
              </div>

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
            </div>
          ))}
          {filteredConvs.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
               <MessageCircle className="w-12 h-12 mb-3 text-slate-300" />
               <p className="text-sm font-bold text-slate-700">Inbox is empty</p>
               <p className="text-xs mt-1 max-w-[200px] mx-auto text-slate-400">No live messages found for {activeAccount === 'all' ? 'any account' : activeAccount}.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN AREA: Active Thread View */}
      <div className="flex-1 flex flex-col bg-white">
        
        {activeConv ? (
          <>
             {/* We omit rendering since filteredConvs is empty, but this structure remains for future real data */}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <MessageCircle className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Conversation Selected</h3>
            <p className="font-medium text-sm text-slate-500 max-w-[300px] text-center">
               Live messaging requires a connected business account with messaging permissions.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
