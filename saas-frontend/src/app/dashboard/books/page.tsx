"use client";

import { useState } from "react";
import { BookOpen, Upload, Search, Filter, MoreVertical, FileText, Trash2, Edit3 } from "lucide-react";
import { motion } from "framer-motion";

export default function BooksManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockBooks = [
    { id: 1, title: "Introduction to Algorithms", subject: "Computer Science", format: "PDF", pages: 1240, date: "2026-08-01" },
    { id: 2, title: "Advanced Calculus", subject: "Mathematics", format: "PDF", pages: 850, date: "2026-08-02" },
    { id: 3, title: "Modern Physics", subject: "Physics", format: "DOCX", pages: 420, date: "2026-08-04" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Textbook Library</h1>
          <p className="text-surface-500">Manage your source materials for question generation.</p>
        </div>
        <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02]">
          <Upload className="w-5 h-5" />
          Upload Textbook
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-200/60 overflow-hidden">
        <div className="p-4 border-b border-surface-200/60 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input 
              type="text" 
              placeholder="Search textbooks..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-white border border-surface-200 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50 flex items-center gap-2 w-full sm:w-auto transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200/60 text-xs uppercase tracking-wider text-surface-500 font-semibold">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockBooks.map((book, idx) => (
                <motion.tr 
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-surface-100 hover:bg-surface-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">{book.title}</p>
                        <p className="text-xs text-surface-500">{book.pages} pages</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-surface-100 text-surface-700 rounded-full text-xs font-medium">
                      {book.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-surface-600">
                      <FileText className="w-4 h-4 text-surface-400" />
                      {book.format}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {book.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
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
        </div>
      </div>
    </div>
  );
}
