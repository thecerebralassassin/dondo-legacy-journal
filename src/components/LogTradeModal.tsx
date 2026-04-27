"use client";

import { useState, useEffect } from "react";
import { X, Calculator, Image as ImageIcon } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function LogTradeModal() {
  const { user, isTradeModalOpen, setIsTradeModalOpen, fetchTrades, isZar, usdZarRate, editingTrade, setEditingTrade } = useAppContext();

  const [asset, setAsset] = useState("US30");
  const [setupType, setSetupType] = useState("CONT");
  const [session, setSession] = useState("NY OPEN");
  
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [lotSize, setLotSize] = useState("");
  
  const [riskReward, setRiskReward] = useState<number | null>(null);
  const [useAutoPnl, setUseAutoPnl] = useState(false);
  const [pnl, setPnl] = useState("");
  const [status, setStatus] = useState("win");

  const [sentiment, setSentiment] = useState("😌");
  const [lesson, setLesson] = useState("");
  const [mistake, setMistake] = useState("");
  
  const [tradeDate, setTradeDate] = useState(""); 
  const [tradeTime, setTradeTime] = useState("");

  const [loading, setLoading] = useState(false);
  
  // Image Storage Logic
  const [ltfFile, setLtfFile] = useState<File | null>(null);
  const [ltfUrl, setLtfUrl] = useState("");
  
  const [mtfFile, setMtfFile] = useState<File | null>(null);
  const [mtfUrl, setMtfUrl] = useState("");
  
  const [htfFile, setHtfFile] = useState<File | null>(null);
  const [htfUrl, setHtfUrl] = useState("");

  // Sync with editingTrade or Reset
  useEffect(() => {
    if (editingTrade) {
      setAsset(editingTrade.asset);
      setSetupType(editingTrade.setup_type || "");
      setSession(editingTrade.session || "");
      setEntryPrice(editingTrade.entry_price?.toString() || "");
      setStopLoss(editingTrade.stop_loss?.toString() || "");
      setTakeProfit(editingTrade.take_profit?.toString() || "");
      setLotSize(editingTrade.lot_size?.toString() || "");
      
      let basePnl = editingTrade.pnl || 0;
      if (isZar) basePnl = basePnl * usdZarRate;
      setPnl(basePnl.toFixed(2));
      
      setStatus(editingTrade.status || "win");
      setSentiment(editingTrade.sentiment || "😌");
      setLesson(editingTrade.lesson || "");
      setMistake(editingTrade.mistake || "");
      
      const rawDate = new Date(editingTrade.trade_date);
      setTradeDate(editingTrade.trade_date.split('T')[0]);
      setTradeTime(rawDate.toISOString().substring(11, 16));
      
      setLtfUrl(editingTrade.image_ltf || "");
      setMtfUrl(editingTrade.image_mtf || "");
      setHtfUrl(editingTrade.image_htf || "");
      
      setIsTradeModalOpen(true);
    } else if (isTradeModalOpen) {
      setTradeDate(new Date().toISOString().split('T')[0]); 
      setTradeTime(new Date().toISOString().substring(11, 16));
    }
  }, [editingTrade, isTradeModalOpen]);

  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && entry !== sl) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      const rr = reward / risk;
      setRiskReward(parseFloat(rr.toFixed(2)));
    } else {
      setRiskReward(null);
    }
  }, [entryPrice, stopLoss, takeProfit]);

  useEffect(() => {
    if (useAutoPnl) {
      const entry = parseFloat(entryPrice);
      const tpOrSl = status === "win" ? parseFloat(takeProfit) : parseFloat(stopLoss);
      const lot = parseFloat(lotSize);
      
      if (!isNaN(entry) && !isNaN(tpOrSl) && !isNaN(lot)) {
        const tradeSize = lot * 100000;
        const diff = Math.abs(tpOrSl - entry); 
        let estimatedPnlBase = diff * tradeSize;
        let displayEstimatedPnl = isZar ? estimatedPnlBase * usdZarRate : estimatedPnlBase;
        setPnl(status === "loss" ? `-${displayEstimatedPnl.toFixed(2)}` : displayEstimatedPnl.toFixed(2));
      }
    }
  }, [entryPrice, stopLoss, takeProfit, lotSize, status, useAutoPnl, isZar, usdZarRate]);

  const uploadImageObj = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
    
    const { data, error } = await supabase.storage.from('trade_images').upload(fileName, file, {
       cacheControl: '3600',
       upsert: false,
       contentType: file.type || 'image/jpeg'
    });
    if (error) {
       console.error("Upload error:", error);
       return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('trade_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let finalPnl = pnl ? parseFloat(pnl) : null;
    if (finalPnl !== null && isZar) {
      finalPnl = finalPnl / usdZarRate;
    }
    if (finalPnl !== null && status === 'loss') {
       finalPnl = -Math.abs(finalPnl);
    }

    let isoTradeDate = new Date().toISOString();
    if (tradeDate) {
      if (tradeTime) {
         isoTradeDate = new Date(`${tradeDate}T${tradeTime}:00`).toISOString();
      } else {
         const newD = new Date(tradeDate);
         isoTradeDate = new Date(newD.getTime() + Math.abs(newD.getTimezoneOffset() * 60000)).toISOString();
      }
    }

    let insertLtf = ltfUrl;
    let insertMtf = mtfUrl;
    let insertHtf = htfUrl;

    if (ltfFile) {
       const o = await uploadImageObj(ltfFile);
       if (o) insertLtf = o;
    }
    if (mtfFile) {
       const o = await uploadImageObj(mtfFile);
       if (o) insertMtf = o;
    }
    if (htfFile) {
       const o = await uploadImageObj(htfFile);
       if (o) insertHtf = o;
    }

    const tradeData = {
      user_id: user.id,
      asset,
      setup_type: setupType,
      session,
      entry_price: entryPrice ? parseFloat(entryPrice) : null,
      stop_loss: stopLoss ? parseFloat(stopLoss) : null,
      take_profit: takeProfit ? parseFloat(takeProfit) : null,
      lot_size: lotSize ? parseFloat(lotSize) : null,
      risk_reward: riskReward,
      pnl: finalPnl,
      status,
      sentiment,
      lesson,
      mistake,
      trade_date: isoTradeDate,
      image_ltf: insertLtf || null,
      image_mtf: insertMtf || null,
      image_htf: insertHtf || null
    };

    if (editingTrade) {
       const { error } = await supabase.from('trades').update(tradeData).eq('id', editingTrade.id);
       if (!error) { await fetchTrades(); handleClose(); }
       else alert(error.message);
    } else {
       const { error } = await supabase.from('trades').insert(tradeData);
       if (!error) { await fetchTrades(); handleClose(); }
       else alert(error.message);
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setIsTradeModalOpen(false);
    setTimeout(() => {
      setEditingTrade(null);
      resetForm();
    }, 300);
  };

  const resetForm = () => {
    setEntryPrice(""); setStopLoss(""); setTakeProfit(""); setLotSize("");
    setPnl(""); setLesson(""); setMistake(""); setRiskReward(null); setUseAutoPnl(false);
    setLtfFile(null); setMtfFile(null); setHtfFile(null);
    setLtfUrl(""); setMtfUrl(""); setHtfUrl("");
  };

  if (!isTradeModalOpen) return null;

  const ImageUploader = ({ label, url, setUrl, file, setFile }: any) => {
    const handleFileChange = (e: any) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setUrl(URL.createObjectURL(e.target.files[0]));
      }
    };
    
    const handleClear = (e: any) => {
      e.stopPropagation(); e.preventDefault();
      setFile(null); setUrl("");
    };

    return (
      <div className="flex flex-col relative">
        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1.5 block flex items-center justify-between">
          <span>{label} Matrix</span>
          {url && <button onClick={handleClear} type="button" className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded text-[8px]">CLEAR</button>}
        </label>
        
        {url ? (
          <div className="relative w-full h-16 rounded-lg bg-black/50 overflow-hidden border border-[var(--dondo-emerald)]/30 group">
              <img src={url} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-[var(--dondo-emerald)]/10" />
          </div>
        ) : (
          <label className="relative w-full h-16 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition border-dashed flex flex-col items-center justify-center cursor-pointer group">
              <ImageIcon size={16} className="text-zinc-500 mb-1 group-hover:text-white transition" />
              <span className="text-[8px] font-bold tracking-widest uppercase text-zinc-500 group-hover:text-white transition">UPLOAD LINK</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm pt-8">
      <div className="w-full max-w-lg bg-[#0a0a0a] rounded-t-3xl sm:rounded-3xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-[95vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-gradient-to-r from-black via-[#0a0a0a] to-[#050505] shrink-0">
          <h2 className="text-white font-black tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--dondo-emerald)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {editingTrade ? 'Edit Matrix' : 'Log Trade Matrix'}
          </h2>
          <button type="button" onClick={handleClose} className="bg-white/5 rounded-full p-2 text-zinc-400 hover:text-white transition hover:bg-white/10 btn-tactile">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
          <form id="trade-form" onSubmit={handleSubmit} className="flex flex-col gap-6 pb-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Asset</label>
                <input type="text" value={asset} onChange={e => setAsset(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[var(--dondo-emerald)] transition uppercase" required />
              </div>
              <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Result Matrix</label>
                  <div className="flex gap-2 h-[46px]">
                    <button type="button" onClick={() => setStatus('win')} className={`flex-1 rounded-xl font-black text-[10px] tracking-widest transition uppercase ${status === 'win' ? 'bg-[var(--dondo-emerald)] text-black shadow-inner' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>Win</button>
                    <button type="button" onClick={() => setStatus('loss')} className={`flex-1 rounded-xl font-black text-[10px] tracking-widest transition uppercase ${status === 'loss' ? 'bg-red-500 text-black shadow-inner' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>Loss</button>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Chronological Date</label>
                <input type="date" value={tradeDate} onChange={e => setTradeDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-white/30 [color-scheme:dark] transition" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Time</label>
                  <input type="time" value={tradeTime} onChange={e => setTradeTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-white/30 [color-scheme:dark] transition" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Mood</label>
                  <input type="text" value={sentiment} onChange={e => setSentiment(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-lg text-center outline-none focus:border-white/30 transition" />
                </div>
              </div>
            </div>

            {/* Visual Evidence Section */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dondo-emerald)]/5 blur-[40px] pointer-events-none rounded-full" />
                <h3 className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase flex justify-between items-center relative z-10">
                  Visual Evidence Link
                </h3>
                <div className="grid grid-cols-3 gap-3 relative z-10">
                  <ImageUploader label="LTF" url={ltfUrl} setUrl={setLtfUrl} file={ltfFile} setFile={setLtfFile} />
                  <ImageUploader label="MTF" url={mtfUrl} setUrl={setMtfUrl} file={mtfFile} setFile={setMtfFile} />
                  <ImageUploader label="HTF" url={htfUrl} setUrl={setHtfUrl} file={htfFile} setFile={setHtfFile} />
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
              <h3 className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase flex justify-between items-center">
                Financial Coordinates 
                {riskReward !== null && <span className="text-[var(--dondo-emerald)] bg-[var(--dondo-emerald)]/10 px-2 py-0.5 rounded border border-[var(--dondo-emerald)]/20 shadow-sm">R:R = {riskReward}</span>}
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-1">
                <input type="text" placeholder="Setup Type (e.g. Breakout)" value={setupType} onChange={e => setSetupType(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-[var(--dondo-emerald)] transition uppercase" />
                <input type="text" placeholder="Session" value={session} onChange={e => setSession(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-indigo-400 text-xs font-bold outline-none focus:border-indigo-500 transition uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="any" placeholder="Entry Price" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition" />
                <input type="number" step="any" placeholder="Lot Size" value={lotSize} onChange={e => setLotSize(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition" />
                <input type="number" step="any" placeholder="Stop Loss" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-red-500 text-sm outline-none focus:border-red-500 transition" />
                <input type="number" step="any" placeholder="Take Profit" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-[var(--dondo-emerald)] text-sm outline-none focus:border-[var(--dondo-emerald)] transition" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-[var(--dondo-emerald)]/5 via-black to-black border border-white/5 p-5 rounded-2xl relative overflow-hidden ring-1 ring-white/5">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="text-[10px] text-white font-bold tracking-widest uppercase drop-shadow">Profit or Loss Made {isZar ? '(ZAR)' : '($)'}</h3>
                  <button type="button" onClick={() => setUseAutoPnl(!useAutoPnl)} className="text-[10px] text-[var(--dondo-emerald)] flex items-center gap-1 font-black underline decoration-[var(--dondo-emerald)]/40 underline-offset-4">
                    <Calculator size={12} /> {useAutoPnl ? "AUTO-PILOT" : "MANUAL"}
                  </button>
                </div>
                <input 
                   type="number" step="any" required 
                   placeholder={useAutoPnl ? "Awaiting Data..." : "Enter Amount (-)"} 
                   value={pnl} onChange={e => setPnl(e.target.value)} 
                   disabled={useAutoPnl}
                   className="w-full relative z-10 bg-black/50 border border-[var(--dondo-emerald)]/20 rounded-xl p-4 text-white font-black text-2xl outline-none focus:border-[var(--dondo-emerald)] transition placeholder:text-white/10" 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--dondo-emerald)] font-bold uppercase tracking-widest mb-1.5 block">Lessons Learned</label>
                  <textarea 
                    value={lesson} onChange={e => setLesson(e.target.value)} 
                    placeholder="What did you learn?"
                    className="w-full h-20 bg-white/5 border border-[var(--dondo-emerald)]/20 rounded-xl p-3 text-white text-xs outline-none focus:border-[var(--dondo-emerald)] resize-none transition" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-red-500 font-bold uppercase tracking-widest mb-1.5 block">Mistakes Made</label>
                  <textarea 
                    value={mistake} onChange={e => setMistake(e.target.value)} 
                    placeholder="What went wrong?"
                    className="w-full h-20 bg-white/5 border border-red-500/20 rounded-xl p-3 text-white text-xs outline-none focus:border-red-500 resize-none transition" 
                  />
                </div>
            </div>

          </form>
        </div>

        {/* Static Footer Button */}
        <div className="p-5 border-t border-white/5 bg-[#0a0a0a] shrink-0">
            <button form="trade-form" type="submit" disabled={loading} className="w-full py-4 text-black font-black uppercase tracking-widest rounded-xl bg-[var(--dondo-emerald)] hover:bg-[#059669] transition shadow-[0_0_20px_rgba(16,185,129,0.3)] btn-tactile text-xs flex justify-center items-center gap-2">
              {loading ? 'EXECUTING...' : editingTrade ? 'UPDATE MATRIX' : 'SAVE TO DATABASE'}
            </button>
        </div>

      </div>
    </div>
  );
}