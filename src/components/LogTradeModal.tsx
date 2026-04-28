"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function LogTradeModal() {
  const { user, isTradeModalOpen, setIsTradeModalOpen, fetchTrades, isZar, usdZarRate, editingTrade, setEditingTrade } = useAppContext();

  // Core States
  const [asset, setAsset] = useState("US30");
  const [direction, setDirection] = useState("BUY"); 
  const [status, setStatus] = useState("win");
  const [tradeDate, setTradeDate] = useState(""); 
  const [tradeTime, setTradeTime] = useState("");
  
  // Financial Inputs
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState(""); // Now Optional
  const [takeProfit, setTakeProfit] = useState(""); // Now Optional
  const [lotSize, setLotSize] = useState("");
  const [pnl, setPnl] = useState("");
  
  // Qualitative Inputs
  const [lesson, setLesson] = useState("");
  const [mistake, setMistake] = useState("");
  const [loading, setLoading] = useState(false);

  // Evidence Files
  const [ltfFile, setLtfFile] = useState<File | null>(null);
  const [ltfUrl, setLtfUrl] = useState("");
  const [mtfFile, setMtfFile] = useState<File | null>(null);
  const [mtfUrl, setMtfUrl] = useState("");
  const [htfFile, setHtfFile] = useState<File | null>(null);
  const [htfUrl, setHtfUrl] = useState("");

  useEffect(() => {
    if (editingTrade) {
      setAsset(editingTrade.asset || "");
      setDirection(editingTrade.direction || "BUY");
      setStatus(editingTrade.status || "win");
      setEntryPrice(editingTrade.entry_price?.toString() || "");
      setStopLoss(editingTrade.stop_loss?.toString() || "");
      setTakeProfit(editingTrade.take_profit?.toString() || "");
      setLotSize(editingTrade.lot_size?.toString() || "");
      
      let basePnl = editingTrade.pnl || 0;
      if (isZar) basePnl = basePnl * usdZarRate;
      setPnl(basePnl.toFixed(2));
      
      setLesson(editingTrade.lesson || "");
      setMistake(editingTrade.mistake || "");
      
      // Separate Date and Time from the ISO string
      const dateObj = new Date(editingTrade.trade_date);
      setTradeDate(dateObj.toISOString().split('T')[0]);
      setTradeTime(dateObj.toTimeString().substring(0, 5));
      
      setLtfUrl(editingTrade.image_ltf || "");
      setMtfUrl(editingTrade.image_mtf || "");
      setHtfUrl(editingTrade.image_htf || "");
      setIsTradeModalOpen(true);
    } else if (isTradeModalOpen) {
      // Default to current South African time
      const now = new Date();
      setTradeDate(now.toISOString().split('T')[0]); 
      setTradeTime(now.toTimeString().substring(0, 5));
    }
  }, [editingTrade, isTradeModalOpen]);

  const uploadImageObj = async (file: File) => {
    const fileName = `${user?.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const { data, error } = await supabase.storage.from('trade_images').upload(fileName, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('trade_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    let finalPnl = pnl ? parseFloat(pnl) : 0;
    if (isZar) finalPnl = finalPnl / usdZarRate;
    if (status === 'loss') finalPnl = -Math.abs(finalPnl);
    
    // Combine Date and Time for the database
    const isoDate = new Date(`${tradeDate}T${tradeTime}:00`).toISOString();

    let insertLtf = ltfUrl, insertMtf = mtfUrl, insertHtf = htfUrl;
    if (ltfFile) insertLtf = await uploadImageObj(ltfFile) || "";
    if (mtfFile) insertMtf = await uploadImageObj(mtfFile) || "";
    if (htfFile) insertHtf = await uploadImageObj(htfFile) || "";

    const tradeData = {
      user_id: user.id, 
      asset, 
      direction, 
      entry_price: parseFloat(entryPrice), 
      // Handle Optional numbers: if empty, send null
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      take_profit: takeProfit ? parseFloat(takeProfit) : null, 
      lot_size: parseFloat(lotSize),
      pnl: finalPnl, 
      status, 
      lesson, 
      mistake,
      trade_date: isoDate, 
      image_ltf: insertLtf, 
      image_mtf: insertMtf, 
      image_htf: insertHtf
    };

    const { error } = editingTrade 
      ? await supabase.from('trades').update(tradeData).eq('id', editingTrade.id)
      : await supabase.from('trades').insert(tradeData);

    if (!error) { 
      await fetchTrades(); 
      handleClose(); 
    } else {
      alert("Database error: " + error.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsTradeModalOpen(false);
    setEditingTrade(null);
    // Reset image states for fresh log
    setLtfFile(null); setMtfFile(null); setHtfFile(null);
  };

  const ImageUploader = ({ label, url, setUrl, setFile }: any) => {
    const handleFileChange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setUrl(URL.createObjectURL(e.target.files[0]));
      }
    };
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</label>
        <label className="relative w-full h-16 rounded-xl bg-white/5 border border-white/10 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition hover:bg-white/[0.08]">
          {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-zinc-600" />}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>
    );
  };

  if (!isTradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#050505] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-500">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
          <h2 className="text-white font-black tracking-widest uppercase text-xs">Log in trade details</h2>
          <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition"><X size={20} /></button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-40">
          <form id="main-trade-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            {/* Row 1: Asset & Direction */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Asset</label>
                  <input type="text" value={asset} onChange={e => setAsset(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[var(--dondo-emerald)] transition" placeholder="e.g. US30" required />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Direction</label>
                  <div className="flex gap-2 h-[56px]">
                    <button type="button" onClick={() => setDirection('BUY')} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${direction === 'BUY' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-zinc-500'}`}>Buy</button>
                    <button type="button" onClick={() => setDirection('SELL')} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${direction === 'SELL' ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]' : 'bg-white/5 text-zinc-500'}`}>Sell</button>
                  </div>
               </div>
            </div>

            {/* Row 2: Date & Time */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Trade Date</label>
                  <input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none [color-scheme:dark] focus:border-[var(--dondo-emerald)]" required />
               </div>
               <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Trade Time</label>
                  <input type="time" value={tradeTime} onChange={e => setTradeTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none [color-scheme:dark] focus:border-[var(--dondo-emerald)]" required />
               </div>
            </div>

            {/* Row 3: Result Toggle */}
            <div className="flex flex-col gap-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Trade Outcome</label>
                <div className="flex gap-3 h-[60px]">
                    <button type="button" onClick={() => setStatus('win')} className={`flex-1 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${status === 'win' ? 'bg-[var(--dondo-emerald)] text-black' : 'bg-white/5 text-zinc-600'}`}>WINNER</button>
                    <button type="button" onClick={() => setStatus('loss')} className={`flex-1 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${status === 'loss' ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-600'}`}>LOSS</button>
                </div>
            </div>

            {/* Row 4: Evidence Uploads */}
            <div className="grid grid-cols-3 gap-3">
              <ImageUploader label="LTF (Entry)" url={ltfUrl} setUrl={setLtfUrl} setFile={setLtfFile} />
              <ImageUploader label="MTF (Context)" url={mtfUrl} setUrl={setMtfUrl} setFile={setMtfFile} />
              <ImageUploader label="HTF (Bias)" url={htfUrl} setUrl={setHtfUrl} setFile={setHtfFile} />
            </div>

            {/* Row 5: Financial Coordinates */}
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Entry Price</label>
                 <input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30" required />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Lot Size</label>
                 <input type="number" step="any" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/30" required />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] text-red-500/50 font-bold uppercase tracking-widest">Stop Loss (Optional)</label>
                 <input type="number" step="any" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="bg-white/5 border border-red-500/20 rounded-xl p-4 text-red-400 outline-none focus:border-red-500/40" />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] text-[var(--dondo-emerald)]/50 font-bold uppercase tracking-widest">Take Profit (Optional)</label>
                 <input type="number" step="any" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="bg-white/5 border border-[var(--dondo-emerald)]/20 rounded-xl p-4 text-[var(--dondo-emerald)] outline-none focus:border-[var(--dondo-emerald)]/40" />
               </div>
            </div>

            {/* Row 6: PnL Display */}
            <div className="flex flex-col gap-2">
               <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center">Net Profit/Loss {isZar ? '(ZAR)' : '(USD)'}</label>
               <input type="number" step="any" value={pnl} onChange={e => setPnl(e.target.value)} className="bg-black border-2 border-[var(--dondo-emerald)]/30 rounded-2xl p-6 text-4xl font-black text-white outline-none text-center shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" required />
            </div>

            {/* Row 7: Psychological Review */}
            <div className="grid grid-cols-2 gap-4">
               <textarea placeholder="Lessons Learned..." value={lesson} onChange={e => setLesson(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white h-28 resize-none outline-none focus:border-[var(--dondo-emerald)] transition" />
               <textarea placeholder="Mistakes Made..." value={mistake} onChange={e => setMistake(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white h-28 resize-none outline-none focus:border-red-500/50 transition" />
            </div>
          </form>
        </div>

        {/* FIXED FOOTER BUTTON */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-[70]">
          <button form="main-trade-form" type="submit" disabled={loading} className="w-full py-5 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-[0.25em] text-[11px] rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all disabled:opacity-50">
            {loading ? "INITIALIZING SECURE UPLOAD..." : editingTrade ? "UPDATE TRADE SEQUENCE" : "COMMIT TO DATABASE"}
          </button>
        </div>
      </div>
    </div>
  );
}