import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Smile,
  Heart,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { HealthTopic } from '../types';

export const HealthKnowledgeSection: React.FC = () => {
  const { topics, addTopic, updateTopic, deleteTopic } = useInfirmary();

  const [selectedTopic, setSelectedTopic] = useState<HealthTopic>(topics[0] || {} as any);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<HealthTopic | null>(null);

  // Form states for adding topic
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('💡');
  const [newCategory, setNewCategory] = useState('สุขอนามัย');
  const [newTargetAge, setNewTargetAge] = useState('ป.1 - ป.6');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFunFact, setNewFunFact] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTips, setNewTips] = useState('');

  // Mini Health Quiz for Elementary Students
  const quizQuestions = [
    {
      question: 'สูตรลับการแปรงฟัน 2-2-2 ข้อใดถูกต้องที่สุด?',
      options: [
        'แปรงฟันวันละ 2 ครั้ง, แปรงนาน 2 นาที, งดกินอาหาร 2 ชั่วโมงหลังแปรง',
        'แปรงฟันวันละ 2 ครั้ง, ใช้ยาสีฟัน 2 หลอด, บ้วนน้ำ 2 แก้ว',
        'แปรงฟันวันละ 2 นาที, กินขนม 2 ห่อ, นอน 2 ทุ่ม',
      ],
      correctAnswer: 0,
      explanation: 'เก่งมาก! สูตร 2-2-2 ช่วยให้ฟลูออไรด์ปกป้องฟัน ป้องกันฟันผุได้อย่างมีประสิทธิภาพที่สุดจ้า',
    },
    {
      question: 'เมื่อเลือดกำเดาไหล นักเรียนควรทำท่าทางอย่างไร?',
      options: [
        'เงยหน้าขึ้นสูงๆ แล้วเอาสำลีอุดแน่นๆ',
        'นั่งก้มหน้าเล็กน้อย บีบปีกจมูก 5-10 นาที หายใจทางปาก',
        'นอนราบกับพื้นแล้วกลั้นหายใจ',
      ],
      correctAnswer: 1,
      explanation: 'ถูกต้อง! ห้ามเงยหน้าเพราะเลือดอาจไหลย้อนลงคอและสำลักได้ ให้ก้มหน้าเล็กน้อยแล้วบีบปีกจมูกนะ',
    },
    {
      question: 'การล้างมือด้วยสบู่ ควรล้างนานอย่างน้อยกี่วินาทีเพื่อฆ่าเชื้อโรค?',
      options: [
        '5 วินาที',
        '20 วินาที (ร้องเพลงช้างจบ 2 รอบ)',
        '1 นาทีเต็มโดยไม่ต้องใช้สบู่',
      ],
      correctAnswer: 1,
      explanation: 'เยี่ยมเลย! ล้างมือ 20 วินาที ด้วย 7 ขั้นตอน เชื้อโรคที่ติดอยู่ตามซอกนิ้วจะหลุดออกหมดจ้า',
    },
    {
      question: 'เด็กวัยประถมควรนอนหลับวันละกี่ชั่วโมงเพื่อให้ร่างกายเจริญเติบโตเต็มที่?',
      options: [
        '4-5 ชั่วโมง',
        '6-7 ชั่วโมง',
        '9-11 ชั่วโมง',
      ],
      correctAnswer: 2,
      explanation: 'ยอดเยี่ยมมาก! การนอน 9-11 ชั่วโมงช่วยให้ร่างกายหลั่งโกรทฮอร์โมน ทำให้สูงขึ้นและสมองสดใส',
    },
  ];

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSelectAnswer = (idx: number) => {
    if (showAnswer) return;
    setSelectedAnswer(idx);
    setShowAnswer(true);
    if (idx === quizQuestions[currentQuizIndex].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const topic: HealthTopic = {
      id: `topic-${Date.now()}`,
      title: newTitle.trim(),
      emoji: newEmoji.trim() || '💡',
      category: newCategory.trim() || 'สุขภาพ',
      targetAge: newTargetAge,
      shortDesc: newShortDesc.trim() || newTitle.trim(),
      funFact: newFunFact.trim() || 'การดูแลสุขภาพเป็นประจำทำให้ร่างกายแข็งแรง!',
      content: newContent.split('\n').map((s) => s.trim()).filter(Boolean),
      tips: newTips.split('\n').map((s) => s.trim()).filter(Boolean),
      doAndDont: {
        do: ['ปฏิบัติตามคำแนะนำของคุณครู', 'ดื่มน้ำสะอาดและพักผ่อนให้เพียงพอ'],
        dont: ['ละเลยสุขอนามัยส่วนตัว', 'ทำกิจกรรมที่เสี่ยงอันตราย'],
      },
    };

    addTopic(topic);
    setSelectedTopic(topic);
    setIsAddTopicOpen(false);
    setNewTitle('');
    setNewShortDesc('');
    setNewFunFact('');
    setNewContent('');
    setNewTips('');
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic) return;
    updateTopic(editingTopic);
    setSelectedTopic(editingTopic);
    setEditingTopic(null);
  };

  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleDeleteTopic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (topics.length <= 1) {
      setAlertMsg('ต้องมีหัวข้อความรู้อย่างน้อย 1 หัวข้อครับ');
      return;
    }
    setTopicToDelete(id);
  };

  const confirmDeleteTopic = () => {
    if (topicToDelete) {
      deleteTopic(topicToDelete);
      setSelectedTopic(topics.find((t) => t.id !== topicToDelete) || topics[0]);
      setTopicToDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3.5 py-1 rounded-full">
          KIDS HEALTH LIBRARY
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          คลังความรู้สุขภาพสำหรับนักเรียน
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          อ่านง่าย สนุก ได้สาระ สามารถเพิ่ม แก้ไข และลบหัวข้อความรู้ได้ Real Time ({topics.length} หมวด)
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => {
              setIsQuizOpen(true);
              resetQuiz();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <Award className="w-4 h-4" />
            <span>เล่นเกมตอบคำถามสุขภาพ (ชิงเหรียญรางวัล!)</span>
          </button>

          <button
            onClick={() => setIsAddTopicOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหัวข้อความรู้ใหม่</span>
          </button>
        </div>
      </div>

      {/* Quiz Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-300 relative text-left">
            <button
              onClick={() => setIsQuizOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
            >
              ✕
            </button>

            {!quizFinished ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                    คำถามข้อที่ {currentQuizIndex + 1} / {quizQuestions.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    คะแนน: {score} แต้ม
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {quizQuestions[currentQuizIndex].question}
                </h3>

                <div className="space-y-2.5">
                  {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[currentQuizIndex].correctAnswer;
                    let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                    if (showAnswer) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-100 border-rose-300 text-rose-800';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={showAnswer}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {showAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      คำอธิบาย:
                    </p>
                    <p>{quizQuestions[currentQuizIndex].explanation}</p>
                  </div>
                )}

                {showAnswer && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuiz}
                      className="px-5 py-2.5 rounded-xl bg-[#2A9D8F] text-white font-bold text-xs sm:text-sm hover:bg-[#21867a] flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuizIndex + 1 < quizQuestions.length ? 'ข้อต่อไป' : 'ดูสรุปผลคะแนน'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">🏆</div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  ยินดีด้วย! คุณตอบได้ {score} จาก {quizQuestions.length} คะแนน
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  ได้รับตราสัญลักษณ์{' '}
                  <strong className="text-[#2A9D8F]">"ผู้พิทักษ์สุขภาพน้อย โรงเรียนวัดใหม่อมตรส"</strong>
                </p>

                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>เล่นใหม่อีกครั้ง</span>
                  </button>
                  <button
                    onClick={() => setIsQuizOpen(false)}
                    className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white text-xs font-bold hover:bg-[#21867a]"
                  >
                    กลับสู่คลังความรู้
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid of Health Topics with Edit/Delete */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topics.map((topic) => {
          const isSelected = selectedTopic?.id === topic.id;
          return (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'bg-white border-[#2A9D8F] ring-2 ring-[#2A9D8F]/20 shadow-md font-bold'
                  : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-2xl p-2 rounded-xl bg-[#E8F6F7]">{topic.emoji}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTopic(topic);
                    }}
                    className="p-1 text-slate-400 hover:text-[#2A9D8F] hover:bg-slate-100 rounded-md transition-colors"
                    title="แก้ไขเนื้อหา"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTopic(topic.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="ลบหัวข้อนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm text-slate-900 leading-tight">
                  {topic.title}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-1">{topic.category}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Topic Detailed Reader */}
      {selectedTopic && selectedTopic.title && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl p-3 rounded-2xl bg-[#E8F6F7]">
                {selectedTopic.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedTopic.title}
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#DFF3E4] text-[#1e6f5c]">
                    เหมาะสำหรับ {selectedTopic.targetAge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTopic.shortDesc}</p>
              </div>
            </div>

            <button
              onClick={() => setEditingTopic(selectedTopic)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>แก้ไขเนื้อหานี้</span>
            </button>
          </div>

          {/* Fun Fact Pill */}
          <div className="p-4 rounded-2xl bg-[#FFF4C2]/70 border border-amber-200/80 flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <span className="text-xs font-bold text-amber-900">รู้หรือไม่? (Fun Fact)</span>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed font-medium">
                {selectedTopic.funFact}
              </p>
            </div>
          </div>

          {/* Main Content & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#2A9D8F]" />
                <span>สาระน่ารู้สำหรับเด็ก</span>
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 space-y-2">
                {selectedTopic.content.map((c, i) => (
                  <p key={i} className="leading-relaxed">{c}</p>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ข้อแนะนำในการปฏิบัติ</span>
              </h3>
              <div className="space-y-2">
                {selectedTopic.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#E8F6F7]/60 border border-[#2A9D8F]/15 text-xs text-slate-800 flex items-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Do and Don't */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                ✅ สิ่งที่ควรทำ (DO)
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                {selectedTopic.doAndDont.do.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                ❌ สิ่งที่ไม่ควรทำ (DON'T)
              </span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                {selectedTopic.doAndDont.dont.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add New Topic Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มหัวข้อความรู้สุขภาพใหม่
              </h3>
              <button
                onClick={() => setIsAddTopicOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อหัวข้อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น การดื่มน้ำสะอาด"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อิโมจิ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 💧"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำอธิบายสั้นๆ
                </label>
                <input
                  type="text"
                  placeholder="เช่น ดื่มน้ำวันละ 6-8 แก้ว สดชื่นตลอดวัน"
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เรื่องน่ารู้ (Fun Fact)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ร่างกายคนเรามีน้ำเป็นส่วนประกอบถึง 70%"
                  value={newFunFact}
                  onChange={(e) => setNewFunFact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เนื้อหาสาระ (1 บรรทัดต่อ 1 ข้อ)
                </label>
                <textarea
                  rows={3}
                  placeholder="พิมพ์สาระความรู้สำหรับเด็ก..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เคล็ดลับการปฏิบัติ (1 บรรทัดต่อ 1 ข้อ)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น พกกระติกน้ำมาโรงเรียนทุกวัน"
                  value={newTips}
                  onChange={(e) => setNewTips(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกหัวข้อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขหัวข้อ: {editingTopic.title}
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTopic} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อหัวข้อ</label>
                  <input
                    type="text"
                    required
                    value={editingTopic.title}
                    onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อิโมจิ</label>
                  <input
                    type="text"
                    value={editingTopic.emoji}
                    onChange={(e) => setEditingTopic({ ...editingTopic, emoji: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={editingTopic.shortDesc}
                  onChange={(e) => setEditingTopic({ ...editingTopic, shortDesc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เรื่องน่ารู้ (Fun Fact)</label>
                <input
                  type="text"
                  value={editingTopic.funFact}
                  onChange={(e) => setEditingTopic({ ...editingTopic, funFact: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Topic */}
      {topicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">ยืนยันการลบหัวข้อความรู้</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              คุณต้องการลบหัวข้อความรู้นี้ใช่หรือไม่? ข้อมูลจะถูกลบออกจากระบบทันที
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTopicToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteTopic}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">แจ้งเตือน</h3>
            <p className="text-xs sm:text-sm text-slate-600">{alertMsg}</p>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAlertMsg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2A9D8F] hover:bg-[#21867a]"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
