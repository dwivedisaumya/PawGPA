import React, { useState, useEffect } from 'react';
import { Target, Sparkles, Trash2, GraduationCap, Compass, ArrowRight, Home, Award, MessageSquare, Lightbulb } from 'lucide-react';

const GRADE_POINTS: { [key: string]: number } = {
  'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
};
const CREDIT_OPTIONS = [4, 3, 2, 1];

const PAW_STUDY_TIPS = [
  "⏱️ Study with Pomodoro technique: 25 mins study, 5 mins break. Keeps the brain fresh!",
  "💧 Drink regular water! Hydration instantly pumps oxygen to your brain and boosts focus.",
  "🎧 Don't use earpods for too long at high volume; it strains your delicate ears and causes fatigue.",
  "☀️ Take a 5-minute walk under natural light before starting a heavy core subject.",
  "📝 Write summary cheat-sheets in your own handwriting. Active recall works like magic!",
  "🐱 Reward yourself! Complete 2 hours of solid prep, then treat yourself to a favorite snack or game."
];

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface StrategySubject {
  id: string;
  credits: number;
}

interface UserSuggestion {
  id: string;
  name: string;
  tip: string;
  time: string;
}

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'dashboard'>('welcome');
  const [activeTab, setActiveTab] = useState<'sem' | 'target' | 'strategy' | 'suggestions'>('sem');

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Subject 1', credits: 4, grade: 'S' }
  ]);
  const [calculatedGPA, setCalculatedGPA] = useState<number | null>(null);

  const [currentCGPA, setCurrentCGPA] = useState<string>('');
  const [completedCredits, setCompletedCredits] = useState<string>('');
  const [nextSemCredits, setNextSemCredits] = useState<string>('');
  const [targetCGPA, setTargetCGPA] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<{msg: string, neededGPA: number | null}>({msg: '', neededGPA: null});

  const [strategySubjects, setStrategySubjects] = useState<StrategySubject[]>([
    { id: '1', credits: 4 }
  ]);
  const [targetStrategyGPA, setTargetStrategyGPA] = useState<string>('');
  const [strategies, setStrategies] = useState<string[][]>([]);
  const [strategyError, setStrategyError] = useState<string>('');

  // 📝 LOCALSTORAGE INTEGRATION FOR SUGGESTIONS
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>(() => {
    const savedTips = localStorage.getItem('pawgpa_user_tips');
    if (savedTips) {
      return JSON.parse(savedTips);
    }
    return [
      { id: '1', name: 'Aman', tip: 'Revise everything right before sleeping, memory retains it better! 📚', time: '5m ago' },
      { id: '2', name: 'Sneha', tip: 'Keep your smartphone in another room during high-focus tasks. 📱❌', time: '1h ago' }
    ];
  });
  
  const [newAuthor, setNewAuthor] = useState('');
  const [newTipText, setNewTipText] = useState('');

  // Sync suggestions to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('pawgpa_user_tips', JSON.stringify(userSuggestions));
  }, [userSuggestions]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: `Subject ${subjects.length + 1}`, credits: 4, grade: 'A' }]);
  };
  const removeSubject = (id: string) => setSubjects(subjects.filter(sub => sub.id !== id));
  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(sub => sub.id === id ? { ...sub, [field]: value } : sub));
  };
  const calculateGPA = () => {
    let tc = 0, tp = 0;
    subjects.forEach(sub => { tc += sub.credits; tp += sub.credits * GRADE_POINTS[sub.grade]; });
    setCalculatedGPA(Number((tp / tc).toFixed(2)));
  };

  const predictTargetGPA = () => {
    const curCG = parseFloat(currentCGPA), compCred = parseFloat(completedCredits);
    const nextCred = parseFloat(nextSemCredits), tarCG = parseFloat(targetCGPA);

    if (isNaN(curCG) || isNaN(compCred) || isNaN(nextCred) || isNaN(tarCG)) {
      setPredictionResult({msg: "Please fill all blanks to calculate.", neededGPA: null});
      return;
    }
    const totalCreditsFuture = compCred + nextCred;
    const requiredGPA = ((tarCG * totalCreditsFuture) - (curCG * compCred)) / nextCred;

    if (requiredGPA > 10) {
      const maxPossible = ((curCG * compCred + nextCred * 10) / totalCreditsFuture).toFixed(2);
      setPredictionResult({msg: `Maximum possible CGPA you can reach is ${maxPossible}.`, neededGPA: null});
    } else if (requiredGPA < 0) {
      setPredictionResult({msg: `Required GPA is 0.00. You are already on track!`, neededGPA: 0});
    } else {
      setPredictionResult({msg: `Target Calculation Successful!`, neededGPA: requiredGPA});
    }
  };

  const addStrategySubject = () => {
    setStrategySubjects([...strategySubjects, { id: Date.now().toString(), credits: 4 }]);
  };
  const removeStrategySubject = (id: string) => setStrategySubjects(strategySubjects.filter(s => s.id !== id));
  const updateStrategySubject = (id: string, credits: number) => {
    setStrategySubjects(strategySubjects.map(s => s.id === id ? { ...s, credits } : s));
  };

  const generateStrategies = () => {
    const target = parseFloat(targetStrategyGPA);
    if (isNaN(target) || target < 0 || target > 10) {
      setStrategyError("Please enter a valid target GPA.");
      return;
    }
    setStrategyError('');
    
    const calculatedCredits = strategySubjects.reduce((sum, s) => sum + s.credits, 0);
    const requiredPoints = target * calculatedCredits;
    const grades = ['S', 'A', 'B', 'C', 'D', 'E'];
    let validCombos: { combo: string[], distance: number }[] = [];

    const findCombos = (index: number, currentPoints: number, currentGrades: string[]) => {
      if (validCombos.length >= 25) return;
      if (index === strategySubjects.length) {
        if (currentPoints >= requiredPoints) {
          validCombos.push({ combo: [...currentGrades], distance: currentPoints - requiredPoints });
        }
        return;
      }
      for (let g of grades) {
        currentGrades.push(g);
        findCombos(index + 1, currentPoints + (strategySubjects[index].credits * GRADE_POINTS[g]), currentGrades);
        currentGrades.pop();
      }
    };

    findCombos(0, 0, []);
    validCombos.sort((a, b) => a.distance - b.distance);
    
    const uniqueCombos = Array.from(new Set(validCombos.map(v => JSON.stringify(v.combo))))
      .slice(0, 5)
      .map(s => JSON.parse(s) as string[]);

    if (uniqueCombos.length === 0) {
      setStrategies([["Combination range too narrow."]]);
    } else {
      setStrategies(uniqueCombos);
    }
  };

  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTipText.trim()) return;
    const incomingTip: UserSuggestion = {
      id: Date.now().toString(),
      name: newAuthor,
      tip: newTipText,
      time: 'Just now'
    };
    setUserSuggestions([incomingTip, ...userSuggestions]);
    setNewAuthor('');
    setNewTipText('');
  };

  if (screen === 'welcome') {
    return (
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-tr from-pink-100 via-purple-50 to-purple-100 p-6">
        <div className="w-full h-full max-w-5xl max-h-[680px] rounded-[40px] shadow-2xl relative overflow-hidden border-8 border-white bg-white group transition-all duration-300 hover:shadow-purple-200/80">
          <img 
            src="/welcome-cat.png" 
            alt="Welcome to PawGPA" 
            className="w-full h-full object-cover select-none pointer-events-none"
          />
          <div className="absolute inset-x-0 bottom-[12%] flex justify-center">
            <button 
              onClick={() => setScreen('dashboard')}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xl font-black px-16 py-5 rounded-full shadow-2xl shadow-pink-400 hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider flex items-center gap-3 border-2 border-white"
            >
              Let's Begin 🐾 <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-pink-50/60 via-purple-50/40 to-purple-100/30 py-12 px-6 selection:bg-pink-200">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-10">
          <button 
            onClick={() => setScreen('welcome')} 
            className="bg-white px-5 py-3 rounded-2xl shadow-md border border-purple-100 text-purple-600 hover:bg-purple-50 transition active:scale-95 font-extrabold flex items-center gap-2 text-sm"
          >
            <Home size={18} /> Exit Dashboard
          </button>
          <div className="bg-white p-1.5 rounded-3xl border-2 border-purple-100/80 shadow-md flex flex-wrap gap-1">
            <button onClick={() => setActiveTab('sem')} className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${activeTab === 'sem' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-purple-600'}`}>🐾 Sem GPA</button>
            <button onClick={() => setActiveTab('target')} className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${activeTab === 'target' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:text-pink-600'}`}>🎯 Predictor</button>
            <button onClick={() => setActiveTab('strategy')} className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${activeTab === 'strategy' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:text-amber-600'}`}>💡 Grade Strategy</button>
            <button onClick={() => setActiveTab('suggestions')} className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${activeTab === 'suggestions' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-emerald-600'}`}>💬 Study Corner</button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border-4 border-purple-100/50 shadow-2xl p-8 md:p-12 min-h-[580px] flex flex-col justify-between transition-all duration-300">
          
          {/* TAB 1: CALC */}
          {activeTab === 'sem' && (
            <div className="w-full flex flex-col justify-between h-full flex-1">
              <div>
                <h2 className="text-3xl font-black text-purple-700 mb-2 flex items-center gap-3"><GraduationCap size={32} className="text-purple-500" /> Semester GPA Calculator</h2>
                <p className="text-xs text-gray-400 font-bold mb-8 pl-1">Add your semester subjects with respective course credits to evaluate your scores.</p>
                
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 mb-6">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="flex gap-4 items-center bg-purple-50/40 p-3 rounded-2xl border border-purple-100/60 transition hover:border-purple-200">
                      <input type="text" value={sub.name} onChange={(e) => updateSubject(sub.id, 'name', e.target.value)} className="w-1/2 p-3 rounded-xl border-2 border-purple-200/80 bg-white text-sm font-bold text-gray-700 focus:outline-none focus:border-purple-500" />
                      <select value={sub.credits} onChange={(e) => updateSubject(sub.id, 'credits', parseInt(e.target.value))} className="w-1/5 p-3 rounded-xl border-2 border-purple-200/80 bg-white text-sm font-black text-gray-700 text-center">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c} Cr</option>)}</select>
                      <select value={sub.grade} onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)} className="w-1/5 p-3 rounded-xl border-2 border-purple-200/80 bg-white text-sm font-black text-purple-700 text-center">{Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}</select>
                      <button onClick={() => removeSubject(sub.id)} className="text-red-400 hover:text-red-500 p-2 transition hover:scale-110"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex gap-4 mb-6">
                  <button onClick={addSubject} className="flex-1 bg-purple-50 border-2 border-purple-200 text-purple-700 py-4 rounded-2xl font-black text-sm hover:bg-purple-100 transition shadow-sm">+ Add Subject Row</button>
                  <button onClick={calculateGPA} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-purple-700 transition tracking-wide">Calculate GPA</button>
                </div>
                
                {calculatedGPA === null ? (
                  <div className="border-2 border-dashed border-purple-100 rounded-3xl p-8 text-center text-gray-400 text-xs font-bold bg-gray-50/30">
                    Click "Calculate GPA" to compile your current semester grades scorecard.
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 text-center border-2 border-emerald-100 shadow-md">
                    <p className="text-[11px] text-emerald-800 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1"><Award size={14}/> Final Semester Score</p>
                    <p className="text-5xl font-black text-emerald-600 my-2">{calculatedGPA}</p>
                    <p className="text-xs text-amber-800 font-black bg-white px-4 py-1.5 rounded-full inline-block border border-amber-200 shadow-sm">
                      🐱 {calculatedGPA >= 9 ? "Status: Certified Dean's Cat!" : "Status: Stellar effort, human pal!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PREDICTOR */}
          {activeTab === 'target' && (
            <div className="w-full flex flex-col justify-between h-full flex-1">
              <div>
                <h2 className="text-3xl font-black text-pink-700 mb-2 flex items-center gap-3"><Target size={32} className="text-pink-500" /> Target CGPA Predictor</h2>
                <p className="text-xs text-gray-400 font-bold mb-8 pl-1">Input details below to find exactly what GPA you need in upcoming examinations.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-1"><label className="text-xs font-black text-gray-500 block">Current Cumulative CGPA</label><input type="number" step="0.01" value={currentCGPA} onChange={e => setCurrentCGPA(e.target.value)} className="w-full p-3.5 text-sm font-bold rounded-xl border-2 border-pink-200 bg-white focus:outline-none focus:border-pink-500" placeholder="e.g. 8.42" /></div>
                  <div className="space-y-1"><label className="text-xs font-black text-gray-500 block">Total Completed Credits</label><input type="number" value={completedCredits} onChange={e => setCompletedCredits(e.target.value)} className="w-full p-3.5 text-sm font-bold rounded-xl border-2 border-pink-200 bg-white focus:outline-none focus:border-pink-500" placeholder="e.g. 92" /></div>
                  <div className="space-y-1"><label className="text-xs font-black text-gray-500 block">Next Semester Value Credits</label><input type="number" value={nextSemCredits} onChange={e => setNextSemCredits(e.target.value)} className="w-full p-3.5 text-sm font-bold rounded-xl border-2 border-pink-200 bg-white focus:outline-none focus:border-pink-500" placeholder="e.g. 21" /></div>
                  <div className="space-y-1"><label className="text-xs font-black text-gray-500 block">Desired CGPA Target Milestone</label><input type="number" step="0.01" value={targetCGPA} onChange={e => setTargetCGPA(e.target.value)} className="w-full p-3.5 text-sm font-bold rounded-xl border-2 border-pink-200 bg-white focus:outline-none focus:border-pink-500" placeholder="e.g. 8.75" /></div>
                </div>
              </div>
              
              <div className="mt-4">
                <button onClick={predictTargetGPA} className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-pink-600 transition flex items-center justify-center gap-2 tracking-wide"><Sparkles size={16} /> Run Prediction Model</button>
                
                {!predictionResult.msg ? (
                  <div className="mt-6 border-2 border-dashed border-pink-100 rounded-3xl p-6 text-center text-gray-400 text-xs font-bold bg-gray-50/30">
                    Submit parameters above to calculate mandatory study targets.
                  </div>
                ) : (
                  <div className="mt-6 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200/60 p-6 rounded-3xl shadow-sm text-center">
                    <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Prediction Matrix Report</span>
                    <p className="text-gray-700 font-bold text-sm mt-3 mb-4">{predictionResult.msg}</p>
                    
                    {predictionResult.neededGPA !== null && predictionResult.neededGPA > 0 && (
                      <div className="bg-white p-4 rounded-2xl border border-pink-200 max-w-sm mx-auto shadow-inner">
                        <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Required Semester GPA</p>
                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 my-1">{predictionResult.neededGPA.toFixed(2)}</p>
                        <button 
                          onClick={() => { setTargetStrategyGPA(predictionResult.neededGPA!.toFixed(2)); setActiveTab('strategy'); }} 
                          className="mt-3 w-full text-[11px] bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black px-4 py-2 rounded-xl hover:shadow-md transition duration-200"
                        >
                          Auto-Map Target Combination Grades ⚡
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="w-full flex flex-col justify-between h-full flex-1">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-amber-700 flex items-center gap-3"><Compass size={32} className="text-amber-500" /> Grade Strategy Planner</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">Configure individual item workloads to evaluate possible optimal grade splits.</p>
                  </div>
                  <div className="w-full sm:w-1/3 flex items-center gap-2 bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <span className="text-xs font-black text-amber-800 whitespace-nowrap pl-1">Target GPA:</span>
                    <input type="number" step="0.01" value={targetStrategyGPA} onChange={e => setTargetStrategyGPA(e.target.value)} className="w-full p-2 text-sm font-black text-center rounded-lg border border-amber-300 bg-white text-amber-950 focus:outline-none" placeholder="Target" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 bg-amber-50/10 p-3 rounded-2xl border-2 border-amber-100/60">
                    {strategySubjects.map((s, idx) => (
                      <div key={s.id} className="flex gap-4 items-center bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-sm">
                        <span className="text-xs font-black text-gray-400 pl-2">Subject {idx + 1}</span>
                        <select value={s.credits} onChange={(e) => updateStrategySubject(s.id, parseInt(e.target.value))} className="ml-auto w-1/2 p-2 text-xs font-black text-center bg-amber-50 rounded-lg text-amber-900 focus:outline-none">{CREDIT_OPTIONS.map(c => <option key={c} value={c}>{c} Credits</option>)}</select>
                        <button onClick={() => removeStrategySubject(s.id)} className="text-amber-400 hover:text-red-500 p-2 transition"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button onClick={addStrategySubject} className="w-full bg-white text-amber-700 border-2 border-dashed border-amber-200 py-3 rounded-xl font-black text-xs hover:bg-amber-50 transition">+ Insert Course Subject</button>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-4 rounded-2xl border-2 border-amber-200/70 max-h-[260px] overflow-y-auto flex flex-col justify-center">
                    {strategyError && <p className="text-xs text-red-500 font-bold text-center">{strategyError}</p>}
                    {strategies.length > 0 ? (
                      <div className="space-y-3 w-full">
                        <h4 className="text-xs font-black text-amber-900 tracking-wider uppercase mb-1 flex items-center gap-1">🔥 Top Easiest Combinations:</h4>
                        {strategies.map((combo, cIdx) => (
                          <div key={cIdx} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm text-xs font-black text-gray-700 flex flex-wrap gap-1.5 items-center">
                            <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">Option {cIdx + 1}</span>
                            {combo.map((g, gIdx) => (
                              <span key={gIdx} className={`px-2 py-0.5 rounded-md text-[10px] ${g === 'S' || g === 'A' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                                S{gIdx+1}: <span className="font-extrabold">{g}</span>
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 text-xs font-bold py-12">
                        Set a target & click calculate below to construct pathways.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6"><button onClick={generateStrategies} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-amber-600 transition tracking-wide">Generate Strategy Options Matrix</button></div>
            </div>
          )}

          {/* TAB 4: STUDY CORNER */}
          {activeTab === 'suggestions' && (
            <div className="w-full flex flex-col justify-between h-full flex-1">
              <div>
                <h2 className="text-3xl font-black text-emerald-700 mb-2 flex items-center gap-3"><MessageSquare size={32} className="text-emerald-500" /> Study Corner</h2>
                <p className="text-xs text-gray-400 font-bold mb-6 pl-1">Get custom study tips or post peer advice to build efficient prep habits.</p>
                
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-200 p-5 rounded-2xl mb-8">
                  <h4 className="text-xs font-black text-emerald-800 tracking-wider uppercase mb-3 flex items-center gap-1.5"><Lightbulb size={14}/> Verified Quick Fix Concentration Hacks:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PAW_STUDY_TIPS.map((tip, idx) => (
                      <div key={idx} className="bg-white/90 p-3 rounded-xl border border-emerald-100 text-xs font-bold text-gray-600 shadow-sm leading-relaxed">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-gray-50/60 p-4 rounded-2xl border border-gray-200/70 h-fit">
                    <h4 className="text-xs font-black text-gray-700 tracking-wider uppercase mb-3">Leave a Suggestion:</h4>
                    <form onSubmit={handleAddSuggestion} className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1">Your Name</label>
                        <input type="text" value={newAuthor} onChange={e => setNewAuthor(e.target.value)} className="w-full p-2.5 text-xs font-bold rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Saumya" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 block mb-1">Best Study Strategy / Advice</label>
                        <textarea rows={3} value={newTipText} onChange={e => setNewTipText(e.target.value)} className="w-full p-2.5 text-xs font-bold rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:border-emerald-500 resize-none" placeholder="Drink regular water for clarity..." />
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md">Post Secret Tip 🐾</button>
                    </form>
                  </div>

                  <div className="md:col-span-2 space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase pl-1">Student Suggestions Board:</h4>
                    {userSuggestions.map((item) => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between transition hover:border-emerald-100/80">
                        <p className="text-xs font-bold text-gray-700 italic">"{item.tip}"</p>
                        <div className="flex justify-between items-center mt-2 border-t border-gray-50 pt-2 text-[10px] font-black text-emerald-600">
                          <span>By {item.name} ✨</span>
                          <span className="text-gray-400 font-normal">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-50 pt-4 text-center text-[11px] font-bold text-emerald-600/70">
                Success is built through daily compounding habits.
              </div>
            </div>
          )}

        </div>

        <footer className="text-center mt-10 text-xs font-black text-purple-400 tracking-wide flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-purple-100/40 pt-6">
          <div>PawGPA Studio</div>
          <div className="text-purple-500">Crafted with 💖 by Saumya Dwivedi</div>
          <div className="flex gap-4 font-bold text-purple-400">
            <a 
              href="https://github.com/dwivedisaumya" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-600 transition underline decoration-2 decoration-pink-400"
            >
              GitHub 🐾
            </a>
            <span>•</span>
            <a 
              href="https://www.linkedin.com/in/saumya-dwivedi-029472324/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-purple-600 transition underline decoration-2 decoration-purple-500"
            >
              LinkedIn 🎯
            </a>
          </div>
        </footer>
        
      </div>
    </div>
  );
}
