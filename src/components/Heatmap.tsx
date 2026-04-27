import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths } from "date-fns";
import { Trade, useAppContext } from "@/context/AppContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Heatmap({ tradesData = [], setActiveTab }: { tradesData?: Trade[], setActiveTab: (t: string) => void }) {
  const { setSelectedHeatmapDate, currentMonth, setCurrentMonth } = useAppContext();
  
  // Real Date object strictly for outlining "today's" block
  const actualToday = new Date();

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handlePrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="px-4">
      <div className="glass-panel p-5 ring-1 ring-white/5 border-none bg-white/[0.015]">
        
        {/* Heatmap Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition btn-tactile">
            <ChevronLeft size={16} />
          </button>
          
          <h3 className="text-sm font-black text-white tracking-widest uppercase shadow-sm">
            {format(currentMonth, "MMMM yyyy")}
          </h3>

          <button onClick={handleNextMonth} className="p-1 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition btn-tactile">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day of Week Labels */}
        <div className="flex justify-between items-center mb-2 px-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-[10px] uppercase font-bold text-zinc-500 w-8 text-center">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for start of month alignment */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
             <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
          ))}

          {daysInMonth.map((date, i) => {
            const dayTrades = tradesData.filter(t => isSameDay(new Date(t.trade_date), date));
            let dailyPnL = 0;
            dayTrades.forEach(t => dailyPnL += (t.pnl || 0));

            let bgColor = "bg-white/5"; // Empty state
            
            if (dayTrades.length > 0) {
              if (dailyPnL > 0) bgColor = "bg-[var(--dondo-emerald)] text-black font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]";
              else if (dailyPnL < 0) bgColor = "bg-red-500 text-black font-black shadow-[0_0_10px_rgba(239,68,68,0.4)]";
              else bgColor = "bg-zinc-400 text-black font-black"; // Breakeven
            }

            const todayBorder = isSameDay(date, actualToday) ? "ring-2 ring-white scale-[1.05] z-10" : "";

            return (
              <div 
                key={i} 
                onClick={() => {
                   if (setActiveTab && setSelectedHeatmapDate) {
                     setSelectedHeatmapDate(date.toISOString());
                     setActiveTab('HEATMAP_DETAILS');
                   }
                }}
                className={`aspect-square rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all hover:scale-[1.15] cursor-pointer ${bgColor} ${todayBorder}`}
              >
                {format(date, "d")}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
