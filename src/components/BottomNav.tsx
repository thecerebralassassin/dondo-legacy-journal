import { LayoutGrid, Activity, PieChart, User } from "lucide-react";

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: "DASHBOARD", icon: LayoutGrid },
    { id: "TRADES", icon: Activity },
    { id: "ANALYTICS", icon: PieChart },
    { id: "PROFILE", icon: User }
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 glass-panel rounded-[2rem] flex justify-between px-6 py-4 border border-white/10 ring-1 ring-white/5 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-[var(--dondo-emerald)]' : 'text-zinc-500 hover:text-white'}`}
          >
            <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.id}</span>
          </button>
        );
      })}
    </div>
  );
}
