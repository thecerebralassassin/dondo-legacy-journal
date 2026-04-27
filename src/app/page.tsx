"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Wallet } from "lucide-react";

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

  // Dynamic Initials for the User Profile Button
  const getUserInitials = () => {
    if (!user) return "??";
    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";
    if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
    return user.email?.substring(0, 2).toUpperCase() || "TR";
  };

  // 1. FIXED: Stop the "Ghost Login" glitch by strictly waiting for auth
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-[var(--dondo-emerald)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. FIXED: Force separate accounts by redirecting to AuthPage if no user session
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="bg-black min-h-screen w-full relative overflow-x-hidden">
       {/* RESTORED HEADER: Trading Journal Dondo. */}
       <header className="flex justify-between items-center p-5 pt-8 mb-4">
         <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-black mb-0.5">Trading Journal</div>
            <div className="text-2xl font-black text-white tracking-tighter leading-none">
              Dondo<span className="text-[var(--dondo-emerald)]">.</span>
            </div>
         </div>
         
         <div className="flex gap-2.5 items-center animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Currency Toggle */}
            <div className="bg-white/5 rounded-full flex p-1 border border-white/10 ring-1 ring-white/5">
              <button onClick={() => setIsZar(false)} className={`${!isZar ? 'bg-[var(--dondo-emerald)] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1 text-[10px] tracking-widest font-black`}>USD</button>
              <button onClick={() => setIsZar(true)} className={`${isZar ? 'bg-[var(--dondo-emerald)] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-white transition'} rounded-full px-4 py-1 text-[10px] tracking-widest font-black`}>ZAR</button>
            </div>
            
            {/* Sign Out Button - Dynamic Initials */}
            <button 
              onClick={() => supabase.auth.signOut()} 
              className="w-10 h-10 rounded-full bg-[var(--dondo-emerald)] flex items-center justify-center text-black font-black text-xs transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-black/20"
            >
              {getUserInitials()}
            </button>
         </div>
       </header>

       {/* Top Dashboard Action Buttons - Correct Placement */}
       {activeTab === "DASHBOARD" && (
         <div className="px-5 mb-8 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-700">
            <button 
              onClick={() => setIsTradeModalOpen(true)} 
              className="flex-1 py-4 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 text-xs shadow-[0_10px_25px_rgba(16,185,129,0.2)] hover:opacity-90 active:scale-95 transition-all"
            >
               <Plus size={18} className="stroke-[3]" /> LOG TRADE
            </button>
            <button 
              onClick={() => setIsWithdrawalModalOpen(true)} 
              className="px-6 bg-[#fbbf24] text-black font-black rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(251,191,36,0.2)] hover:opacity-90 active:scale-95 transition-all"
            >
               <Wallet size={18} />
            </button>
         </div>
       )}

       {/* Main Content Area */}
       <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 z-10 relative pb-40">
         {activeTab === "DASHBOARD" && <Dashboard setActiveTab={setActiveTab} />}
         {activeTab === "TRADES" && <TradesView />}
         {activeTab === "ANALYTICS" && <AnalyticsView />}
         {activeTab === "PROFILE" && <ProfileView />}
         {activeTab === "HEATMAP_DETAILS" && <HeatmapDetailsView setActiveTab={setActiveTab} />}
         {activeTab === "MONTHLY_DETAILS" && <MonthlyDetailsView setActiveTab={setActiveTab} />}

         {/* GLOBAL FOOTER: Integrated into the scroll area */}
         <div className="mt-16 mb-8 text-center px-5 opacity-40">
           <p className="text-[7px] tracking-[0.3em] font-black text-zinc-500 uppercase">
             © By DondoLegacy | Created by Mr RC Dondo
           </p>
         </div>
       </div>

       {/* Floating Modals & Navigation */}
       <LogTradeModal />
       <LogWithdrawalModal />
       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}