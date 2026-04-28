"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type Trade = {
  id: string;
  user_id: string;
  asset: string;
  direction: string; 
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number | null;
  risk_reward: number | null;
  pnl: number | null;
  status: string | null;
  trade_date: string;
  created_at?: string;
  image_ltf?: string;
  image_mtf?: string;
  image_htf?: string;
  lesson?: string | null;
  mistake?: string | null;
  // COMPATIBILITY FIELDS - DO NOT REMOVE
  session?: string | null;
  setup_type?: string | null;
  sentiment?: string | null;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
};

type AppContextType = {
  user: User | null;
  loadingAuth: boolean;
  isZar: boolean;
  setIsZar: (val: boolean) => void;
  usdZarRate: number;
  trades: Trade[];
  fetchTrades: () => Promise<void>;
  startingBalance: number;
  setStartingBalance: (val: number) => void;
  leverage: string;
  setLeverage: (val: string) => void;
  broker: string;
  setBroker: (val: string) => void;
  defaultLotSize: number;
  setDefaultLotSize: (val: number) => void;
  isTradeModalOpen: boolean;
  setIsTradeModalOpen: (val: boolean) => void;
  selectedHeatmapDate: string | null;
  setSelectedHeatmapDate: (val: string | null) => void;
  currentMonth: Date;
  setCurrentMonth: (val: Date) => void;
  editingTrade: Trade | null;
  setEditingTrade: (val: Trade | null) => void;
  tradingGoal: string;
  setTradingGoal: (val: string) => void;
  withdrawals: Withdrawal[];
  fetchWithdrawals: () => Promise<void>;
  isWithdrawalModalOpen: boolean;
  setIsWithdrawalModalOpen: (val: boolean) => void;
  editingWithdrawal: Withdrawal | null;
  setEditingWithdrawal: (val: Withdrawal | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isZar, setIsZarState] = useState(true);
  const usdZarRate = 18.5;

  const [trades, setTrades] = useState<Trade[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [leverage, setLeverage] = useState("1:100");
  const [broker, setBroker] = useState("None");
  const [tradingGoal, setTradingGoal] = useState("");
  const [defaultLotSize, setDefaultLotSize] = useState(0.1);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);

  const setIsZar = (val: boolean) => {
    setIsZarState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dondo_currency_pref', val ? 'zar' : 'usd');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setTrades([]);
        setWithdrawals([]);
        setStartingBalance(0);
        setBroker("None");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchTrades = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id) 
      .order('trade_date', { ascending: false });

    if (data && !error) setTrades(data as Trade[]);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setStartingBalance(Number(profile.starting_balance || 0));
      setLeverage(profile.leverage || "1:100");
      setBroker(profile.broker || "None");
      setDefaultLotSize(Number(profile.default_lot_size || 0.1));
      setTradingGoal(profile.trading_goal || "");
    }
  };

  const fetchWithdrawals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('withdrawal_date', { ascending: false });

    if (data && !error) setWithdrawals(data as Withdrawal[]);
  };

  useEffect(() => {
    if (user) {
      fetchTrades();
      fetchWithdrawals();
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user, loadingAuth, isZar, setIsZar, usdZarRate, trades, fetchTrades,
      startingBalance, setStartingBalance, 
      leverage, setLeverage, broker, setBroker, defaultLotSize, setDefaultLotSize,
      tradingGoal, setTradingGoal,
      isTradeModalOpen, setIsTradeModalOpen, selectedHeatmapDate, setSelectedHeatmapDate,
      currentMonth, setCurrentMonth, editingTrade, setEditingTrade,
      withdrawals, fetchWithdrawals, isWithdrawalModalOpen, setIsWithdrawalModalOpen,
      editingWithdrawal, setEditingWithdrawal
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}