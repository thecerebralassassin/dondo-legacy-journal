import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { ChevronLeft, ChevronRight, Activity, CalendarDays } from "lucide-react";

export default function MonthlyDetailsView({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, withdrawals, isZar, usdZarRate } = useAppContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handlePrevYear = () => setSelectedYear(y => y - 1);
  const handleNextYear = () => setSelectedYear(y => y + 1);

  // Group trades and withdrawals by year
  const yearlyTrades = trades.filter(t => new Date(t.trade_date).getFullYear() === selectedYear);
  const yearlyWithdrawals = withdrawals.filter(w => new Date(w.withdrawal_date).getFullYear() === selectedYear);
  
  let totalYearlyPnL = 0;
  let winTradesYearly = 0;
  let totalYearlyWithdrawn = 0;

  const monthData = Array.from({ length: 12 }, (_, i) => {
    const monthTrades = yearlyTrades.filter(t => new Date(t.trade_date).getMonth() === i);
    const monthWithdrawals = yearlyWithdrawals.filter(w => new Date(w.withdrawal_date).getMonth() === i);
    
    let monthlyPnL = 0;
    let wins = 0;
    let monthlyWithdrawn = 0;
    
    monthTrades.forEach(t => {
       const mappedPnl = (t.pnl || 0);
       monthlyPnL += mappedPnl;
       totalYearlyPnL += mappedPnl; // safely aggregate
       if (t.status === 'win') { wins++; winTradesYearly++; }
    });

    monthWithdrawals.forEach(w => {
       monthlyWithdrawn += w.amount;
       totalYearlyWithdrawn += w.amount;
    });

    const displayPnL = isZar ? monthlyPnL * usdZarRate : monthlyPnL;
    const displayWithdrawn = isZar ? monthlyWithdrawn * usdZarRate : monthlyWithdrawn;
    
    return {
      monthStr: new Date(selectedYear, i).toLocaleString('default', { month: 'long' }),
      tradesCount: monthTrades.length,
      winRate: monthTrades.length > 0 ? ((wins / monthTrades.length) * 100).toFixed(0) : "0",
      displayPnL,
      displayWithdrawn,
      isPositive: displayPnL >= 0,
      hasData: monthTrades.length > 0 || monthWithdrawals.length > 0
    };
  });

  // Calculate high-level metrics for the entire year
  const displayTotalYearlyPnL = isZar ? totalYearlyPnL * usdZarRate : totalYearlyPnL;
  const displayTotalYearlyWithdrawn = isZar ? totalYearlyWithdrawn * usdZarRate : totalYearlyWithdrawn;
  const yearlyWinRate = yearlyTrades.length > 0 ? ((winTradesYearly / yearlyTrades.length) * 100).toFixed(0) : "0";

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 px-2">
         <button onClick={() => setActiveTab('DASHBOARD')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition">{"<"}</button>
         <h2 className="text-2xl font-black text-white tracking-tighter">Yearly Aggregation</h2>
      </div>

      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button onClick={handlePrevYear} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition btn-tactile border border-white/5">
          <ChevronLeft size={18} />
        </button>
        
        <h3 className="text-2xl font-black text-[var(--dondo-emerald)] tracking-widest shadow-sm">
          {selectedYear}
        </h3>

        <button onClick={handleNextYear} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition btn-tactile border border-white/5">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Yearly Macro Stats */}
      <div className="glass-panel p-6 ring-1 ring-white/5 border-none mb-6 relative overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent">
         {displayTotalYearlyPnL >= 0 
           ? <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dondo-emerald)]/10 blur-[50px] pointer-events-none rounded-full" />
           : <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] pointer-events-none rounded-full" />
         }
         <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Total {selectedYear} Profit</div>
         <div className={`text-3xl font-black tracking-tighter mb-4 ${displayTotalYearlyPnL >= 0 ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
            {displayTotalYearlyPnL >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{Math.abs(displayTotalYearlyPnL).toFixed(2)}
         </div>

         <div className="flex gap-6 border-t border-white/5 pt-4">
            <div>
               <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-1"><Activity size={10}/> WR</div>
               <div className="text-lg font-black text-white">{yearlyWinRate}%</div>
            </div>
            <div>
               <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase flex items-center gap-1"><CalendarDays size={10}/> Trades</div>
               <div className="text-lg font-black text-white">{yearlyTrades.length}</div>
            </div>
            {displayTotalYearlyWithdrawn > 0 && (
               <div>
                 <div className="text-[10px] text-[#fbbf24] font-bold tracking-widest uppercase flex items-center gap-1"><Activity size={10}/> Withdrawn</div>
                 <div className="text-lg font-black text-[#fbbf24]">{isZar ? 'R' : '$'}{displayTotalYearlyWithdrawn.toFixed(2)}</div>
               </div>
            )}
         </div>
      </div>

      {/* Monthly Loop Feed */}
      <div className="flex flex-col gap-3">
        {monthData.filter(m => m.hasData).length === 0 ? (
          <div className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 mt-8">No historical data for {selectedYear}</div>
        ) : (
          monthData.map((month, idx) => {
            if (!month.hasData) return null; // Only render active months

            return (
              <div key={idx} className="glass-panel p-4 ring-1 ring-white/5 border-none flex items-center justify-between bg-white/[0.02]">
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                     <span className="font-black text-white uppercase tracking-widest text-sm">{month.monthStr}</span>
                     {month.displayWithdrawn > 0 && (
                       <span className="text-[8px] font-bold tracking-widest uppercase text-black bg-[#fbbf24] px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                         PAYDAY
                       </span>
                     )}
                   </div>
                   <span className="text-[10px] text-zinc-500 font-bold mt-1 tracking-wide">{month.tradesCount} Trades taken • {month.winRate}% WR</span>
                 </div>
                 <div className="text-right flex flex-col items-end">
                   <div className={`font-black text-lg tracking-tighter ${month.isPositive ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>
                     {month.isPositive ? '+' : ''}{isZar ? 'R' : '$'}{Math.abs(month.displayPnL).toFixed(2)}
                   </div>
                   {month.displayWithdrawn > 0 && (
                     <div className="text-[10px] font-bold text-[#fbbf24]/80 mt-0.5 tracking-wide">
                       Withdrawn: {isZar ? 'R' : '$'}{month.displayWithdrawn.toFixed(2)}
                     </div>
                   )}
                 </div>
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}
