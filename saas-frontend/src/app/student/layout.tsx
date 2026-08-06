"use client";

import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-surface-900 tracking-tight text-xl">Student Portal</span>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
