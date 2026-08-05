"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Settings2, Sliders, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Search, X } from "lucide-react";
import Link from "next/link";

const btechSubjects: Record<string, string[]> = {
  "Data Structures": ["Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Sorting & Searching"],
  "Operating Systems": ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Concurrency"],
  "Database Management Systems": ["ER Model", "Relational Algebra", "SQL", "Normalization", "Transactions", "Concurrency Control", "NoSQL"],
  "Computer Networks": ["OSI Model", "TCP/IP", "Data Link Layer", "Network Layer", "Transport Layer", "Application Layer", "Network Security"],
  "Software Engineering": ["SDLC Models", "Requirements Engineering", "Software Design", "Testing", "Maintenance"],
  "Theory of Computation": ["Finite Automata", "Context Free Grammars", "Turing Machines", "Decidability"],
  "Compiler Design": ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Code Optimization", "Code Generation"],
  "Artificial Intelligence": ["Search Algorithms", "Knowledge Representation", "Machine Learning Basics", "Neural Networks", "NLP Basics"],
  "Web Technologies": ["HTML/CSS", "JavaScript", "React", "Node.js", "REST APIs", "Web Security"],
  "Machine Learning (ML)": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Regression", "Classification", "Clustering", "SVM", "Decision Trees"],
  "Deep Learning (DL)": ["Neural Networks", "CNNs", "RNNs", "LSTMs", "Transformers", "GANs", "Transfer Learning"],
  "Natural Language Processing (NLP)": ["Text Preprocessing", "Word Embeddings", "Sequence to Sequence Models", "Attention Mechanism", "Named Entity Recognition", "Sentiment Analysis"],
  "Privacy and Intrusion Detection": ["Network Intrusions", "Host-based Intrusions", "Cryptography", "Firewalls", "Anomaly Detection", "Data Privacy Laws", "Malware Analysis"],
  "Big Data and Analytics": ["Hadoop Ecosystem", "MapReduce", "Spark", "Data Mining", "Predictive Analytics", "Data Visualization", "Stream Processing"],
  "Cloud Computing": ["IaaS, PaaS, SaaS", "Virtualization", "Cloud Security", "Docker & Kubernetes", "Cloud Architectures", "Serverless Computing"],
  "Computing Ethics": ["Intellectual Property", "Privacy & Surveillance", "Cybercrime", "Professional Codes of Conduct", "AI Ethics", "Social Impact of Computing"]
};

const generatorSchema = z.object({
  title: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  topics: z.array(z.string()).min(1, "Select at least one topic"),
  numSets: z.number().min(1).max(10),
  questionsPerSet: z.number().min(5).max(100),
  difficulty: z.object({
    easy: z.number(),
    medium: z.number(),
    hard: z.number(),
  }).refine((data) => data.easy + data.medium + data.hard === 100, {
    message: "Difficulty distribution must equal 100%",
  }),
  questionTypes: z.array(z.string()).min(1, "Select at least one question type"),
});

type FormValues = z.infer<typeof generatorSchema>;

const STEPS = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Configuration", icon: Settings2 },
  { id: 3, title: "Difficulty & Types", icon: Sliders },
];

export default function GeneratorWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedPaperId, setGeneratedPaperId] = useState<string | null>(null);

  // Subject Dropdown State
  const [subjectSearch, setSubjectSearch] = useState("");
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  
  // Topic Dropdown State
  const [topicSearch, setTopicSearch] = useState("");
  const [isTopicOpen, setIsTopicOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      title: "",
      subject: "",
      topics: [],
      numSets: 1,
      questionsPerSet: 10,
      difficulty: { easy: 30, medium: 40, hard: 30 },
      questionTypes: ["MCQ", "Short Answer"],
    },
  });

  const selectedSubject = watch("subject");
  const selectedTopics = watch("topics") || [];

  const availableSubjects = Object.keys(btechSubjects).filter(sub => sub.toLowerCase().includes(subjectSearch.toLowerCase()));
  const availableTopics = selectedSubject && btechSubjects[selectedSubject] 
    ? btechSubjects[selectedSubject].filter(top => top.toLowerCase().includes(topicSearch.toLowerCase())) 
    : [];

  // Close dropdowns on outside click (simplified for this context)
  
  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token") || "";
      const topicString = data.topics.join(", ");
      const paperTitle = data.title || `${data.subject} - ${topicString} - Set ${data.numSets}`;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const genRes = await fetch(`${API_URL}/api/papers/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: paperTitle,
          subjectName: data.subject,
          topic: topicString,
          config: {
            numSets: data.numSets,
            questionsPerSet: data.questionsPerSet,
            difficulty: data.difficulty,
            questionTypes: data.questionTypes
          }
        }),
      });
      
      const genData = await genRes.json();
      
      if (!genData.success) {
        throw new Error(genData.error || genData.message || "Failed to generate paper");
      }
      
      setGeneratedPaperId(genData.paper.id);
      setIsGenerating(false);
      setSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "An error occurred");
      setIsGenerating(false);
    }
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 px-4">
        <div className="w-24 h-24 bg-emerald-100/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 backdrop-blur-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-surface-900 mb-3 tracking-tight">Paper Generated!</h2>
        <p className="text-surface-500 mb-10 max-w-md text-center text-lg">Your highly structured, randomized question papers have been generated successfully.</p>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white border border-surface-200 hover:bg-surface-50 text-surface-700 rounded-xl font-medium transition-all shadow-sm">
            Generate Another
          </button>
          {generatedPaperId && (
            <Link href={`/dashboard/papers/${generatedPaperId}`}>
              <button className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-brand-500/25">
                View Paper
              </button>
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-surface-900 tracking-tight">Generate Question Paper</h1>
        <p className="text-surface-500 text-lg">Configure parameters to generate an enterprise-grade B.Tech CSE exam.</p>
      </div>

      {/* Modern Stepper */}
      <div className="relative px-8">
        <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-surface-100 rounded-full z-0"></div>
        <div 
          className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-brand-600 rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 80}%` }}
        ></div>
        
        <div className="relative z-10 flex justify-between items-center">
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-3 bg-surface-50 px-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? "bg-brand-600 border-brand-100 text-white shadow-lg shadow-brand-500/30 scale-110" : isCompleted ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-surface-200 text-surface-400"}`}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-bold ${isActive ? "text-brand-900" : isCompleted ? "text-brand-600" : "text-surface-400"}`}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <div className="relative bg-white/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-xl shadow-surface-200/50 border border-white min-h-[450px] flex flex-col">
        {/* Subtle background glow wrapper */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-50 rounded-full blur-3xl opacity-50"></div>
        </div>

        <form className="flex-1 flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-surface-700">Paper Title <span className="font-normal text-surface-400">(Optional)</span></label>
                  <input {...register("title")} className="w-full px-5 py-4 rounded-2xl border-2 border-surface-100 bg-surface-50/50 text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm" placeholder="Leave blank to auto-generate" />
                </div>
                
                {/* Subject Custom Dropdown */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-surface-700">Select Subject</label>
                  <div className="relative">
                    <div 
                      className="w-full px-5 py-4 rounded-2xl border-2 border-surface-100 bg-surface-50/50 text-surface-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm cursor-pointer flex items-center justify-between"
                      onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                    >
                      <span>{selectedSubject || "Choose a B.Tech CSE Subject..."}</span>
                      <ChevronRight className={`w-5 h-5 text-surface-400 transition-transform ${isSubjectOpen ? "rotate-90" : ""}`} />
                    </div>
                    
                    {isSubjectOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-surface-100 flex items-center gap-2 bg-surface-50/50">
                          <Search className="w-4 h-4 text-surface-400" />
                          <input 
                            type="text" 
                            className="w-full bg-transparent focus:outline-none text-sm text-surface-900" 
                            placeholder="Search subjects..." 
                            value={subjectSearch}
                            onChange={(e) => setSubjectSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {availableSubjects.map(sub => (
                            <div 
                              key={sub} 
                              className={`p-3 rounded-xl cursor-pointer text-sm font-medium transition-colors ${selectedSubject === sub ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-50 text-surface-700'}`}
                              onClick={() => {
                                setValue("subject", sub, { shouldValidate: true });
                                setValue("topics", [], { shouldValidate: true }); // Reset topics
                                setIsSubjectOpen(false);
                                setSubjectSearch("");
                              }}
                            >
                              {sub}
                            </div>
                          ))}
                          {availableSubjects.length === 0 && <div className="p-4 text-center text-sm text-surface-500">No subjects found</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                </div>

                {/* Topics Custom Dropdown */}
                <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-surface-700">Select Topics (Multiple)</label>
                  <div className="relative">
                    <div 
                      className={`w-full px-5 py-4 rounded-2xl border-2 border-surface-100 bg-surface-50/50 text-surface-900 transition-all shadow-sm flex items-center justify-between min-h-[60px] ${!selectedSubject ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus:border-brand-500 focus:bg-white'}`}
                      onClick={() => selectedSubject && setIsTopicOpen(!isTopicOpen)}
                    >
                      <div className="flex flex-wrap gap-2">
                        {selectedTopics.length === 0 ? (
                          <span className="text-surface-400">{!selectedSubject ? "Select a subject first" : "Choose topics..."}</span>
                        ) : (
                          selectedTopics.map(t => (
                            <span key={t} className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-xs font-bold flex items-center gap-1">
                              {t}
                              <X className="w-3 h-3 hover:bg-brand-200 rounded-full" onClick={(e) => {
                                e.stopPropagation();
                                setValue("topics", selectedTopics.filter(topic => topic !== t), { shouldValidate: true });
                              }}/>
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-surface-400 transition-transform ${isTopicOpen ? "rotate-90" : ""}`} />
                    </div>
                    
                    {isTopicOpen && selectedSubject && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-surface-100 flex items-center gap-2 bg-surface-50/50">
                          <Search className="w-4 h-4 text-surface-400" />
                          <input 
                            type="text" 
                            className="w-full bg-transparent focus:outline-none text-sm text-surface-900" 
                            placeholder="Search topics..." 
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2">
                          {availableTopics.map(top => {
                            const isSelected = selectedTopics.includes(top);
                            return (
                              <div 
                                key={top} 
                                className={`p-3 rounded-xl cursor-pointer text-sm font-medium transition-colors flex justify-between items-center ${isSelected ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface-50 text-surface-700'}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setValue("topics", selectedTopics.filter(t => t !== top), { shouldValidate: true });
                                  } else {
                                    setValue("topics", [...selectedTopics, top], { shouldValidate: true });
                                  }
                                }}
                              >
                                {top}
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                              </div>
                            );
                          })}
                          {availableTopics.length === 0 && <div className="p-4 text-center text-sm text-surface-500">No topics found</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.topics && <p className="text-red-500 text-xs mt-1">{errors.topics.message}</p>}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-surface-700">Number of Sets</label>
                    <input type="number" {...register("numSets", { valueAsNumber: true })} className="w-full px-5 py-4 rounded-2xl border-2 border-surface-100 bg-surface-50/50 text-surface-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm text-lg font-semibold" />
                    {errors.numSets && <p className="text-red-500 text-xs">{errors.numSets.message}</p>}
                    <p className="text-xs text-surface-500 font-medium">Multiple sets will have strictly randomized unique questions.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-surface-700">Questions Per Set</label>
                    <input type="number" {...register("questionsPerSet", { valueAsNumber: true })} className="w-full px-5 py-4 rounded-2xl border-2 border-surface-100 bg-surface-50/50 text-surface-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm text-lg font-semibold" />
                    {errors.questionsPerSet && <p className="text-red-500 text-xs">{errors.questionsPerSet.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-8 flex-1">
                <div className="space-y-5">
                  <label className="text-sm font-bold text-surface-700 flex items-center justify-between">
                    Difficulty Distribution (%)
                    {errors.difficulty && <span className="text-red-500 text-xs bg-red-50 px-2 py-1 rounded">{errors.difficulty.message}</span>}
                  </label>
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                      <span className="text-xs text-emerald-600 uppercase font-extrabold tracking-wider">Easy</span>
                      <input type="number" {...register("difficulty.easy", { valueAsNumber: true })} className="w-full px-5 py-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 text-emerald-900 font-bold focus:outline-none focus:border-emerald-300 focus:bg-emerald-50 transition-all text-center text-xl" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-xs text-amber-600 uppercase font-extrabold tracking-wider">Medium</span>
                      <input type="number" {...register("difficulty.medium", { valueAsNumber: true })} className="w-full px-5 py-3 rounded-2xl border-2 border-amber-100 bg-amber-50/50 text-amber-900 font-bold focus:outline-none focus:border-amber-300 focus:bg-amber-50 transition-all text-center text-xl" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <span className="text-xs text-red-600 uppercase font-extrabold tracking-wider">Hard</span>
                      <input type="number" {...register("difficulty.hard", { valueAsNumber: true })} className="w-full px-5 py-3 rounded-2xl border-2 border-red-100 bg-red-50/50 text-red-900 font-bold focus:outline-none focus:border-red-300 focus:bg-red-50 transition-all text-center text-xl" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-8 border-t border-surface-100">
                  <label className="text-sm font-bold text-surface-700">Question Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["MCQ", "True/False", "Short Answer", "Long Essay"].map(type => (
                      <label key={type} className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-surface-100 rounded-2xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all group relative">
                        <input type="checkbox" value={type} {...register("questionTypes")} className="absolute top-3 left-3 w-4 h-4 text-brand-600 rounded border-surface-300 focus:ring-brand-600" />
                        <span className="text-sm font-bold text-surface-700 group-hover:text-brand-700">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.questionTypes && <p className="text-red-500 text-xs mt-2">{errors.questionTypes.message}</p>}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-surface-100 flex items-center justify-between">
            <button 
              type="button" 
              onClick={prevStep} 
              disabled={currentStep === 1 || isGenerating}
              className="px-6 py-3 rounded-2xl font-bold text-surface-600 hover:bg-surface-100 disabled:opacity-0 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            {currentStep < STEPS.length ? (
              <button 
                type="button" 
                onClick={nextStep}
                className="px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-surface-900/20 active:scale-95"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isGenerating}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-brand-500/30 disabled:opacity-70 disabled:scale-100 active:scale-95"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Paper...</>
                ) : (
                  <><FileText className="w-5 h-5" /> Generate Paper Now</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
