"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus } from "lucide-react";

// Components
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import BottomNav from "@/components/BottomNav";
import LogTradeModal from "@/components/LogTradeModal";
import LogWithdrawalModal from "@/components/LogWithdrawalModal";
import TradesView from "@/components/TradesView";
import AnalyticsView from "@/components/AnalyticsView";
import ProfileView from "@/components/ProfileView";
import HeatmapDetailsView from "@/components/HeatmapDetailsView";
import MonthlyDetailsView from "@/components/MonthlyDetailsView";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { user, loadingAuth, isZar, setIsZar, setIsTradeModalOpen, setIsWithdrawalModalOpen } = useAppContext();
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-[var(--dondo-emerald)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="pb-36 bg-black min-h-screen w-full relative">
       {/* Global Header */}
       <header className="flex justify-between items-center p-5 pt-8">
         <div className="flex flex-col">
            <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Trading Journal</div>
            <div className="text-2xl font-black text-white tracking-tighter leading-none">
              Dondo<span className="text-[var(--dondo-emerald)]">.</span>
            </div>
         </div>
         
         <div className="flex gap-2.5 items-center">
            {/* Currency Toggle */}
            <div className="bg-white/5 rounded-full flex p-1 border border-white/10 ring-1 ring-white/5">
              <button onClick={() => setIsZar(false)} className={`${!isZar ? 'bg-[var(--dondo-emerald)] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1 text-[10px] tracking-widest font-black`}>USD</button>
              <button onClick={() => setIsZar(true)} className={`${isZar ? 'bg-[var(--dondo-emerald)] text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1 text-[10px] tracking-widest font-black`}>ZAR</button>
            </div>
            
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="w-10 h-10 rounded-full bg-[var(--dondo-emerald)] flex items-center justify-center text-black font-black text-sm transition-transform hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              RC
            </button>
         </div>
       </header>

       {/* Tab Content */}
       <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
         {activeTab === "DASHBOARD" && <Dashboard setActiveTab={setActiveTab} />}
         {activeTab === "TRADES" && <TradesView />}
         {activeTab === "ANALYTICS" && <AnalyticsView />}
         {activeTab === "PROFILE" && <ProfileView />}
         {activeTab === "HEATMAP_DETAILS" && <HeatmapDetailsView setActiveTab={setActiveTab} />}
         {activeTab === "MONTHLY_DETAILS" && <MonthlyDetailsView setActiveTab={setActiveTab} />}
       </div>

       {/* Floating Action Buttons - ONLY visible on Dashboard and Trades */}
       {(activeTab === "DASHBOARD" || activeTab === "TRADES") && (
         <div className="fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40 animate-in fade-in zoom-in duration-300">
           <button onClick={() => setIsTradeModalOpen(true)} className="bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-widest px-8 py-3.5 rounded-full flex items-center gap-2 shadow-[0_5px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_5px_40px_rgba(16,185,129,0.5)] transition-all btn-tactile">
             <Plus size={20} className="stroke-[3]" /> LOG TRADE
           </button>
           
           <button onClick={() => setIsWithdrawalModalOpen(true)} className="bg-[#fbbf24] text-black font-black uppercase tracking-widest px-6 py-3.5 rounded-full flex items-center gap-2 shadow-[0_5px_30px_rgba(251,191,36,0.35)] hover:shadow-[0_5px_40px_rgba(251,191,36,0.5)] transition-all btn-tactile">
             <span className="font-bold text-lg leading-none mt-0.5">$</span>
           </button>
         </div>
       )}

       {/* Modals & Nav */}
       <LogTradeModal />
       <LogWithdrawalModal />
       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
       
       <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-30"></div>
       
       <div className="fixed bottom-3 left-0 w-full text-center z-40 pointer-events-none">
          <p className="text-[7px] tracking-[0.2em] font-black text-zinc-600 uppercase">© By DondoLegacy | Created by Mr RC Dondo</p>
       </div>
    </div>
  );
}