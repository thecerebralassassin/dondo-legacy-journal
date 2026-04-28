"use client";

import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { useState, useRef } from "react";
import { User, ShieldCheck, Target, Image as ImageIcon, CheckCircle2, AlertCircle, Coins, X } from "lucide-react";

export default function ProfileView() {
  const { 
    user, startingBalance, setStartingBalance, 
    goalsText, setGoalsText, goalsImage, setGoalsImage,
    fetchProfile, isZar, setIsZar
  } = useAppContext();
  
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadGoalImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    
    // Show preview immediately
    const tempUrl = URL.createObjectURL(file);
    setGoalsImage(tempUrl);
    
    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-goal.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('trade-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('trade-images').getPublicUrl(fileName);
      
      // Save directly to profile so it doesn't disappear on refresh
      await supabase.from('profiles').update({ goals_image: publicUrl }).eq('id', user.id);
      setGoalsImage(publicUrl);
      setFeedback({ type: 'success', message: "Goal Image Saved!" });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback(null);
    
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        starting_balance: startingBalance,
        goals_text: goalsText,
        currency_pref: isZar ? 'ZAR' : 'USD'
      });

      if (error) throw error;
      
      await fetchProfile();
      setFeedback({ type: 'success', message: "Settings Saved Successfully!" });
    } catch (err: any) {
      setFeedback({ type: 'error', message: "Failed to save: " + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="px-4 pb-24 w-full max-w-lg mx-auto relative animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="glass-panel p-8 mb-8 flex flex-col items-center gap-4 bg-black/40 rounded-[2.5rem] border border-white/5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--dondo-emerald)] to-[#065f46] p-1 relative">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-4 border-black overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-700" />
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--dondo-emerald)] text-black p-1.5 rounded-full border-4 border-black">
                <ShieldCheck size={14} strokeWidth={3} />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black text-white tracking-tighter capitalize">
              {user?.user_metadata?.full_name || "Dondo Trader"}
            </h2>
            <p className="text-[9px] text-[var(--dondo-emerald)] font-black uppercase tracking-[0.2em] mt-1">{user?.email}</p>
          </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* Currency & Account Info */}
        <div className="glass-panel p-6 bg-white/[0.01] rounded-3xl border border-white/5">
            <h3 className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-6 text-center">System Configuration</h3>
            
            <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Coins size={18} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Display Currency</span>
                  </div>
                  <div className="flex bg-black p-1 rounded-xl border border-white/10">
                     <button 
                       type="button" 
                       onClick={() => setIsZar(false)}
                       className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition ${!isZar ? 'bg-[var(--dondo-emerald)] text-black' : 'text-zinc-600'}`}
                     >
                       USD
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setIsZar(true)}
                       className={`px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest transition ${isZar ? 'bg-[var(--dondo-emerald)] text-black' : 'text-zinc-600'}`}
                     >
                       ZAR
                     </button>
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Starting Equity ({isZar ? 'ZAR' : 'USD'})</label>
                  <input 
                    type="number" step="any" required 
                    value={startingBalance || ""} 
                    onChange={e => setStartingBalance(Number(e.target.value))} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black outline-none focus:border-[var(--dondo-emerald)]" 
                    placeholder="0.00"
                  />
               </div>
            </div>
        </div>

        {/* Goals Section */}
        <div className="glass-panel p-6 bg-white/[0.01] rounded-3xl border border-white/5">
            <h3 className="text-[10px] text-zinc-500 font-black tracking-[0.2em] uppercase mb-6 text-center flex items-center justify-center gap-2">
              <Target size={14} className="text-[var(--dondo-emerald)]"/> Your Trading Goals
            </h3>
            
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">What are your goals?</label>
                  <textarea 
                    value={goalsText} 
                    onChange={e => setGoalsText(e.target.value)}
                    placeholder="Write your long-term and short-term trading goals here..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] min-h-[120px] resize-none"
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Vision Board (Goal Image)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-video w-full rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition overflow-hidden group"
                  >
                     {goalsImage ? (
                        <>
                           <img src={goalsImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
                           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <ImageIcon className="text-white drop-shadow-lg" size={32} />
                           </div>
                           <button 
                             type="button" 
                             onClick={async (e) => {
                               e.stopPropagation();
                               if (confirm("Remove goal image?")) {
                                 setGoalsImage("");
                                 await supabase.from('profiles').update({ goals_image: null }).eq('id', user.id);
                               }
                             }}
                             className="absolute top-4 right-4 p-2 bg-red-500 rounded-xl text-white shadow-lg hover:bg-red-600 transition z-10"
                           >
                             <X size={16} />
                           </button>
                        </>
                     ) : (
                        <>
                           <ImageIcon className="text-zinc-700 mb-2" size={32} />
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Click to upload your goal image</span>
                        </>
                     )}
                     <input type="file" ref={fileInputRef} onChange={handleUploadGoalImage} className="hidden" accept="image/*" />
                  </div>
               </div>
            </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{feedback.message}</span>
          </div>
        )}

        <button type="submit" disabled={saving} className="w-full py-5 text-black font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl bg-[var(--dondo-emerald)] shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:bg-[#10b981]/90 active:scale-[0.97] transition-all">
            {saving ? 'PROCESSING...' : 'SAVE SETTINGS'}
        </button>

        <div className="mt-8 pt-8 border-t border-white/5">
           <button 
             type="button"
             onClick={async () => {
               await supabase.auth.signOut();
               window.location.reload();
             }}
             className="w-full py-4 text-red-500 font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all"
           >
             Secure Sign Out
           </button>
        </div>
      </form>
    </div>
  );
}