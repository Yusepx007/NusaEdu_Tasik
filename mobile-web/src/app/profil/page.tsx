'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { auth } from '@/lib/auth';
import { historyApi } from '@/lib/api';
import type { User, VisitHistory } from '@/lib/types';
import { useRouter } from 'next/navigation';

const BADGES = [
  { icon: '🏅', label: 'Explorer', color: '#E56E24' },
  { icon: '🛡️', label: 'Penjaga', color: '#3B82F6' },
  { icon: '⭐', label: 'Bintang', color: '#F59E0B' },
  { icon: '🌿', label: 'Eco Hero', color: '#10B981' },
];

const LEVEL_LABELS = ['Pemula', 'Penjelajah', 'Petualang', 'Master', 'Legenda'];
function getLevel(points: number) {
  if (points >= 500) return 4;
  if (points >= 200) return 3;
  if (points >= 100) return 2;
  if (points >= 30) return 1;
  return 0;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<VisitHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    const u = auth.getUser();
    setUser(u);
    if (u) {
      setIsLoadingHistory(true);
      historyApi.getHistory(u.id).then(data => {
        setHistory(data);
      }).catch(() => {}).finally(() => setIsLoadingHistory(false));
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari akun?')) {
      auth.clearSession();
      router.replace('/login');
    }
  };

  const points = user?.points ?? 0;
  const level = getLevel(points);
  const levelLabel = LEVEL_LABELS[level];
  const nextLevelPoints = [30, 100, 200, 500, Infinity][level];
  const progressToNext = level < 4 ? Math.min((points / nextLevelPoints) * 100, 100) : 100;

  return (
    <div className="page fade-in">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Account</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Profil Pengguna</h1>
        </div>
        <button style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid white', borderRadius: 14, padding: 10, cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>
          </svg>
        </button>
      </div>

      {/* ── Profile Card ── */}
      {user ? (
        <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.85)', borderRadius: 24, border: '1.5px solid white', boxShadow: 'var(--shadow-md)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 700, flexShrink: 0, boxShadow: 'var(--shadow-primary)' }}>
              {user.name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{user.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 6px' }}>{user.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-primary" style={{ fontSize: 10 }}>🏆 {points} Poin</span>
                <span style={{ background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Level: {levelLabel}</span>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          {level < 4 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Menuju {LEVEL_LABELS[level + 1]}</span>
                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{points}/{nextLevelPoints} poin</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
          )}

          {/* Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {BADGES.map((badge, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: level >= i ? 1 : 0.3 }}>
                <span style={{ fontSize: 32 }}>{badge.icon}</span>
                <span style={{ fontSize: 9, color: badge.color, fontWeight: 600 }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ margin: '0 16px 16px', background: 'rgba(255,255,255,0.85)', borderRadius: 24, border: '1.5px solid white', boxShadow: 'var(--shadow-md)', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>Kamu belum login</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>Login untuk menyimpan poin & riwayat kunjungan</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => router.push('/login')}>Masuk</button>
            <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => router.push('/register')}>Daftar</button>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      {user && (
        <>
          <div style={{ display: 'flex', padding: '0 16px', gap: 8, marginBottom: 12 }}>
            {(['info', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: '10px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.7)', color: activeTab === tab ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}
              >
                {tab === 'info' ? '⚙️ Menu' : '📍 Riwayat'}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div style={{ margin: '0 16px', background: 'rgba(255,255,255,0.85)', borderRadius: 24, border: '1.5px solid white', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              {[
                { icon: '🏅', label: 'Badge Saya', action: () => {} },
                { icon: '📍', label: 'Riwayat Kunjungan', action: () => setActiveTab('history') },
                { icon: '⚙️', label: 'Pengaturan', action: () => {} },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <button onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.icon}</div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  {i < arr.length - 1 && <div className="divider" />}
                </div>
              ))}
              <div className="divider" />
              <button id="btn-logout" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600, color: '#DC2626' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚪</div>
                Keluar Akun
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ margin: '0 16px' }}>
              {isLoadingHistory ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map(k => <div key={k} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
                </div>
              ) : history.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 32px' }}>
                  <div className="icon-circle"><span style={{ fontSize: 28 }}>📍</span></div>
                  <h3 style={{ fontSize: 15 }}>Belum ada riwayat</h3>
                  <p>Scan wisata untuk mulai mengumpulkan riwayat!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map(h => (
                    <div key={h.id} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, border: '1.5px solid white', boxShadow: 'var(--shadow-sm)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📍</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.destination_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{h.date}</p>
                        {h.kategori && <p style={{ fontSize: 10, color: 'var(--primary)', margin: '2px 0 0', fontWeight: 600 }}>{h.kategori}</p>}
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: 11, flexShrink: 0 }}>+{h.points} poin</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div style={{ height: 24 }} />
      <BottomNav />
    </div>
  );
}
