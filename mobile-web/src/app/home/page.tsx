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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 12px' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Explore</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>NUSAEDU</h1>
        </div>
        <button
          id="btn-scan-ai"
          onClick={() => router.push('/scan')}
          style={{
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 14,
            padding: '10px 14px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 3v3m8-3v3M3 8h3m12 0h3M3 16h3m12 0h3M8 21v-3m8 3v-3"/>
          </svg>
          Scan AI
        </button>
      </div>

      {/* ── Carousel Banner ── */}
      <div style={{ margin: '0 20px', marginBottom: 8 }}>
        <div style={{ position: 'relative', height: 230, borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
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
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
              {/* Bottom info */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600, margin: 0, letterSpacing: 0.5 }}>
                  {current.category?.toUpperCase()}
                </p>
                <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '2px 0 10px' }}>{current.name}</p>
                <button
                  onClick={() => router.push('/quiz')}
                  style={{ background: 'var(--secondary)', border: 'none', borderRadius: 10, padding: '8px 20px', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Mulai Kuis 🧠
                </button>
              </div>
            </>
          )}
        </div>


        {/* Dots */}
        {carouselItems.length > 1 && (
          <div className="carousel-dots" style={{ marginTop: 10 }}>
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
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {QUICK_MENUS.map((item) => (
            <button
              key={item.path}
              id={`btn-menu-${item.label.toLowerCase().replace(' ', '-')}`}
              className="category-item"
              onClick={() => router.push(item.path)}
              style={{ background: 'none', border: 'none', fontFamily: 'Poppins, sans-serif', cursor: 'pointer' }}
            >
              <div
                className="category-icon"
                style={{ background: item.bg }}
              >
                <span style={{ fontSize: 24 }}>{item.icon}</span>
              </div>
              <span className="category-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Destinations ── */}
      <div style={{ marginTop: 24 }}>
        <div className="section-header">
          <h2 className="section-title">Top Destinations</h2>
          <span
            className="section-link"
            onClick={() => router.push('/destinations')}
          >
            View All
          </span>
        </div>

        {isLoading ? (
          <div className="h-scroll">
            {[1, 2, 3].map((k) => (
              <div key={k} className="skeleton" style={{ width: 150, height: 180, borderRadius: 20, flexShrink: 0 }} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 32px' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tidak ada destinasi tersedia</p>
          </div>
        ) : (
          <div className="h-scroll">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </div>

      {/* ── Greet user ── */}
      {user && (
        <div style={{ margin: '20px 20px 0', padding: '16px 20px', borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), #00969880)', color: 'white' }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>Selamat datang kembali,</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{user.name} 👋</p>
          <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.85 }}>
            🏆 {user.points ?? 0} Poin terkumpul
          </p>
        </div>
      )}

      <div style={{ height: 24 }} />
      <BottomNav />
    </div>
  );
}
