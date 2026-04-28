"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  image_ltf?: string;
  image_mtf?: string;
  image_htf?: string;
  lesson?: string | null;
  mistake?: string | null;
  session?: string | null;
  setup_type?: string | null;
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
  firstName: string;
  lastName: string;
  isZar: boolean;
  setIsZar: (val: boolean) => void;
  usdZarRate: number;
  trades: Trade[];
  withdrawals: Withdrawal[];
  fetchTrades: () => Promise<void>;
  fetchWithdrawals: () => Promise<void>;
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
  isWithdrawalModalOpen: boolean;
  setIsWithdrawalModalOpen: (val: boolean) => void;
  editingTrade: Trade | null;
  setEditingTrade: (val: Trade | null) => void;
  editingWithdrawal: Withdrawal | null;
  setEditingWithdrawal: (val: Withdrawal | null) => void;
  tradingGoal: string;
  setTradingGoal: (val: string) => void;
  selectedHeatmapDate: string | null;
  setSelectedHeatmapDate: (val: string | null) => void;
  currentMonth: Date;
  setCurrentMonth: (val: Date) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [startingBalance, setStartingBalance] = useState(0);
  const [leverage, setLeverage] = useState("1:100");
  const [broker, setBroker] = useState("None");
  const [tradingGoal, setTradingGoal] = useState("");
  const [defaultLotSize, setDefaultLotSize] = useState(0.1);
  const [isZar, setIsZarState] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const usdZarRate = 18.5;

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const setIsZar = (val: boolean) => {
    setIsZarState(val);
    if (typeof window !== 'undefined') localStorage.setItem('currency_pref', val ? 'zar' : 'usd');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    // Initialize currency preference from localStorage
    if (typeof window !== 'undefined') {
      const pref = localStorage.getItem('currency_pref');
      if (pref === 'usd') setIsZarState(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchTrades = useCallback(async () => {
    if (!user) return;
    const { data: tData } = await supabase.from('trades').select('*').eq('user_id', user.id).order('trade_date', { ascending: false });
    if (tData) setTrades(tData as Trade[]);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setStartingBalance(Number(profile.starting_balance) || 0);
      setLeverage(profile.leverage || "1:100");
      setBroker(profile.broker || "None");
      setDefaultLotSize(Number(profile.default_lot_size) || 0.1);
      setTradingGoal(profile.trading_goal || "");
    }
  }, [user]);

  const fetchWithdrawals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('withdrawals').select('*').eq('user_id', user.id);
    if (data) setWithdrawals(data as Withdrawal[]);
  }, [user]);

  useEffect(() => { 
    if (user) { 
      fetchTrades(); 
      fetchWithdrawals(); 
    } 
  }, [user, fetchTrades, fetchWithdrawals]);

  return (
    <AppContext.Provider value={{
      user, loadingAuth, firstName, lastName, isZar, setIsZar, usdZarRate, trades, withdrawals, fetchTrades, fetchWithdrawals,
      startingBalance, setStartingBalance, leverage, setLeverage, broker, setBroker,
      defaultLotSize, setDefaultLotSize, isTradeModalOpen, setIsTradeModalOpen,
      isWithdrawalModalOpen, setIsWithdrawalModalOpen, editingTrade, setEditingTrade,
      editingWithdrawal, setEditingWithdrawal, tradingGoal, setTradingGoal,
      selectedHeatmapDate, setSelectedHeatmapDate,
      currentMonth, setCurrentMonth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext error");
  return context;
};