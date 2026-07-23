'use client';
import { useEffect, useState } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { destinationApi } from '@/lib/api';
import type { Destination } from '@/lib/types';
import { resolveImage } from '@/lib/images';
import { useRouter } from 'next/navigation';

export default function PetaPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  useEffect(() => {
    destinationApi.getAll().then(res => {
      if (res && Array.isArray(res.data)) {
        setDestinations(res.data);
      }
    }).catch(() => {});
  }, []);

  const fallbackList = [
    { id: 1, name: 'Alun-Alun Kota Tasikmalaya', category: 'Taman & Ruang Publik', location: 'Jl. Yudanegara, Cihideung', wisata_key: 'alun_alun' },
    { id: 2, name: 'Masjid Agung Tasikmalaya', category: 'Wisata Religi', location: 'Jl. Masjid Agung No.1, Yudanegara', wisata_key: 'masjid_agung' },
    { id: 3, name: 'Karang Kamulyan', category: 'Wisata Alam & Pantai', location: 'Kec. Cijeungjing, Tasikmalaya', wisata_key: 'karang_kamulyan' },
    { id: 4, name: 'Museum Sukapura', category: 'Museum & Budaya', location: 'Sukapura, Kabupaten Tasikmalaya', wisata_key: 'museum_sukapura' },
  ];

  const displayList = destinations.length > 0 ? destinations : (fallbackList as Destination[]);

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px' }}>
        <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: 'var(--primary-bg)', padding: '3px 10px', borderRadius: 20 }}>
          Navigasi Interaktif
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>Peta Wisata</h1>
      </div>

      {/* Map embed */}
      <div style={{ margin: '0 16px', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1.5px solid white' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.01!2d108.2!3d-7.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f5a5f5a5f5a5f%3A0x5f5a5f5a5f5a5f5f!2sTasikmalaya%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
          width="100%"
          height="360"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta Wisata Tasikmalaya"
        />
      </div>

      {/* Quick destinations list with real photos */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Destinasi Populer</h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => router.push('/destinations')}>
            Lihat Semua →
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayList.slice(0, 5).map((dest) => {
            const imgSrc = resolveImage(dest.image_url, dest.wisata_key, dest.name);

            return (
              <div
                key={dest.id}
                onClick={() => router.push(`/destinations/${dest.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 20,
                  padding: '10px 14px',
                  border: '1.5px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 4px 16px rgba(0, 105, 106, 0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', background: '#E2E8F0', flexShrink: 0, position: 'relative' }}>
                  {imgSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dest.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, margin: '2px 0 0' }}>
                    {dest.category}
                  </p>
                  {dest.location && (
                    <p style={{ fontSize: 10.5, color: 'var(--text-muted)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {dest.location}
                    </p>
                  )}
                </div>

                <div style={{ background: 'var(--primary-bg)', borderRadius: 12, padding: '8px 12px', color: 'var(--primary)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  Detail
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 24 }} />
      <BottomNav />
    </div>
  );
}
