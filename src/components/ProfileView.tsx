"use client";

import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { User, LogOut, ShieldCheck, Target } from "lucide-react";

export default function ProfileView() {
  const { 
    user, startingBalance, setStartingBalance, 
    leverage, setLeverage, broker, setBroker, 
    defaultLotSize, setDefaultLotSize,
    tradingGoal, setTradingGoal
  } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Fetch names from the user's private database profile
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();
        
      if (data && !error) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    };
    fetchProfileData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    // Upsert ensures the data is saved ONLY to this user's unique ID (Privacy)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      starting_balance: startingBalance,
      leverage,
      broker,
      default_lot_size: defaultLotSize,
      trading_goal: tradingGoal
    });
    
    setLoading(false);
    
    if (error) {
      alert("System Error: " + error.message);
    } else {
      const btn = document.getElementById("profile-save-btn");
      if (btn) {
        btn.innerText = "✓ SYSTEM UPDATED";
        setTimeout(() => { 
          if (btn) btn.innerText = "UPDATE RESUME"; 
        }, 2000);
      }
    }
  };

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Identity Header: Pulls real names from registration */}
      <div className="glass-panel p-8 ring-1 ring-white/5 border-none mb-8 relative overflow-hidden flex flex-col items-center gap-4 bg-black/40 rounded-[2.5rem]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dondo-emerald)]/5 blur-[60px] pointer-events-none rounded-full" />
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--dondo-emerald)] to-[#065f46] p-1 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-10">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-4 border-black overflow-hidden relative">
                <User size={40} className="text-zinc-700" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--dondo-emerald)] text-black p-1.5 rounded-full border-4 border-black shadow-lg">
                <ShieldCheck size={14} strokeWidth={3} />
            </div>
          </div>

          <div className="text-center relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tighter capitalize">
              {firstName || lastName ? `${firstName} ${lastName}` : "Authenticated Trader"}
            </h2>
            <p className="text-[9px] text-[var(--dondo-emerald)] font-black uppercase tracking-[0.2em] mt-1 opacity-80">
              {user?.email}
            </p>
          </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* Identity & Account Setup Section */}
        <div className="glass-panel p-6 ring-1 ring-white/5 border-none bg-white/[0.01] rounded-3xl">
            <h3 className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-6 text-center">Terminal Identity & Specs</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-[var(--dondo-emerald)] transition-all capitalize" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-[var(--dondo-emerald)] transition-all capitalize" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Starting Equity</label>
                <input type="number" step="any" required value={startingBalance} onChange={e => setStartingBalance(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-[var(--dondo-emerald)] transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Default Lot Size</label>
                <input type="number" step="any" required value={defaultLotSize} onChange={e => setDefaultLotSize(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-white/30 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">System Leverage</label>
                <select value={leverage} onChange={e => setLeverage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-white/30 transition-all appearance-none">
                   <option value="1:1">1:1</option>
                   <option value="1:50">1:50</option>
                   <option value="1:100">1:100</option>
                   <option value="1:200">1:200</option>
                   <option value="1:400">1:400</option>
                   <option value="1:500">1:500</option>
                   <option value="1:1000">1:1000</option>
                   <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Active Broker</label>
                <input type="text" required value={broker} onChange={e => setBroker(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold outline-none focus:border-white/30 transition-all" />
              </div>
            </div>
        </div>

        {/* Psychological Motivation Section */}
        <div className="glass-panel p-6 ring-1 ring-white/5 border-none bg-gradient-to-br from-[var(--dondo-emerald)]/[0.03] to-transparent flex flex-col gap-4 rounded-3xl">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={14} className="text-[var(--dondo-emerald)]" />
                <h3 className="text-[10px] text-[var(--dondo-emerald)] font-black tracking-[0.2em] uppercase">The North Star</h3>
            </div>
            <div>
              <label className="text-[9px] text-white/30 font-bold uppercase tracking-widest mb-2 block text-center">My Strategic Mission / Long-term Goal</label>
              <textarea value={tradingGoal} onChange={e => setTradingGoal(e.target.value)} placeholder="Define your purpose..." className="w-full h-36 bg-black/40 border border-[var(--dondo-emerald)]/10 rounded-2xl p-5 text-white text-xs font-medium leading-relaxed outline-none focus:border-[var(--dondo-emerald)]/40 resize-none transition-all shadow-inner" />
            </div>
        </div>

        {/* Action Button */}
        <button id="profile-save-btn" type="submit" disabled={loading} className="w-full py-5 text-black font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl bg-[var(--dondo-emerald)] shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:bg-[#10b981]/90 active:scale-[0.97] transition-all">
            {loading ? 'SYNCING DATA...' : 'UPDATE RESUME'}
        </button>

      </form>
      
      {/* Footer Sign Out */}
      <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
        <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black tracking-[0.2em] uppercase text-red-500/50 hover:text-red-500 transition-all flex items-center gap-2 bg-red-500/5 px-6 py-3 rounded-xl border border-red-500/10 active:scale-95">
          <LogOut size={12} /> EXIT SYSTEM
        </button>
      </div>

    </div>
  );
}