"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Lock } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    registrationNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("student_token", data.token);
        localStorage.setItem("student_user", JSON.stringify(data.user));
        router.push("/student/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-surface-200 overflow-hidden"
      >
        <div className="bg-brand-600 p-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Student Login</h1>
          <p className="text-brand-100">Welcome back to your student portal.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">College Registration Number</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="e.g. COL-12345" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-surface-500 mt-4">
            Don't have an account? <Link href="/student/register" className="text-brand-600 font-medium hover:underline">Register with code</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
