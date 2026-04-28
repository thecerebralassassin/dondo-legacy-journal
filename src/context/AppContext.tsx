"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type Trade = {
  id: string;
  user_id: string;
  asset: string;
  direction: string;
  status: string;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number | null;
  pnl: number;
  trade_date: string;
  image_ltf?: string;
  image_mtf?: string;
  image_htf?: string;
  lesson?: string;
  mistake?: string;
  session?: string;
  setup_type?: string;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  withdrawal_date: string;
  notes?: string;
};

type AppContextType = {
  user: any;
  trades: Trade[];
  withdrawals: Withdrawal[];
  isZar: boolean;
  setIsZar: (val: boolean) => void;
  usdZarRate: number;
  startingBalance: number;
  setStartingBalance: (val: number) => void;
  goalsText: string;
  setGoalsText: (val: string) => void;
  goalsImage: string;
  setGoalsImage: (val: string) => void;
  fetchTrades: () => Promise<void>;
  fetchWithdrawals: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  loadingAuth: boolean;
  selectedHeatmapDate: string | null;
  setSelectedHeatmapDate: (val: string | null) => void;
  isTradeModalOpen: boolean;
  setIsTradeModalOpen: (val: boolean) => void;
  isWithdrawalModalOpen: boolean;
  setIsWithdrawalModalOpen: (val: boolean) => void;
  editingTrade: Trade | null;
  setEditingTrade: (t: Trade | null) => void;
  editingWithdrawal: Withdrawal | null;
  setEditingWithdrawal: (w: Withdrawal | null) => void;
  currentMonth: Date | null;
  setCurrentMonth: (d: Date) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isZar, setIsZarInternal] = useState(false);
  const [startingBalance, setStartingBalanceInternal] = useState(0);
  const [goalsText, setGoalsTextInternal] = useState("");
  const [goalsImage, setGoalsImageInternal] = useState("");
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [selectedHeatmapDate, setSelectedHeatmapDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const usdZarRate = 18.5;

  useEffect(() => {
    setCurrentMonth(new Date());
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingAuth(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('starting_balance, currency_pref, goals_text, goals_image')
      .eq('id', user.id)
      .single();
    
    if (data && !error) {
      setStartingBalanceInternal(data.starting_balance || 0);
      setIsZarInternal(data.currency_pref === 'ZAR');
      setGoalsTextInternal(data.goals_text || "");
      setGoalsImageInternal(data.goals_image || "");
    }
  }, [user]);

  const fetchTrades = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('trade_date', { ascending: false });
    
    if (data && !error) setTrades(data);
  }, [user]);

  const fetchWithdrawals = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('withdrawal_date', { ascending: false });
    
    if (data && !error) setWithdrawals(data);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTrades();
      fetchWithdrawals();
    }
  }, [user, fetchProfile, fetchTrades, fetchWithdrawals]);

  const setIsZar = async (val: boolean) => {
    setIsZarInternal(val);
    if (user) {
      await supabase.from('profiles').update({ currency_pref: val ? 'ZAR' : 'USD' }).eq('id', user.id);
    }
  };

  const setStartingBalance = async (val: number) => {
    setStartingBalanceInternal(val);
    if (user) {
      await supabase.from('profiles').update({ starting_balance: val }).eq('id', user.id);
    }
  };

  const setGoalsText = (val: string) => setGoalsTextInternal(val);
  const setGoalsImage = (val: string) => setGoalsImageInternal(val);

  return (
    <AppContext.Provider value={{
      user, trades, withdrawals, isZar, setIsZar, usdZarRate, startingBalance, setStartingBalance,
      goalsText, setGoalsText, goalsImage, setGoalsImage,
      fetchTrades, fetchWithdrawals, fetchProfile, loadingAuth, 
      selectedHeatmapDate, setSelectedHeatmapDate,
      isTradeModalOpen, setIsTradeModalOpen,
      isWithdrawalModalOpen, setIsWithdrawalModalOpen,
      editingTrade, setEditingTrade, editingWithdrawal, setEditingWithdrawal,
      currentMonth, setCurrentMonth
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppContext must be used within AppProvider");
  return context;
}