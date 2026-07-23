'use client';
import { useState, useEffect, useCallback } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { quizApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { LOCAL_QUIZ } from '@/lib/quizData';
import type { QuizQuestion } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Patung KH Zainal Mustofa': '🏛️',
  'Tugu Adipura': '🏆',
  'Situ Gede': '🌊',
  'Alun-Alun Kota Tasikmalaya': '🌳',
  'Kerajinan Tasikmalaya': '🎨',
  'Kuliner Tasikmalaya': '🍜',
  'Sejarah Tasikmalaya': '📜',
  'Geografi Tasikmalaya': '🗺️',
  'Wisata Alam Tasikmalaya': '🌿',
};

type QuizState = 'idle' | 'playing' | 'done';

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    let apiQuestions: QuizQuestion[] = [];
    try {
      apiQuestions = await quizApi.getQuizzes();
    } catch { /* silently fall back to local */ }

    // Merge API questions + LOCAL, dedup by id, shuffle, take 20
    const merged = [...apiQuestions, ...LOCAL_QUIZ];
    const deduped = merged.filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i);
    setQuestions(shuffle(deduped).slice(0, 20));
    setIsLoading(false);
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const startQuiz = () => {
    setCurrent(0);
    setScore(0);
    setCorrect(0);
    setSelected(null);
    setShowAnswer(false);
    setStreak(0);
    setMaxStreak(0);
    setQuizState('playing');
  };

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
  };

  const handleAnswer = async () => {
    if (selected === null) return;
    const q = questions[current];
    const isCorrect = selected === q.answer;
    const newStreak = isCorrect ? streak + 1 : 0;
    const bonusPts = newStreak >= 3 ? 5 : 0; // streak bonus!
    const pts = isCorrect ? 10 + bonusPts : 0;

    setShowAnswer(true);
    setStreak(newStreak);
    if (newStreak > maxStreak) setMaxStreak(newStreak);
    if (isCorrect) {
      setScore(s => s + pts);
      setCorrect(c => c + 1);
    }

    setTimeout(async () => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setSelected(null);
        setShowAnswer(false);
      } else {
        const finalScore = score + pts;
        const user = auth.getUser();
        if (user && finalScore > 0) {
          try {
            const res = await quizApi.submitScore(user.id, finalScore);
            auth.updatePoints(res.total_points);
          } catch { /* silently fail */ }
        }
        setQuizState('done');
      }
    }, 1300);
  };

  const q = questions[current];
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const destIcon = q?.destination ? (CATEGORY_ICONS[q.destination] ?? '❓') : '❓';

  // ── LOADING ──
  if (isLoading) {
    return (
      <div className="page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Memuat soal kuis...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── IDLE / START SCREEN ──
  if (quizState === 'idle') {
    return (
      <div className="page fade-in">
        <div style={{ padding: '52px 20px 0' }}>
          <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600, margin: '0 0 4px' }}>🧠 Edukasi Wisata</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Kuis Interaktif</h1>
        </div>

        {/* Banner card */}
        <div style={{ margin: '20px 16px', borderRadius: 24, background: 'linear-gradient(135deg, var(--primary) 0%, #007b7c 100%)', padding: 24, color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 90, height: 90, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <p style={{ fontSize: 48, margin: '0 0 12px' }}>🏛️</p>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Uji Wawasan Wisata Tasikmalaya!</h2>
          <p style={{ fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.5 }}>
            {questions.length} soal · Setiap jawaban benar = +10 poin<br />Streak bonus: 3 jawaban beruntun = +5 poin ekstra!
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 16px 24px' }}>
          {[
            { icon: '❓', label: 'Total Soal', value: questions.length },
            { icon: '🏆', label: 'Maks Poin', value: questions.length * 10 + '+' },
            { icon: '⏱️', label: 'Estimasi', value: `${questions.length * 20}dtk` },
            { icon: '🔥', label: 'Streak Bonus', value: '+5 poin' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, border: '1.5px solid white', padding: '14px 16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category preview */}
        <div style={{ margin: '0 16px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>📚 Topik yang dibahas:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CATEGORY_ICONS).map(([name, icon]) => (
              <span key={name} style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid white', borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {icon} {name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <button id="btn-mulai-kuis" className="btn btn-primary" onClick={startQuiz}>
            🚀 Mulai Kuis Sekarang!
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── DONE SCREEN ──
  if (quizState === 'done') {
    const pct = Math.round((correct / questions.length) * 100);
    const medal = pct >= 90 ? '🥇' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '📚';
    const msg = pct >= 90 ? 'Luar biasa! Kamu ahli wisata Tasikmalaya!' : pct >= 70 ? 'Bagus! Pengetahuanmu cukup baik.' : pct >= 50 ? 'Lumayan! Terus belajar ya.' : 'Jangan menyerah, coba lagi!';

    return (
      <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', padding: '60px 20px 0' }}>
        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 28, border: '1.5px solid white', boxShadow: 'var(--shadow-lg)', padding: '32px 24px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 80, marginBottom: 12 }}>{medal}</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>Kuis Selesai!</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px' }}>{msg}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Poin Diperoleh', value: score, color: 'var(--primary)', icon: '🏆' },
              { label: 'Benar', value: `${correct}/${questions.length}`, color: '#16A34A', icon: '✅' },
              { label: 'Akurasi', value: `${pct}%`, color: 'var(--secondary)', icon: '🎯' },
              { label: 'Max Streak', value: maxStreak, color: '#7C3AED', icon: '🔥' },
            ].map(s => (
              <div key={s.label} style={{ background: s.color + '12', borderRadius: 16, padding: '14px 12px' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color }}>{s.icon} {s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-primary" onClick={startQuiz}>🔄 Main Lagi (soal diacak)</button>
            <button className="btn btn-outline" onClick={() => setQuizState('idle')}>🏠 Kembali ke Menu</button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── PLAYING ──
  const OPTION_LABELS = ['A', 'B', 'C', 'D'];

  return (
    <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ── */}
      <div style={{ background: 'var(--primary)', padding: '44px 20px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => setQuizState('idle')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12, fontFamily: 'Poppins, sans-serif' }}>
            ✕ Keluar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {streak >= 2 && (
              <span style={{ background: '#F59E0B', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: 'white' }}>
                🔥 {streak} streak!
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: 'white' }}>
              🏆 {score}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 20, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {current + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Destination tag */}
        {q.destination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{destIcon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-bg)', padding: '4px 12px', borderRadius: 20 }}>
              {q.destination}
            </span>
          </div>
        )}

        {/* Question Card */}
        <div style={{ background: 'white', borderRadius: 22, padding: '20px 20px', boxShadow: 'var(--shadow-md)', border: '1.5px solid rgba(255,255,255,0.9)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {q.options.map((opt, i) => {
            const isChosen = selected === i;
            const isCorrectOpt = i === q.answer;

            let bg = 'rgba(255,255,255,0.85)';
            let borderColor = '#E2E8F0';
            let textColor = 'var(--text-primary)';
            let labelBg = '#F1F5F9';
            let labelColor = 'var(--text-muted)';

            if (isChosen && !showAnswer) {
              bg = 'var(--primary)';
              borderColor = 'var(--primary)';
              textColor = 'white';
              labelBg = 'rgba(255,255,255,0.25)';
              labelColor = 'white';
            }
            if (showAnswer) {
              if (isCorrectOpt) {
                bg = '#DCFCE7'; borderColor = '#16A34A'; textColor = '#15803D'; labelBg = '#16A34A'; labelColor = 'white';
              } else if (isChosen) {
                bg = '#FEE2E2'; borderColor = '#DC2626'; textColor = '#B91C1C'; labelBg = '#DC2626'; labelColor = 'white';
              } else {
                bg = 'rgba(255,255,255,0.5)'; textColor = '#94A3B8';
              }
            }

            return (
              <button
                key={i}
                id={`btn-option-${i}`}
                onClick={() => handleSelect(i)}
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 16,
                  padding: '14px 16px',
                  color: textColor,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: showAnswer ? 'default' : 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s ease',
                  transform: isChosen && !showAnswer ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isChosen && !showAnswer ? 'var(--shadow-primary)' : 'var(--shadow-sm)',
                }}
              >
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: labelBg, color: labelColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.2s' }}>
                  {showAnswer && isCorrectOpt ? '✓' : showAnswer && isChosen ? '✗' : OPTION_LABELS[i]}
                </span>
                <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Streak indicator */}
        {showAnswer && streak >= 2 && (
          <div style={{ textAlign: 'center', padding: '8px', animation: 'fadeIn 0.3s ease' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>🔥 Streak {streak}x! +5 poin bonus!</span>
          </div>
        )}

        {/* Submit / Next button */}
        <button
          id="btn-jawab"
          onClick={handleAnswer}
          disabled={selected === null || showAnswer}
          style={{
            padding: '15px',
            borderRadius: 16,
            border: 'none',
            background: selected === null || showAnswer ? '#CBD5E1' : 'var(--secondary)',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            cursor: selected === null || showAnswer ? 'not-allowed' : 'pointer',
            boxShadow: selected !== null && !showAnswer ? '0 8px 24px rgba(229,110,36,0.3)' : 'none',
            transition: 'all 0.2s ease',
            marginBottom: 8,
          }}
        >
          {showAnswer ? (current + 1 < questions.length ? '⏭ Soal Berikutnya...' : '🏁 Lihat Hasil') : 'Jawab ✓'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
