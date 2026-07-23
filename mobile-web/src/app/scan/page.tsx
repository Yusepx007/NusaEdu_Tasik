'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import { destinationApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { ScanResult } from '@/lib/types';

type ScanState = 'idle' | 'scanning' | 'result';

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [cameraOn, setCameraOn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // ── Start Camera ─────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung di browser/perangkat ini.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch (err: unknown) {
      setCameraOn(false);
      const msg = err instanceof Error ? err.message : 'Kamera tidak tersedia.';
      setError(`${msg} Silakan pilih foto langsung dari Galeri.`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  // ── Capture from Camera ──────────────────────────────────────────────
  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
      await doScan(file);
    }, 'image/jpeg', 0.85);
  };

  // ── Pick from Gallery ────────────────────────────────────────────────
  const pickFromGallery = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    stopCamera();
    await doScan(file);
  };

  // ── Local destination data (for enriching AI results) ───────────────────
  const LOCAL_DEST: Record<string, { name: string; description: string; lokasi: string; kategori: string; jam_buka?: string; tiket?: string }> = {
    alun_alun: {
      name: 'Alun-Alun Kota Tasikmalaya',
      description: 'Alun-Alun Tasikmalaya adalah ruang publik utama di pusat kota yang menjadi tempat berkumpul masyarakat dan berbagai kegiatan budaya serta rekreasi.',
      lokasi: 'Jl. Masjid Agung, Pusat Kota Tasikmalaya',
      kategori: 'Taman & Ruang Publik',
      jam_buka: '24 Jam', tiket: 'Gratis',
    },
    khz_mustofa: {
      name: 'Patung KH Zainal Mustofa',
      description: 'Monumen pahlawan nasional KH Zainal Mustofa, ulama sekaligus pejuang kemerdekaan dari Singaparna yang melawan penjajah Jepang pada tahun 1944.',
      lokasi: 'Singaparna, Kabupaten Tasikmalaya',
      kategori: 'Sejarah',
    },
    tugu_adipura: {
      name: 'Tugu Adipura Tasikmalaya',
      description: 'Tugu kebanggaan Kota Tasikmalaya sebagai simbol penghargaan Adipura atas prestasi kebersihan dan lingkungan hidup kota.',
      lokasi: 'Pusat Kota Tasikmalaya',
      kategori: 'Landmark',
    },
    situ_gede: {
      name: 'Situ Gede',
      description: 'Danau alami seluas ±57 hektar dengan pulau kecil di tengahnya yang menjadi destinasi wisata alam, berperahu, dan memancing favorit warga Tasikmalaya.',
      lokasi: 'Kecamatan Mangkubumi, Kota Tasikmalaya',
      kategori: 'Wisata Alam',
      jam_buka: '06.00–18.00', tiket: 'Rp 5.000',
    },
  };

  // ── Do Scan ──────────────────────────────────────────────────────────
  const doScan = async (file: File) => {
    setScanState('scanning');
    setError('');
    setScanResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await destinationApi.scan(formData) as any;

      // ── Handle "not recognized" response ──────────────────────────────
      // Python AI returns { success: true, recognized: false, message: "..." }
      if (raw.recognized === false) {
        setScanResult({
          success: true,
          recognized: false,
          name: 'Tidak Dikenali',
          description: raw.message || 'Coba arahkan kamera lebih jelas ke objek wisata.',
          confidence: Number(raw.confidence ?? 0),
        });
        setScanState('result');
        return;
      }

      // ── Parse info object (Python AI fields use Bahasa Indonesia) ──────
      // Response: { success, recognized, wisata_key, confidence, info: { nama, deskripsi, lokasi, ... } }
      const info = raw.info ?? {};
      const key  = raw.wisata_key || '';
      const conf = Number(raw.confidence ?? 0); // already 0-100 from Python

      // thumbnail URL → absolute URL ke Python AI server
      const AI_BASE = process.env.NEXT_PUBLIC_AI_URL || 'https://kotapintar.my.id/ai';
      const thumbUrl = raw.thumbnail_url
        ? `${AI_BASE}${raw.thumbnail_url}`
        : undefined;

      const result: ScanResult = {
        success:     true,
        recognized:  true,
        wisata_key:  key,
        confidence:  conf,
        name:        info.nama        || 'Destinasi Tidak Dikenal',
        description: info.deskripsi   || '',
        lokasi:      info.lokasi      || undefined,
        jam_buka:    info.jam_buka    || undefined,
        tiket:       info.tiket       || undefined,
        kategori:    info.kategori    || undefined,
        image_url:   thumbUrl,
        has_quiz:    raw.has_quiz     || false,
      };

      setScanResult(result);
      setScanState('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Scan gagal. Coba lagi.';
      setError(msg);
      setScanState('idle');
    }
  };



  // ── Save Scan Result ─────────────────────────────────────────────────
  const saveScan = async () => {
    if (!scanResult) return;
    const user = auth.getUser();
    try {
      const res = await destinationApi.saveScan({
        user_id: user?.id,
        wisata_key: scanResult.wisata_key,
        destination_name: scanResult.name,
        confidence: scanResult.confidence,
        lokasi: scanResult.lokasi,
        kategori: scanResult.kategori,
      });
      if (user && res.total_points) auth.updatePoints(res.total_points);
      setSaveMsg(`✅ +${res.points_earned} poin! Kunjungan disimpan.`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Gagal menyimpan. Coba lagi.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const reset = () => {
    setScanState('idle');
    setScanResult(null);
    setPreviewUrl(null);
    setError('');
    setSaveMsg('');
  };

  const confidencePct = scanResult ? Math.round(scanResult.confidence) : 0;
  const isReliable = confidencePct >= 70;

  return (
    <div className="page fade-in" style={{ background: scanState !== 'idle' || cameraOn ? 'black' : 'var(--bg)' }}>
      {/* ── Top Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 50, padding: '44px 4px 8px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => { stopCamera(); router.push('/home'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: '8px 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 12l6-6M3 12l6 6"/>
            </svg>
          </button>
          <h1 style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>Scan Wisata 🔍</h1>
          <div style={{ width: 48 }} />
        </div>
      </div>

      {/* ── RESULT STATE ── */}
      {scanState === 'result' && scanResult && (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', paddingTop: 80 }}>
          {/* Preview image */}
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Foto scan" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
          )}
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* ── NOT RECOGNIZED ── */}
            {scanResult.recognized === false ? (
              <>
                <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>🔍</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#92400E' }}>Tempat tidak dikenali</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>
                      {scanResult.description || 'Coba arahkan kamera lebih jelas ke objek wisata dan pastikan pencahayaan cukup.'}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                  Confidence: {Math.round(scanResult.confidence)}% — Perlu minimal 35%
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  <button className="btn btn-primary" onClick={reset}>📷 Coba Scan Lagi</button>
                  <button className="btn btn-outline" onClick={() => router.push('/destinations')}>🗺️ Lihat Daftar Wisata</button>
                </div>
              </>
            ) : (
              /* ── RECOGNIZED ── */
              <>
                {/* Confidence badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`badge ${confidencePct >= 70 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 12 }}>
                    {confidencePct >= 70 ? '✅' : '⚠️'} Keyakinan AI: {confidencePct}%
                  </div>
                  {scanResult.kategori && (
                    <span className="badge badge-primary">{scanResult.kategori}</span>
                  )}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{scanResult.name}</h2>

                {scanResult.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{scanResult.description}</p>
                )}

                {/* Info grid */}
                {(scanResult.lokasi || scanResult.jam_buka || scanResult.tiket) && (
                  <div style={{ background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: 'var(--shadow-sm)' }}>
                    {scanResult.lokasi && <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, margin: 0 }}>📍 <span>{scanResult.lokasi}</span></p>}
                    {scanResult.jam_buka && <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, margin: 0 }}>🕐 <span>{scanResult.jam_buka}</span></p>}
                    {scanResult.tiket && <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 8, margin: 0 }}>🎟️ <span>{scanResult.tiket}</span></p>}
                  </div>
                )}

                {saveMsg && (
                  <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 12, padding: '12px 16px', color: '#2E7D32', fontSize: 13, fontWeight: 600 }}>
                    {saveMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                  <button id="btn-lihat-detail" className="btn btn-primary" onClick={() => router.push('/destinations')}>
                    Lihat Destinasi 🗺️
                  </button>
                  <button id="btn-mulai-kuis" className="btn btn-secondary" onClick={() => router.push('/quiz')}>
                    Mulai Kuis 🧠
                  </button>
                  <button id="btn-simpan-scan" className="btn btn-outline" onClick={saveScan}>
                    Simpan Kunjungan (+poin)
                  </button>
                  <button className="btn btn-ghost" onClick={reset} style={{ color: 'var(--text-secondary)' }}>
                    Scan Lagi
                  </button>
                </div>
              </>
            )}
          </div>
          <div style={{ height: 80 }} />
        </div>
      )}


      {/* ── SCANNING STATE ── */}
      {scanState === 'scanning' && (
        <div className="loading-overlay" style={{ position: 'fixed', zIndex: 200 }}>
          <div className="spinner" style={{ width: 52, height: 52, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'var(--primary)' }} />
          <p style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>Menganalisis gambar...</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Memuat hasil dari AI</p>
        </div>
      )}

      {/* ── IDLE STATE ── */}
      {scanState === 'idle' && (
        <>
          {/* Camera preview or placeholder */}
          <div style={{ position: 'relative', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: cameraOn ? 'black' : 'var(--bg)' }}>
            {cameraOn ? (
              <video ref={videoRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted autoPlay />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '80px 32px 0' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 56 }}>📷</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)', margin: 0 }}>Scan Wisata AI</h2>
                <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Ambil foto destinasi wisata Tasikmalaya & AI akan mengidentifikasi tempat tersebut!
                </p>
                {error && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4, width: '100%', textAlign: 'left' }}>
                    {error.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: 0, fontSize: i === 0 ? 13 : 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#DC2626' : '#B91C1C', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ flexShrink: 0 }}>{i === 0 ? '⚠️' : '💡'}</span> {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scan Frame overlay */}
            {cameraOn && (
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, pointerEvents: 'none' }}>
                <div className="scan-frame">
                  <div className="scan-corner tl" />
                  <div className="scan-corner tr" />
                  <div className="scan-corner bl" />
                  <div className="scan-corner br" />
                </div>
                <div style={{ background: 'rgba(0,0,0,0.55)', borderRadius: 20, padding: '8px 20px' }}>
                  <p style={{ color: 'white', fontSize: 12, margin: 0 }}>Arahkan ke objek wisata</p>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 32px', paddingBottom: 'calc(24px + 80px)', background: cameraOn ? 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
              {/* Gallery button */}
              <button id="btn-galeri" onClick={pickFromGallery} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: cameraOn ? 'white' : 'var(--text-secondary)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: cameraOn ? 'rgba(255,255,255,0.15)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: cameraOn ? 'none' : 'var(--shadow-sm)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Galeri</span>
              </button>

              {/* Shutter / Action button */}
              {cameraOn ? (
                <button id="btn-capture" onClick={captureAndScan} style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: 'var(--shadow-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v3m8-3v3M3 8h3m12 0h3M3 16h3m12 0h3M8 21v-3m8 3v-3"/>
                  </svg>
                </button>
              ) : (
                <button id="btn-buka-kamera" onClick={startCamera} style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: 'var(--shadow-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              )}

              {/* Stop camera / flip */}
              {cameraOn ? (
                <button onClick={stopCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'white' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Stop</span>
                </button>
              ) : (
                <div style={{ width: 60 }} />
              )}
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
      {scanState !== 'result' && <BottomNav />}
    </div>
  );
}
