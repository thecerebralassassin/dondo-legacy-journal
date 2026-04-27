"use client";

import { useAppContext } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import { format, isSameDay } from "date-fns";

export default function HeatmapDetailsView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, withdrawals, selectedHeatmapDate, isZar, usdZarRate } = useAppContext();

  // If a specific day is clicked, we filter the list below the heatmap.
  const selectedDateObj = selectedHeatmapDate ? new Date(selectedHeatmapDate) : null;

  // Calculate high level monthly stats for the mini grid
  const winDays = new Set();
  const lossDays = new Set();
  
  trades.forEach(t => {
      const day = t.trade_date.split('T')[0];
      if (t.status === 'win') winDays.add(day);
      if (t.status === 'loss') lossDays.add(day);
  });

  // Filter trades and withdrawals for the selected day list
  const dailyTrades = selectedDateObj 
    ? trades.filter(t => isSameDay(new Date(t.trade_date), selectedDateObj))
    : [];
    
  const dailyWithdrawals = selectedDateObj
    ? withdrawals.filter(w => isSameDay(new Date(w.withdrawal_date), selectedDateObj))
    : [];

  const dailyPnL = dailyTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const displayDailyPnL = isZar ? dailyPnL * usdZarRate : dailyPnL;
  const isDailyWin = dailyPnL >= 0;

  return (
    <div className="px-4 pb-20 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4 px-2">
         <button onClick={() => setActiveTab('DASHBOARD')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition">{"<"}</button>
         <h2 className="text-2xl font-black text-white tracking-tighter">Heatmap Details</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 px-1">
         <div className="glass-panel p-4 ring-1 ring-[#065f46] bg-[#064e3b]/20 flex flex-col items-center justify-center border-none rounded-2xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Winning Days</div>
            <div className="text-xl font-black text-[var(--dondo-emerald)]">{winDays.size}</div>
         </div>
         <div className="glass-panel p-4 ring-1 ring-[#7f1d1d] bg-[#450a0a]/20 flex flex-col items-center justify-center border-none rounded-2xl">
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Losing Days</div>
            <div className="text-xl font-black text-red-500">{lossDays.size}</div>
         </div>
      </div>

      <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
      
      {/* Daily Breakdown Log */}
      {selectedDateObj && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className={`p-5 rounded-3xl mb-4 text-center ring-1 ${isDailyWin ? 'bg-[#064e3b] text-[var(--dondo-emerald)] ring-[#065f46]' : 'bg-[#450a0a] text-red-500 ring-[#7f1d1d]'}`}>
             <h3 className="text-sm font-black tracking-widest uppercase mb-1 text-white">{format(selectedDateObj, "MMMM do, yyyy")}</h3>
             <div className="text-2xl font-black tracking-tighter">
               {isDailyWin ? '+' : ''}{isZar ? 'R' : '$'}{Math.abs(displayDailyPnL).toFixed(2)}
             </div>
             <div className="flex gap-2 justify-center mt-1">
               <span className="text-[10px] uppercase font-bold tracking-widest opacity-70 bg-black/20 px-2 py-0.5 rounded">{dailyTrades.length} Trades Taken</span>
               {dailyWithdrawals.length > 0 && (
                 <span className="text-[10px] uppercase font-bold tracking-widest text-black bg-[#fbbf24] px-2 py-0.5 rounded">{dailyWithdrawals.length} Paydays</span>
               )}
             </div>
           </div>

           <div className="flex flex-col gap-3">
              {dailyTrades.length === 0 ? (
                <div className="text-center text-[10px] font-bold tracking-widest uppercase text-zinc-600 mt-4">No trades on this date.</div>
              ) : (
                dailyTrades.map((trade) => {
                  let amountValue = trade.pnl || 0;
                  if (isZar) amountValue = amountValue * usdZarRate;
                  const amountStr = `${amountValue >= 0 ? '+' : '-'}${isZar ? 'R' : '$'}${Math.abs(amountValue).toFixed(2)}`;

                  return (
                    <div key={trade.id} className="glass-panel p-4 ring-1 ring-white/5 border-none flex items-center justify-between bg-white/[0.02] rounded-2xl">
                      <div className="flex gap-4 items-center">
                        <div className={`w-2 h-2 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)] shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                        <div>
                          <div className="font-black text-white text-sm tracking-wide">
                            {trade.asset} <span className="text-[10px] opacity-40 ml-1 font-normal">{trade.direction}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 flex gap-2 items-center mt-1.5 font-medium tracking-wide">
                            <span>{format(new Date(trade.trade_date), "HH:mm")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black tracking-wide ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>{amountStr}</div>
                      </div>
                    </div>
                  );
                })
              )}

              {dailyWithdrawals.map(w => {
                 const amountValue = isZar ? w.amount * usdZarRate : w.amount;
                 const amountStr = `${isZar ? 'R' : '$'}${Math.abs(amountValue).toFixed(2)}`;
                 return (
                    <div key={w.id} className="glass-panel p-4 ring-1 ring-[#fbbf24]/20 border border-[#fbbf24]/10 flex items-center justify-between bg-[#fbbf24]/5 rounded-2xl">
                      <div className="flex gap-4 items-center">
                        <div className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                        <div>
                          <div className="font-black text-white text-sm tracking-wide">WITHDRAWAL</div>
                          <div className="text-[10px] text-[#fbbf24]/70 mt-0.5 font-medium tracking-wide">
                            {format(new Date(w.withdrawal_date), "HH:mm")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black tracking-wide text-[#fbbf24]">- {amountStr}</div>
                      </div>
                    </div>
                 )
              })}
           </div>
        </div>
      )}
    </div>
  );
}