"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Wallet } from "lucide-react";
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

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-black"><div className="w-12 h-12 border-4 border-[var(--dondo-emerald)] border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return <AuthPage />;

  return (
    <div className="pb-36 bg-black min-h-screen w-full relative">
       {/* RESTORED TEXT HEADER */}
       <header className="flex justify-between items-center p-5 pt-8">
         <div className="flex flex-col">
            <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Trading Journal</div>
            <div className="text-2xl font-black text-white tracking-tighter leading-none">
              Dondo<span className="text-[var(--dondo-emerald)]">.</span>
            </div>
         </div>
         <div className="flex gap-2.5 items-center">
            <div className="bg-white/5 rounded-full flex p-1 border border-white/10">
              <button onClick={() => setIsZar(false)} className={`${!isZar ? 'bg-[var(--dondo-emerald)] text-black' : 'text-zinc-500'} rounded-full px-4 py-1 text-[10px] font-black`}>USD</button>
              <button onClick={() => setIsZar(true)} className={`${isZar ? 'bg-[var(--dondo-emerald)] text-black' : 'text-zinc-500'} rounded-full px-4 py-1 text-[10px] font-black`}>ZAR</button>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="w-10 h-10 rounded-full bg-[var(--dondo-emerald)] flex items-center justify-center text-black font-black">RC</button>
         </div>
       </header>

       {/* Top Dashboard Action Buttons */}
       {activeTab === "DASHBOARD" && (
         <div className="px-5 mb-8 flex gap-3">
            <button onClick={() => setIsTradeModalOpen(true)} className="flex-1 py-4 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 text-xs shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
               <Plus size={18} /> LOG TRADE
            </button>
            <button onClick={() => setIsWithdrawalModalOpen(true)} className="px-6 bg-[#fbbf24] text-black font-black rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(251,191,36,0.2)]">
               <Wallet size={18} />
            </button>
         </div>
       )}

       <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
         {activeTab === "DASHBOARD" && <Dashboard setActiveTab={setActiveTab} />}
         {activeTab === "TRADES" && <TradesView />}
         {activeTab === "ANALYTICS" && <AnalyticsView />}
         {activeTab === "PROFILE" && <ProfileView />}
         {activeTab === "HEATMAP_DETAILS" && <HeatmapDetailsView setActiveTab={setActiveTab} />}
         {activeTab === "MONTHLY_DETAILS" && <MonthlyDetailsView setActiveTab={setActiveTab} />}
       </div>

       <LogTradeModal />
       <LogWithdrawalModal />
       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}