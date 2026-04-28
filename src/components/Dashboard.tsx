"use client";

import { useAppContext, Trade } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import RecentTrades from "./RecentTrades";
import { PlusCircle, Wallet } from "lucide-react";

export default function Dashboard({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { 
    trades, withdrawals, isZar, usdZarRate, startingBalance, 
    setIsTradeModalOpen, setIsWithdrawalModalOpen 
  } = useAppContext();

  // Math Fix: Treat the starting balance as a raw number from the profile
  const baseBalance = Number(startingBalance) || 0;
  
  // Calculate PnL: All trades are stored as USD. Convert to ZAR only if app is in ZAR mode.
  const totalPnL = trades.reduce((acc, t) => {
    const val = t.pnl || 0;
    return acc + (isZar ? val * usdZarRate : val);
  }, 0);

  const totalWithdrawn = withdrawals.reduce((acc, w) => {
    return acc + (isZar ? w.amount * usdZarRate : w.amount);
  }, 0);

  const currentEquity = baseBalance + totalPnL - totalWithdrawn;
  const pctGrowth = baseBalance > 0 ? (totalPnL / baseBalance) * 100 : 0;
  const winRate = trades.length > 0 ? Math.round((trades.filter(t => t.status === 'win').length / trades.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full relative animate-in fade-in duration-500">
      
      {/* BRANDING & LOG BUTTONS REINSTATED */}
      <div className="mx-4 mt-6 flex justify-between items-center">
        <div className="flex flex-col">
           <h1 className="text-white font-black tracking-tighter text-2xl uppercase italic">Dondo Legacy</h1>
           <p className="text-[10px] text-[var(--dondo-emerald)] font-bold tracking-[0.3em] uppercase">God First †</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsWithdrawalModalOpen(true)} className="p-3 bg-white/5 rounded-2xl text-[#fbbf24] hover:bg-[#fbbf24]/10 transition border border-white/10"><Wallet size={20} /></button>
           <button onClick={() => setIsTradeModalOpen(true)} className="p-3 bg-[var(--dondo-emerald)] rounded-2xl text-black hover:scale-105 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"><PlusCircle size={20} /></button>
        </div>
      </div>

      {/* EQUITY CARD */}
      <div className="glass-panel mx-4 p-8 relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2.5rem] border border-white/5">
        <div className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-2">Total Equity Portfolio</div>
        <div className="text-[3.2rem] font-black text-white tracking-tighter flex items-start gap-1">
          <span className="text-xl text-zinc-600 mt-2">{isZar ? 'R' : '$'}</span>
          {currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex gap-2 mt-4">
           <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest border ${totalPnL >= 0 ? 'bg-[var(--dondo-emerald)]/10 border-[var(--dondo-emerald)]/20 text-[var(--dondo-emerald)]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
             {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({pctGrowth.toFixed(2)}%)
           </div>
           <div className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest bg-white/5 border border-white/10 text-zinc-400">
             {winRate}% WIN RATE
           </div>
        </div>
      </div>

      <div className="px-4">
        <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
      </div>

      <RecentTrades setActiveTab={setActiveTab} />
    </div>
  );
}