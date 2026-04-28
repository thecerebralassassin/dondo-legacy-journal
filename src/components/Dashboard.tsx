"use client";

import { useAppContext, Trade, Withdrawal } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import RecentTrades from "./RecentTrades";

export default function Dashboard({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, withdrawals, isZar, usdZarRate, startingBalance } = useAppContext();

  // 1. SAFE MATH: Ensure everything is treated as a number to avoid "phantom" amounts
  const baseBalance = Number(startingBalance) || 0;
  
  // Sum up all recorded trade profits/losses with explicit Types for 'acc' and 't'
  const totalPnL = trades.reduce((acc: number, t: Trade) => acc + (t.pnl || 0), 0);
  
  // Sum up all recorded withdrawals with explicit Types
  const totalWithdrawnUSD = (withdrawals || []).reduce((acc: number, w: Withdrawal) => acc + (w.amount || 0), 0);

  // STATS
  const winTrades = trades.filter(t => t.status === 'win');
  const winRate = trades.length > 0 ? Math.round((winTrades.length / trades.length) * 100) : 0;
  
  const rrTrades = trades.filter(t => t.risk_reward !== null && t.risk_reward !== undefined);
  const avgRR = rrTrades.length > 0 
    ? (rrTrades.reduce((acc: number, t: Trade) => acc + (t.risk_reward || 0), 0) / rrTrades.length).toFixed(1) 
    : "0.0";

  // 2. EQUITY & MAX DRAWDOWN CALCULATION
  let peakEquity = baseBalance;
  let runningEquity = baseBalance;
  let maxDdPct = 0;

  // Sort trades chronologically to trace growth
  const chronologicalTrades = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  
  chronologicalTrades.forEach(t => {
     const tradePnl = t.pnl || 0; 
     runningEquity += tradePnl;
     if (runningEquity > peakEquity) peakEquity = runningEquity;
     if (peakEquity > 0) {
       const drop = ((peakEquity - runningEquity) / peakEquity) * 100;
       if (drop > maxDdPct) maxDdPct = drop;
     }
  });

  // Final current equity = Starting Equity + Trades - Withdrawals
  const currentEquityUSD = runningEquity - totalWithdrawnUSD; 

  // 4. DISPLAY CONVERSIONS
  const displayEquity = isZar ? currentEquityUSD * usdZarRate : currentEquityUSD;
  const displayPnL = isZar ? totalPnL * usdZarRate : totalPnL;
  const displayWithdrawn = isZar ? totalWithdrawnUSD * usdZarRate : totalWithdrawnUSD;
  const pctGrowth = baseBalance > 0 ? ((runningEquity - baseBalance) / baseBalance) * 100 : 0;

  // 5. GRAPH PATH LOGIC
  const dataPoints = [baseBalance];
  let tempEq = baseBalance;
  chronologicalTrades.forEach(t => {
      tempEq += (t.pnl || 0);
      dataPoints.push(tempEq);
  });

  const minEq = Math.min(...dataPoints);
  const maxEq = Math.max(...dataPoints);
  const range = maxEq - minEq || 1;
  const padding = range * 0.1;
  const adjustedMin = minEq - padding;
  const adjustedRange = (maxEq + padding) - adjustedMin;
  
  let linePath = `M0,${30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30}`;
  let dynamicPath = `M0,30 L0,${30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30}`;
  let finalY = 30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30;

  if (dataPoints.length === 1) {
    linePath = "M0,15 L100,15";
    dynamicPath = "M0,30 L0,15 L100,15 L100,30 Z";
    finalY = 15;
  } else {
    for (let i = 1; i < dataPoints.length; i++) {
       const x = (i / (dataPoints.length - 1)) * 100;
       const y = 30 - ((dataPoints[i] - adjustedMin) / adjustedRange) * 30;
       linePath += ` L${x},${y}`;
       dynamicPath += ` L${x},${y}`;
       if (i === dataPoints.length - 1) finalY = y;
    }
    dynamicPath += ` L100,30 Z`;
  }

  return (
    <div className="flex flex-col gap-6 w-full relative">
      <style>{`@keyframes drawCurve { to { stroke-dashoffset: 0; } }`}</style>
      
      {/* Visual Header */}
      <div className="mx-4 mt-2 mb-1 rounded-[2rem] overflow-hidden relative h-40 bg-zinc-900 border border-white/10 ring-1 ring-white/5">
         <img src="/adam.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60 saturate-[0.8] contrast-125" alt="Creation of Adam" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
         <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <div className="flex flex-col">
               <span className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-400 mb-1 drop-shadow-md">Dondo Legacy</span>
               <div className="text-white font-serif text-[1.35rem] tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,1)] leading-tight">Trading Journal</div>
               <div className="text-[var(--dondo-emerald)] font-serif italic text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,1)] font-medium">God First †</div>
            </div>
         </div>
      </div>

      {/* Hero Equity Card */}
      <div className="glass-panel mx-4 p-6 pb-28 relative overflow-hidden ring-1 ring-white/5 border-none bg-gradient-to-b from-white/[0.03] to-transparent rounded-[2.5rem]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--dondo-emerald)]/10 blur-[90px] pointer-events-none rounded-full" />
        <div className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-2 relative z-10">Total Equity Portfolio</div>
        <div className="text-[2.8rem] leading-none font-black text-white tracking-tighter mb-4 relative z-10 flex items-start gap-1">
          <span className="text-xl text-zinc-600 font-normal mt-1">{isZar ? 'R' : '$'}</span>
          {displayEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center relative z-10 mt-1">
           <div className={`inline-flex rounded-full px-4 py-2 text-[10px] font-black items-center gap-2 tracking-widest border ${displayPnL >= 0 ? 'bg-[var(--dondo-emerald)]/10 border-[var(--dondo-emerald)]/20 text-[var(--dondo-emerald)]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
             <span>{displayPnL >= 0 ? '▲' : '▼'}</span> 
             {displayPnL >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{displayPnL.toFixed(2)} 
             <span className="opacity-20">|</span> 
             {pctGrowth >= 0 ? '+' : ''}{pctGrowth.toFixed(2)}%
           </div>
           
           {totalWithdrawnUSD > 0 && (
             <div className="inline-flex rounded-full px-4 py-2 text-[10px] font-black items-center gap-1.5 tracking-widest border bg-[#fbbf24]/10 border-[#fbbf24]/20 text-[#fbbf24]">
               WITHDRAWN: {isZar ? 'R' : '$'}{displayWithdrawn.toFixed(2)}
             </div>
           )}
        </div>

        <div className="h-24 w-full absolute bottom-0 left-0 opacity-80 pointer-events-none drop-shadow-[0_-5px_20px_rgba(16,185,129,0.2)]">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            <path d={dynamicPath} fill="url(#equityGrad)" className="animate-in fade-in duration-1000" />
            <path d={linePath} fill="none" stroke="var(--dondo-emerald)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: 'drawCurve 3s ease-out forwards' }} />
            <circle cx="100" cy={finalY} r="1.5" fill="var(--dondo-emerald)" className="animate-pulse" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4">
        <div className="glass-panel p-5 flex flex-col items-center justify-center border-none bg-white/[0.01] rounded-2xl ring-1 ring-white/5">
          <div className="text-2xl font-black text-[var(--dondo-emerald)] mb-1 tracking-tighter">{winRate}%</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Win Rate</div>
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center border-none bg-white/[0.01] rounded-2xl ring-1 ring-white/5">
          <div className="text-2xl font-black text-[#F59E0B] mb-1 tracking-tighter">{avgRR}R</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Avg R:R</div>
        </div>
        <div className="glass-panel p-5 flex flex-col items-center justify-center border-none bg-white/[0.01] rounded-2xl ring-1 ring-white/5">
          <div className="text-2xl font-black text-red-500 mb-1 tracking-tighter">-{maxDdPct.toFixed(1)}%</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">Max DD</div>
        </div>
      </div>

      <div className="px-4"><Heatmap tradesData={trades} setActiveTab={setActiveTab} /></div>
      <RecentTrades setActiveTab={setActiveTab} />
    </div>
  );
}