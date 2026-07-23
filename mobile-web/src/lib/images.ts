/**
 * Peta fallback gambar lokal untuk setiap destinasi.
 * Digunakan jika image_url dari API kosong atau gagal load.
 */
const FALLBACK_MAP: Record<string, string> = {
  // by wisata_key
  'khz_mustofa':  '/images/khz-mustofa.jpg',
  'tugu_adipura': '/images/tugu-adipura.jpg',
  'situ_gede':    '/images/situ-gede.webp',
  'alun_alun':    '/images/alun-alun.jpg',
  'masjid_agung': 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80',
  'karang_kamulyan': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'museum_sukapura': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80',
};

/** Kata kunci nama → foto lokal / online fallback (case-insensitive) */
const KEYWORD_MAP: Array<{ keywords: string[]; src: string }> = [
  { keywords: ['mustofa', 'khz', 'kh zainal', 'zainal'],       src: '/images/khz-mustofa.jpg'  },
  { keywords: ['tugu', 'adipura'],                               src: '/images/tugu-adipura.jpg' },
  { keywords: ['situ', 'gede'],                                  src: '/images/situ-gede.webp'   },
  { keywords: ['alun', 'tasikmalaya', 'kota'],                  src: '/images/alun-alun.jpg'    },
  { keywords: ['masjid', 'agung', 'religi'],                    src: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['karang', 'kamulyan', 'pantai'],                  src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['museum', 'sukapura', 'budaya'],                 src: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80' },
  { keywords: ['galunggung', 'gunung'],                          src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80' },
];

/**
 * Ambil src gambar untuk destinasi:
 * 1. Coba image_url dari API
 * 2. Fallback ke wisata_key map
 * 3. Fallback ke keyword name match
 */
export function resolveImage(
  imageUrl?: string,
  wisataKey?: string,
  name?: string,
): string | null {
  if (imageUrl && imageUrl.trim()) return imageUrl;
  if (wisataKey && FALLBACK_MAP[wisataKey]) return FALLBACK_MAP[wisataKey];
  if (name) {
    const lower = name.toLowerCase();
    for (const entry of KEYWORD_MAP) {
      if (entry.keywords.some(k => lower.includes(k))) return entry.src;
    }
  }
  return null;
}
