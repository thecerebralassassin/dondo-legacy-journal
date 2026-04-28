"use client";

import { useAppContext } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import { format, isSameDay } from "date-fns";

export default function HeatmapDetailsView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, withdrawals, selectedHeatmapDate, isZar, usdZarRate } = useAppContext();
  
  const selectedDateObj = selectedHeatmapDate ? new Date(selectedHeatmapDate) : null;

  const winDays = new Set();
  const lossDays = new Set();
  
  trades.forEach(t => {
      const day = t.trade_date.split('T')[0];
      if (t.status === 'win') winDays.add(day);
      if (t.status === 'loss') lossDays.add(day);
  });

  const dailyTrades = selectedDateObj 
    ? trades.filter(t => isSameDay(new Date(t.trade_date), selectedDateObj))
    : [];
    
  const dailyWithdrawals = selectedDateObj
    ? (withdrawals || []).filter(w => isSameDay(new Date(w.withdrawal_date), selectedDateObj))
    : [];

  const dailyPnL = dailyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const displayDailyPnL = isZar ? dailyPnL * usdZarRate : dailyPnL;
  const isDailyWin = dailyPnL >= 0;

  return (
    <div className="px-4 pb-20 w-full max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 px-2">
         <button onClick={() => setActiveTab('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition">{"<"}</button>
         <h2 className="text-2xl font-black text-white tracking-tighter">Market Activity</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
         <div className="glass-panel p-5 ring-1 ring-[#065f46] bg-[#064e3b]/20 flex flex-col items-center justify-center rounded-2xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Win Days</div>
            <div className="text-xl font-black text-[var(--dondo-emerald)]">{winDays.size}</div>
         </div>
         <div className="glass-panel p-5 ring-1 ring-[#7f1d1d] bg-[#450a0a]/20 flex flex-col items-center justify-center rounded-2xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Loss Days</div>
            <div className="text-xl font-black text-red-500">{lossDays.size}</div>
         </div>
      </div>

      <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
      
      {selectedDateObj && (
        <div className="mt-8">
           <div className={`p-6 rounded-[2rem] mb-4 text-center ring-1 ${isDailyWin ? 'bg-[#064e3b]/40 text-[var(--dondo-emerald)] ring-[#065f46]' : 'bg-[#450a0a]/40 text-red-500 ring-[#7f1d1d]'}`}>
             <h3 className="text-[10px] font-black tracking-[0.2em] uppercase mb-2 text-white/50">{format(selectedDateObj, "MMMM do, yyyy")}</h3>
             <div className="text-3xl font-black tracking-tighter">
               {isDailyWin ? '+' : ''}{isZar ? 'R' : '$'}{displayDailyPnL.toFixed(2)}
             </div>
           </div>

           <div className="flex flex-col gap-3">
              {dailyTrades.map((trade) => (
                <div key={trade.id} className="glass-panel p-4 ring-1 ring-white/5 bg-white/[0.02] flex items-center justify-between rounded-2xl">
                  <div className="flex gap-4 items-center">
                    <div className={`w-2 h-2 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)] shadow-[0_0_10px_var(--dondo-emerald)]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                    <div>
                      <div className="font-black text-white text-sm">{trade.asset} <span className="text-[9px] opacity-30 ml-1">{trade.direction}</span></div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{format(new Date(trade.trade_date), "HH:mm")}</div>
                    </div>
                  </div>
                  <div className={`font-black ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                    {isZar ? ((trade.pnl || 0) * usdZarRate).toFixed(2) : (trade.pnl || 0).toFixed(2)}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}