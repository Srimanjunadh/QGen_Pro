"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamPage() {
  const { assignmentId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const studentStr = localStorage.getItem("student_user");
    if (!studentStr) {
      router.push("/student/login");
      return;
    }
    setUser(JSON.parse(studentStr));

    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/student/assignment/${assignmentId}`);
        const data = await res.json();
        setAssignment(data);
        if (data.paper && data.paper.content) {
          const parsedContent = JSON.parse(data.paper.content);
          // Handle both direct array format and { sets: [{ questions: [] }] } format
          let allQuestions = [];
          if (Array.isArray(parsedContent)) {
            allQuestions = parsedContent;
          } else if (parsedContent.sets && Array.isArray(parsedContent.sets)) {
            // Flatten questions from all sets, or just take the first set
            allQuestions = parsedContent.sets[0]?.questions || [];
          } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
            allQuestions = parsedContent.questions;
          }
          setQuestions(allQuestions);
        }
      } catch (error) {
        console.error("Failed to fetch exam", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [assignmentId, router]);

  // Strict Mode capabilities
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // Also manually set it in case the event listener misses it or browser blocks it
      setIsFullscreen(true);
    } catch (error) {
      console.error("Fullscreen error:", error);
      // Fallback for development if fullscreen is blocked
      setIsFullscreen(true);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Prevent copy/paste and context menu
  useEffect(() => {
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    
    if (isFullscreen) {
      document.addEventListener("copy", preventCopy);
      document.addEventListener("paste", preventCopy);
      document.addEventListener("contextmenu", preventContextMenu);
    }
    
    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("paste", preventCopy);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [isFullscreen]);

  // Timer Logic
  const submitExam = useCallback(async () => {
    setSubmitting(true);
    try {
      let marks = 0;
      const positiveMarks = assignment?.paper?.positiveMarks || 1;
      const negativeMarks = assignment?.paper?.negativeMarks || 0;

      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      let detailedQuestions: any[] = [];
      const currentAnswers = answersRef.current;

      let difficultyStats: any = { Easy: { correct: 0, total: 0 }, Medium: { correct: 0, total: 0 }, Hard: { correct: 0, total: 0 } };

      questions.forEach((q, idx) => {
        const studentAnswer = currentAnswers[idx];
        const isCorrect = studentAnswer === q.correctAnswer;
        const diff = q.difficulty || "Medium";
        
        if (difficultyStats[diff]) difficultyStats[diff].total++;
        
        if (!studentAnswer) {
          unattemptedCount++;
        } else if (isCorrect) {
          marks += positiveMarks;
          correctCount++;
          if (difficultyStats[diff]) difficultyStats[diff].correct++;
        } else {
          marks -= negativeMarks;
          incorrectCount++;
        }

        detailedQuestions.push({
          questionText: q.questionText || q.question || "Question text missing",
          studentAnswer: studentAnswer || "Not Attempted",
          correctAnswer: q.correctAnswer,
          isCorrect: isCorrect,
          status: !studentAnswer ? "unattempted" : isCorrect ? "correct" : "incorrect",
          difficulty: diff
        });
      });

      // Compute weaknesses based on difficulty accuracy
      let weakAreas: string[] = [];
      Object.keys(difficultyStats).forEach(diff => {
        const stat = difficultyStats[diff];
        if (stat.total > 0 && (stat.correct / stat.total) < 0.5) {
          weakAreas.push(`Struggling with ${diff} level questions`);
        }
      });
      if (weakAreas.length === 0) weakAreas = ["Needs to improve overall consistency"];

      const reportData = {
        score: marks,
        totalQuestions: questions.length,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy: questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0,
        skills: weakAreas,
        detailedQuestions
      };

      const res = await fetch(`http://localhost:8080/api/student/assignment/${assignmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers, marks, reportData }),
      });

      if (res.ok) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        router.push(`/student/report/${assignmentId}`);
      }
    } catch (error) {
      console.error("Failed to submit", error);
      setSubmitting(false);
    }
  }, [assignment, assignmentId, questions, router]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30); // Reset timer
    } else {
      submitExam();
    }
  }, [currentQuestionIndex, questions.length, submitExam]);

  useEffect(() => {
    if (!isFullscreen || questions.length === 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30; // Will be reset by handleNextQuestion anyway
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFullscreen, questions.length, submitting, handleNextQuestion]);

  const handleOptionSelect = (option: string) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: option };
    setAnswers(newAnswers);
    answersRef.current = newAnswers;
  };

  if (loading) return <div className="p-12 text-center text-surface-500">Loading Exam Environment...</div>;
  if (!assignment) return <div className="p-12 text-center text-red-500">Assignment not found</div>;

  if (!isFullscreen) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-surface-200 p-8 max-w-md w-full text-center">
          <ShieldAlert className="w-16 h-16 text-brand-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Strict Exam Mode</h2>
          <p className="text-surface-500 mb-6 text-sm">
            This exam is proctored. You will have <strong>30 seconds</strong> per question. 
            Do not exit fullscreen, switch tabs, or attempt to copy text. 
            A watermark will be applied to your screen.
          </p>
          <button 
            onClick={enterFullscreen}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg shadow-brand-500/20"
          >
            Enter Fullscreen & Start Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div ref={containerRef} className="fixed inset-0 bg-surface-50 z-[100] flex flex-col overflow-hidden select-none">
      {/* Watermark */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden opacity-5 z-0">
        <div className="transform -rotate-45 text-surface-900 text-[10rem] font-bold whitespace-nowrap">
          {user?.registrationNumber} {user?.registrationNumber}
        </div>
      </div>

      <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-6 z-10">
        <div className="font-bold text-surface-900">{assignment.paper?.title}</div>
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-surface-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft <= 5 ? 'text-red-600' : 'text-brand-600'}`}>
            <Clock className="w-5 h-5" />
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 relative flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-3xl"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-6 md:p-10">
              <h2 className="text-xl md:text-2xl font-medium text-surface-900 mb-8 leading-relaxed">
                <span className="font-bold mr-2">{currentQuestionIndex + 1}.</span>
                {currentQ.questionText || currentQ.question || "Question text not available"}
              </h2>

              <div className="space-y-4">
                {(currentQ.options || ["A", "B", "C", "D"]).map((opt: string, idx: number) => {
                  const isSelected = answers[currentQuestionIndex] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-brand-500 bg-brand-50' 
                          : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-surface-50'
                      }`}
                    >
                      <span className={`text-lg ${isSelected ? 'text-brand-900 font-medium' : 'text-surface-700'}`}>
                        {opt}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNextQuestion}
                disabled={submitting}
                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Exam'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
