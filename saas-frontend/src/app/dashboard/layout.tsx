"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Settings2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: BookOpen, label: "Textbooks", href: "/dashboard/books" },
  { icon: Settings2, label: "Generate Paper", href: "/dashboard/generator" },
  { icon: FileText, label: "Generated Papers", href: "/dashboard/papers" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-surface-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-surface-900 tracking-tight">QGen Pro</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-surface-900">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 768 ? 0 : -280) }}
          className={`
            fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-surface-900 text-white flex flex-col
            border-r border-surface-800 shadow-xl md:shadow-none
            transform transition-transform duration-300 md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">QGen Pro</span>
              </div>
              <button className="md:hidden p-2 text-surface-200 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link href={item.href} key={item.href} onClick={() => setSidebarOpen(false)}>
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? "bg-brand-600 text-white shadow-md shadow-brand-600/20" 
                        : "text-surface-200 hover:bg-surface-800 hover:text-white"}
                    `}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-surface-200"}`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="p-4 border-t border-surface-800">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-200 hover:bg-surface-800 hover:text-red-400 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-white border-b border-surface-200">
          <h2 className="text-xl font-bold text-surface-900 capitalize">
            {pathname.split("/").pop() || "Overview"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-surface-900 hover:bg-surface-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-100 to-accent-100 rounded-full border border-surface-200 flex items-center justify-center">
              <span className="font-bold text-brand-600 text-sm">AD</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={pathname}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
