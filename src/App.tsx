/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronLeft, 
  LayoutDashboard, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Star, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Menu,
  Database,
  Info,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for our data structure
interface ExamStructure {
  slots: string;
  marks_each: number;
  total: number;
  note?: string;
}

interface ExamInfo {
  title: string;
  subject_code: string;
  total_marks: number;
  time: string;
  structure: {
    MCQ: ExamStructure;
    SAQ: ExamStructure;
    LAQ: ExamStructure;
  };
  chapter_map: Record<string, string>;
}

interface MCQQuestion {
  id: string;
  question: string;
  year: string;
  options: Record<string, string>;
  correct: string;
  tip: string;
}

interface MCQSlot {
  qNum: number;
  chapter: string;
  questions: MCQQuestion[];
}

interface AnswerBlock {
  type: 'paragraph' | 'subheading' | 'list' | 'numbered_list' | 'code' | 'table';
  text?: string;
  items?: string[];
  lang?: string;
  content?: string;
  headers?: string[];
  rows?: string[][];
}

interface SAQLAQOption {
  id: string;
  question: string;
  year: string;
  importance: number;
  answer: AnswerBlock[];
}

interface SAQLAQSlot {
  slot: string;
  chapter: string;
  type: string;
  marks: number;
  options: SAQLAQOption[];
}

interface ExamData {
  exam: ExamInfo;
  MCQ: MCQSlot[];
  SAQ: SAQLAQSlot[];
  LAQ: SAQLAQSlot[];
}

export default function App() {
  // State Routing
  const [view, setView] = useState<'home' | 'overview' | 'groups' | 'patterns' | 'question' | 'question_bank' | 'about' | 'bank_groups' | 'bank_patterns' | 'bank_question'>('home');
  const [category, setCategory] = useState<'MCQ' | 'SAQ' | 'LAQ' | null>(null);
  const [activeSlot, setActiveSlot] = useState<MCQSlot | SAQLAQSlot | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<MCQQuestion | SAQLAQOption | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  // UI States
  const [showAnswer, setShowAnswer] = useState(false);
  const [data, setData] = useState<ExamData | null>(null);
  const [detailedData, setDetailedData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load primary data
    const loadData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch('/data/Answer-data-v2.json'),
          fetch('/data/Answer-detailed.json')
        ]);
        const json1 = await res1.json();
        const json2 = await res2.json();
        setData(json1);
        setDetailedData(json2);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBack = () => {
    if (view === 'question') setView('patterns');
    else if (view === 'patterns') setView('groups');
    else if (view === 'groups') setView('home');
    else if (view === 'overview') setView('home');
    else if (view === 'question_bank') setView('home');
    else if (view === 'bank_groups') setView('question_bank');
    else if (view === 'bank_patterns') setView('bank_groups');
    else if (view === 'bank_question') setView('bank_patterns');
    else if (view === 'about') setView('home');
    setShowAnswer(false);
  };

  const renderAnswerBlock = (block: AnswerBlock) => {
    const key = Math.random().toString(36).substr(2, 9);
    const text = block.text || block.content || '';
    
    switch (block.type) {
      case 'paragraph':
        return <p key={key} className="mb-4 text-lg leading-relaxed">{text}</p>;
      case 'subheading':
        return <h3 key={key} className="text-xl font-bold text-presentation-primary mt-6 mb-3">{text}</h3>;
      case 'list':
        return (
          <ul key={key} className="list-disc pl-6 mb-4 space-y-2">
            {block.items?.map((item: string, i: number) => <li key={i} className="text-lg">{item}</li>)}
          </ul>
        );
      case 'numbered_list':
        return (
          <ol key={key} className="list-decimal pl-6 mb-4 space-y-2">
            {block.items?.map((item: string, i: number) => <li key={i} className="text-lg">{item}</li>)}
          </ol>
        );
      case 'table':
        return (
          <div key={key} className="overflow-hidden rounded-xl border border-presentation-border mb-6 bg-presentation-bg">
            <table className="w-full text-left border-collapse">
              <thead className="bg-presentation-border">
                <tr>
                  {block.headers?.map((h: string, i: number) => (
                    <th key={i} className="p-4 font-bold text-presentation-muted text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-presentation-border">
                {block.rows?.map((row: string[], i: number) => (
                  <tr key={i} className="hover:bg-presentation-surface/50">
                    {row.map((cell: string, j: number) => (
                      <td key={j} className="p-4 text-sm">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'code':
        return (
          <pre key={key} className="bg-black p-6 rounded-xl font-mono text-sm mb-6 overflow-x-auto border border-presentation-border text-presentation-accent">
            <code>{text}</code>
          </pre>
        );
      default:
        return null;
    }
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-presentation-bg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-presentation-primary rounded-full mb-4"></div>
          <p className="text-presentation-muted">Loading Presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-screen flex flex-col relative bg-presentation-bg">
      {/* Global Header - Hidden on Home */}
      {view !== 'home' && (
        <header className="h-[60px] bg-presentation-surface/40 backdrop-blur-md border-b border-presentation-border flex items-center justify-between px-6 z-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 bg-white flex items-center justify-center">
              <img 
                src="/image/RONB-Edu.png" 
                alt="RONB EDU" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-bold tracking-tight">{data.exam.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {view !== 'home' && (
              <button 
                onClick={handleBack}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border bg-presentation-surface/50 border-presentation-border text-presentation-muted hover:text-white"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}

            <button 
              onClick={() => setView('home')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
                view === 'home' 
                  ? 'bg-presentation-surface border-presentation-primary/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-presentation-surface/50 border-presentation-border text-presentation-muted hover:text-white'
              }`}
            >
              <span>Home</span>
              <Home size={16} />
            </button>

            <div className="h-10 px-3 bg-white rounded-lg flex items-center justify-center border border-presentation-border overflow-hidden shadow-sm">
              <img 
                src="/image/NSA.png" 
                alt="Nepal STEM Alliance" 
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 md:p-4 gap-3 md:gap-4 relative">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-full flex flex-col"
            >
              {/* Home Header - 3 Columns */}
              <div className="flex items-center justify-between w-full px-8 py-4 mb-2">
                <div className="w-[27.5%] flex justify-start items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-red-600 bg-white flex items-center justify-center shadow-2xl">
                    <img 
                      src="/image/RONB-Edu.png" 
                      alt="RONB EDU" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="w-[45%] text-center flex items-center justify-center">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                    NEB Grade XII - Computer Science<br/>
                    <span className="text-presentation-primary text-xl md:text-2xl lg:text-3xl block mt-2">Exam Pattern & High-Probability Questions</span>
                  </h2>
                </div>

                <div className="w-[27.5%] flex justify-end items-center">
                  <div className="h-20 md:h-28 px-6 bg-white rounded-2xl flex items-center justify-center border-4 border-presentation-border overflow-hidden shadow-2xl">
                    <img 
                      src="/image/NSA.png" 
                      alt="Nepal STEM Alliance" 
                      className="h-16 md:h-20 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
                <div className="max-w-6xl w-full">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-4"
                  >
                    <p className="text-xl md:text-2xl text-presentation-muted font-medium">
                      Presenter: Diperson Shrestha
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* High Probability Questions Section */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-presentation-surface/30 border border-presentation-border shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-presentation-primary/20 rounded-lg">
                          <Star className="text-presentation-primary" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">High Probability Questions</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: 'overview', label: 'View Overview', icon: LayoutDashboard, color: 'bg-slate-600', desc: 'Pattern & Marks', action: () => setView('overview') },
                          { id: 'MCQ', label: 'Start MCQ', icon: HelpCircle, color: 'bg-blue-600', desc: `${data.exam.structure.MCQ.slots} Slots`, action: () => { setCategory('MCQ'); setView('groups'); } },
                          { id: 'SAQ', label: 'Start SAQ', icon: BookOpen, color: 'bg-emerald-600', desc: `${data.exam.structure.SAQ.slots} Slots`, action: () => { setCategory('SAQ'); setView('groups'); } },
                          { id: 'LAQ', label: 'Start LAQ', icon: CheckCircle2, color: 'bg-purple-600', desc: `${data.exam.structure.LAQ.slots} Slots`, action: () => { setCategory('LAQ'); setView('groups'); } }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={cat.action}
                            className="group relative p-4 rounded-xl bg-presentation-surface border border-presentation-border hover:border-presentation-primary/50 transition-all text-left overflow-hidden shadow-lg"
                          >
                            <div className={`absolute top-0 right-0 w-16 h-16 ${cat.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                            <cat.icon className="mb-3 text-presentation-primary group-hover:scale-110 transition-transform" size={24} />
                            <h3 className="text-lg font-bold mb-0.5">{cat.label}</h3>
                            <p className="text-presentation-muted text-[10px]">{cat.desc}</p>
                            <div className="mt-3 flex items-center gap-2 text-presentation-primary font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Begin</span>
                              <ArrowRight size={12} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Options */}
                    <div className="flex flex-col gap-6">
                      {/* Extra MCQ Question Bank */}
                      <button
                        onClick={() => setView('question_bank')}
                        className="flex-1 group relative p-6 rounded-2xl bg-presentation-surface border border-presentation-border hover:border-presentation-accent/50 transition-all text-left overflow-hidden shadow-xl flex flex-col justify-center"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-presentation-accent opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                        <Database className="mb-4 text-presentation-accent group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-2xl font-bold mb-2">Extra MCQ Question Bank</h3>
                        <p className="text-presentation-muted text-sm">Comprehensive collection of additional multiple choice questions.</p>
                        <div className="mt-4 flex items-center gap-2 text-presentation-accent font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Explore Library</span>
                          <ArrowRight size={14} />
                        </div>
                      </button>

                      {/* About Us */}
                      <button
                        onClick={() => setView('about')}
                        className="flex-1 group relative p-6 rounded-2xl bg-presentation-surface border border-presentation-border hover:border-presentation-primary/50 transition-all text-left overflow-hidden shadow-xl flex flex-col justify-center"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-presentation-primary opacity-10 rounded-bl-full group-hover:scale-110 transition-transform"></div>
                        <Users className="mb-4 text-presentation-primary group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-2xl font-bold mb-2">About Us</h3>
                        <p className="text-presentation-muted text-sm">Learn more about our mission and the team behind this tool.</p>
                        <div className="mt-4 flex items-center gap-2 text-presentation-primary font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Meet the Team</span>
                          <ArrowRight size={14} />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Metadata Box */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-8 px-8 py-4 bg-presentation-surface/50 border border-presentation-border rounded-xl backdrop-blur-sm">
                      <div className="text-left">
                        <div className="text-[10px] text-presentation-muted uppercase font-bold tracking-widest mb-1">Subject</div>
                        <div className="text-lg font-bold">{data.exam.title} ({data.exam.subject_code})</div>
                      </div>
                      <div className="w-px h-10 bg-presentation-border"></div>
                      <div className="text-left">
                        <div className="text-[10px] text-presentation-muted uppercase font-bold tracking-widest mb-1">Full Marks</div>
                        <div className="text-lg font-bold">{data.exam.total_marks}</div>
                      </div>
                      <div className="w-px h-10 bg-presentation-border"></div>
                      <div className="text-left">
                        <div className="text-[10px] text-presentation-muted uppercase font-bold tracking-widest mb-1">Time</div>
                        <div className="text-lg font-bold">{data.exam.time}</div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
        )}

          {view === 'question_bank' && detailedData && (
            <motion.div 
              key="question_bank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-5xl mx-auto py-12 px-6">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-presentation-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database className="text-presentation-accent" size={40} />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Extra MCQ Question Bank</h2>
                  <p className="text-lg text-presentation-muted max-w-2xl mx-auto">
                    Browse the complete collection of multiple choice questions from the master database.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-12 max-w-md mx-auto">
                  {[
                    { id: 'MCQ', label: 'MCQ Bank', icon: HelpCircle, color: 'bg-blue-600', count: detailedData.MCQ.length },
                  ].map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => {
                        setCategory(bank.id as any);
                        setView('bank_groups');
                      }}
                      className="group p-8 rounded-2xl bg-presentation-surface border border-presentation-border hover:border-presentation-accent/50 transition-all text-center relative overflow-hidden shadow-xl"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${bank.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>
                      <bank.icon className="mx-auto mb-4 text-presentation-accent group-hover:scale-110 transition-transform" size={40} />
                      <h3 className="text-2xl font-bold mb-2">{bank.label}</h3>
                      <p className="text-presentation-muted text-sm">{bank.count} Chapters/Slots</p>
                      <div className="mt-6 inline-flex items-center gap-2 text-presentation-accent font-bold text-sm">
                        <span>Open Bank</span>
                        <ArrowRight size={16} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="text-center mb-16">
                  <div className="w-24 h-24 bg-presentation-primary/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Users className="text-presentation-primary" size={48} />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">About the Project</h2>
                  <p className="text-xl text-presentation-muted">
                    Empowering NEB Grade XII students with high-quality teaching tools and resources.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-presentation-primary">Our Mission</h3>
                    <p className="text-presentation-muted leading-relaxed">
                      This presentation tool is designed to help teachers deliver high-impact lessons on NEB exam patterns. By focusing on high-probability questions and providing clear, structured answers, we aim to bridge the gap between classroom learning and exam success.
                    </p>
                    <p className="text-presentation-muted leading-relaxed">
                      Built with a focus on touchscreen interactivity and high-contrast visuals, it is perfect for smartboards and digital classrooms.
                    </p>
                  </div>
                  <div className="bg-presentation-surface/50 p-8 rounded-2xl border border-presentation-border">
                    <h3 className="text-2xl font-bold mb-6">Key Contributors</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-presentation-primary/20 flex items-center justify-center text-presentation-primary font-bold">DS</div>
                        <div>
                          <div className="font-bold">Diperson Shrestha</div>
                          <div className="text-sm text-presentation-muted">Lead Presenter & Content Expert</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-presentation-accent/20 flex items-center justify-center text-presentation-accent font-bold">NSA</div>
                        <div>
                          <div className="font-bold">Nepal STEM Alliance</div>
                          <div className="text-sm text-presentation-muted">Technical Development & Support</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center text-red-600 font-bold">RE</div>
                        <div>
                          <div className="font-bold">RONB EDU</div>
                          <div className="text-sm text-presentation-muted">Educational Outreach Partner</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => setView('home')}
                    className="px-8 py-3 bg-presentation-primary text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full overflow-y-auto custom-scrollbar pb-20"
            >
              <div className="max-w-4xl mx-auto py-10 px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">NEB Grade XII – Exam Overview</h2>

                {/* Exam Structure */}
                <section className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-presentation-primary">Exam Structure</h3>
                  <div className="bg-presentation-surface/50 rounded-xl border border-presentation-border overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-presentation-surface border-b border-presentation-border">
                        <tr>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Question Type</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Questions</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-presentation-border">
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-4">Group A - MCQs</td>
                          <td className="p-4">9</td>
                          <td className="p-4">1 × 9 = 9</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-4">Group B - SAQs</td>
                          <td className="p-4">5</td>
                          <td className="p-4">5 × 5 = 25</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="p-4">Group C - LAQs</td>
                          <td className="p-4">2</td>
                          <td className="p-4">8 × 2 = 16</td>
                        </tr>
                        <tr className="bg-presentation-surface/80 font-bold">
                          <td className="p-4">Total</td>
                          <td className="p-4">16</td>
                          <td className="p-4">50</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* MCQs */}
                <section className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-presentation-primary">MCQs</h3>
                  <div className="bg-presentation-surface/50 rounded-xl border border-presentation-border overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-presentation-surface border-b border-presentation-border">
                        <tr>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider w-24">Serial</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Chapters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-presentation-border">
                        {[
                          { s: 1, c: 'DBMS' },
                          { s: 2, c: 'Data Communication / DBMS' },
                          { s: 3, c: 'Data Communication' },
                          { s: 4, c: 'Web Technology' },
                          { s: 5, c: 'Web Technology' },
                          { s: 6, c: 'C' },
                          { s: 7, c: 'C' },
                          { s: 8, c: 'OOP' },
                          { s: 9, c: 'SDLC / Recent Trends' }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.s}</td>
                            <td className="p-4">{row.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* SAQs */}
                <section className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-presentation-primary">Short Answer Questions (SAQs)</h3>
                  <div className="bg-presentation-surface/50 rounded-xl border border-presentation-border overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-presentation-surface border-b border-presentation-border">
                        <tr>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider w-24">Serial</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Chapters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-presentation-border">
                        {[
                          { s: 10, c: 'DBMS - 2 OR Questions' },
                          { s: 11, c: 'Web Technology - 2 OR (Java / PHP)' },
                          { s: 12, c: 'OOP' },
                          { s: 13, c: 'SDLC' },
                          { s: 14, c: 'Recent Trends' }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.s}</td>
                            <td className="p-4">{row.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* LAQs */}
                <section className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-presentation-primary">Long Answer Questions (LAQs)</h3>
                  <div className="bg-presentation-surface/50 rounded-xl border border-presentation-border overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-presentation-surface border-b border-presentation-border">
                        <tr>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider w-24">Serial</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Chapters</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-presentation-border">
                        {[
                          { s: 15, c: 'Data and Communication' },
                          { s: 16, c: 'C (Structure / File) - 2 OR' }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.s}</td>
                            <td className="p-4">{row.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Chapter-wise Marks */}
                <section className="mb-12">
                  <h3 className="text-xl font-bold mb-4 text-presentation-primary">Chapter-wise Marks</h3>
                  <div className="bg-presentation-surface/50 rounded-xl border border-presentation-border overflow-hidden shadow-2xl">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-presentation-surface border-b border-presentation-border">
                        <tr>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider">Chapter</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider text-center">MCQ (1)</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider text-center">SAQ (5)</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider text-center">LAQ (8)</th>
                          <th className="p-4 font-bold text-presentation-muted uppercase tracking-wider text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-presentation-border">
                        {[
                          { name: 'DBMS', mcq: 3, saq: 1, laq: '', total: 8 },
                          { name: 'Data Communication', mcq: 1, saq: '', laq: 1, total: 9 },
                          { name: 'Web Technology', mcq: 3, saq: 1, laq: '', total: 8 },
                          { name: 'Programming in C', mcq: '', saq: '', laq: 1, total: 8 },
                          { name: 'OOP', mcq: 1, saq: 1, laq: '', total: 6 },
                          { name: 'Software Process Model', mcq: 1, saq: 1, laq: '', total: 6 },
                          { name: 'Recent Trends', mcq: '', saq: 1, laq: '', total: 5 }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-medium">{row.name}</td>
                            <td className="p-4 text-center">{row.mcq}</td>
                            <td className="p-4 text-center">{row.saq}</td>
                            <td className="p-4 text-center">{row.laq}</td>
                            <td className="p-4 text-center font-bold">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {(view === 'bank_groups' || view === 'groups') && category && (
            <motion.div 
              key={view}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                  <span className="text-presentation-primary font-bold uppercase tracking-widest text-sm">
                    {view === 'bank_groups' ? 'Detailed Bank' : 'High Probability'}
                  </span>
                  <h2 className="text-4xl font-bold mt-2">{category} Slots</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(view === 'bank_groups' ? detailedData![category] : data![category]).map((slot: any) => (
                    <button
                      key={slot.qNum || slot.slot}
                      onClick={() => {
                        setActiveSlot(slot);
                        setView(view === 'bank_groups' ? 'bank_patterns' : 'patterns');
                      }}
                      className="group p-8 rounded-2xl bg-presentation-surface border border-presentation-border hover:border-presentation-primary/50 transition-all text-left flex items-center justify-between shadow-lg"
                    >
                      <div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-presentation-primary transition-colors">
                          {slot.qNum ? `Question ${slot.qNum}` : `Slot ${slot.slot}`}
                        </h3>
                        <p className="text-presentation-muted">{slot.chapter}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-presentation-bg flex items-center justify-center group-hover:bg-presentation-primary group-hover:text-white transition-all border border-presentation-border">
                        <ChevronRight size={24} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(view === 'bank_patterns' || view === 'patterns') && activeSlot && (
            <motion.div 
              key={view}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-5xl mx-auto">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <span className="text-presentation-primary font-bold uppercase tracking-widest text-sm">{activeSlot.chapter}</span>
                    <h2 className="text-4xl font-bold mt-2">Select Pattern</h2>
                  </div>
                  <div className="px-6 py-2 bg-presentation-surface rounded-full border border-presentation-border text-presentation-muted text-sm font-medium">
                    {(activeSlot as any).questions?.length || (activeSlot as any).options?.length} Options
                  </div>
                </div>

                <div className="space-y-4">
                  {((activeSlot as any).questions || (activeSlot as any).options).map((q: any, idx: number) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveQuestion(q);
                        setQuestionIndex(idx);
                        setView(view === 'bank_patterns' ? 'bank_question' : 'question');
                      }}
                      className="w-full group p-6 rounded-xl bg-presentation-surface border border-presentation-border hover:border-presentation-primary/50 transition-all text-left flex items-center gap-6 shadow-md"
                    >
                      <div className="w-12 h-12 rounded-lg bg-presentation-bg flex items-center justify-center font-bold text-presentation-primary group-hover:bg-presentation-primary group-hover:text-white transition-all border border-presentation-border">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold line-clamp-1">{q.question}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-presentation-accent/10 text-presentation-accent rounded border border-presentation-accent/20 font-bold uppercase tracking-wider">
                            Year: {q.year}
                          </span>
                          {q.importance && (
                            <div className="flex items-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Star key={i} size={12} className={i < q.importance ? 'fill-presentation-primary text-presentation-primary' : 'text-presentation-muted/30'} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-presentation-muted group-hover:text-presentation-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(view === 'bank_question' || view === 'question') && activeQuestion && (
            <motion.div 
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-full flex flex-col gap-4 md:gap-6 pb-20 md:pb-0"
            >
              {/* Question Section - Refined height and text size */}
              <div className="flex-shrink-0 bg-presentation-surface rounded-2xl border border-presentation-border p-5 md:p-6 flex flex-col justify-center shadow-2xl relative overflow-hidden">
                <div className="max-w-6xl w-full mx-auto relative z-10">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="px-2.5 py-0.5 bg-presentation-primary/20 text-presentation-primary rounded-md border border-presentation-primary/30 text-[10px] font-black uppercase tracking-widest shrink-0">
                      {category === 'MCQ' ? '1 Mark' : category === 'SAQ' ? '5 Marks' : '8 Marks'}
                    </div>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-snug text-white tracking-tight">
                      {activeQuestion.question}
                    </h2>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-presentation-muted text-xs md:text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-presentation-primary"></span>
                      <span>Year: {activeQuestion.year}</span>
                    </div>
                    {(activeQuestion as any).importance && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-presentation-primary"></span>
                        <span className="mr-0.5">Importance:</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <Star key={i} size={14} className={i < (activeQuestion as any).importance ? 'fill-presentation-primary text-presentation-primary' : 'text-presentation-muted/30'} />
                          ))}
                        </div>
                      </div>
                    )}
                    {activeSlot?.chapter && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-presentation-primary"></span>
                        <span>{activeSlot.chapter}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Subtle background accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-presentation-primary/5 blur-3xl rounded-full -mr-24 -mt-24"></div>
              </div>

              {/* Answer Section - Let parent handle scrolling for better mobile experience */}
              <div className="bg-presentation-surface/30 rounded-2xl border border-dashed border-presentation-border p-4 md:p-6 relative">
                <div className="max-w-6xl mx-auto">
                  {category === 'MCQ' ? (
                    <div className={`flex flex-col md:flex-row gap-4 md:gap-6 transition-all duration-500 ${showAnswer ? 'items-start' : 'items-center justify-start py-4 md:py-8'}`}>
                      <div className={`grid gap-2 md:gap-3 transition-all duration-500 ${showAnswer ? 'w-full md:w-[45%] grid-cols-1' : 'w-full grid-cols-1 md:grid-cols-2'}`}>
                        {Object.entries((activeQuestion as MCQQuestion).options).map(([key, opt], i) => {
                          const isCorrect = key === (activeQuestion as MCQQuestion).correct;
                          return (
                            <div 
                              key={i}
                              className={`p-3 md:p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                                showAnswer 
                                  ? isCorrect 
                                    ? 'bg-presentation-accent/15 border-presentation-accent text-presentation-accent shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                    : 'bg-presentation-surface/50 border-presentation-border opacity-40 grayscale'
                                  : 'bg-presentation-surface border-presentation-border hover:border-presentation-primary/50 hover:bg-presentation-surface/80 cursor-default'
                              }`}
                            >
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-bold text-sm md:text-lg shrink-0 transition-colors ${
                                showAnswer && isCorrect 
                                  ? 'bg-presentation-accent text-white' 
                                  : 'bg-presentation-bg text-presentation-muted border border-presentation-border'
                              }`}>
                                {key}
                              </div>
                              <span className="text-base md:text-lg font-bold leading-tight">{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showAnswer && (activeQuestion as MCQQuestion).tip && (
                          <motion.div 
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.98 }}
                            className="w-full md:w-[55%] p-4 md:p-6 rounded-2xl bg-presentation-surface border border-presentation-border shadow-2xl relative overflow-hidden flex flex-col"
                          >
                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-presentation-primary mb-3">Explanation</div>
                            <div className="text-lg md:text-xl font-bold mb-4">The correct answer is <span className="text-presentation-accent">{(activeQuestion as MCQQuestion).correct}</span></div>
                            
                            <div className="p-3 md:p-5 rounded-xl bg-presentation-bg/50 border-l-4 border-presentation-primary relative">
                              <div className="text-[9px] font-black uppercase tracking-widest text-presentation-primary mb-2 opacity-80">Target Principle:</div>
                              <p className="text-sm md:text-base text-presentation-text leading-relaxed font-medium">
                                {(activeQuestion as MCQQuestion).tip}
                              </p>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-presentation-primary/5 blur-3xl rounded-full"></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="relative">
                      {!showAnswer && (
                        <div className="absolute inset-0 bg-presentation-bg/40 backdrop-blur-md z-10 flex flex-col items-center justify-center rounded-xl min-h-[200px]">
                          <EyeOff size={48} className="text-presentation-muted mb-4 opacity-50" />
                          <p className="text-xl font-bold text-presentation-muted">Answer is Hidden</p>
                          <p className="text-presentation-muted/60 text-sm mt-1">Tap "Show Answer" to reveal content</p>
                        </div>
                      )}
                      <div className={`transition-all duration-500 ${showAnswer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {(activeQuestion as SAQLAQOption).answer?.map(renderAnswerBlock)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls - Fixed on mobile for accessibility, absolute on desktop */}
              <div className="fixed bottom-6 right-6 md:absolute md:bottom-4 md:right-4 flex items-center gap-2 z-50">
                {questionIndex > 0 && (
                  <button
                    onClick={() => {
                      const prevIdx = questionIndex - 1;
                      setQuestionIndex(prevIdx);
                      setActiveQuestion(((activeSlot as any).questions || (activeSlot as any).options)[prevIdx]);
                      setShowAnswer(false);
                    }}
                    className="h-10 md:h-12 px-4 bg-presentation-surface text-presentation-text border border-presentation-border rounded-xl flex items-center gap-2 font-bold text-sm shadow-xl hover:bg-presentation-surface/80 transition-all"
                  >
                    <ChevronLeft size={18} />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className={`h-10 md:h-12 px-4 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-xl ${
                    showAnswer 
                      ? 'bg-presentation-surface text-presentation-text border border-presentation-border' 
                      : 'bg-presentation-primary text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]'
                  }`}
                >
                  {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span>{showAnswer ? 'Hide' : 'Show'}</span>
                </button>

                {activeSlot && questionIndex < ((activeSlot as any).questions?.length || (activeSlot as any).options?.length) - 1 && (
                  <button
                    onClick={() => {
                      const nextIdx = questionIndex + 1;
                      setQuestionIndex(nextIdx);
                      setActiveQuestion(((activeSlot as any).questions || (activeSlot as any).options)[nextIdx]);
                      setShowAnswer(false);
                    }}
                    className="h-10 md:h-12 px-4 bg-presentation-accent text-white rounded-xl flex items-center gap-2 font-bold text-sm shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:scale-105 transition-transform"
                  >
                    <span>Next</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
