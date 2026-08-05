import { format, parseISO } from "date-fns";
import { Globe, MessageCircle, Briefcase, Camera, PlayCircle, Play as Youtube, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NETWORK_META: Record<string, { color: string, icon: any }> = {
  'Instagram': { color: "text-pink-500", icon: Camera },
  'Facebook': { color: "text-[#1877F2]", icon: Globe },
  'TikTok': { color: "text-slate-800", icon: PlayCircle },
  'YouTube': { color: "text-red-500", icon: Youtube },
  'LinkedIn': { color: "text-[#0A66C2]", icon: Briefcase },
  'Twitter': { color: "text-black", icon: MessageCircle },
};

interface ListViewProps {
  posts: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ListView({ posts, onEdit, onDelete }: ListViewProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 py-20 bg-white rounded-2xl border border-slate-100">
        No posts found. Create one to get started!
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
              <th className="px-6 py-4 font-bold tracking-wider">Account</th>
              <th className="px-6 py-4 font-bold tracking-wider">Content</th>
              <th className="px-6 py-4 font-bold tracking-wider">Date & Time</th>
              <th className="px-6 py-4 font-bold tracking-wider">Status</th>
              <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                      <div className={`p-1.5 rounded-md bg-slate-100 ${meta.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-700">{post.network}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                    {post.account_name || <span className="text-slate-400 italic">No account</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="line-clamp-2 max-w-md">
                      {post.content || <span className="text-slate-400 italic">Media only</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {displayDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className={post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {post.status || (isScheduled ? 'Scheduled' : 'Published')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(post.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(post.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
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
