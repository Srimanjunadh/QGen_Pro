"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, PlayCircle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentStr = localStorage.getItem("student_user");
    if (!studentStr) {
      router.push("/student/login");
      return;
    }
    const studentData = JSON.parse(studentStr);
    setUser(studentData);

    const fetchAssignments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/student/${studentData.id}/exams`);
        const data = await res.json();
        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [router]);

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-brand-100">Here are your assigned exams and recent results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-surface-500 font-medium">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-surface-200">
            <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900">No exams assigned</h3>
            <p className="text-surface-500">You're all caught up! Check back later.</p>
          </div>
        ) : (
          assignments.map((assignment, idx) => (
            <motion.div 
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  assignment.status === 'STARTED' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {assignment.status}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-surface-900 mb-1">{assignment.paper?.title}</h3>
              <p className="text-sm text-brand-600 font-medium mb-4">{assignment.paper?.subject?.name}</p>
              
              <div className="flex items-center gap-4 text-sm text-surface-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {assignment.paper?.duration} Mins
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {assignment.paper?.maxMarks} Marks
                </span>
              </div>
              
              <div className="mt-auto">
                {assignment.status === 'COMPLETED' ? (
                  <Link href={`/student/report/${assignment.id}`}>
                    <button className="w-full py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl font-medium transition-colors text-sm">
                      View Report
                    </button>
                  </Link>
                ) : (
                  <Link href={`/student/exam/${assignment.id}`}>
                    <button className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20">
                      <PlayCircle className="w-4 h-4" />
                      {assignment.status === 'STARTED' ? 'Resume Exam' : 'Start Exam'}
                    </button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
