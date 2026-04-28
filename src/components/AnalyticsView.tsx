"use client";

import { useState } from "react";
import { format, isValid } from "date-fns";
import { useAppContext } from "@/context/AppContext";
import { PieChart, Activity, TrendingUp, TrendingDown, Target, BrainCircuit, AlertTriangle, Scale } from "lucide-react";

export default function AnalyticsView() {
  const { trades, isZar, usdZarRate } = useAppContext();
  const [activeAsset, setActiveAsset] = useState("ALL");

  const uniqueAssets = Array.from(new Set(trades.map(t => t.asset)));
  const tabs = ["ALL", ...uniqueAssets];

  const filteredTrades = activeAsset === "ALL" ? trades : trades.filter(t => t.asset === activeAsset);

  // Core Arrays & Math
  let winCount = 0;
  let lossCount = 0;
  let beCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  filteredTrades.forEach(t => {
     let mappedPnl = t.pnl || 0;
     if (mappedPnl === 0) beCount++;
     else if (mappedPnl > 0) { winCount++; grossProfit += mappedPnl; }
     else { lossCount++; grossLoss += Math.abs(mappedPnl); }
  });

  const totalCalc = winCount + lossCount + beCount;
  const winRate = totalCalc > 0 ? ((winCount / totalCalc) * 100).toFixed(0) : "0";
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? "Max" : "0.00") : (grossProfit / grossLoss).toFixed(2);
  
  const avgWin = winCount > 0 ? grossProfit / winCount : 0;
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;
  
  const avgWinDisplay = isZar ? avgWin * usdZarRate : avgWin;
  const avgLossDisplay = isZar ? avgLoss * usdZarRate : avgLoss;

  // Best Trading Day Algorithmic Detection
  const dayStats: Record<string, number> = { "Sunday": 0, "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0 };
  filteredTrades.forEach(t => {
     const tradeDate = new Date(t.trade_date);
     if (isValid(tradeDate)) {
       const dayName = format(tradeDate, 'EEEE');
       if (dayStats[dayName] !== undefined) dayStats[dayName] += (t.pnl || 0);
     }
  });
  
  let bestDay = "N/A";
  let maxDayPnl = -Infinity;
  Object.entries(dayStats).forEach(([day, pnl]) => {
     if (pnl > maxDayPnl && pnl > 0) { maxDayPnl = pnl; bestDay = day; }
  });

  // Psychological Galleries
  const mistakeTrades = filteredTrades.filter(t => t.mistake && t.mistake.trim() !== "").sort((a,b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime());

  if (trades.length === 0) {
    return <div className="px-5 mt-8 pb-12 text-center text-zinc-600 text-[10px] font-bold tracking-widest uppercase">No data to analyze.</div>;
  }

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <h2 className="text-2xl font-black text-white tracking-tighter mb-4 px-2">Analytics Engine</h2>

      {/* Dynamic Asset Ticker Tabs */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-4 px-2 mb-2">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveAsset(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black tracking-widest transition shadow-sm ${activeAsset === tab ? 'bg-[var(--dondo-emerald)] text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        
        {/* Core Matrix */}
        <div className="grid grid-cols-2 gap-4">
           {/* Win Rate Panel */}
           <div className="glass-panel p-5 ring-1 ring-white/5 border-none flex flex-col items-center justify-center bg-white/[0.015]">
              <div className="w-16 h-16 rounded-full border-4 border-[var(--dondo-emerald)] flex items-center justify-center mb-3 relative shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="text-xl font-black text-white">{winRate}%</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Global Win Rate</div>
           </div>

           {/* Performance Breakdown Panel */}
           <div className="glass-panel p-5 ring-1 ring-white/5 border-none flex flex-col justify-center gap-3 bg-white/[0.015]">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Wins</span>
                 <span className="text-sm font-black text-[var(--dondo-emerald)]">{winCount}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Losses</span>
                 <span className="text-sm font-black text-red-500">{lossCount}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Break Even</span>
                 <span className="text-sm font-black text-zinc-400">{beCount}</span>
              </div>
           </div>
        </div>

        {/* Institutional Metrics */}
        <div className="glass-panel p-5 ring-1 ring-white/5 border-none bg-gradient-to-br from-[var(--dondo-emerald)]/5 to-transparent">
           <h3 className="text-[10px] text-[var(--dondo-emerald)] font-bold tracking-widest uppercase mb-4 flex items-center gap-2"><Scale size={14}/> Institutional Metrics</h3>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Profit Factor</div>
                 <div className="text-2xl font-black text-white">{profitFactor}</div>
              </div>
              <div>
                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Most Profitable</div>
                 <div className="text-xl font-black text-indigo-400 uppercase">{bestDay}</div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mt-5 border-t border-white/5 pt-4">
              <div>
                 <div className="text-[9px] text-[var(--dondo-emerald)] uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><TrendingUp size={10}/> Avg Win</div>
                 <div className="text-lg font-black text-[var(--dondo-emerald)]">{isZar ? 'R' : '$'}{avgWinDisplay.toFixed(2)}</div>
              </div>
              <div>
                 <div className="text-[9px] text-red-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><TrendingDown size={10}/> Avg Loss</div>
                 <div className="text-lg font-black text-red-500">{isZar ? 'R' : '$'}{avgLossDisplay.toFixed(2)}</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
