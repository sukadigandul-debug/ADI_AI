import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import { 
  BookOpen, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  Home, 
  ChevronRight, 
  Menu, 
  X,
  GraduationCap,
  Leaf,
  Palette,
  Calculator,
  Languages,
  Book,
  User,
  School,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Plus,
  Trash2,
  Key,
  Settings,
  ShieldCheck,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { generateMateri, generateModulAjar, generateAsesmen } from './services/gemini';

// --- Constants ---
const SUBJECTS = [
  "Pendidikan Agama",
  "PPKn",
  "Bahasa Indonesia",
  "Matematika",
  "Seni Budaya",
  "PLH",
  "Bahasa Inggris"
];

const RELIGIONS = [
  "Islam",
  "Kristen Protestan",
  "Katolik",
  "Hindu",
  "Buddha",
  "Khonghucu"
];

const PROFIL_LULUSAN = [
  "Keimanan dan Ketagwaan",
  "Kewargaan",
  "Penalaran Kritis",
  "Kreatifitas",
  "Kolaborasi",
  "Kemandirian",
  "Kesehatan",
  "Komunikasi"
];

const TAXONOMY_LEVELS = ["C1 - Mengingat", "C2 - Memahami", "C3 - Menerapkan", "C4 - Menganalisis", "C5 - Mengevaluasi", "C6 - Mencipta"];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines
      setHasApiKey(true);
    }
  };

  // --- Materi State ---
  const [materiSubject, setMateriSubject] = useState(SUBJECTS[0]);
  const [materiReligion, setMateriReligion] = useState(RELIGIONS[0]);
  const [materiChapter, setMateriChapter] = useState('');
  const [materiContent, setMateriContent] = useState('');
  const [isMateriLoading, setIsMateriLoading] = useState(false);

  // --- Administrasi State ---
  const [adminIdentitas, setAdminIdentitas] = useState({
    nama: '',
    sekolah: '',
    fase: 'Fase A / Kelas 1',
    mapel: SUBJECTS[0],
    waktu: '2 x 35 Menit',
    profil: [] as string[]
  });
  const [adminCP, setAdminCP] = useState('');
  const [adminATP, setAdminATP] = useState('');
  const [adminModul, setAdminModul] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // --- Asesmen State ---
  const [asesmenConfig, setAsesmenConfig] = useState({
    subject: SUBJECTS[0],
    religion: RELIGIONS[0],
    type: 'Formatif',
    level: TAXONOMY_LEVELS[1],
    questionType: 'Pilihan Ganda',
    count: 10,
    optionsCount: 4,
    difficulty: 'Sedang'
  });
  const [asesmenQuestions, setAsesmenQuestions] = useState<any[]>([]);
  const [isAsesmenLoading, setIsAsesmenLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [studentName, setStudentName] = useState('');
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // --- Nilai State ---
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const savedRecords = localStorage.getItem('adiai_records');
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  }, []);

  const saveRecord = (record: any) => {
    const newRecords = [record, ...records];
    setRecords(newRecords);
    localStorage.setItem('adiai_records', JSON.stringify(newRecords));
  };

  const handleGenerateMateri = async () => {
    if (!materiChapter) return;
    setIsMateriLoading(true);
    try {
      const content = await generateMateri(materiSubject, materiChapter, materiReligion);
      setMateriContent(content || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsMateriLoading(false);
    }
  };

  const handleGenerateModul = async () => {
    if (!adminCP || !adminATP) return;
    setIsAdminLoading(true);
    try {
      const content = await generateModulAjar(adminIdentitas, adminCP, adminATP);
      setAdminModul(content || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleGenerateAsesmen = async () => {
    setIsAsesmenLoading(true);
    setIsQuizSubmitted(false);
    setUserAnswers({});
    try {
      const data = await generateAsesmen(asesmenConfig);
      setAsesmenQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAsesmenLoading(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    asesmenQuestions.forEach(q => {
      if (userAnswers[q.id] === q.answer) correct++;
    });
    return Math.round((correct / asesmenQuestions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    if (!studentName) {
      alert("Masukkan nama siswa terlebih dahulu!");
      return;
    }
    const score = calculateScore();
    const record = {
      id: Date.now(),
      name: studentName,
      subject: asesmenConfig.subject,
      type: asesmenConfig.type,
      score,
      date: new Date().toLocaleString()
    };
    saveRecord(record);
    setIsQuizSubmitted(true);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">adiai</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={Home} label="Beranda" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={BookOpen} label="Materi Pelajaran" active={activeTab === 'materi'} onClick={() => setActiveTab('materi')} />
          <SidebarItem icon={FileText} label="Administrasi Guru" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          <SidebarItem icon={ClipboardCheck} label="Asesmen" active={activeTab === 'asesmen'} onClick={() => setActiveTab('asesmen')} />
          <SidebarItem icon={BarChart3} label="Nilai Siswa" active={activeTab === 'nilai'} onClick={() => setActiveTab('nilai')} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <button 
            onClick={handleOpenKeyDialog}
            className={cn(
              "flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold",
              hasApiKey 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
            )}
          >
            {hasApiKey ? <ShieldCheck size={18} /> : <Key size={18} />}
            <span>{hasApiKey ? "API Key Aktif" : "Set API Key"}</span>
          </button>
          
          <div className="bg-emerald-50 p-4 rounded-xl">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm text-emerald-900 font-medium">Profesor Aplikasi Aktif</p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Administrator</p>
              <p className="text-xs text-slate-500">Guru Profesional</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/teacher/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1920" 
                    alt="Education" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-transparent flex flex-col justify-center p-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                      Selamat Datang di <span className="text-emerald-400">adiai</span>
                    </h2>
                    <p className="text-emerald-50 text-lg max-w-md">
                      Asisten Digital Administrasi Guru Indonesia berbasis AI. 
                      Cerdas, Cepat, dan Komprehensif.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: BookOpen, title: "Materi", desc: "Penjabaran materi lengkap dengan AI", color: "bg-blue-500", tab: 'materi' },
                    { icon: FileText, title: "Administrasi", desc: "CP, TP, dan Modul Ajar otomatis", color: "bg-emerald-500", tab: 'admin' },
                    { icon: ClipboardCheck, title: "Asesmen", desc: "Generator soal berbasis taksonomi", color: "bg-amber-500", tab: 'asesmen' },
                    { icon: BarChart3, title: "Nilai", desc: "Rekapitulasi hasil belajar siswa", color: "bg-rose-500", tab: 'nilai' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(item.tab)}
                      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform", item.color)}>
                        <item.icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'materi' && (
              <motion.div
                key="materi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Mata Pelajaran</label>
                      <select 
                        value={materiSubject}
                        onChange={(e) => setMateriSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {materiSubject === "Pendidikan Agama" && (
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Agama</label>
                        <select 
                          value={materiReligion}
                          onChange={(e) => setMateriReligion(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bab / Topik</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Bilangan Bulat"
                        value={materiChapter}
                        onChange={(e) => setMateriChapter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleGenerateMateri}
                        disabled={isMateriLoading || !materiChapter}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isMateriLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        Generate
                      </button>
                    </div>
                  </div>

                  {materiContent ? (
                    <div className="prose prose-slate max-w-none bg-slate-50 p-8 rounded-2xl border border-slate-200">
                      <Markdown>{materiContent}</Markdown>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p>Pilih mata pelajaran dan bab untuk melihat materi.</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <User size={20} className="text-emerald-600" />
                        Identitas Modul
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Penyusun</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={adminIdentitas.nama}
                            onChange={(e) => setAdminIdentitas({...adminIdentitas, nama: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Satuan Pendidikan</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={adminIdentitas.sekolah}
                            onChange={(e) => setAdminIdentitas({...adminIdentitas, sekolah: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fase/Kelas</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={adminIdentitas.fase}
                              onChange={(e) => setAdminIdentitas({...adminIdentitas, fase: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alokasi Waktu</label>
                            <input 
                              type="text" 
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                              value={adminIdentitas.waktu}
                              onChange={(e) => setAdminIdentitas({...adminIdentitas, waktu: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mata Pelajaran</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            value={adminIdentitas.mapel}
                            onChange={(e) => setAdminIdentitas({...adminIdentitas, mapel: e.target.value})}
                          >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-emerald-600" />
                        Profil Lulusan
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {PROFIL_LULUSAN.map(p => (
                          <label key={p} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                              checked={adminIdentitas.profil.includes(p)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAdminIdentitas({...adminIdentitas, profil: [...adminIdentitas.profil, p]});
                                } else {
                                  setAdminIdentitas({...adminIdentitas, profil: adminIdentitas.profil.filter(item => item !== p)});
                                }
                              }}
                            />
                            <span className="text-sm text-slate-700">{p}</span>
                          </label>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                      <h3 className="font-bold text-lg mb-4">Input CP & ATP</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Capaian Pembelajaran (CP)</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Masukkan CP di sini..."
                            value={adminCP}
                            onChange={(e) => setAdminCP(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Alur Tujuan Pembelajaran (ATP)</label>
                          <textarea 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Masukkan ATP di sini..."
                            value={adminATP}
                            onChange={(e) => setAdminATP(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={handleGenerateModul}
                          disabled={isAdminLoading || !adminCP || !adminATP}
                          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isAdminLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                          Generate Modul Ajar Otomatis
                        </button>
                      </div>
                    </Card>

                    {adminModul && (
                      <Card className="p-8 bg-white border-2 border-emerald-100">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-emerald-900">Modul Ajar Tergenerasi</h3>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                            <Download size={24} />
                          </button>
                        </div>
                        <div className="prose prose-emerald max-w-none">
                          <Markdown>{adminModul}</Markdown>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'asesmen' && (
              <motion.div
                key="asesmen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {!asesmenQuestions.length ? (
                  <Card className="p-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">Konfigurasi Asesmen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Mata Pelajaran</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={asesmenConfig.subject}
                            onChange={(e) => setAsesmenConfig({...asesmenConfig, subject: e.target.value})}
                          >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        {asesmenConfig.subject === "Pendidikan Agama" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Agama</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                              value={asesmenConfig.religion}
                              onChange={(e) => setAsesmenConfig({...asesmenConfig, religion: e.target.value})}
                            >
                              {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Asesmen</label>
                          <div className="flex gap-2">
                            {['Formatif', 'Sumatif'].map(t => (
                              <button 
                                key={t}
                                onClick={() => setAsesmenConfig({...asesmenConfig, type: t})}
                                className={cn(
                                  "flex-1 py-2 rounded-lg font-medium border transition-all",
                                  asesmenConfig.type === t ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Level Taksonomi</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={asesmenConfig.level}
                            onChange={(e) => setAsesmenConfig({...asesmenConfig, level: e.target.value})}
                          >
                            {TAXONOMY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Bentuk Soal</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={asesmenConfig.questionType}
                            onChange={(e) => setAsesmenConfig({...asesmenConfig, questionType: e.target.value})}
                          >
                            <option value="Pilihan Ganda">Pilihan Ganda</option>
                            <option value="Menjodohkan">Menjodohkan</option>
                            <option value="Isian">Isian</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Soal</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={asesmenConfig.count}
                            onChange={(e) => setAsesmenConfig({...asesmenConfig, count: parseInt(e.target.value)})}
                          >
                            {[10, 15, 20, 25].map(c => <option key={c} value={c}>{c} Soal</option>)}
                          </select>
                        </div>
                        {asesmenConfig.questionType === "Pilihan Ganda" && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Opsi Jawaban</label>
                            <select 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                              value={asesmenConfig.optionsCount}
                              onChange={(e) => setAsesmenConfig({...asesmenConfig, optionsCount: parseInt(e.target.value)})}
                            >
                              <option value={3}>3 Jawaban (A, B, C)</option>
                              <option value={4}>4 Jawaban (A, B, C, D)</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Tingkat Kesulitan</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2"
                            value={asesmenConfig.difficulty}
                            onChange={(e) => setAsesmenConfig({...asesmenConfig, difficulty: e.target.value})}
                          >
                            <option value="Mudah">Mudah</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Sulit">Sulit</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateAsesmen}
                      disabled={isAsesmenLoading}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
                    >
                      {isAsesmenLoading ? <Loader2 className="animate-spin" size={24} /> : <ClipboardCheck size={24} />}
                      Buat Soal Sekarang
                    </button>
                  </Card>
                ) : (
                  <div className="space-y-6 pb-20">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 sticky top-0 z-10 shadow-sm">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setAsesmenQuestions([])}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                        >
                          <X size={20} />
                        </button>
                        <div>
                          <h3 className="font-bold text-slate-900">{asesmenConfig.subject} - {asesmenConfig.type}</h3>
                          <p className="text-xs text-slate-500">{asesmenQuestions.length} Soal • {asesmenConfig.level}</p>
                        </div>
                      </div>
                      {!isQuizSubmitted && (
                        <div className="flex items-center gap-3">
                          <input 
                            type="text" 
                            placeholder="Nama Siswa"
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                          />
                          <button 
                            onClick={handleSubmitQuiz}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Kirim Jawaban
                          </button>
                        </div>
                      )}
                    </div>

                    {isQuizSubmitted && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-emerald-600 text-white p-8 rounded-3xl text-center shadow-xl"
                      >
                        <h4 className="text-xl font-medium mb-2">Hasil Asesmen</h4>
                        <div className="text-6xl font-black mb-4">{calculateScore()}</div>
                        <p className="opacity-90">Bagus sekali, {studentName}! Teruslah belajar.</p>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      {asesmenQuestions.map((q, idx) => (
                        <Card key={q.id} className={cn("p-6", isQuizSubmitted && (userAnswers[q.id] === q.answer ? "border-emerald-500 bg-emerald-50" : "border-rose-500 bg-rose-50"))}>
                          <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{idx + 1}</span>
                            <div className="flex-1">
                              <p className="text-lg font-medium text-slate-800 mb-4">{q.question}</p>
                              
                              {asesmenConfig.questionType === "Pilihan Ganda" && q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {q.options.map((opt: string) => (
                                    <button
                                      key={opt}
                                      disabled={isQuizSubmitted}
                                      onClick={() => setUserAnswers({...userAnswers, [q.id]: opt})}
                                      className={cn(
                                        "p-3 rounded-xl border text-left transition-all",
                                        userAnswers[q.id] === opt 
                                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {(asesmenConfig.questionType === "Isian" || asesmenConfig.questionType === "Menjodohkan") && (
                                <div className="space-y-4">
                                  {asesmenConfig.questionType === "Menjodohkan" && q.matchPairs && (
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                                      <p className="text-sm font-bold text-amber-800 mb-2">Pasangkan item berikut:</p>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          {q.matchPairs.map((p: any, i: number) => <div key={i} className="text-sm py-1">• {p.left}</div>)}
                                        </div>
                                        <div>
                                          {q.matchPairs.map((p: any, i: number) => <div key={i} className="text-sm py-1">• {p.right}</div>)}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <input 
                                    type="text"
                                    disabled={isQuizSubmitted}
                                    placeholder={asesmenConfig.questionType === "Menjodohkan" ? "Ketik pasangan jawaban (misal: A-1, B-2)..." : "Ketik jawaban di sini..."}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={userAnswers[q.id] || ''}
                                    onChange={(e) => setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                                  />
                                </div>
                              )}

                              {isQuizSubmitted && (
                                <div className="mt-4 flex items-center gap-2 text-sm font-bold">
                                  {userAnswers[q.id] === q.answer ? (
                                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16} /> Benar</span>
                                  ) : (
                                    <span className="text-rose-600 flex items-center gap-1">
                                      <AlertCircle size={16} /> Salah. Jawaban: {q.answer}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'nilai' && (
              <motion.div
                key="nilai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">Rekapitulasi Nilai Siswa</h3>
                  <button 
                    onClick={() => {
                      if(confirm("Hapus semua data?")) {
                        setRecords([]);
                        localStorage.removeItem('adiai_records');
                      }
                    }}
                    className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                    Hapus Semua
                  </button>
                </div>

                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Skor</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.length > 0 ? records.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                            <td className="px-6 py-4 text-slate-600">{r.subject}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-xs font-bold",
                                r.type === 'Formatif' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                              )}>
                                {r.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "text-lg font-bold",
                                r.score >= 75 ? "text-emerald-600" : "text-rose-600"
                              )}>
                                {r.score}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{r.date}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                              <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
                              <p>Belum ada data nilai yang terekam.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
