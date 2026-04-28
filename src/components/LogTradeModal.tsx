"use client";

import { useState, useEffect } from "react";
import { useAppContext, Trade } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { X, PlusCircle, CheckCircle2 } from "lucide-react";

export default function LogTradeModal() {
  const { 
    user, isTradeModalOpen, setIsTradeModalOpen, 
    fetchTrades, isZar, usdZarRate, editingTrade, setEditingTrade 
  } = useAppContext();

  const [asset, setAsset] = useState("EURUSD");
  const [direction, setDirection] = useState("BUY");
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [tradeTime, setTradeTime] = useState("12:00");
  const [status, setStatus] = useState("win");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [pnl, setPnl] = useState("");
  const [lesson, setLesson] = useState("");
  const [mistake, setMistake] = useState("");
  const [setupType, setSetupType] = useState("");
  const [session, setSession] = useState("London");
  
  const [ltfUrl, setLtfUrl] = useState("");
  const [mtfUrl, setMtfUrl] = useState("");
  const [htfUrl, setHtfUrl] = useState("");
  const [ltfFile, setLtfFile] = useState<File | null>(null);
  const [mtfFile, setMtfFile] = useState<File | null>(null);
  const [htfFile, setHtfFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTrade) {
      setAsset(editingTrade.asset);
      setDirection(editingTrade.direction);
      setStatus(editingTrade.status);
      setEntryPrice(editingTrade.entry_price?.toString() || "");
      setStopLoss(editingTrade.stop_loss?.toString() || "");
      setTakeProfit(editingTrade.take_profit?.toString() || "");
      setLotSize(editingTrade.lot_size?.toString() || "");
      
      let displayPnl = editingTrade.pnl;
      if (isZar) displayPnl = displayPnl * usdZarRate;
      setPnl(Math.abs(displayPnl).toString());
      
      setLesson(editingTrade.lesson || "");
      setMistake(editingTrade.mistake || "");
      setSetupType(editingTrade.setup_type || "");
      setSession(editingTrade.session || "London");
      
      const dt = new Date(editingTrade.trade_date);
      setTradeDate(dt.toISOString().split('T')[0]);
      setTradeTime(dt.toTimeString().split(' ')[0].substring(0, 5));
      
      setLtfUrl(editingTrade.image_ltf || "");
      setMtfUrl(editingTrade.image_mtf || "");
      setHtfUrl(editingTrade.image_htf || "");
    } else {
      resetForm();
    }
  }, [editingTrade, isTradeModalOpen, isZar, usdZarRate]);

  const resetForm = () => {
    setAsset("EURUSD");
    setDirection("BUY");
    setStatus("win");
    setEntryPrice("");
    setStopLoss("");
    setTakeProfit("");
    setLotSize("");
    setPnl("");
    setLesson("");
    setMistake("");
    setSetupType("");
    setSession("London");
    setTradeDate(new Date().toISOString().split('T')[0]);
    setTradeTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
    setLtfUrl(""); setMtfUrl(""); setHtfUrl("");
    setLtfFile(null); setMtfFile(null); setHtfFile(null);
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('trade-images').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('trade-images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let finalLtf = ltfUrl, finalMtf = mtfUrl, finalHtf = htfUrl;
      if (ltfFile) finalLtf = await uploadImage(ltfFile);
      if (mtfFile) finalMtf = await uploadImage(mtfFile);
      if (htfFile) finalHtf = await uploadImage(htfFile);

      let rawPnl = pnl ? parseFloat(pnl) : 0;
      if (isZar) rawPnl = rawPnl / usdZarRate;
      if (status === 'loss') rawPnl = -Math.abs(rawPnl);

      const fullDate = `${tradeDate}T12:00:00Z`; // Noon UTC to prevent date shifting

      const tradeData = {
        user_id: user.id,
        asset,
        direction,
        status,
        entry_price: entryPrice ? parseFloat(entryPrice) : null,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null,
        lot_size: lotSize ? parseFloat(lotSize) : null,
        pnl: rawPnl,
        trade_date: fullDate,
        image_ltf: finalLtf,
        image_mtf: finalMtf,
        image_htf: finalHtf,
        lesson,
        mistake,
        session,
        setup_type: setupType
      };

      const { error } = editingTrade 
        ? await supabase.from('trades').update(tradeData).eq('id', editingTrade.id)
        : await supabase.from('trades').insert([tradeData]);

      if (error) throw error;
      
      await fetchTrades();
      handleClose();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsTradeModalOpen(false);
    setEditingTrade(null);
  };

  if (!isTradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose}></div>
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
              {editingTrade ? "Edit Execution" : "Log New Trade"}
            </h2>
            <p className="text-[10px] text-emerald-500 font-bold tracking-[0.3em] uppercase">God First †</p>
          </div>
          <button onClick={handleClose} className="p-3 hover:bg-white/5 rounded-2xl text-zinc-500 transition"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
          
          {/* Date & Time Manual Entry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Execution Date</label>
              <input 
                type="date"
                value={tradeDate} onChange={e => setTradeDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500/50 outline-none transition"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Execution Time</label>
              <input 
                type="time"
                value={tradeTime} onChange={e => setTradeTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500/50 outline-none transition"
              />
            </div>
          </div>

          {/* Asset & Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Asset</label>
              <input 
                value={asset} onChange={e => setAsset(e.target.value.toUpperCase())}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500/50 outline-none transition"
                placeholder="e.g. US30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Direction</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                <button type="button" onClick={() => setDirection("BUY")} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${direction === 'BUY' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>BUY</button>
                <button type="button" onClick={() => setDirection("SELL")} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${direction === 'SELL' ? 'bg-red-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>SELL</button>
              </div>
            </div>
          </div>

          {/* Outcome Toggle */}
          <div className="grid grid-cols-2 gap-4">
             <button type="button" onClick={() => setStatus("win")} className={`py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${status === 'win' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-transparent text-zinc-600 grayscale opacity-40 hover:opacity-100'}`}>
                <CheckCircle2 size={32} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Winner</span>
             </button>
             <button type="button" onClick={() => setStatus("loss")} className={`py-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${status === 'loss' ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,44,44,0.2)]' : 'bg-white/5 border-transparent text-zinc-600 grayscale opacity-40 hover:opacity-100'}`}>
                <X size={32} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Loss</span>
             </button>
          </div>

          {/* Images Section */}
          <div className="grid grid-cols-3 gap-4">
             <ImageUploader label="LTF (Entry)" url={ltfUrl} setUrl={setLtfUrl} setFile={setLtfFile} />
             <ImageUploader label="MTF (Context)" url={mtfUrl} setUrl={setMtfUrl} setFile={setMtfFile} />
             <ImageUploader label="HTF (Bias)" url={htfUrl} setUrl={setHtfUrl} setFile={setHtfFile} />
          </div>

          {/* Core Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Entry Price</label>
               <input value={entryPrice} onChange={e => setEntryPrice(e.target.value)} type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Lot Size</label>
               <input value={lotSize} onChange={e => setLotSize(e.target.value)} type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-red-500/50 ml-2">Stop Loss (Optional)</label>
               <input value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" step="any" className="w-full bg-white/5 border border-red-500/10 rounded-2xl p-4 text-white outline-none" />
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 ml-2">Take Profit (Optional)</label>
               <input value={takeProfit} onChange={e => setTakeProfit(e.target.value)} type="number" step="any" className="w-full bg-white/5 border border-emerald-500/10 rounded-2xl p-4 text-white outline-none" />
            </div>
          </div>

          {/* PnL Display Big */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 flex flex-col items-center gap-2">
             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Net Profit/Loss ({isZar ? 'ZAR' : 'USD'})</label>
             <input 
               value={pnl} onChange={e => setPnl(e.target.value)} type="number" step="any"
               className="bg-transparent text-white text-6xl font-black text-center outline-none w-full tracking-tighter" 
               placeholder="0.00"
             />
          </div>

          {/* Meta Data */}
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Session</label>
                <select value={session} onChange={e => setSession(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none">
                   <option value="London">London</option>
                   <option value="New York">New York</option>
                   <option value="Asia">Asia</option>
                </select>
             </div>
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Setup Type</label>
                <input value={setupType} onChange={e => setSetupType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none" placeholder="e.g. Trend Continuation" />
             </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-6 bg-emerald-500 rounded-3xl text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {loading ? "Initializing Secure Upload..." : (editingTrade ? "Update Execution" : "Secure Journal Entry")}
          </button>
        </form>
      </div>
    </div>
  );
}

const ImageUploader = ({ label, url, setUrl, setFile }: { label: string, url: string, setUrl: (v: string) => void, setFile: (f: File | null) => void }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-600 text-center">{label}</label>
      <div className="relative group aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:border-emerald-500/30 transition">
        {url ? (
          <>
            <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
            <button type="button" onClick={(e) => { e.stopPropagation(); setUrl(""); setFile(null); }} className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-700 group-hover:text-emerald-500 transition">
            <PlusCircle size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Upload</span>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              setFile(file);
              setUrl(URL.createObjectURL(file));
            }
          }} 
          className="absolute inset-0 opacity-0 cursor-pointer" 
        />
      </div>
    </div>
  );
};