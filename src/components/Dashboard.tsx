import { useAppContext } from "@/context/AppContext";
import Heatmap from "./Heatmap";
import RecentTrades from "./RecentTrades";

export default function Dashboard({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, withdrawals, isZar, usdZarRate, startingBalance } = useAppContext();

  // Basic Math Calculations
  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winTrades = trades.filter(t => t.status === 'win');
  
  const winRate = trades.length > 0 ? Math.round((winTrades.length / trades.length) * 100) : 0;
  
  const rrTrades = trades.filter(t => t.risk_reward !== null) as {risk_reward: number}[];
  const avgRR = rrTrades.length > 0 ? (rrTrades.reduce((acc, t) => acc + t.risk_reward, 0) / rrTrades.length).toFixed(1) : 0;

  const baselineZar = startingBalance;
  
  // MAX DD ALGORITHM
  let peakEquity = baselineZar;
  let runningEquity = baselineZar;
  let maxDdPct = 0;

  // Chronological sort to trace equity correctly
  const chronologicalTrades = [...trades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  
  chronologicalTrades.forEach(t => {
     let pnlInZar = (t.pnl || 0) * usdZarRate; 
     runningEquity += pnlInZar;
     
     if (runningEquity > peakEquity) peakEquity = runningEquity;

     if (peakEquity > 0) {
       const drop = ((peakEquity - runningEquity) / peakEquity) * 100;
       if (drop > maxDdPct) maxDdPct = drop;
     }
  });

  // Capital Flow (Withdrawals)
  const totalWithdrawnBase = withdrawals.reduce((acc, w) => acc + w.amount, 0);
  const totalWithdrawnZar = totalWithdrawnBase * usdZarRate;

  const currentEquityZar = runningEquity - totalWithdrawnZar; 

  const displayEquity = isZar ? currentEquityZar : currentEquityZar / usdZarRate;
  const displayPnL = isZar ? totalPnL * usdZarRate : totalPnL;
  const displayWithdrawn = isZar ? totalWithdrawnZar : totalWithdrawnBase;

  const pctGrowth = baselineZar > 0 ? ((runningEquity - baselineZar) / baselineZar) * 100 : 0;

  // Dynamic Equity Curve Math
  const dataPoints = [isZar ? startingBalance * usdZarRate : startingBalance];
  let currentEq = dataPoints[0];
  
  chronologicalTrades.forEach(t => {
     if (t.status === 'win' || t.status === 'loss' || t.pnl === 0) {
        let mappedPnl = t.pnl || 0;
        if (isZar) mappedPnl = mappedPnl * usdZarRate;
        currentEq += mappedPnl;
        dataPoints.push(currentEq);
     }
  });

  const minEq = Math.min(...dataPoints);
  const maxEq = Math.max(...dataPoints);
  const range = maxEq - minEq || 1;
  const padding = range * 0.1;
  const adjustedMin = minEq - padding;
  const adjustedRange = (maxEq + padding) - adjustedMin;
  
  let dynamicPath = `M0,30 L0,${30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30}`;
  let linePath = `M0,${30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30}`;
  let finalY = 30 - ((dataPoints[0] - adjustedMin) / adjustedRange) * 30;
  
  if (dataPoints.length === 1) {
    dynamicPath = "M0,30 L0,15 L100,15 L100,30 Z";
    linePath = "M0,15 L100,15";
    finalY = 15;
  } else {
    for (let i = 1; i < dataPoints.length; i++) {
       const x = (i / (dataPoints.length - 1)) * 100;
       const y = 30 - ((dataPoints[i] - adjustedMin) / adjustedRange) * 30;
       dynamicPath += ` L${x},${y}`;
       linePath += ` L${x},${y}`;
       if (i === dataPoints.length - 1) finalY = y;
    }
    dynamicPath += ` L100,30 Z`;
  }

  return (
    <div className="flex flex-col gap-6 w-full relative">
      <style>{`@keyframes drawCurve { to { stroke-dashoffset: 0; } }`}</style>
      
      {/* Creation of Adam Header */}
      <div className="mx-4 mt-2 mb-1 rounded-[2rem] overflow-hidden relative h-40 bg-zinc-900 border border-white/10 ring-1 ring-white/5 group shadow-2xl">
         <img src="/adam.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 saturate-[0.8] contrast-125" alt="Creation of Adam" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
         
         <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <div className="flex flex-col">
               <span className="text-[8px] uppercase tracking-[0.3em] font-black text-zinc-400 mb-1 drop-shadow-md">Dondo Legacy</span>
               <div className="text-white font-serif text-[1.35rem] tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,1)] opacity-100 leading-tight">
                  3 Months of Hardwork.
               </div>
               <div className="text-[var(--dondo-emerald)] font-serif italic text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,1)] font-medium">
                  God First †
               </div>
            </div>
            
            <div className="text-white/70 mb-2 flex items-center justify-center bg-black/60 backdrop-blur-md p-1.5 rounded-full ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M5 8h14"/></svg>
            </div>
         </div>
      </div>

      {/* Hero Equity Card */}
      <div className="glass-panel mx-4 p-5 pb-28 relative overflow-hidden ring-1 ring-white/5 border-none bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--dondo-emerald)]/10 blur-[90px] pointer-events-none rounded-full" />
        
        <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-2 relative z-10">Total Equity</div>
        <div className="text-[2.5rem] leading-none font-black text-white tracking-tighter mb-4 relative z-10 flex items-start gap-1">
          <span className="text-xl text-zinc-500 font-normal mt-1">{isZar ? 'R' : '$'}</span>
          {displayEquity.toFixed(2)}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center relative z-10 mt-1">
           <div className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold items-center gap-2 tracking-wide border ${displayPnL >= 0 ? 'bg-[var(--dondo-emerald)]/10 border-[var(--dondo-emerald)]/20 text-[var(--dondo-emerald)]' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
             <span>{displayPnL >= 0 ? '▲' : '▼'}</span> 
             {displayPnL >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{displayPnL.toFixed(2)} 
             <span className="opacity-40 font-normal">|</span> 
             {pctGrowth >= 0 ? '+' : ''}{pctGrowth.toFixed(2)}%
           </div>
           
           {totalWithdrawnBase > 0 && (
             <div className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold items-center gap-1.5 tracking-wide border bg-[#fbbf24]/10 border-[#fbbf24]/20 text-[#fbbf24]">
               Withdrawals: {isZar ? 'R' : '$'}{displayWithdrawn.toFixed(2)}
             </div>
           )}
        </div>

        {/* Dynamic SVG Curve */}
        <div className="h-20 w-full absolute bottom-0 left-0 opacity-80 pointer-events-none drop-shadow-[0_-5px_15px_rgba(16,185,129,0.15)]">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0)" />
              </linearGradient>
            </defs>
            <path 
              d={dynamicPath} 
              fill="url(#grad)" 
              className="animate-in fade-in duration-1000"
            />
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--dondo-emerald)" 
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ strokeDasharray: 300, strokeDashoffset: 300, animation: 'drawCurve 2.5s ease-out forwards' }}
            />
            <circle cx="100" cy={finalY} r="1.5" fill="var(--dondo-emerald)" className="animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
          </svg>
        </div>
      </div>

      {/* Stat Pills */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <div className="glass-panel p-4 flex flex-col items-center justify-center ring-1 ring-white/5 border-none bg-white/[0.015]">
          <div className="text-xl font-black text-[var(--dondo-emerald)] mb-1 tracking-tight">{winRate}%</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Win Rate</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center ring-1 ring-white/5 border-none bg-white/[0.015]">
          <div className="text-xl font-black text-[#F59E0B] mb-1 tracking-tight">{avgRR}R</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Avg R:R</div>
        </div>
        <div className="glass-panel p-4 flex flex-col items-center justify-center ring-1 ring-white/5 border-none bg-white/[0.015]">
          <div className="text-xl font-black text-red-500 mb-1 tracking-tight">-{maxDdPct.toFixed(1)}%</div>
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Max DD</div>
        </div>
      </div>

      {/* Heatmap & Details Header */}
      <div className="flex justify-between items-center px-4 mb-2 mt-4">
        <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Activity Map</h3>
        <button 
          onClick={() => setActiveTab('MONTHLY_DETAILS')} 
          className="text-[10px] text-[var(--dondo-emerald)] font-bold tracking-widest uppercase hover:text-white transition flex items-center gap-1 bg-[var(--dondo-emerald)]/10 px-3 py-1.5 rounded-full border border-[var(--dondo-emerald)]/20"
        >
           Details
        </button>
      </div>

      <div className="px-4">
         <Heatmap tradesData={trades} setActiveTab={setActiveTab} />
      </div>
      
      <RecentTrades setActiveTab={setActiveTab} />

    </div>
  );
}
