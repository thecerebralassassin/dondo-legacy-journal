"use client";

import { useAppContext, Trade } from "@/context/AppContext";
import { format } from "date-fns";

export default function RecentTrades({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, isZar, usdZarRate, setEditingTrade } = useAppContext();

  // Limit to the 5 most recent executions
  const latestTrades = trades.slice(0, 5);

  return (
    <div className="px-4 mt-6">
      <div className="flex justify-between items-center px-2 mb-4">
        <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.25em]">Recent Executions</h3>
        <button 
          onClick={() => setActiveTab('TRADES')} 
          className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest hover:text-white transition-colors"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {latestTrades.length === 0 ? (
          <div className="glass-panel p-10 border-none bg-white/[0.01] rounded-[2rem] text-center border border-white/5">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest opacity-50">Waiting for terminal data...</p>
          </div>
        ) : (
          latestTrades.map((trade: Trade) => {
            const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
            
            return (
              <div 
                key={trade.id} 
                onClick={() => setActiveTab("TRADES")}
                className="glass-panel p-4 ring-1 ring-white/5 bg-white/[0.02] border-none rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator with Glow */}
                  <div className={`w-1.5 h-8 rounded-full ${
                    trade.status === 'win' 
                    ? 'bg-[var(--dondo-emerald)] shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  }`} />
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-sm tracking-tight uppercase">{trade.asset}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${
                        trade.direction === 'BUY' 
                        ? 'text-blue-400 border-blue-400/20 bg-blue-400/5' 
                        : 'text-orange-500 border-orange-500/20 bg-orange-500/5'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                      {format(new Date(trade.trade_date), "MMM dd · HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-black tracking-tight text-base ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                    {displayPnl >= 0 ? '+' : ''}{displayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mt-0.5">
                    {isZar ? 'ZAR' : 'USD'} NET
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}