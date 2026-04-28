"use client";

import { useState } from "react";
import { useAppContext, Trade } from "@/context/AppContext";
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TradesView() {
  const { trades, fetchTrades, isZar, usdZarRate, setEditingTrade, setIsTradeModalOpen } = useAppContext();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this trade?")) return;
    setLoadingId(id);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) await fetchTrades();
    setLoadingId(null);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  return (
    <div className="px-4 pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8 px-2 mt-6">
         <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Executions</h2>
         <div className="text-[10px] font-black text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">{trades.length} TRADES</div>
      </div>
      
      <div className="flex flex-col gap-3">
        {trades.map((trade: Trade) => {
          const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
          return (
            <div key={trade.id} className="glass-panel p-5 ring-1 ring-white/5 bg-white/[0.02] rounded-[1.5rem] flex items-center justify-between group border-none">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-10 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)] shadow-[0_0_10px_var(--dondo-emerald)]' : 'bg-red-500 shadow-[0_0_10px_red]'}`} />
                <div>
                  <div className="text-white font-black text-sm tracking-tight">{trade.asset} <span className="text-[9px] opacity-30 font-normal ml-1 uppercase">{trade.direction}</span></div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{format(new Date(trade.trade_date), "MMM dd · HH:mm")}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`text-right font-black mr-2 ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                  {displayPnl >= 0 ? '+' : ''}{displayPnl.toFixed(2)}
                </div>
                <button onClick={() => handleEdit(trade)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => handleDelete(trade.id, e)} className="p-2.5 bg-white/5 rounded-xl text-zinc-800 hover:text-red-500 transition">
                  <Trash2 size={14} className={loadingId === trade.id ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}