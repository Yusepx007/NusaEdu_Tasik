import type { QuizQuestion } from './types';

/**
 * Bank soal edukasi wisata Tasikmalaya (minimal 20 soal).
 * Digunakan sebagai fallback jika API /quizzes kosong atau error.
 * answer = index jawaban benar (0-based)
 */
export const LOCAL_QUIZ: QuizQuestion[] = [
  // ── Patung KH Zainal Mustofa ─────────────────────────────────────────
  {
    id: 101,
    destination: 'Patung KH Zainal Mustofa',
    question: 'KH Zainal Mustofa adalah pahlawan nasional yang berasal dari daerah mana di Tasikmalaya?',
    options: ['Singaparna', 'Indihiang', 'Kawalu', 'Cibeureum'],
    answer: 0,
  },
  {
    id: 102,
    destination: 'Patung KH Zainal Mustofa',
    question: 'KH Zainal Mustofa memimpin perlawanan terhadap penjajah pada tahun berapa?',
    options: ['1940', '1944', '1945', '1950'],
    answer: 1,
  },
  {
    id: 103,
    destination: 'Patung KH Zainal Mustofa',
    question: 'Apa nama pesantren yang didirikan oleh KH Zainal Mustofa di Singaparna?',
    options: ['Pesantren Sukamanah', 'Pesantren Cipasung', 'Pesantren Al-Basyariyah', 'Pesantren Miftahul Huda'],
    answer: 0,
  },
  // ── Tugu Adipura ─────────────────────────────────────────────────────
  {
    id: 201,
    destination: 'Tugu Adipura',
    question: 'Penghargaan Adipura diberikan oleh pemerintah kepada kota yang berprestasi di bidang apa?',
    options: ['Pendidikan', 'Kebersihan & Lingkungan', 'Pariwisata', 'Olahraga'],
    answer: 1,
  },
  {
    id: 202,
    destination: 'Tugu Adipura',
    question: 'Tugu Adipura Tasikmalaya terletak di kawasan mana di kota Tasikmalaya?',
    options: ['Kawalu', 'Cihideung', 'Alun-Alun', 'Mangkubumi'],
    answer: 2,
  },
  {
    id: 203,
    destination: 'Tugu Adipura',
    question: 'Kota Tasikmalaya pertama kali meraih penghargaan Adipura pada dekade mana?',
    options: ['1980-an', '1990-an', '2000-an', '2010-an'],
    answer: 1,
  },
  // ── Situ Gede ────────────────────────────────────────────────────────
  {
    id: 301,
    destination: 'Situ Gede',
    question: 'Situ Gede adalah sebuah danau yang terletak di kecamatan mana di Tasikmalaya?',
    options: ['Indihiang', 'Mangkubumi', 'Kawalu', 'Cibeureum'],
    answer: 1,
  },
  {
    id: 302,
    destination: 'Situ Gede',
    question: 'Apa fungsi utama Situ Gede selain sebagai objek wisata?',
    options: ['Pembangkit listrik', 'Irigasi pertanian', 'Budidaya ikan laut', 'Pelabuhan nelayan'],
    answer: 1,
  },
  {
    id: 303,
    destination: 'Situ Gede',
    question: 'Apa nama pulau kecil yang terdapat di tengah Situ Gede?',
    options: ['Pulau Merak', 'Nusa Gede', 'Pulau Hijau', 'Nusa Indah'],
    answer: 1,
  },
  {
    id: 304,
    destination: 'Situ Gede',
    question: 'Aktivitas wisata apa yang paling populer di Situ Gede?',
    options: ['Mendaki gunung', 'Berperahu di danau', 'Surfing', 'Paragliding'],
    answer: 1,
  },
  // ── Alun-Alun Tasikmalaya ─────────────────────────────────────────────
  {
    id: 401,
    destination: 'Alun-Alun Kota Tasikmalaya',
    question: 'Di sebelah mana Alun-Alun Tasikmalaya berdiri Masjid Agung Kota Tasikmalaya?',
    options: ['Timur', 'Barat', 'Utara', 'Selatan'],
    answer: 1,
  },
  {
    id: 402,
    destination: 'Alun-Alun Kota Tasikmalaya',
    question: 'Apa nama julukan kota Tasikmalaya yang sering disebut?',
    options: ['Kota Kembang', 'Kota Mutiara dari Priangan Timur', 'Kota Santri', 'Kota Pahlawan'],
    answer: 1,
  },
  // ── Kerajinan & Budaya ────────────────────────────────────────────────
  {
    id: 501,
    destination: 'Kerajinan Tasikmalaya',
    question: 'Kerajinan khas Tasikmalaya yang terkenal terbuat dari bahan tanaman mendong adalah?',
    options: ['Batik', 'Anyaman mendong', 'Payung geulis', 'Bordir'],
    answer: 1,
  },
  {
    id: 502,
    destination: 'Kerajinan Tasikmalaya',
    question: 'Payung tradisional khas Tasikmalaya yang terkenal hingga mancanegara disebut?',
    options: ['Payung Keraton', 'Payung Geulis', 'Payung Agung', 'Payung Nusantara'],
    answer: 1,
  },
  {
    id: 503,
    destination: 'Kerajinan Tasikmalaya',
    question: 'Kota Tasikmalaya terkenal sebagai penghasil produk bordir. Bordir Tasikmalaya paling banyak dipasarkan di pasar mana?',
    options: ['Pasar Tanah Abang', 'Pasar Cipadu', 'Pasar Cikupa', 'Pasar Tasik di seluruh Jawa & ekspor'],
    answer: 3,
  },
  // ── Kuliner ───────────────────────────────────────────────────────────
  {
    id: 601,
    destination: 'Kuliner Tasikmalaya',
    question: 'Makanan khas Tasikmalaya yang terbuat dari singkong fermentasi disebut?',
    options: ['Comro', 'Peuyeum', 'Misro', 'Combro'],
    answer: 1,
  },
  {
    id: 602,
    destination: 'Kuliner Tasikmalaya',
    question: 'Minuman tradisional khas Tasikmalaya yang terbuat dari cincau hitam disebut?',
    options: ['Es cendol', 'Es dawet', 'Es cincau', 'Es campur'],
    answer: 2,
  },
  {
    id: 603,
    destination: 'Kuliner Tasikmalaya',
    question: 'Nasi tutug oncom adalah makanan khas Tasikmalaya. Oncom dibuat dari bahan utama apa?',
    options: ['Kedelai hitam', 'Bungkil kacang tanah atau ampas tahu', 'Jagung', 'Singkong'],
    answer: 1,
  },
  // ── Sejarah & Geografi ─────────────────────────────────────────────────
  {
    id: 701,
    destination: 'Sejarah Tasikmalaya',
    question: 'Kota Tasikmalaya secara resmi menjadi kota otonom (bukan kabupaten) pada tahun berapa?',
    options: ['1998', '2001', '2002', '2005'],
    answer: 2,
  },
  {
    id: 702,
    destination: 'Geografi Tasikmalaya',
    question: 'Tasikmalaya terletak di wilayah Priangan mana di Jawa Barat?',
    options: ['Priangan Barat', 'Priangan Tengah', 'Priangan Timur', 'Priangan Selatan'],
    answer: 2,
  },
  {
    id: 703,
    destination: 'Wisata Alam Tasikmalaya',
    question: 'Pantai yang terkenal sebagai salah satu destinasi wisata bahari di wilayah Tasikmalaya adalah?',
    options: ['Pantai Pangandaran', 'Pantai Karang Tawulan', 'Pantai Sindangkerta', 'Pantai Cipatujah'],
    answer: 3,
  },
  {
    id: 704,
    destination: 'Wisata Alam Tasikmalaya',
    question: 'Gunung apa yang menjadi ikon alam di dekat wilayah Tasikmalaya?',
    options: ['Gunung Ciremai', 'Gunung Galunggung', 'Gunung Papandayan', 'Gunung Salak'],
    answer: 1,
  },
  {
    id: 705,
    destination: 'Sejarah Tasikmalaya',
    question: 'Hari jadi Kota Tasikmalaya diperingati setiap tanggal berapa?',
    options: ['17 Oktober', '21 Juni', '25 Maret', '14 Agustus'],
    answer: 0,
  },
];
