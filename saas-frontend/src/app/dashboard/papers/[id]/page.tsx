"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Clock, Award, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

interface QuestionSet {
  setNumber: number;
  questions: Question[];
}

interface PaperDetail {
  id: string;
  title: string;
  duration: number;
  maxMarks: number;
  content: string; // JSON string
  createdAt: string;
}

export default function PaperView() {
  const params = useParams();
  const router = useRouter();
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Set Tabs and Interactive MCQs
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_URL}/api/papers/${params.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.paper) {
          setPaper(data.paper);
          const parsedContent = JSON.parse(data.paper.content);
          // If the AI returned an array of sets, or an object containing sets
          setSets(Array.isArray(parsedContent) ? parsedContent : parsedContent.sets || []);
        }
      } catch (error) {
        console.error("Failed to fetch paper details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-surface-900">Paper not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-brand-600 font-medium hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const activeSet = sets[activeSetIndex];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/dashboard/papers")}
          className="flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Papers
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-surface-200 hover:bg-surface-50 text-surface-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      {/* Paper Metadata */}
      <div className="bg-white p-8 rounded-3xl shadow-lg shadow-surface-200/50 border border-white backdrop-blur-2xl">
        <div className="flex items-start justify-between border-b border-surface-100 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 tracking-tight">{paper.title}</h1>
            <p className="text-surface-500 mt-2 font-medium">Generated on {new Date(paper.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <span className="flex items-center justify-end gap-2 text-surface-700 font-bold bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200">
              <Clock className="w-4 h-4 text-brand-500" /> {paper.duration} Minutes
            </span>
            <span className="flex items-center justify-end gap-2 text-surface-700 font-bold bg-surface-50 px-3 py-1.5 rounded-lg border border-surface-200">
              <Award className="w-4 h-4 text-accent-500" /> {paper.maxMarks} Max Marks
            </span>
          </div>
        </div>

        {/* Set Navigation Tabs */}
        {sets.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-6 mb-6 border-b border-surface-100 no-scrollbar">
            {sets.map((set, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSetIndex(idx)}
                className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeSetIndex === idx
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105"
                    : "bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200"
                }`}
              >
                SET {set.setNumber || idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Question Set Display */}
        <div className="space-y-12 printable-content">
          {sets.length === 0 ? (
            <div className="text-center py-10 text-surface-500 font-medium">
              No questions found or failed to parse AI output.
            </div>
          ) : (
            <div className="space-y-6">
              {activeSet?.questions?.map((q, qIdx) => (
                <div key={q.id || qIdx} className="p-6 rounded-2xl border-2 border-surface-100 bg-surface-50/30 hover:bg-surface-50/80 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <span className="font-extrabold text-brand-600 text-lg">Q{qIdx + 1}.</span>
                      <p className="text-surface-900 font-medium leading-relaxed text-lg">{q.question}</p>
                    </div>
                  </div>
                  
                  {/* Interactive MCQ Options Display */}
                  {q.type === 'MCQ' && q.options && q.options.length > 0 && (
                    <div className="mt-6 pl-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[q.id] === opt;
                        const isCorrect = q.correctAnswer === opt;
                        const showResult = userAnswers[q.id] !== undefined; // User has answered this question
                        
                        let optionStyle = "border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50 cursor-pointer shadow-sm hover:shadow";
                        let badgeStyle = "bg-brand-50 text-brand-700 border-brand-200";
                        let icon = null;

                        if (showResult) {
                          if (isCorrect) {
                            optionStyle = "border-emerald-500 bg-emerald-50/50 shadow-sm cursor-default";
                            badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />;
                          } else if (isSelected && !isCorrect) {
                            optionStyle = "border-red-500 bg-red-50/50 shadow-sm cursor-default";
                            badgeStyle = "bg-red-500 text-white border-red-500";
                            icon = <XCircle className="w-5 h-5 text-red-500 ml-auto" />;
                          } else {
                            optionStyle = "border-surface-200 bg-white/50 opacity-60 cursor-default";
                            badgeStyle = "bg-surface-100 text-surface-400 border-surface-200";
                          }
                        }

                        return (
                          <div 
                            key={oIdx} 
                            onClick={() => {
                              // Prevent changing answer if already answered
                              if (!showResult && q.id) {
                                setUserAnswers(prev => ({ ...prev, [q.id]: opt }));
                              }
                            }}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${optionStyle}`}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold border transition-colors ${badgeStyle}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className={`font-semibold text-[15px] ${showResult && isCorrect ? 'text-emerald-900' : showResult && isSelected && !isCorrect ? 'text-red-900' : 'text-surface-800'}`}>
                              {opt}
                            </span>
                            {icon}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Metadata tags */}
                  <div className="mt-6 flex items-center gap-3 pl-10">
                    <span className="px-3 py-1.5 bg-white border border-surface-200 text-surface-600 rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm">
                      {q.type}
                    </span>
                    <span className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border shadow-sm
                      ${q.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        q.difficulty?.toLowerCase() === 'hard' ? 'bg-red-50 border-red-200 text-red-700' : 
                        'bg-amber-50 border-amber-200 text-amber-700'}
                    `}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
