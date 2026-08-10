"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, Heart, Eye,
  RefreshCw, FileText
} from "lucide-react";
import { getAccounts, type SocialAccount } from "@/app/actions/accounts";
import { getThreadsContent, type ThreadPost } from "@/app/actions/content";
import React from "react";

const NETWORK_COLORS: Record<string, string> = {
  'Instagram': '#E1306C',
  'Facebook': '#1877F2',
  'Twitter': '#000000',
  'LinkedIn': '#0A66C2',
  'TikTok': '#0f172a',
  'YouTube': '#ef4444',
  'Threads': '#000000'
};

export default function ContentHistoryPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    const brandId = localStorage.getItem("activeBrandId");
    if (brandId) {
      const data = await getAccounts(brandId);
      // Filter for Threads only for now since we only implemented Threads content history
      const threadsAccounts = (data || []).filter(acc => acc.network === 'Threads');
      
      if (threadsAccounts.length > 0) {
        setAccounts(threadsAccounts);
        if (!activeAccount) setActiveAccount(threadsAccounts[0].id);
      } else {
        setAccounts([]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAccounts();
    const handleBrandChange = () => loadAccounts();
    window.addEventListener('brand-changed', handleBrandChange);
    return () => window.removeEventListener('brand-changed', handleBrandChange);
  }, []);

  useEffect(() => {
    if (activeAccount) {
      loadContent(activeAccount);
    }
  }, [activeAccount]);

  const loadContent = async (accountId: string) => {
    setIsContentLoading(true);
    setError(null);
    
    try {
      const data = await getThreadsContent(accountId);
      if (data.error) {
        setError(data.error);
        setPosts([]);
      } else {
        setPosts(data.posts);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load content");
    } finally {
      setIsContentLoading(false);
    }
  };

  const activeAccObj = accounts.find(a => a.id === activeAccount);
  const brandColor = activeAccObj ? NETWORK_COLORS[activeAccObj.network] || '#4f46e5' : '#4f46e5';

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Content History</h1>
          <p className="text-slate-500 font-medium mt-1">Review your past posts and read real comments directly from the platform.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
             <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Threads Accounts Found</h3>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Please connect a Threads account in the sidebar to view your content history.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Account Selector */}
          <div className="flex flex-wrap gap-2">
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => setActiveAccount(acc.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all flex items-center gap-2 ${
                  activeAccount === acc.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                @{acc.account_handle}
              </button>
            ))}
          </div>

          {/* Content Area */}
          {isContentLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
              <FileText className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-sm">Failed to load content: {error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200/50 shadow-inner">
                 <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Posts Yet!</h3>
              <p className="text-slate-500 font-medium max-w-md text-sm leading-relaxed">
                It looks like <span className="font-bold text-slate-700">@{activeAccObj?.account_handle}</span> hasn't published any posts on Threads yet. Once you make a post, it will automatically appear here along with its comments and analytics!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  {post.media_url && (
                    <div className="w-full h-48 bg-slate-100 border-b border-slate-100 overflow-hidden relative group">
                      {post.media_type === 'VIDEO' ? (
                        <video src={post.media_url} className="w-full h-full object-cover" controls={false} />
                      ) : (
                        <img src={post.media_url} alt="Post media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                  )}
                  
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-slate-800 font-medium text-sm leading-relaxed mb-4 line-clamp-4">{post.text}</p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 hover:text-pink-600 transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-4 h-4" /> {post.replies.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                          <Eye className="w-4 h-4" /> {post.views.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comments ({post.comments.length})</h4>
                        {post.comments.length === 0 ? (
                          <p className="text-xs font-medium text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">No comments on this post yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="bg-slate-50/80 p-3 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                <p className="text-xs font-bold text-slate-900 mb-1">@{comment.username}</p>
                                <p className="text-xs font-medium text-slate-600">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 flex justify-between items-center text-[11px] font-bold text-slate-400">
                         <span>{new Date(post.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                         <a href={post.permalink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline">View on Threads &rarr;</a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
