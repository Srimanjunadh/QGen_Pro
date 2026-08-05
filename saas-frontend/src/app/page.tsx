"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, LogIn, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Try to login
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      let res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data = await res.json();

      // Check if authentication failed
      if (!data.success) {
        setError(data.message || "Invalid Login ID or Password");
        setLoading(false);
        return;
      }


      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        throw new Error(data.message || "Failed to login");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-900">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl relative z-10 mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">QGen Pro</h1>
          <p className="text-surface-200 mt-2 text-center text-sm">
            Enterprise Exam Generation Platform
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-200">Login ID / Email</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-surface-800/50 border border-surface-200/10 rounded-xl text-white placeholder-surface-200/50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="e.g. Manju"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-surface-200">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-surface-800/50 border border-surface-200/10 rounded-xl text-white placeholder-surface-200/50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-500/25"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            {!loading && <LogIn className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-200/10 text-center">
          <button className="text-sm text-surface-200 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto group">
            Go to Student Portal
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </main>
  );
}
