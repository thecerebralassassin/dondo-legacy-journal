"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import BottomNav from "@/components/BottomNav";
import LogTradeModal from "@/components/LogTradeModal";
import LogWithdrawalModal from "@/components/LogWithdrawalModal";
import ProfileView from "@/components/ProfileView";
import TradesView from "@/components/TradesView";
import AnalyticsView from "@/components/AnalyticsView";
import HeatmapDetailsView from "@/components/HeatmapDetailsView";
import MonthlyDetailsView from "@/components/MonthlyDetailsView";
import ViewTradeModal from "@/components/ViewTradeModal";

export default function Home() {
  const { user, loadingAuth } = useAppContext();
  const [activeTab, setActiveTabInternal] = useState("DASHBOARD");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dondo_active_tab");
    if (saved) setActiveTabInternal(saved);
    setHydrated(true);
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab);
    localStorage.setItem("dondo_active_tab", tab);
  };

  if (loadingAuth || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-[var(--dondo-emerald)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="bg-black min-h-screen w-full relative pb-32 overflow-x-hidden">
        {/* Keep Dashboard mounted but hidden to prevent image flicker/reload */}
        <div className={activeTab === "DASHBOARD" ? "block" : "hidden"}>
          <Dashboard setActiveTab={setActiveTab} />
        </div>

        {activeTab === "TRADES" && <TradesView />}
        {activeTab === "ANALYTICS" && <AnalyticsView />}
        {activeTab === "PROFILE" && <ProfileView />}
        {activeTab === "MONTHLY_DETAILS" && <MonthlyDetailsView setActiveTab={setActiveTab} />}
        {activeTab === "HEATMAP_DETAILS" && <HeatmapDetailsView setActiveTab={setActiveTab} />}
       
       <LogTradeModal />
       <LogWithdrawalModal />
       <ViewTradeModal />
       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}