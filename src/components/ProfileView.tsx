"use client";

import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";

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

  // Fetch the actual names from the database
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
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
      alert(error.message);
    } else {
      const btn = document.getElementById("profile-save-btn");
      if (btn) btn.innerText = "✓ UPDATED";
      setTimeout(() => { if (btn) btn.innerText = "UPDATE RESUME"; }, 2000);
    }
  };

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Identity Header */}
      <div className="glass-panel p-6 ring-1 ring-white/5 border-none mb-6 relative overflow-hidden flex flex-col items-center gap-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dondo-emerald)]/10 blur-[50px] pointer-events-none rounded-full" />
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--dondo-emerald)] to-[#047857] p-1 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative z-10">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-black overflow-hidden relative">
                <User size={32} className="text-white/50" />
            </div>
          </div>
          <div className="text-center relative z-10">
            <h2 className="text-2xl font-black text-white tracking-tighter shadow-sm capitalize">
              {firstName || lastName ? `${firstName} ${lastName}` : "Trader"}
            </h2>
            <p className="text-[10px] text-[var(--dondo-emerald)] font-bold uppercase tracking-widest">{user?.email}</p>
          </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* Global Finance Config */}
        <div className="glass-panel p-5 ring-1 ring-white/5 border-none bg-white/[0.015]">
            <h3 className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-4 text-center">Identity & Account Specs</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">First Name</label>
                <input 
                  type="text" value={firstName} onChange={e => setFirstName(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[var(--dondo-emerald)] transition capitalize" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Last Name</label>
                <input 
                  type="text" value={lastName} onChange={e => setLastName(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[var(--dondo-emerald)] transition capitalize" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Starting Equity</label>
                <input 
                  type="number" step="any" required 
                  value={startingBalance} onChange={e => setStartingBalance(Number(e.target.value))} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-black outline-none focus:border-[var(--dondo-emerald)] transition" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Default Lot Size</label>
                <input 
                  type="number" step="any" required 
                  value={defaultLotSize} onChange={e => setDefaultLotSize(Number(e.target.value))} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-black outline-none focus:border-white/30 transition" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Leverage</label>
                <select 
                  value={leverage} onChange={e => setLeverage(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm font-bold outline-none focus:border-white/30 transition appearance-none"
                >
                   <option value="1:1">1:1</option>
                   <option value="1:50">1:50</option>
                   <option value="1:100">1:100</option>
                   <option value="1:200">1:200</option>
                   <option value="1:400">1:400</option>
                   <option value="1:500">1:500</option>
                   <option value="1:1000">1:1000</option>
                   <option value="1:2000">1:2000</option>
                   <option value="1:3000">1:3000</option>
                   <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1 block">Broker Name</label>
                <input 
                  type="text" required 
                  value={broker} onChange={e => setBroker(e.target.value)} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm font-bold outline-none focus:border-white/30 transition" 
                />
              </div>
            </div>
        </div>

        {/* Psychological Code */}
        <div className="glass-panel p-5 ring-1 ring-white/5 border-none bg-gradient-to-br from-[var(--dondo-emerald)]/5 to-transparent flex flex-col gap-4">
            <h3 className="text-[10px] text-[var(--dondo-emerald)] font-bold tracking-widest uppercase text-center">My Trading Goal</h3>
            
            <div>
              <label className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1.5 block">My Trading Why / Long-term Goal</label>
              <textarea 
                  value={tradingGoal} onChange={e => setTradingGoal(e.target.value)} 
                  placeholder="Why are you doing this? What is the final goal?"
                  className="w-full h-32 bg-black/60 border border-[var(--dondo-emerald)]/20 rounded-xl p-4 text-white text-xs font-medium leading-relaxed outline-none focus:border-[var(--dondo-emerald)] resize-none transition shadow-inner" 
              />
            </div>
        </div>

        <button id="profile-save-btn" type="submit" disabled={loading} className="w-full py-4 text-black font-black uppercase tracking-widest rounded-xl bg-[var(--dondo-emerald)] hover:bg-[#059669] transition shadow-[0_0_20px_rgba(16,185,129,0.3)] btn-tactile text-xs flex justify-center items-center gap-2">
            {loading ? 'SYNCING...' : 'UPDATE RESUME'}
        </button>

      </form>
      
      <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="text-[10px] font-bold tracking-widest uppercase text-red-500/70 hover:text-red-500 transition flex items-center gap-2 bg-red-500/5 px-4 py-2 rounded-lg border border-red-500/10 btn-tactile"
        >
          <LogOut size={12} /> Sign Out
        </button>
      </div>

    </div>
  );
}