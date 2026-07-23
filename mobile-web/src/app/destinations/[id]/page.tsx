'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { destinationApi } from '@/lib/api';
import type { Destination } from '@/lib/types';
import { resolveImage } from '@/lib/images';
import BottomNav from '@/components/layout/BottomNav';

export default function DestinationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    destinationApi.getAll().then(res => {
      const dest = res.data?.find(d => String(d.id) === String(params.id));
      setDestination(dest || null);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="page-no-nav fade-in">
        <div className="skeleton" style={{ height: 280, borderRadius: 0 }} />
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 28, width: '70%', borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 16, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="page-no-nav fade-in">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="icon-circle"><span style={{ fontSize: 36 }}>❓</span></div>
          <h3>Destinasi tidak ditemukan</h3>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', marginTop: 16 }} onClick={() => router.back()}>Kembali</button>
        </div>
      </div>
    );
  }

  const heroImg = resolveImage(destination.image_url, destination.wisata_key, destination.name);

  return (
    <div className="page-no-nav fade-in">
      {/* Hero Image */}
      <div style={{ position: 'relative', height: 280 }}>
        {heroImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImg} alt={destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🏞️</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{ position: 'absolute', top: 'calc(44px + 8px)', left: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
        </button>
        <span style={{ position: 'absolute', bottom: 16, left: 16 }} className="badge badge-primary">{destination.category}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{destination.name}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {destination.location && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>📍</span> {destination.location}
            </p>
          )}
          {destination.jam_buka && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>🕐</span> {destination.jam_buka}
            </p>
          )}
          {destination.tiket && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>🎟️</span> {destination.tiket}
            </p>
          )}
          {destination.rating && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span>⭐</span> {destination.rating}/5
            </p>
          )}
        </div>

        {destination.description && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0 6px' }}>Tentang Tempat Ini</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{destination.description}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push('/quiz')}>
            🧠 Mulai Kuis
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/scan')}>
            📷 Scan AI
          </button>
        </div>
      </div>

      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  );
}
