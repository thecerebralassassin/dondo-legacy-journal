"use client";

import { useState } from "react";
import { useAppContext, Trade, Withdrawal } from "@/context/AppContext";
import { format } from "date-fns";
import { Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TradesView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { 
    trades, withdrawals, isZar, usdZarRate, fetchTrades, fetchWithdrawals, 
    setEditingTrade 
  } = useAppContext();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"trades" | "withdrawals">("trades");

  const handleDeleteTrade = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this trade?")) return;
    setLoadingId(id);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) await fetchTrades();
    setLoadingId(null);
  };

  const handleDeleteWithdrawal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this record?")) return;
    setLoadingId(id);
    const { error } = await supabase.from('withdrawals').delete().eq('id', id);
    if (!error) await fetchWithdrawals();
    setLoadingId(null);
  };

  return (
    <div className="px-4 pb-24 animate-in fade-in duration-500">
      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/5">
        <button onClick={() => setViewMode("trades")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "trades" ? 'bg-[var(--dondo-emerald)] text-black' : 'text-zinc-500'}`}>Trades</button>
        <button onClick={() => setViewMode("withdrawals")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "withdrawals" ? 'bg-[#fbbf24] text-black' : 'text-zinc-500'}`}>Withdrawals</button>
      </div>

      <div className="flex flex-col gap-3">
        {viewMode === "trades" ? (
          trades.map((trade) => {
            const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
            return (
              <div key={trade.id} onClick={() => setEditingTrade(trade)} className="glass-panel p-5 ring-1 ring-white/5 bg-white/[0.02] rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)]' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-white font-black text-sm tracking-tight">{trade.asset} <span className="text-[10px] opacity-30 font-normal uppercase ml-1">{trade.direction}</span></div>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{format(new Date(trade.trade_date), "MMM dd · HH:mm")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-right font-black ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                    {displayPnl >= 0 ? '+' : ''}{displayPnl.toFixed(2)}
                  </div>
                  <button onClick={(e) => handleDeleteTrade(trade.id, e)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                    <Trash2 size={14} className={loadingId === trade.id ? "animate-pulse" : ""} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          withdrawals.map((w) => (
            <div key={w.id} className="glass-panel p-5 ring-1 ring-[#fbbf24]/20 bg-[#fbbf24]/5 rounded-[1.5rem] flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 rounded-full bg-[#fbbf24]" />
                  <div>
                    <div className="text-white font-black text-sm tracking-tight uppercase">Capital Withdrawal</div>
                    <div className="text-[9px] text-[#fbbf24]/60 font-bold uppercase tracking-widest mt-1">{format(new Date(w.withdrawal_date), "MMM dd · HH:mm")}</div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right font-black text-[#fbbf24]">-{isZar ? (w.amount * usdZarRate).toFixed(2) : w.amount.toFixed(2)}</div>
                  <button onClick={(e) => handleDeleteWithdrawal(w.id, e)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                    <Trash2 size={14} className={loadingId === w.id ? "animate-pulse" : ""} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}