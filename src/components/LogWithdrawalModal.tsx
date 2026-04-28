"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { X, CheckCircle2 } from "lucide-react";

export default function LogWithdrawalModal() {
  const { 
    user, 
    isWithdrawalModalOpen, setIsWithdrawalModalOpen, 
    editingWithdrawal, setEditingWithdrawal,
    fetchWithdrawals, isZar, usdZarRate
  } = useAppContext();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingWithdrawal) {
      setDate(editingWithdrawal.withdrawal_date.split('T')[0]);
      
      let displayAmount = editingWithdrawal.amount;
      if (isZar) displayAmount = displayAmount * usdZarRate;
      
      setAmount(displayAmount.toString());
      setNotes(editingWithdrawal.notes || "");
      setIsWithdrawalModalOpen(true);
    } else if (isWithdrawalModalOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setAmount("");
      setNotes("");
    }
  }, [editingWithdrawal, isWithdrawalModalOpen, setIsWithdrawalModalOpen, isZar, usdZarRate, setEditingWithdrawal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    let parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
       alert("Amount must be a valid positive number.");
       setLoading(false);
       return;
    }

    // Convert back to USD base for database storage
    if (isZar) {
       parsedAmount = parsedAmount / usdZarRate;
    }

    const payload = {
      user_id: user.id,
      amount: parsedAmount,
      withdrawal_date: `${date}T12:00:00Z`,
      notes: notes || null
    };

    const { error } = editingWithdrawal 
      ? await supabase.from('withdrawals').update(payload).eq('id', editingWithdrawal.id)
      : await supabase.from('withdrawals').insert([payload]);

    if (error) {
      alert("System Error: " + error.message);
    } else {
      await fetchWithdrawals();
      handleClose();
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsWithdrawalModalOpen(false);
    // Short delay before clearing edit state for smooth animation
    setTimeout(() => {
      setEditingWithdrawal(null);
    }, 300);
  };

  if (!isWithdrawalModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Body */}
      <div className="bg-[#050505] border border-white/10 ring-1 ring-[#fbbf24]/20 rounded-3xl w-full max-w-sm relative z-10 animate-in zoom-in-95 slide-in-from-bottom-10 flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(251,191,36,0.15)]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#fbbf24]/10 to-transparent rounded-t-3xl">
          <h2 className="text-white font-black tracking-tighter text-xl flex items-center gap-2">
            <span className="text-[#fbbf24]">{isZar ? 'R' : '$'}</span> {editingWithdrawal ? "Resync Payday" : "Log Payday"}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-5">
           <form id="withdrawalForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="bg-black/50 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Withdrawal Date</label>
                    <input 
                      type="date" required value={date} onChange={e => setDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#fbbf24] transition"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Amount Withdrawn</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{isZar ? 'R' : '$'}</span>
                       <input 
                         type="number" step="any" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                         className="w-full bg-white/5 border border-[#fbbf24]/20 rounded-xl pl-8 pr-4 py-3 text-white font-black text-lg outline-none focus:border-[#fbbf24] transition shadow-inner"
                       />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Optional Notes / Remarks</label>
                    <textarea 
                      value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Paid Rent, Bought new gear..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[#fbbf24] transition h-20 resize-none"
                    />
                  </div>
              </div>
           </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/5 bg-black/40 rounded-b-3xl mt-auto">
           <button 
             type="submit" form="withdrawalForm" disabled={loading}
             className="w-full py-4 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 btn-tactile text-xs disabled:opacity-50"
           >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 size={16} /> {editingWithdrawal ? 'UPDATE PAYDAY' : 'SECURE THE BAG'}</>
              )}
           </button>
        </div>
      </div>
    </div>
  );
}