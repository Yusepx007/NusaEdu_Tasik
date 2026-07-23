'use client';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/navigation';

const UMKM_DATA = [
  { id: 1, name: 'Batik Tasik Indah', category: 'Kerajinan', desc: 'Batik khas Tasikmalaya dengan motif ragam hias tradisional yang unik dan elegan.', icon: '🎨', rating: 4.8, whatsapp: '6281234567890' },
  { id: 2, name: 'Warung Sate Maranggi Pak Uu', category: 'Kuliner', desc: 'Sate maranggi khas Sunda dengan bumbu kacang spesial yang telah diwariskan turun temurun.', icon: '🍢', rating: 4.9, whatsapp: '6281234567891' },
  { id: 3, name: 'Kerajinan Mendong Tasik', category: 'Kerajinan', desc: 'Produk anyaman mendong berkualitas tinggi: tas, topi, tikar dengan desain modern.', icon: '🌾', rating: 4.7, whatsapp: '6281234567892' },
  { id: 4, name: 'Toko Oleh-Oleh Bu Sari', category: 'Oleh-oleh', desc: 'Pusat oleh-oleh khas Tasikmalaya: makanan, kerajinan, dan souvenir terlengkap.', icon: '🛍️', rating: 4.6, whatsapp: '6281234567893' },
  { id: 5, name: 'Kopi Tasik Heritage', category: 'Kuliner', desc: 'Kedai kopi artisan dengan single origin kopi Tasikmalaya yang kaya rasa dan aroma.', icon: '☕', rating: 4.8, whatsapp: '6281234567894' },
  { id: 6, name: 'Galeri Payung Tasikmalaya', category: 'Kerajinan', desc: 'Payung geulis dan kerajinan seni rupa khas Tasikmalaya yang terkenal di mancanegara.', icon: '☂️', rating: 4.9, whatsapp: '6281234567895' },
];

const CAT_COLORS: Record<string, string> = {
  Kerajinan: 'var(--primary)',
  Kuliner: 'var(--secondary)',
  'Oleh-oleh': '#8B5CF6',
};

export default function UmkmPage() {
  const router = useRouter();

  return (
    <div className="page fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 16px 12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
        </button>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0 }}>Ekonomi Lokal</p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Mitra UMKM 🏪</h1>
        </div>
      </div>

      {/* Banner */}
      <div style={{ margin: '0 16px 20px', padding: '16px 20px', borderRadius: 20, background: 'linear-gradient(135deg, var(--secondary), #c95e1a)', color: 'white' }}>
        <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 4px' }}>Dukung UMKM Lokal! 🌟</p>
        <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>Beli produk lokal Tasikmalaya untuk mendukung perekonomian daerah</p>
      </div>

      {/* UMKM Grid */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {UMKM_DATA.map((umkm) => {
          const catColor = CAT_COLORS[umkm.category] || 'var(--primary)';
          return (
            <div key={umkm.id} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 20, border: '1.5px solid white', boxShadow: 'var(--shadow-md)', padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Icon */}
              <div style={{ width: 56, height: 56, borderRadius: 18, background: catColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {umkm.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{umkm.name}</h3>
                  <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>⭐ {umkm.rating}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: catColor, background: catColor + '18', padding: '2px 10px', borderRadius: 20 }}>{umkm.category}</span>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{umkm.desc}</p>
                <a
                  href={`https://wa.me/${umkm.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Hubungi WA
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 24 }} />
      <BottomNav />
    </div>
  );
}
