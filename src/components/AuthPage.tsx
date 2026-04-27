import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setError("Check your email for the confirmation link! (If testing locally, you might be logged in directly depending on supabase settings)");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--dondo-emerald)] opacity-20 blur-[60px] pointer-events-none rounded-full" />
        
        <h1 className="text-3xl font-black text-center mb-8 text-white uppercase tracking-widest relative z-10">
          {isLogin ? "Welcome Back" : "Join Dondo Trades"}
        </h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-5 relative z-10">
          <div>
            <label className="text-xs tracking-wider text-zinc-400 mb-2 block uppercase font-bold">Email</label>
            <input 
              type="email" 
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-[var(--dondo-emerald)] transition-colors text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-wider text-zinc-400 mb-2 block uppercase font-bold">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-[var(--dondo-emerald)] transition-colors text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 p-4 rounded-xl font-bold tracking-widest btn-tactile btn-tactile-emerald uppercase"
          >
            {loading ? "Processing..." : isLogin ? "Enter Terminal" : "Create Account"}
          </button>
        </form>
        
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-sm text-zinc-500 hover:text-white transition-colors relative z-10"
        >
          {isLogin ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
