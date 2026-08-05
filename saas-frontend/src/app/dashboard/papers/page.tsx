"use client";

import { useEffect, useState } from "react";
import { FileText, Search, Filter, MoreVertical, Eye, Printer, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Paper {
  id: string;
  title: string;
  subjectId: string;
  duration: number;
  maxMarks: number;
  createdAt: string;
}

export default function GeneratedPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_URL}/api/papers`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPapers(data.papers);
        }
      } catch (error) {
        console.error("Failed to fetch papers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Generated Papers</h1>
          <p className="text-surface-500">View and manage all your generated question sets.</p>
        </div>
        <Link href="/dashboard/generator">
          <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02]">
            <FileText className="w-5 h-5" />
            New Paper
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-200/60 overflow-hidden">
        <div className="p-4 border-b border-surface-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search papers..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-surface-200 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 flex items-center gap-2 w-full sm:w-auto transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-surface-500">Loading papers...</span>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <span className="text-surface-500 mb-2">No papers generated yet.</span>
              <Link href="/dashboard/generator">
                <span className="text-brand-600 font-medium hover:underline text-sm">Generate your first paper</span>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200/60 text-xs uppercase tracking-wider text-surface-500 font-semibold">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper, idx) => (
                  <motion.tr 
                    key={paper.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900">{paper.title}</p>
                          <p className="text-xs text-surface-500">ID: {paper.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-medium">
                          {paper.maxMarks} Marks
                        </span>
                        <span className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-medium">
                          {paper.duration} Mins
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-surface-600">
                        <Calendar className="w-4 h-4 text-surface-400" />
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/papers/${paper.id}`}>
                          <button className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="View Paper">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-2 text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-200 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
