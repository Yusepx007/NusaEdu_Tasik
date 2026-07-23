'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import DestinationCard from '@/components/ui/DestinationCard';
import { destinationApi } from '@/lib/api';
import type { Destination } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filtered, setFiltered] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    destinationApi.getAll().then(res => {
      setDestinations(res.data || []);
      setFiltered(res.data || []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const categories = ['Semua', ...Array.from(new Set(destinations.map(d => d.category).filter(Boolean)))];

  useEffect(() => {
    let data = destinations;
    if (activeCategory !== 'Semua') data = data.filter(d => d.category === activeCategory);
    if (search.trim()) data = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, activeCategory, destinations]);

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 16px 16px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>Daftar Wisata</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px' }}>
        <div className="input-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            id="input-search"
            className="input"
            type="search"
            placeholder="Cari destinasi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="filter-chips" style={{ marginBottom: 16 }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
          {[1,2,3,4].map(k => <div key={k} className="skeleton" style={{ height: 200, borderRadius: 20 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon-circle"><span style={{ fontSize: 36 }}>🔍</span></div>
          <h3>Tidak ditemukan</h3>
          <p>Coba kata kunci yang berbeda</p>
        </div>
      ) : (
        <>
          <p style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} destinasi ditemukan</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
            {filtered.map(dest => (
              <DestinationCard key={dest.id} destination={dest} compact />
            ))}
          </div>
        </>
      )}

      <div style={{ height: 16 }} />
      <BottomNav />
    </div>
  );
}
