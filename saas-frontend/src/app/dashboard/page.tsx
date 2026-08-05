"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, FileText, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Total Textbooks", value: "12", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Papers Generated", value: "148", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Active Subjects", value: "8", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
  { title: "Generation Success", value: "99.9%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome back, Admin</h1>
          <p className="text-surface-500">Here's what's happening with your exam generator today.</p>
        </div>
        <Link href="/dashboard/generator">
          <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02]">
            <Plus className="w-5 h-5" />
            New Question Paper
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-surface-200/60 flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-surface-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-surface-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-surface-200/60 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-surface-900 mb-4">Generation Activity (Placeholder)</h3>
          <div className="w-full h-64 bg-surface-50 rounded-xl border border-surface-100 flex items-center justify-center text-surface-400">
            Chart Component Goes Here
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200/60 p-6">
          <h3 className="text-lg font-bold text-surface-900 mb-4">Recent Papers</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-surface-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-surface-100">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900">Midterm Set {i}</p>
                  <p className="text-xs text-surface-500">Generated 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
