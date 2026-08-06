"use client";

import { Save, User, Key, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-200/60 overflow-hidden">
        <div className="flex border-b border-surface-200/60">
          <button className="px-6 py-4 text-sm font-medium border-b-2 border-brand-600 text-brand-600 bg-brand-50/50">
            Profile
          </button>
          <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition-colors">
            Security
          </button>
          <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition-colors">
            API Keys
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-6 pb-8 border-b border-surface-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-100 to-accent-100 border-2 border-white shadow-md flex items-center justify-center">
              <span className="text-2xl font-bold text-brand-600">AD</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-surface-900">Admin User</h3>
              <p className="text-surface-500 text-sm mb-3">admin@university.edu</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg text-sm font-medium transition-colors">
                  Change Avatar
                </button>
                <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">First Name</label>
                <input type="text" defaultValue="Admin" className="w-full px-4 py-2.5 bg-white text-surface-900 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700">Last Name</label>
                <input type="text" defaultValue="User" className="w-full px-4 py-2.5 bg-white text-surface-900 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Email Address</label>
              <input type="email" defaultValue="admin@university.edu" className="w-full px-4 py-2.5 bg-surface-50 text-surface-900 border border-surface-200 rounded-xl cursor-not-allowed" disabled />
              <p className="text-xs text-surface-500">Contact IT support to change your primary email address.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-surface-700">Role / Department</label>
              <select className="w-full px-4 py-2.5 bg-white text-surface-900 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all">
                <option>Computer Science Dept.</option>
                <option>Mathematics Dept.</option>
                <option>Physics Dept.</option>
                <option>System Administrator</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-100 flex justify-end">
            <button className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:scale-[1.02]">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
