"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import BottomNav from "@/components/BottomNav";
import LogTradeModal from "@/components/LogTradeModal";
import ProfileView from "@/components/ProfileView"; // Ensure these are imported
import TradesView from "@/components/TradesView";   // Ensure these are imported
import HeatmapDetailsView from "@/components/HeatmapDetailsView";

export default function Home() {
  const { user, loadingAuth } = useAppContext();
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  // LOADING STATE: Prevents "flickering" while Supabase checks the session
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-[var(--dondo-emerald)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // SECURITY GATE: Redirects to Login if no user is found
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="bg-black min-h-screen w-full relative pb-32 overflow-x-hidden">
       
       {/* TAB NAVIGATION LOGIC */}
       {activeTab === "DASHBOARD" && <Dashboard setActiveTab={setActiveTab} />}
       {activeTab === "TRADES" && <TradesView setActiveTab={setActiveTab} />}
       {activeTab === "PROFILE" && <ProfileView />}
       {activeTab === "MONTHLY_DETAILS" && <HeatmapDetailsView setActiveTab={setActiveTab} />}
       
       {/* PERSISTENT ELEMENTS */}
       <LogTradeModal />
       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}