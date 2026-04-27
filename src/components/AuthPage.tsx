"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    let error;

    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else {
      // Sending metadata ensures your friend's name is saved separately from yours
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      error = signUpError;
    }

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (!isLogin) {
      setMessage({ type: 'success', text: "Terminal Access Granted. You can now sign in." });
      setIsLogin(true); // Switch to login after successful signup
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Please enter your terminal email first." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: "System reset link sent to your email." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative">
      <div className="w-full max-w-md glass-panel p-8 flex flex-col items-center z-10 pb-10 bg-black/40 border border-white/5 rounded-[2rem]">
        
        {/* BRANDING: Only the logo, no "Welcome Back" text */}
        <img src="/icon.png" alt="Dondo Logo" className="w-24 h-24 mb-10 shadow-[0_0_40px_rgba(16,185,129,0.15)] rounded-2xl animate-in fade-in zoom-in duration-700" />

        {message && (
          <div className={`w-full p-4 rounded-xl mb-6 text-[10px] font-black uppercase tracking-[0.15em] text-center animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[var(--dondo-emerald)]/10 text-[var(--dondo-emerald)] border border-[var(--dondo-emerald)]/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
          
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-left-4">
              <div>
                <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition-all" />
              </div>
              <div>
                <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition-all" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Terminal Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition-all" />
          </div>

          <div>
            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Secure Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-[var(--dondo-emerald)] transition-all" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:opacity-90 transition active:scale-[0.98] mt-2">
            {loading ? "INITIALIZING..." : isLogin ? "ENTER TERMINAL" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-[9px] text-zinc-500 font-black uppercase tracking-widest hover:text-white transition-colors">
            {isLogin ? "System Access Required? Register" : "Already have a key? Sign in"}
          </button>

          {isLogin && (
            <button onClick={handleForgotPassword} type="button" className="text-[9px] text-red-500/40 font-black uppercase tracking-widest hover:text-red-500 transition-colors">
              Reset Terminal Password
            </button>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center z-0 pointer-events-none">
        <p className="text-[7px] tracking-[0.3em] font-black text-zinc-700 uppercase">
          © By DondoLegacy | Created by Mr RC Dondo
        </p>
      </div>
    </div>
  );
}