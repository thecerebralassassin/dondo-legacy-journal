"use client";

import { useState } from "react";
import { useAppContext, Trade } from "@/context/AppContext";
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TradesView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
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

  return (
    <div className="px-4 pb-24 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-white tracking-tighter mb-6 px-2">Execution History</h2>
      
      <div className="flex flex-col gap-3">
        {trades.map((trade: Trade) => {
          const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
          return (
            <div key={trade.id} className="glass-panel p-5 ring-1 ring-white/5 bg-white/[0.02] rounded-[1.5rem] flex items-center justify-between group border-none">
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-10 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)]' : 'bg-red-500'}`} />
                <div>
                  <div className="text-white font-black text-sm">{trade.asset} <span className="text-[10px] opacity-30 font-normal ml-1 uppercase">{trade.direction}</span></div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{format(new Date(trade.trade_date), "MMM dd · HH:mm")}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-right font-black mr-2 ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                  {displayPnl >= 0 ? '+' : ''}{displayPnl.toFixed(2)}
                </div>
                <button onClick={() => { setEditingTrade(trade); setIsTradeModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition">
                  <Edit3 size={14} />
                </button>
                <button onClick={(e) => handleDelete(trade.id, e)} className="p-2 bg-white/5 rounded-lg text-zinc-800 hover:text-red-500 transition">
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