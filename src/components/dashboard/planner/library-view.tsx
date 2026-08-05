import { FolderOpen, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LibraryViewProps {
  onOpenComposer: () => void;
}

export function LibraryView({ onOpenComposer }: LibraryViewProps) {
  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shadow-sm mx-6 mt-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Posts Library</h2>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Store your favorite post templates, reusable content, and media assets here. Keep your content organized and ready to publish at any time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 bg-white shadow-sm">
            <Filter className="w-4 h-4 mr-2 text-slate-400" /> Filter
          </Button>
          <Button className="bg-slate-900 hover:bg-black text-white shadow-sm">
            <FolderOpen className="w-4 h-4 mr-2" /> New Folder
          </Button>
        </div>
      </div>

      <div className="mx-6 relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search your library..." className="pl-9 bg-white border-slate-200 w-full md:w-96" />
      </div>

      {/* Empty State Grid */}
      <div className="mx-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div 
            key={i} 
            onClick={onOpenComposer}
            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer hover:border-indigo-200 hover:text-indigo-400 group"
          >
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-indigo-50 transition-colors">
               <FolderOpen className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
             </div>
             <p className="text-sm font-bold text-slate-500 group-hover:text-indigo-500 transition-colors">Empty Slot</p>
          </div>
        ))}
      </div>
    </div>
  );
}
