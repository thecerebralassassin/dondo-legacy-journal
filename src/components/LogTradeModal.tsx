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

  const [ltfFile, setLtfFile] = useState<File | null>(null);
  const [ltfUrl, setLtfUrl] = useState("");
  const [mtfFile, setMtfFile] = useState<File | null>(null);
  const [mtfUrl, setMtfUrl] = useState("");
  const [htfFile, setHtfFile] = useState<File | null>(null);
  const [htfUrl, setHtfUrl] = useState("");

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
      setTradeDate(editingTrade.trade_date.split('T')[0]);
      setTradeTime(new Date(editingTrade.trade_date).toISOString().substring(11, 16));
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
    const entry = parseFloat(entryPrice), sl = parseFloat(stopLoss), tp = parseFloat(takeProfit);
    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && entry !== sl) {
      setRiskReward(parseFloat((Math.abs(tp - entry) / Math.abs(entry - sl)).toFixed(2)));
    } else setRiskReward(null);
  }, [entryPrice, stopLoss, takeProfit]);

  const uploadImageObj = async (file: File) => {
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const { data, error } = await supabase.storage.from('trade_images').upload(fileName, file);
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from('trade_images').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    let finalPnl = pnl ? parseFloat(pnl) : null;
    if (finalPnl !== null && isZar) finalPnl = finalPnl / usdZarRate;
    if (finalPnl !== null && status === 'loss') finalPnl = -Math.abs(finalPnl);
    const isoDate = new Date(`${tradeDate}T${tradeTime || '00:00'}:00`).toISOString();

    let insertLtf = ltfUrl, insertMtf = mtfUrl, insertHtf = htfUrl;
    if (ltfFile) insertLtf = await uploadImageObj(ltfFile) || "";
    if (mtfFile) insertMtf = await uploadImageObj(mtfFile) || "";
    if (htfFile) insertHtf = await uploadImageObj(htfFile) || "";

    const tradeData = {
      user_id: user.id, asset, setup_type: setupType, session,
      entry_price: parseFloat(entryPrice), stop_loss: parseFloat(stopLoss),
      take_profit: parseFloat(takeProfit), lot_size: parseFloat(lotSize),
      risk_reward: riskReward, pnl: finalPnl, status, sentiment, lesson, mistake,
      trade_date: isoDate, image_ltf: insertLtf, image_mtf: insertMtf, image_htf: insertHtf
    };

    const { error } = editingTrade 
      ? await supabase.from('trades').update(tradeData).eq('id', editingTrade.id)
      : await supabase.from('trades').insert(tradeData);

    if (!error) { await fetchTrades(); handleClose(); }
    else alert(error.message);
    setLoading(false);
  };

  const handleClose = () => {
    setIsTradeModalOpen(false);
    setEditingTrade(null);
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
        <label className="relative w-full h-16 rounded-xl bg-white/5 border border-white/10 border-dashed flex items-center justify-center cursor-pointer overflow-hidden">
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
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
          <h2 className="text-white font-black tracking-widest uppercase text-xs">Log in trade details</h2>
          <button onClick={handleClose} className="p-2 bg-white/5 rounded-full text-zinc-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-40">
          <form id="main-trade-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Asset</label>
                  <input type="text" value={asset} onChange={e => setAsset(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[var(--dondo-emerald)]" required />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Result</label>
                  <div className="flex gap-2 h-full">
                    <button type="button" onClick={() => setStatus('win')} className={`flex-1 rounded-xl text-[10px] font-black uppercase ${status === 'win' ? 'bg-[var(--dondo-emerald)] text-black' : 'bg-white/5 text-zinc-500'}`}>Win</button>
                    <button type="button" onClick={() => setStatus('loss')} className={`flex-1 rounded-xl text-[10px] font-black uppercase ${status === 'loss' ? 'bg-red-500 text-black' : 'bg-white/5 text-zinc-500'}`}>Loss</button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ImageUploader label="LTF" url={ltfUrl} setUrl={setLtfUrl} setFile={setLtfFile} />
              <ImageUploader label="MTF" url={mtfUrl} setUrl={setMtfUrl} setFile={setMtfFile} />
              <ImageUploader label="HTF" url={htfUrl} setUrl={setHtfUrl} setFile={setHtfFile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <input type="number" step="any" placeholder="Entry" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none" required />
               <input type="number" step="any" placeholder="Lot Size" value={lotSize} onChange={e => setLotSize(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none" required />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Profit/Loss Made {isZar ? '(ZAR)' : '(USD)'}</label>
               <input type="number" step="any" value={pnl} onChange={e => setPnl(e.target.value)} className="bg-black border border-[var(--dondo-emerald)]/40 rounded-xl p-5 text-3xl font-black text-white outline-none text-center" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <textarea placeholder="Lessons Learned" value={lesson} onChange={e => setLesson(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white h-24 resize-none" />
               <textarea placeholder="Mistakes Made" value={mistake} onChange={e => setMistake(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white h-24 resize-none" />
            </div>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent z-[70]">
          <button form="main-trade-form" type="submit" disabled={loading} className="w-full py-5 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 transition">
            {loading ? "SAVING..." : "COMMIT TO DATABASE"}
          </button>
        </div>
      </div>
    </div>
  );
}