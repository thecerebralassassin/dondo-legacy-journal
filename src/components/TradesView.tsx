"use client";

import { useAppContext, Trade, Withdrawal } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Wallet, Edit2, Trash2, Calendar, Clock, Filter } from "lucide-react";
import { useState } from "react";

export default function TradesView() {
  const { 
    trades, withdrawals, isZar, usdZarRate, 
    setEditingTrade, setIsTradeModalOpen,
    setEditingWithdrawal, setIsWithdrawalModalOpen,
    fetchTrades, fetchWithdrawals 
  } = useAppContext();

  const [filter, setFilter] = useState<'all' | 'trades' | 'withdrawals'>('all');

  // Combine and sort by date
  const allActivity = [
    ...trades.map(t => ({ ...t, type: 'trade' as const })),
    ...withdrawals.map(w => ({ ...w, type: 'withdrawal' as const, trade_date: w.withdrawal_date }))
  ].sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime());

  const filteredActivity = allActivity.filter(item => {
    if (filter === 'trades') return item.type === 'trade';
    if (filter === 'withdrawals') return item.type === 'withdrawal';
    return true;
  });

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade?")) return;
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchTrades();
  };

  const handleDeleteWithdrawal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this withdrawal?")) return;
    const { error } = await supabase.from('withdrawals').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchWithdrawals();
  };

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Activity Log</h2>
          <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">Historical Performance & Capital Flow</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
           {(['all', 'trades', 'withdrawals'] as const).map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-[var(--dondo-emerald)] text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="flex flex-col gap-4">
        {filteredActivity.length === 0 ? (
          <div className="p-20 text-center glass-panel border-dashed border-white/10 rounded-[2.5rem]">
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">No records found</p>
          </div>
        ) : (
          filteredActivity.map((item: any) => {
            const isTrade = item.type === 'trade';
            const date = new Date(item.trade_date);
            
            if (isTrade) {
              const trade = item as Trade;
              const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
              return (
                <div key={trade.id} className="glass-panel p-5 ring-1 ring-white/5 border-none bg-white/[0.01] rounded-3xl group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trade.status === 'win' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {trade.status === 'win' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                         </div>
                         <div>
                            <div className="text-sm font-black text-white tracking-tight">{trade.asset} <span className={trade.direction === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{trade.direction}</span></div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                               <Calendar size={10} /> {format(date, 'dd MMM')} <Clock size={10} className="ml-1" /> {format(date, 'HH:mm')}
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className={`text-lg font-black tracking-tighter ${displayPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {displayPnl >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{displayPnl.toFixed(2)}
                         </div>
                         <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">LOT {trade.lot_size}</div>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                         {trade.setup_type || 'Classic Setup'}
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => { setEditingTrade(trade); setIsTradeModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition">
                            <Edit2 size={14} />
                         </button>
                         <button onClick={() => handleDeleteTrade(trade.id)} className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition">
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                </div>
              );
            } else {
              const w = item as Withdrawal;
              const displayAmount = isZar ? w.amount * usdZarRate : w.amount;
              return (
                <div key={w.id} className="glass-panel p-5 ring-1 ring-white/5 border-none bg-gradient-to-r from-[#fbbf24]/5 to-transparent rounded-3xl border-l-2 border-l-[#fbbf24]">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 text-[#fbbf24] flex items-center justify-center">
                            <Wallet size={20} />
                         </div>
                         <div>
                            <div className="text-sm font-black text-white tracking-tight uppercase tracking-widest">Payday Withdrawal</div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                               <Calendar size={10} /> {format(date, 'dd MMM yyyy')}
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-black tracking-tighter text-[#fbbf24]">
                            -{isZar ? 'R' : '$'}{displayAmount.toFixed(2)}
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic truncate max-w-[150px]">
                         {w.notes || 'No remarks'}
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => { setEditingWithdrawal(w); setIsWithdrawalModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-[#fbbf24] hover:bg-[#fbbf24]/10 transition">
                            <Edit2 size={14} />
                         </button>
                         <button onClick={() => handleDeleteWithdrawal(w.id)} className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition">
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>
                </div>
              );
            }
          })
        )}
      </div>

    </div>
  );
}