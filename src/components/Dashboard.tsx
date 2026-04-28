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
    <div className="flex flex-col gap-6 w-full relative animate-in fade-in duration-700">
      
      {/* HEADER SECTION: Branding on top left */}
      <div className="px-6 pt-8 flex items-center gap-6">
        <h1 className="text-3xl font-black text-white tracking-tighter flex items-center">
          DONDO<span className="text-[var(--dondo-emerald)] ml-0.5 text-4xl leading-none">.</span>
        </h1>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 pt-1">Trading Journal</span>
      </div>

      {/* HERO SECTION: Banner & Faith Quote */}
      <div className="px-6 flex flex-col lg:flex-row items-center gap-8">
        {/* Banner */}
        <div className="w-full lg:w-2/3 h-64 rounded-2xl overflow-hidden border border-white/5 relative group shadow-2xl">
          <img 
            src="/adam.jpg" 
            alt="The Creation of Adam" 
            className="w-full h-full object-cover object-[50%_15%] scale-[1.7] opacity-90 transition-transform duration-1000 group-hover:scale-[1.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Faith Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 lg:pl-4">
          <div className="relative">
             {/* Custom Neon Cross */}
             <svg width="40" height="60" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
               <path d="M12 2V22M7 9H17" stroke="var(--dondo-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
               <path d="M12 2V22M7 9H17" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
             </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-xl italic font-serif text-white tracking-tight leading-relaxed">
              3 Months Hardwork
            </p>
            <p className="text-xl italic font-serif text-white tracking-tight">
              God First
            </p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-6 grid grid-cols-2 gap-4">
         <button onClick={() => setIsWithdrawalModalOpen(true)} className="py-4 bg-[#fbbf24] rounded-xl text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(251,191,36,0.2)] active:scale-95 transition-all btn-tactile">
           PAYDAY
         </button>
         <button onClick={() => setIsTradeModalOpen(true)} className="py-4 bg-[var(--dondo-emerald)] rounded-xl text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_0_30px_rgba(16,185,129,0.25)] active:scale-95 transition-all btn-tactile">
           LOG TRADE
         </button>
      </div>

      {/* DASHBOARD GRID */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Card */}
        <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent rounded-[2.5rem] border border-white/5 flex flex-col justify-between min-h-[280px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] text-[var(--dondo-emerald)] font-black tracking-[0.2em] uppercase mb-2">Total Equity Portfolio</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter flex items-start gap-1">
                    <span className="text-xl text-zinc-600 mt-2">{isZar ? 'R' : '$'}</span>
                    {currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <div className="mt-2">
                    <span className={`text-sm font-bold ${totalPnL >= 0 ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                      {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} ({pctGrowth.toFixed(2)}%)
                    </span>
                  </div>
               </div>
               <div className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                 {winRate}% WIN RATE
               </div>
            </div>
            
            <div className="mt-4">
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-black text-zinc-500 tracking-[0.2em] uppercase">
                {trades.length > 0 ? (trades.filter(t => t.status === 'win').length / trades.length * 100).toFixed(0) : 0}% WIN RATE
              </span>
            </div>
          </div>

          {/* Equity Curve Integration */}
          <div className="absolute bottom-0 left-0 w-full h-40">
            <EquityCurve trades={trades} startingBalance={startingBalance} isZar={isZar} usdZarRate={usdZarRate} />
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="glass-panel p-2 rounded-[2.5rem] border border-white/5">
           <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
        </div>
      </div>

      <RecentTrades setActiveTab={setActiveTab} />
    </div>
  );
}