"use client";

import { useAppContext, Trade } from "@/context/AppContext";
import { X, Calendar, Clock, Target, Activity, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export default function ViewTradeModal() {
  const { isZar, usdZarRate } = useAppContext();
  const [open, setOpen] = useState(false);
  const [trade, setTrade] = useState<Trade | null>(null);

  // Expose this to the window so we can trigger it from other components
  if (typeof window !== 'undefined') {
    (window as any).viewTrade = (t: Trade) => {
      setTrade(t);
      setOpen(true);
    };
  }

  if (!open || !trade) return null;

  const displayPnl = isZar ? (trade.pnl || 0) * usdZarRate : (trade.pnl || 0);
  const date = new Date(trade.trade_date);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setOpen(false)}></div>
      
      <div className="relative w-full max-w-2xl bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-br from-white/[0.03] to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${trade.status === 'win' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-black'}`}>
                  {trade.status === 'win' ? 'WINNER' : 'LOSS'}
               </span>
               <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{trade.asset} • {trade.direction}</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Execution Details</h2>
          </div>
          <button onClick={() => setOpen(false)} className="p-4 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition"><X size={20}/></button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8">
           
           {/* PnL Hero */}
           <div className={`p-8 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-2 ${trade.status === 'win' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Net Realized Result</span>
              <span className={`text-6xl font-black tracking-tighter ${trade.status === 'win' ? 'text-emerald-500' : 'text-red-500'}`}>
                {displayPnl >= 0 ? '+' : ''}{isZar ? 'R' : '$'}{displayPnl.toFixed(2)}
              </span>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                 <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> Date</div>
                 <div className="text-sm font-black text-white">{format(date, 'dd MMM yyyy')}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                 <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={10}/> Time</div>
                 <div className="text-sm font-black text-white">{format(date, 'HH:mm')}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                 <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Session</div>
                 <div className="text-sm font-black text-white">{trade.session}</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                 <div className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Target size={10}/> Lot</div>
                 <div className="text-sm font-black text-white">{trade.lot_size}</div>
              </div>
           </div>

           {/* Setup Visuals */}
           <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 ml-2">Visual Executions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <VisualItem label="LTF (Entry)" src={trade.image_ltf} />
                 <VisualItem label="MTF (Context)" src={trade.image_mtf} />
                 <VisualItem label="HTF (Bias)" src={trade.image_htf} />
              </div>
           </div>

           {/* Breakdown */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Setup / Strategy</span>
                 <div className="p-5 bg-white/5 border border-white/5 rounded-2xl text-white text-sm font-bold">
                    {trade.setup_type || "No strategy recorded"}
                 </div>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Price Metrics</span>
                 <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between">
                       <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Entry</span>
                       <span className="text-sm font-black text-white">{trade.entry_price || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">SL</span>
                       <span className="text-sm font-black text-red-500">{trade.stop_loss || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">TP</span>
                       <span className="text-sm font-black text-emerald-500">{trade.take_profit || 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

function VisualItem({ label, src }: { label: string, src?: string }) {
  if (!src) return (
    <div className="flex flex-col gap-2">
       <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest text-center">{label}</span>
       <div className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
          <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">No Image</span>
       </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2 group">
       <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center">{label}</span>
       <div 
         onClick={() => window.open(src, '_blank')}
         className="aspect-video rounded-2xl overflow-hidden border border-white/10 cursor-zoom-in relative"
       >
          <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={label} />
       </div>
    </div>
  );
}
