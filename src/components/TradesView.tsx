import { useState } from "react";
import { useAppContext, Withdrawal } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Trash2, Edit2 } from "lucide-react";

export default function TradesView() {
  const { trades, withdrawals, isZar, usdZarRate, fetchTrades, fetchWithdrawals, setEditingTrade, setEditingWithdrawal } = useAppContext();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"trades" | "withdrawals">("trades");

  const handleDeleteTrade = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this trade?")) return;
    setLoadingId(id);
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) await fetchTrades();
    else alert(error.message);
    setLoadingId(null);
  };

  const handleDeleteWithdrawal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this record?")) return;
    setLoadingId(id);
    const { error } = await supabase.from('withdrawals').delete().eq('id', id);
    if (!error) await fetchWithdrawals();
    else alert(error.message);
    setLoadingId(null);
  };

  const handleEditTrade = (trade: any, e: React.MouseEvent) => {
     e.stopPropagation();
     setEditingTrade(trade); 
  };

  const handleEditWithdrawal = (withdrawal: Withdrawal, e: React.MouseEvent) => {
     e.stopPropagation();
     setEditingWithdrawal(withdrawal); 
  };

  return (
    <div className="px-4 pb-12 w-full max-w-lg mx-auto relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-black text-white tracking-tighter">History</h2>
        
        <div className="bg-white/5 rounded-full flex p-1 border border-white/10 ring-1 ring-white/5">
          <button onClick={() => setViewMode("trades")} className={`${viewMode === "trades" ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1.5 text-[10px] tracking-widest font-black uppercase btn-tactile`}>Trades</button>
          <button onClick={() => setViewMode("withdrawals")} className={`${viewMode === "withdrawals" ? 'bg-[#fbbf24] text-black shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1.5 text-[10px] tracking-widest font-black uppercase btn-tactile`}>Paydays</button>
        </div>
      </div>
      
      {viewMode === "trades" && (
        trades.length === 0 ? (
        <div className="glass-panel p-6 text-center text-zinc-500 text-[10px] font-bold tracking-widest uppercase">No trades recorded yet.</div>
      ) : (
        <div className="flex flex-col gap-3 pb-24">
          {trades.map((trade) => {
            let amountValue = trade.pnl || 0;
            if (isZar) amountValue = amountValue * usdZarRate;
            const amountStr = `${amountValue >= 0 ? '+' : '-'}${isZar ? 'R' : '$'}${Math.abs(amountValue).toFixed(2)}`;

            return (
              <div key={trade.id} className="glass-panel p-4 ring-1 ring-white/5 border-none flex flex-col gap-3 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className={`w-2 h-2 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)] shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                    <div>
                      <div className="font-black text-white text-sm tracking-wide">
                        {trade.asset} <span className="font-normal text-zinc-500 text-[10px] ml-1">{format(new Date(trade.trade_date), "MMM d - yyyy")}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex gap-2 items-center mt-1.5 font-medium tracking-wide">
                        {trade.session && <span className="bg-[#1e1b4b] border border-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-400 font-bold text-[8px] uppercase">{trade.session}</span>}
                        {trade.setup_type && <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-bold text-[8px] uppercase">{trade.setup_type}</span>}
                        <span>{trade.sentiment}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`font-black tracking-wide ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>{amountStr}</div>
                    {trade.risk_reward && <div className="text-[10px] text-zinc-500 mt-1 font-bold">{trade.risk_reward}R</div>}
                  </div>
                </div>

                {/* Details like notes */}
                {(trade.lesson || trade.mistake) && (
                  <div className="p-3 bg-black/40 rounded-lg border border-white/5 mt-1">
                    {trade.lesson && <p className="text-[10px] text-[var(--dondo-emerald)] mb-1.5"><span className="font-bold uppercase tracking-widest opacity-70">Lesson:</span> {trade.lesson}</p>}
                    {trade.mistake && <p className="text-[10px] text-red-500"><span className="font-bold uppercase tracking-widest opacity-70">Mistake:</span> {trade.mistake}</p>}
                  </div>
                )}

                {/* Visual Evidence Thumbnails */}
                {(trade.image_htf || trade.image_mtf || trade.image_ltf) && (
                  <div className="flex gap-2 mt-1">
                    {trade.image_ltf && (
                      <a href={trade.image_ltf} target="_blank" className="relative h-12 flex-1 rounded-lg bg-black/40 border border-white/10 hover:border-[var(--dondo-emerald)] transition overflow-hidden group">
                         <img src={trade.image_ltf} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition text-[8px] font-black tracking-widest text-white drop-shadow-md">LTF</div>
                      </a>
                    )}
                    {trade.image_mtf && (
                      <a href={trade.image_mtf} target="_blank" className="relative h-12 flex-1 rounded-lg bg-black/40 border border-white/10 hover:border-indigo-400 transition overflow-hidden group">
                         <img src={trade.image_mtf} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition text-[8px] font-black tracking-widest text-white drop-shadow-md">MTF</div>
                      </a>
                    )}
                    {trade.image_htf && (
                      <a href={trade.image_htf} target="_blank" className="relative h-12 flex-1 rounded-lg bg-black/40 border border-white/10 hover:border-[#F59E0B] transition overflow-hidden group">
                         <img src={trade.image_htf} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition text-[8px] font-black tracking-widest text-white drop-shadow-md">HTF</div>
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-white/5 pt-3 mt-1">
                  <button onClick={(e) => handleEditTrade(trade, e)} className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-white transition flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg btn-tactile">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={(e) => handleDeleteTrade(trade.id, e)} disabled={loadingId === trade.id} className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-red-400 transition flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg btn-tactile border border-red-500/20">
                    <Trash2 size={12} /> {loadingId === trade.id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {viewMode === "withdrawals" && (
        withdrawals.length === 0 ? (
          <div className="glass-panel p-6 text-center text-zinc-500 text-[10px] font-bold tracking-widest uppercase">No withdrawals recorded yet.</div>
        ) : (
          <div className="flex flex-col gap-3 pb-24">
            {withdrawals.map((withdrawal) => {
              const amountValue = isZar ? withdrawal.amount * usdZarRate : withdrawal.amount;
              const amountStr = `${isZar ? 'R' : '$'}${Math.abs(amountValue).toFixed(2)}`;

              return (
                <div key={withdrawal.id} className="glass-panel p-4 ring-1 ring-[#fbbf24]/20 border border-[#fbbf24]/10 flex flex-col gap-3 bg-[#fbbf24]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
                      <div>
                        <div className="font-black text-white text-sm tracking-wide">
                          WITHDRAWAL
                        </div>
                        <div className="text-[10px] text-zinc-500 flex gap-2 items-center mt-1 font-medium tracking-wide text-[#fbbf24]/70">
                          {format(new Date(withdrawal.withdrawal_date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black tracking-wide text-[#fbbf24] text-lg">-{amountStr}</div>
                    </div>
                  </div>

                  {withdrawal.notes && (
                    <div className="p-3 bg-black/40 rounded-lg border border-[#fbbf24]/10 mt-1">
                      <p className="text-[10px] text-white/70"><span className="font-bold uppercase tracking-widest opacity-50 text-[#fbbf24]">Notes:</span> {withdrawal.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-[#fbbf24]/10 pt-3 mt-1">
                    <button onClick={(e) => handleEditWithdrawal(withdrawal, e)} className="text-[10px] font-bold tracking-widest uppercase text-[#fbbf24]/70 hover:text-[#fbbf24] transition flex items-center gap-1.5 bg-[#fbbf24]/10 px-3 py-1.5 rounded-lg btn-tactile">
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={(e) => handleDeleteWithdrawal(withdrawal.id, e)} disabled={loadingId === withdrawal.id} className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-red-400 transition flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg btn-tactile border border-red-500/20">
                      <Trash2 size={12} /> {loadingId === withdrawal.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
