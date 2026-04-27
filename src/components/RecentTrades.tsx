import { useAppContext } from "@/context/AppContext";
import { format } from "date-fns";

export default function RecentTrades({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const { trades, isZar, usdZarRate } = useAppContext();

  if (trades.length === 0) {
    return <div className="px-5 mt-4 pb-12 text-center text-zinc-600 text-[10px] font-bold tracking-widest uppercase">No trades recorded yet</div>;
  }

  const recentTrades = trades.slice(0, 5);

  return (
    <div className="px-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Recent Trades</h2>
        <button onClick={() => setActiveTab('TRADES')} className="text-[10px] text-[var(--dondo-emerald)] font-bold hover:text-white transition">All Trades →</button>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {recentTrades.map((trade) => {
           let amountValue = trade.pnl || 0;
           if (isZar) amountValue = amountValue * usdZarRate;
           const amountStr = `${amountValue >= 0 ? '+' : '-'}${isZar ? 'R' : '$'}${Math.abs(amountValue).toFixed(2)}`;

           return (
            <div key={trade.id} className="glass-panel p-4 ring-1 ring-white/5 border-none flex items-center justify-between bg-white/[0.02]">
              <div className="flex gap-4 items-center">
                <div className={`w-2 h-2 rounded-full ${trade.status === 'win' ? 'bg-[var(--dondo-emerald)] shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                <div>
                  <div className="font-black text-white text-sm tracking-wide">
                    {trade.asset}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex gap-2 items-center mt-1.5 font-medium tracking-wide border-t-0">
                    <span className="hidden sm:inline">{format(new Date(trade.trade_date), "MMM d - HH:mm")}</span>
                    {trade.session && <span className="bg-[#1e1b4b] border border-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-400 font-bold text-[8px] uppercase">{trade.session}</span>}
                    {trade.setup_type && <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-bold text-[8px] uppercase">{trade.setup_type}</span>}
                    <span>{trade.sentiment}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black tracking-wide ${trade.status === 'win' ? 'text-[var(--dondo-emerald)]' : 'text-red-500'}`}>{amountStr}</div>
                {trade.risk_reward && <div className="text-[10px] text-zinc-500 mt-1 font-bold">{trade.risk_reward}R</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
