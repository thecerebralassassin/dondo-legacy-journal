"use client";

import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { User, LogOut, ShieldCheck, Target } from "lucide-react";

export default function ProfileView() {
  const { 
    user, firstName, lastName, startingBalance, setStartingBalance, 
    leverage, setLeverage, broker, setBroker, 
    defaultLotSize, setDefaultLotSize, tradingGoal, setTradingGoal
  } = useAppContext();
  
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    await supabase.from('profiles').upsert({
      id: user.id,
      starting_balance: startingBalance,
      leverage,
      broker,
      default_lot_size: defaultLotSize,
      trading_goal: tradingGoal
    });
    
    setSaving(false);
    const btn = document.getElementById("save-btn");
    if (btn) btn.innerText = "✓ UPDATED";
    setTimeout(() => { if(btn) btn.innerText = "UPDATE RESUME"; }, 2000);
  };

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto relative animate-in fade-in duration-500">
      
      {/* Header: Uses the firstName from Context */}
      <div className="glass-panel p-8 mb-8 flex flex-col items-center gap-4 bg-black/40 rounded-[2.5rem] border border-white/5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--dondo-emerald)] to-[#065f46] p-1 relative">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-4 border-black overflow-hidden">
                <User size={40} className="text-zinc-700" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--dondo-emerald)] text-black p-1.5 rounded-full border-4 border-black">
                <ShieldCheck size={14} strokeWidth={3} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tighter capitalize">
              {firstName} {lastName}
            </h2>
            <p className="text-[9px] text-[var(--dondo-emerald)] font-black uppercase tracking-[0.2em] mt-1">{user?.email}</p>
          </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="glass-panel p-6 bg-white/[0.01] rounded-3xl border border-white/5">
            <h3 className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-6 text-center">Account Setup</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Starting Equity</label>
                <input 
                  type="number" step="any" required 
                  value={startingBalance === 0 ? "" : startingBalance} 
                  onChange={e => setStartingBalance(e.target.value === "" ? 0 : Number(e.target.value))} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-[var(--dondo-emerald)]" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Default Lot Size</label>
                <input 
                  type="number" step="any" required 
                  value={defaultLotSize === 0 ? "" : defaultLotSize} 
                  onChange={e => setDefaultLotSize(e.target.value === "" ? 0 : Number(e.target.value))} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-white/30" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Leverage</label>
                <select value={leverage} onChange={e => setLeverage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none">
                   <option value="1:1">1:1</option>
                   <option value="1:500">1:500</option>
                   <option value="1:1000">1:1000</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Broker</label>
                <input type="text" value={broker} onChange={e => setBroker(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none" />
              </div>
            </div>
        </div>

        <button id="save-btn" type="submit" disabled={saving} className="w-full py-5 text-black font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl bg-[var(--dondo-emerald)] shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:bg-[#10b981]/90 active:scale-[0.97] transition-all">
            {saving ? 'SAVING...' : 'UPDATE RESUME'}
        </button>
      </form>
    </div>
  );
}