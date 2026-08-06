"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Target, BrainCircuit, ShieldAlert, CheckCircle2, ChevronLeft, XCircle, MinusCircle, ListOrdered } from "lucide-react";
import Link from "next/link";

const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];
const BREAKDOWN_COLORS = { correct: '#10b981', incorrect: '#f43f5e', unattempted: '#94a3b8' };

export default function AdminStudentReportView() {
  const { studentId } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/students`);
        const students = await res.json();
        const found = students.find((s: any) => s.id === studentId);
        setStudent(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [studentId]);

  if (loading) return <div className="p-12 text-center text-surface-500 font-medium">Loading detailed analysis...</div>;
  if (!student) return <div className="p-12 text-center text-red-500 font-medium">Student not found.</div>;

  // Get the latest completed assignment for this student
  const completedAssignments = student.assignments?.filter((a: any) => a.status === 'COMPLETED') || [];
  const assignment = completedAssignments.length > 0 ? completedAssignments[completedAssignments.length - 1] : null;

  if (!assignment) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">{student.name}</h2>
        <p className="text-surface-500">This student has not completed any exams yet.</p>
        <Link href="/dashboard/students" className="mt-4 inline-block text-brand-600 hover:underline">Back to Students</Link>
      </div>
    );
  }

  let reportData: any = { 
    score: 0, 
    totalQuestions: 10, 
    skills: ["General"],
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: 10,
    accuracy: 0,
    detailedQuestions: [] 
  };

  try {
    if (assignment.reportData) {
      reportData = { ...reportData, ...JSON.parse(assignment.reportData) };
    }
  } catch (e) {}

  const breakdownData = [
    { name: 'Correct', value: reportData.correctCount || 0, color: BREAKDOWN_COLORS.correct },
    { name: 'Incorrect', value: reportData.incorrectCount || 0, color: BREAKDOWN_COLORS.incorrect },
    { name: 'Unattempted', value: reportData.unattemptedCount || 0, color: BREAKDOWN_COLORS.unattempted },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Link href="/dashboard/students" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 transition mb-2">
        <ChevronLeft className="w-4 h-4" /> Back to Students
      </Link>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -top-24 -right-24 p-8 opacity-10">
          <BrainCircuit className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{student.name}'s Report</h1>
          <p className="text-brand-100 text-lg">College ID: {student.registrationNumber}</p>
          <div className="inline-block mt-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <span className="text-brand-50 font-medium">Exam Completed on {new Date(assignment.completedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="relative z-10 flex gap-4">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full flex flex-col items-center justify-center text-brand-900 shadow-xl border-8 border-brand-400/30">
            <span className="text-4xl md:text-5xl font-black">{assignment.marks}</span>
            <span className="text-xs md:text-sm font-medium text-surface-500 uppercase tracking-wider mt-1">Total Score</span>
          </div>
          <div className="w-32 h-32 md:w-48 md:h-48 bg-brand-50 rounded-full flex flex-col items-center justify-center text-brand-900 shadow-xl border-8 border-brand-400/30">
            <span className="text-4xl md:text-5xl font-black">{reportData.accuracy || 0}%</span>
            <span className="text-xs md:text-sm font-medium text-surface-500 uppercase tracking-wider mt-1">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-surface-900">{reportData.correctCount || 0}</div>
            <div className="text-sm font-medium text-surface-500 uppercase tracking-wider">Correct Answers</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-surface-900">{reportData.incorrectCount || 0}</div>
            <div className="text-sm font-medium text-surface-500 uppercase tracking-wider">Incorrect Answers</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 flex items-center gap-4">
          <div className="p-4 bg-slate-50 rounded-xl text-slate-600">
            <MinusCircle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-surface-900">{reportData.unattemptedCount || 0}</div>
            <div className="text-sm font-medium text-surface-500 uppercase tracking-wider">Unattempted</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Answer Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-500" />
            Performance Breakdown
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Feedback */}
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5" />
              Student Strengths
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                Great accuracy in {reportData.skills?.[0] || 'Core Concepts'}.
              </li>
              <li className="flex items-start gap-3 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                {reportData.accuracy > 70 ? "Excellent overall comprehension rate." : "Steady pacing throughout the exam."}
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-2xl shadow-sm border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              Areas to Improve
            </h3>
            <ul className="space-y-3">
              {reportData.skills && reportData.skills.length > 0 ? (
                reportData.skills.map((weakness: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-orange-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    {weakness}
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-3 text-orange-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                  {reportData.incorrectCount > 0 ? `Review concepts from the ${reportData.incorrectCount} questions missed.` : 'Focus on attempting all questions.'}
                </li>
              )}
              {reportData.unattemptedCount > 0 && (
                <li className="flex items-start gap-3 text-orange-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                  {reportData.unattemptedCount > 2 ? "Time management needs work—many questions left blank." : "Double-check answers before time expires. Unattempted questions missed out on potential marks."}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Question Analysis */}
      {reportData.detailedQuestions && reportData.detailedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 md:p-8 mt-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-brand-500" />
            Question-by-Question Analysis
          </h2>
          
          <div className="space-y-6">
            {reportData.detailedQuestions.map((q: any, idx: number) => (
              <div key={idx} className={`p-6 rounded-2xl border ${
                q.status === 'correct' ? 'bg-emerald-50/50 border-emerald-100' : 
                q.status === 'incorrect' ? 'bg-rose-50/50 border-rose-100' : 
                'bg-slate-50/50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-surface-900 font-medium text-lg leading-relaxed">
                    <span className="font-bold mr-2">{idx + 1}.</span> {q.questionText}
                  </h3>
                  {q.status === 'correct' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-xs uppercase tracking-wider shrink-0">Correct</span>}
                  {q.status === 'incorrect' && <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded-full text-xs uppercase tracking-wider shrink-0">Incorrect</span>}
                  {q.status === 'unattempted' && <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-full text-xs uppercase tracking-wider shrink-0">Unattempted</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={`p-3 rounded-xl border ${q.status === 'correct' ? 'bg-emerald-100/50 border-emerald-200 text-emerald-900' : q.status === 'incorrect' ? 'bg-rose-100/50 border-rose-200 text-rose-900' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    <span className="block text-xs uppercase font-bold opacity-70 mb-1">Student Answer</span>
                    <span className="font-medium">{q.studentAnswer}</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-emerald-100/50 border-emerald-200 text-emerald-900">
                    <span className="block text-xs uppercase font-bold opacity-70 mb-1">Correct Answer</span>
                    <span className="font-medium">{q.correctAnswer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
