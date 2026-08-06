"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Lock, Key, Mail, Phone, BookOpen, Building } from "lucide-react";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    registrationNumber: "",
    name: "",
    password: "",
    year: "",
    section: "",
    mlNumber: "",
    fatherName: "",
    mobileNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please login.");
        router.push("/student/login");
      } else {
        setError(data.message || "Registration failed");
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-surface-200 overflow-hidden"
      >
        <div className="bg-brand-600 p-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Student Registration</h1>
          <p className="text-brand-100">Enter your unique code to create your portal account.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Registration Code (Access Key) *</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="e.g. A1B2C3D4" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">College Registration Number *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="e.g. COL-12345" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="••••••••" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Year / Grade</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="text" name="year" value={formData.year} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="e.g. 1st Year" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Section</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="e.g. A" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">ML Number (Roll No)</label>
              <input type="text" name="mlNumber" value={formData.mlNumber} onChange={handleChange} className="w-full px-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="ML-12345" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="Father's Full Name" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-surface-700">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-white text-surface-900 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500" placeholder="+1 234 567 890" />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>

          <p className="text-center text-sm text-surface-500 mt-4">
            Already have an account? <Link href="/student/login" className="text-brand-600 font-medium hover:underline">Login here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
