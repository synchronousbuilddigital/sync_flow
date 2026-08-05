import { format, parseISO } from "date-fns";
import { Globe, MessageCircle, Briefcase, Camera, PlayCircle, Play as Youtube, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NETWORK_META: Record<string, { color: string, icon: any }> = {
  'Instagram': { color: "text-pink-500", icon: Camera },
  'Facebook': { color: "text-[#1877F2]", icon: Globe },
  'TikTok': { color: "text-slate-800", icon: PlayCircle },
  'YouTube': { color: "text-red-500", icon: Youtube },
  'LinkedIn': { color: "text-[#0A66C2]", icon: Briefcase },
  'Twitter': { color: "text-black", icon: MessageCircle },
};

interface DeletedViewProps {
  posts: any[];
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}

export function DeletedView({ posts, onRestore, onHardDelete }: DeletedViewProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-32 bg-white rounded-2xl border border-slate-100 mx-6 mt-4 shadow-sm">
        <Trash2 className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-slate-600">Trash is empty</h3>
        <p className="text-sm">Deleted posts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mx-6 mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold tracking-wider">Network</th>
              <th className="px-6 py-4 font-bold tracking-wider">Content</th>
              <th className="px-6 py-4 font-bold tracking-wider">Date & Time</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 opacity-70">
            {posts.map((post) => {
              const meta = NETWORK_META[post.network] || { color: 'text-slate-500', icon: Globe };
              const Icon = meta.icon;
              
              const isScheduled = !!post.scheduled_timestamp;
              let displayDate = "Now";
              if (isScheduled) {
                displayDate = format(parseISO(post.scheduled_timestamp), "MMM d, yyyy 'at' h:mm a");
              }

              return (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-md bg-slate-100 ${meta.color} grayscale`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-500">{post.network}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="line-clamp-2 max-w-md">
                      {post.content || <span className="text-slate-400 italic">Media only</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {displayDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onRestore(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button 
                        onClick={() => onHardDelete(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
