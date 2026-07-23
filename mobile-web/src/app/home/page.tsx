'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import DestinationCard from '@/components/ui/DestinationCard';
import { destinationApi } from '@/lib/api';
import type { Destination } from '@/lib/types';
import { auth } from '@/lib/auth';
import { resolveImage } from '@/lib/images';

const QUICK_MENUS = [
  { icon: '🏪', label: 'Mitra UMKM', color: '#FF9800', bg: '#FFF3E0', path: '/umkm' },
  { icon: '🗺️', label: 'Peta Digital', color: '#009688', bg: '#E0F2F1', path: '/peta' },
  { icon: '🧠', label: 'Kuis Edukasi', color: '#5C6BC0', bg: '#E8EAF6', path: '/quiz' },
  { icon: '📷', label: 'Scan AI', color: '#E56E24', bg: '#FDE8D8', path: '/scan' },
];

export default function HomePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const user = typeof window !== 'undefined' ? auth.getUser() : null;

  const loadDestinations = useCallback(async () => {
    try {
      const res = await destinationApi.getAll();
      setDestinations(res.data || []);
    } catch {
      // use empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  // Auto-advance carousel
  useEffect(() => {
    if (destinations.length < 2) return;
    const timer = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % Math.min(destinations.length, 3));
    }, 3500);
    return () => clearInterval(timer);
  }, [destinations]);

  const carouselItems = destinations.slice(0, 3);
  const current = carouselItems[carouselIdx];

  return (
    <div className="page fade-in">
      {/* ── AppBar ── */}
      <div className="mobile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-bg)', padding: '3px 10px', borderRadius: 20 }}>
            Explore Tasikmalaya
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0', letterSpacing: '-0.3px' }}>
            NUSAEDU <span style={{ color: 'var(--secondary)', fontSize: 16 }}>✨</span>
          </h1>
        </div>
        <button
          id="btn-scan-ai"
          onClick={() => router.push('/scan')}
          style={{
            background: 'linear-gradient(135deg, var(--primary), #00878A)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: 18,
            padding: '10px 16px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            transition: 'transform 0.2s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 3v3m8-3v3M3 8h3m12 0h3M3 16h3m12 0h3M8 21v-3m8 3v-3"/>
          </svg>
          Scan AI
        </button>
      </div>

      {/* ── Carousel Banner ── */}
      <div style={{ margin: '0 20px', marginBottom: 12 }}>
        <div style={{ position: 'relative', height: 230, borderRadius: 26, overflow: 'hidden', boxShadow: '0 14px 36px rgba(0,105,106,0.14)', border: '1.5px solid rgba(255,255,255,0.9)' }}>
          {isLoading ? (
            <div className="skeleton" style={{ width: '100%', height: '100%' }} />
          ) : current ? (
            (() => {
              const bannerImg = resolveImage(current.image_url, current.wisata_key, current.name);
              return bannerImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bannerImg}
                  alt={current.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 64 }}>🏞️</span>
                </div>
              );
            })()
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #00696A, #E56E24)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 48 }}>🌴</span>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Wisata Tasikmalaya</p>
            </div>
          )}
          {current && (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)' }} />
              {/* Bottom info */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5 }}>
                  📍 {current.category?.toUpperCase() || 'DESTINASI'}
                </span>
                <p style={{ color: 'white', fontSize: 17, fontWeight: 800, margin: '2px 0 8px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{current.name}</p>
                <button
                  onClick={() => router.push('/quiz')}
                  style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, var(--secondary), #D97706)', border: 'none', borderRadius: 12, padding: '8px 18px', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(229,110,36,0.3)' }}
                >
                  Mulai Kuis 🧠
                </button>
              </div>
            </>
          )}
        </div>

        {/* Dots */}
        {carouselItems.length > 1 && (
          <div className="carousel-dots" style={{ marginTop: 12 }}>
            {carouselItems.map((_, i) => (
              <div
                key={i}
                className={`dot ${i === carouselIdx ? 'active' : ''}`}
                onClick={() => setCarouselIdx(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Menu ── */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {QUICK_MENUS.map((item) => (
            <button
              key={item.path}
              id={`btn-menu-${item.label.toLowerCase().replace(' ', '-')}`}
              className="category-item"
              onClick={() => router.push(item.path)}
              style={{ background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 20,
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0, 105, 106, 0.07)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <span style={{ fontSize: 26 }}>{item.icon}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Destinations ── */}
      <div style={{ marginTop: 24 }}>
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 4 }} />
            <h2 className="section-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Destinasi Populer</h2>
          </div>
          <span
            className="section-link"
            onClick={() => router.push('/destinations')}
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}
          >
            Lihat Semua →
          </span>
        </div>

        {isLoading ? (
          <div className="h-scroll">
            {[1, 2, 3].map((k) => (
              <div key={k} className="skeleton" style={{ width: 165, height: 190, borderRadius: 20, flexShrink: 0 }} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 32px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tidak ada destinasi tersedia</p>
          </div>
        ) : (
          <div className="h-scroll" style={{ paddingBottom: 16 }}>
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </div>

      {/* ── Greet user ── */}
      {user && (
        <div style={{ margin: '16px 20px 0', padding: '18px 22px', borderRadius: 22, background: 'linear-gradient(135deg, var(--primary), #00878A)', color: 'white', boxShadow: 'var(--shadow-primary)' }}>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.85, fontWeight: 500 }}>Selamat datang kembali,</p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{user.name} 👋</p>
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
            🏆 {user.points ?? 0} Poin Terkumpul
          </div>
        </div>
      )}

      {/* Spacing to keep bottom cards 100% visible above BottomNav */}
      <div style={{ height: 40 }} />
      <BottomNav />
    </div>
  );
}
