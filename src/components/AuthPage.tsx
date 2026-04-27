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

    if (error) setMessage({ type: 'error', text: error.message });
    else if (!isLogin) setMessage({ type: 'success', text: "Account created! You can now sign in." });
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "Please enter your email first." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: "Password reset link sent to your email!" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative">
      <div className="w-full max-w-md glass-panel p-8 flex flex-col items-center z-10 pb-10">
        
        <img src="/icon.png" alt="Dondo Logo" className="w-24 h-24 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] rounded-2xl" />

        {message && (
          <div className={`w-full p-4 rounded-xl mb-6 text-xs font-bold uppercase tracking-widest text-center ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[var(--dondo-emerald)]/10 text-[var(--dondo-emerald)] border border-[var(--dondo-emerald)]/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
          
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--dondo-emerald)] transition" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required={!isLogin} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--dondo-emerald)] transition" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Terminal Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--dondo-emerald)] transition" />
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 block">Secure Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[var(--dondo-emerald)] transition" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-[var(--dondo-emerald)] text-black font-black uppercase tracking-widest rounded-xl shadow-[0_10px_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition active:scale-95">
            {loading ? "INITIALIZING..." : isLogin ? "ENTER TERMINAL" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition">
            {isLogin ? "No account? Create one" : "Already have an account? Sign in"}
          </button>

          {isLogin && (
            <button onClick={handleForgotPassword} type="button" className="text-[10px] text-red-500/50 font-bold uppercase tracking-widest hover:text-red-500 transition">
              Forgot Password?
            </button>
          )}
        </div>
      </div>

      {/* Dondo Legacy Footer */}
      <div className="absolute bottom-4 left-0 w-full text-center z-0 pointer-events-none">
        <p className="text-[7px] tracking-[0.2em] font-black text-zinc-600 uppercase">
          © By DondoLegacy | Created by Mr RC Dondo
        </p>
      </div>
    </div>
  );
}