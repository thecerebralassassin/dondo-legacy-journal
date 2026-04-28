"use client";

import { useAppContext, Trade } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import RecentTrades from "./RecentTrades";
import { PlusCircle, Wallet } from "lucide-react";
import EquityCurve from "./EquityCurve";

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
      
      {/* BRANDING SECTION */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">Trading Journal</p>
        <div className="relative w-48 h-48 rounded-full p-1 bg-gradient-to-b from-white/10 to-transparent">
          <img 
            src="/adam.jpg" 
            alt="Adam" 
            className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mt-6 flex items-center">
          DONDO<span className="text-[var(--dondo-emerald)] ml-0.5 text-4xl leading-none">.</span>
        </h1>
      </div>

      {/* LOG BUTTONS */}
      <div className="mx-4 flex justify-center gap-4">
         <button onClick={() => setIsWithdrawalModalOpen(true)} className="flex-1 py-4 bg-white/5 rounded-2xl text-[#fbbf24] font-black uppercase tracking-widest text-[10px] hover:bg-[#fbbf24]/10 transition border border-white/5 flex items-center justify-center gap-2">
           <Wallet size={16} /> Payday
         </button>
         <button onClick={() => setIsTradeModalOpen(true)} className="flex-1 py-4 bg-[var(--dondo-emerald)] rounded-2xl text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2">
           <PlusCircle size={16} /> Log Trade
         </button>
      </div>

      {/* EQUITY CARD */}
      <div className="glass-panel mx-4 p-8 relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2.5rem] border border-white/5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-2">Total Equity Portfolio</div>
            <div className="text-[3.2rem] font-black text-white tracking-tighter flex items-start gap-1">
              <span className="text-xl text-zinc-600 mt-2">{isZar ? 'R' : '$'}</span>
              {currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
             <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest border ${totalPnL >= 0 ? 'bg-[var(--dondo-emerald)]/10 border-[var(--dondo-emerald)]/20 text-[var(--dondo-emerald)]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
               {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({pctGrowth.toFixed(2)}%)
             </div>
             <div className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest bg-white/5 border border-white/10 text-zinc-400">
               {winRate}% WIN RATE
             </div>
          </div>
        </div>

        {/* Equity Curve Integration */}
        <EquityCurve trades={trades} startingBalance={startingBalance} isZar={isZar} usdZarRate={usdZarRate} />
      </div>

      <div className="px-4">
        <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
      </div>

      <RecentTrades setActiveTab={setActiveTab} />
    </div>
  );
}