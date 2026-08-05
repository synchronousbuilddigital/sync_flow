import { Plus, Users, Link as LinkIcon, FileText, Infinity, CalendarDays } from "lucide-react";

export function AutolistsView() {
  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Top Banner */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Publish on autopilot with autolists</h2>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Create content lists that publish themselves. Import from RSS or create posts, activate circular mode and choose your frequency. Once set up, the autolist publishes for you without you having to do anything else.
          </p>
        </div>
        <button className="shrink-0 bg-slate-900 hover:bg-black text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors">
          New autolist
        </button>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Your autolist fills itself</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Connect any blog, media or RSS feed and new content is automatically queued without you having to do anything.
            </p>
            <button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors mb-8">
              Learn more
            </button>
          </div>
          
          {/* Visual Graphic 1 */}
          <div className="mt-auto relative h-[240px] bg-slate-50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-[280px] bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
                <Infinity className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Metricool</span>
                <span className="text-[10px] text-slate-400 ml-auto">Sources · 9 RSS feeds</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${i===1?'bg-teal-400':i===2?'bg-indigo-400':i===3?'bg-yellow-400':'bg-red-400'}`}></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-700">Source {i}</p>
                        <p className="text-[8px] text-green-500 font-medium">● Active</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">+{20-i*4} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-8 right-8 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Queued</p>
              <p className="text-2xl font-black text-slate-800">23</p>
              <p className="text-[8px] font-bold text-orange-500 absolute bottom-3 right-3">+4 today</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
            
            <div className="absolute bottom-8 left-8 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Feeds</p>
              <p className="text-2xl font-black text-slate-800">8</p>
              <p className="text-[8px] font-bold text-teal-500 absolute bottom-3 right-3">+2 this week</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Good content never expires: make it circular</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Activate repetition and each post, after being published, goes back to the end of the autolist to keep being published over and over again.
            </p>
            <button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors mb-8">
              Learn more
            </button>
          </div>
          
          {/* Visual Graphic 2 */}
          <div className="mt-auto relative h-[240px] bg-slate-50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-[280px] bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4 pt-10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Infinity className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">Metricool</span>
                <span className="text-[8px] text-slate-400 ml-1">Loop · every 30 days</span>
              </div>
              
              <div className="flex items-center justify-between gap-2 mt-2">
                {/* Block 1 */}
                <div className="flex-1 bg-gradient-to-br from-yellow-300 to-yellow-400 h-16 rounded-lg opacity-60"></div>
                {/* Arrow */}
                <div className="text-slate-300 text-[10px]">▶</div>
                {/* Block 2 */}
                <div className="flex-1 bg-gradient-to-br from-blue-300 to-blue-400 h-16 rounded-lg opacity-60"></div>
                {/* Arrow */}
                <div className="text-slate-300 text-[10px]">▶</div>
                {/* Block 3 */}
                <div className="flex-1 bg-gradient-to-br from-purple-300 to-purple-400 h-16 rounded-lg"></div>
              </div>
              
              <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 px-1">
                <span>Jun 12</span>
                <span>Jul 5</span>
                <span className="text-orange-500">In 23 days</span>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-6 right-10 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Cycle</p>
              <p className="text-2xl font-black text-slate-800">30</p>
              <p className="text-[8px] font-bold text-slate-400 absolute bottom-3 right-3">days</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
            
            <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Repeats</p>
              <p className="text-2xl font-black text-slate-800">47</p>
              <p className="text-[8px] font-bold text-teal-500 absolute bottom-3 right-3">12 this month</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">Set it up once, publish forever</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Set days and times and Metricool publishes for you continuously. Your networks always active without any effort.
            </p>
            <button className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors mb-8">
              Learn more
            </button>
          </div>
          
          {/* Visual Graphic 3 */}
          <div className="mt-auto relative h-[240px] bg-slate-50 border-t border-slate-100 overflow-hidden flex items-center justify-center p-6">
            <div className="w-full max-w-[280px] bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-4">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
                <Infinity className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-700">Metricool</span>
                <span className="text-[9px] text-slate-400 ml-auto">Schedule · Mon, Fri weekly</span>
              </div>
              
              {/* Mini Grid */}
              <div className="flex text-[8px] font-bold text-slate-400 mb-1 px-4 justify-between">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="space-y-1.5">
                {[10, 12, 14, 18].map((time, rowIdx) => (
                  <div key={time} className="flex items-center gap-2">
                    <span className="text-[8px] text-slate-400 font-medium w-4">{time}:00</span>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                      {[0,1,2,3,4,5,6].map(colIdx => {
                        const isActive = (rowIdx === 0 && colIdx < 5) || 
                                         (rowIdx === 1 && (colIdx === 0 || colIdx === 2 || colIdx === 4)) ||
                                         (rowIdx === 2 && colIdx > 1 && colIdx < 6) ||
                                         (rowIdx === 3 && (colIdx === 0 || colIdx === 4));
                        return (
                          <div key={colIdx} className={`h-4 rounded-[2px] ${isActive ? 'bg-orange-400' : 'bg-slate-100/50'}`}></div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-6 right-6 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8 z-10">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Published</p>
              <p className="text-2xl font-black text-slate-800">156</p>
              <p className="text-[8px] font-bold text-teal-500 absolute bottom-3 right-3">+12% this month</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
            
            <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-lg border border-orange-100 p-3 pr-8 z-10">
              <p className="text-[10px] font-bold text-slate-400 mb-1">Slots</p>
              <p className="text-2xl font-black text-slate-800">14</p>
              <p className="text-[8px] font-bold text-slate-400 absolute bottom-3 right-3">week</p>
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-400 rounded-l-xl"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
