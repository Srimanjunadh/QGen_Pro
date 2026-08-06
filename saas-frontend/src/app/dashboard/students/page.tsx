"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, ShieldAlert, CheckCircle2, MoreVertical, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/students`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    try {
      setGenerating(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/generate-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount })
      });
      const data = await res.json();
      setGeneratedCodes(data.codes.map((c: any) => c.code));
      fetchStudents(); // Refresh if it helps, though usually they are separate
    } catch (error) {
      console.error("Failed to generate codes", error);
    } finally {
      setGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/students/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchStudents();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Student Management</h1>
          <p className="text-surface-500">Manage student access, generate registration codes, and view reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Generation Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-500" />
            Generate Group Code
          </h2>
          <p className="text-sm text-surface-500 mb-4">Create a single registration code valid for multiple students.</p>
          <div className="flex gap-2 mb-4 items-center">
            <span className="text-sm text-surface-700 font-medium">For</span>
            <input 
              type="number" 
              min="1" 
              max="1000" 
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="w-20 px-4 py-2 border border-surface-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-surface-900 bg-white"
            />
            <span className="text-sm text-surface-700 font-medium">students</span>
            <button 
              onClick={handleGenerateCodes}
              disabled={generating}
              className="ml-auto px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition flex items-center justify-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
            </button>
          </div>
          
          {generatedCodes.length > 0 && (
            <div className="mt-4 p-4 bg-surface-50 rounded-xl">
              <p className="text-sm font-medium text-surface-700 mb-2">New Group Code (Valid for {generateCount} students):</p>
              <div className="flex flex-wrap gap-2">
                {generatedCodes.map(c => (
                  <span key={c} className="px-4 py-2 bg-white border border-surface-200 rounded-md text-lg font-mono font-bold text-brand-700 shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-surface-200 p-6 overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            Registered Students
          </h2>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-200 text-surface-500 text-sm">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Reg Number</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-surface-500">Loading...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-surface-500">No students registered yet.</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id} className="hover:bg-surface-50 transition-colors group">
                      <td className="py-3">
                        <div className="font-medium text-surface-900">{student.name}</div>
                        <div className="text-xs text-surface-500">{student.year} - Sec {student.section}</div>
                      </td>
                      <td className="py-3 font-mono text-sm text-surface-700">{student.registrationNumber}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          student.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/reports/${student.id}`}>
                            <button className="text-brand-600 hover:text-brand-800 text-sm font-medium">
                              Report
                            </button>
                          </Link>
                          {student.status === 'ACTIVE' ? (
                            <button onClick={() => updateStatus(student.id, 'SUSPENDED')} className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => updateStatus(student.id, 'ACTIVE')} className="text-green-600 hover:text-green-800 text-sm font-medium">
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
