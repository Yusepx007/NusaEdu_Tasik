'use client';
import BottomNav from '@/components/layout/BottomNav';

export default function PetaPage() {
  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Navigasi</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Peta Wisata 🗺️</h1>
      </div>

      {/* Map embed */}
      <div style={{ margin: '0 16px', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1.5px solid white' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63384.01!2d108.2!3d-7.32!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f5a5f5a5f5a5f%3A0x5f5a5f5a5f5a5f5f!2sTasikmalaya%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
          width="100%"
          height="380"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta Wisata Tasikmalaya"
        />
      </div>

      {/* Legend / Quick destinations */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>📍 Destinasi Populer</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Alun-Alun Kota Tasikmalaya', cat: 'Taman & Ruang Publik', icon: '🌳' },
            { name: 'Masjid Agung Tasikmalaya', cat: 'Wisata Religi', icon: '🕌' },
            { name: 'Karang Kamulyan', cat: 'Wisata Alam & Pantai', icon: '🌊' },
            { name: 'Museum Sukapura', cat: 'Museum & Budaya', icon: '🏛️' },
          ].map((dest, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.85)', borderRadius: 16, padding: '12px 16px', border: '1.5px solid white', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {dest.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: 'var(--text-primary)' }}>{dest.name}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{dest.cat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />
      <BottomNav />
    </div>
  );
}
