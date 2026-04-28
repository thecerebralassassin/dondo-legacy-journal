"use client";

import { useAppContext } from "@/context/AppContext";
import { format, isSameDay } from "date-fns";
import { X, TrendingUp, TrendingDown, Clock, Target, Calendar } from "lucide-react";

interface Props {
  setActiveTab: (t: string) => void;
}

export default function HeatmapDetailsView({ setActiveTab }: Props) {
  const { trades, selectedHeatmapDate, isZar, usdZarRate } = useAppContext();

  if (!selectedHeatmapDate) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
        <Calendar size={48} className="mb-4 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select a date to view executions</p>
      </div>
    );
  }

  const dateObj = new Date(selectedHeatmapDate);
  const dayTrades = trades.filter(t => isSameDay(new Date(t.trade_date), dateObj));
  
  const dailyPnl = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const displayPnl = isZar ? dailyPnl * usdZarRate : dailyPnl;
  const isProfit = dailyPnl >= 0;

  return (
    <div className="px-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            {format(dateObj, 'MMMM do')}
          </h2>
          <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">Daily Performance Log</p>
        </div>
        <button 
          onClick={() => setActiveTab("DASHBOARD")}
          className="p-3 bg-white/5 rounded-2xl text-zinc-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Daily Summary Card */}
      <div className={`glass-panel p-8 mb-8 border-none ring-1 ring-white/5 bg-gradient-to-br ${isProfit ? 'from-emerald-500/10' : 'from-red-500/10'} to-transparent rounded-[2.5rem]`}>
         <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Net Day Result</span>
            <span className={`text-5xl font-black tracking-tighter ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
              {isProfit ? '+' : ''}{isZar ? 'R' : '$'}{displayPnl.toFixed(2)}
            </span>
            <div className="flex gap-4 mt-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Executions</span>
                  <span className="text-xs font-black text-white">{dayTrades.length}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Trades List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-4 mb-2">Detailed Breakdown</h3>
        
        {dayTrades.length === 0 ? (
          <div className="p-12 text-center glass-panel border-dashed border-white/10 rounded-3xl">
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No trades recorded for this date.</p>
          </div>
        ) : (
          dayTrades.map(trade => {
            const tradePnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
            return (
              <div key={trade.id} className="glass-panel p-5 ring-1 ring-white/5 border-none bg-white/[0.015] rounded-3xl flex flex-col gap-4">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${trade.status === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trade.status === 'win' ? 'W' : 'L'}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white tracking-tight">{trade.asset} <span className={trade.direction === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{trade.direction}</span></div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {format(new Date(trade.trade_date), 'HH:mm')}
                        </div>
                      </div>
                   </div>
                   <div className={`text-lg font-black tracking-tighter ${tradePnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                     {tradePnl >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{tradePnl.toFixed(2)}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <Target size={12} className="text-zinc-600" />
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{trade.setup_type || 'Classic Setup'}</span>
                   </div>
                   <div className="flex items-center gap-2 justify-end text-zinc-500">
                      <span className="text-[9px] font-bold uppercase tracking-widest">Lot {trade.lot_size}</span>
                   </div>
                </div>

                {trade.image_ltf && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-white/5 aspect-video">
                     <img src={trade.image_ltf} className="w-full h-full object-cover" alt="Entry" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}