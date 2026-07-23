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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
      setCameraOn(true);
    } catch (err: unknown) {
      setCameraOn(false);
      const msg = err instanceof Error ? err.message : 'Kamera tidak tersedia.';
      setError(`${msg}\nSilakan pilih foto langsung dari Galeri.`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  // ── Capture from Camera ──────────────────────────────────────────────
  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
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

      const info = raw.info ?? {};
      const key  = raw.wisata_key || '';
      const conf = Number(raw.confidence ?? 0);
      const AI_BASE = process.env.NEXT_PUBLIC_AI_URL || 'https://kotapintar.my.id/ai';
      const thumbUrl = raw.thumbnail_url ? `${AI_BASE}${raw.thumbnail_url}` : undefined;

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

  return (
    <div className="page fade-in" style={{ background: cameraOn ? 'black' : 'var(--bg)', minHeight: '100dvh' }}>

      {/* ── Top Bar ── */}
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 50, padding: '44px 4px 8px', background: cameraOn ? 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' : 'transparent', transition: 'background 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => { stopCamera(); router.push('/home'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cameraOn ? 'white' : 'var(--text-primary)', padding: '8px 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 12l6-6M3 12l6 6"/>
            </svg>
          </button>
          <h1 style={{ flex: 1, textAlign: 'center', color: cameraOn ? 'white' : 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: 0 }}>Scan Wisata 🔍</h1>
          <div style={{ width: 48 }} />
        </div>
      </div>

      {/* ── RESULT STATE ── */}
      {scanState === 'result' && scanResult && (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', paddingTop: 80 }}>
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
          {/* Video: always rendered so ref is always attached, visibility toggled */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{
              position: 'fixed',
              inset: 0,
              width: '100%',
              maxWidth: 430,
              left: '50%',
              transform: 'translateX(-50%)',
              height: '100dvh',
              objectFit: 'cover',
              display: cameraOn ? 'block' : 'none',
              zIndex: 1,
            }}
          />

          {/* Idle (no camera) landing view */}
          {!cameraOn && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '110px 32px 200px', minHeight: '100dvh' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-bg), #c8e6e6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,105,106,0.15)' }}>
                <span style={{ fontSize: 56 }}>📷</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>Scan Wisata AI</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Arahkan kamera ke destinasi wisata Tasikmalaya &amp; AI akan mengidentifikasi tempat tersebut secara otomatis!
                </p>
              </div>
              {error && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', width: '100%', textAlign: 'left' }}>
                  {error.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: i > 0 ? '4px 0 0' : 0, fontSize: i === 0 ? 13 : 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#DC2626' : '#B91C1C', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ flexShrink: 0 }}>{i === 0 ? '⚠️' : '💡'}</span> {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Scan Frame overlay (VISUAL ONLY, pointer-events:none) ── */}
          {cameraOn && (
            <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div className="scan-frame" style={{ marginBottom: 12 }}>
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

          {/* ── Bottom Controls — z-index above scan frame ── */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 430,
            padding: '24px 32px',
            paddingBottom: 'calc(24px + 90px)',
            background: cameraOn ? 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 10,
          }}>

            {/* Gallery button */}
            <button
              id="btn-galeri"
              onClick={pickFromGallery}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: cameraOn ? 'white' : 'var(--text-secondary)', fontFamily: 'Poppins, sans-serif' }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 16, background: cameraOn ? 'rgba(255,255,255,0.18)' : 'white', border: cameraOn ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: cameraOn ? 'none' : 'var(--shadow-sm)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600 }}>Galeri</span>
            </button>

            {/* Shutter / Action button */}
            {cameraOn ? (
              <button
                id="btn-capture"
                onClick={captureAndScan}
                style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #00878A)', border: '4px solid white', boxShadow: '0 0 0 2px var(--primary), var(--shadow-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.15s ease', zIndex: 11 }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="8" strokeWidth="2.5"/>
                </svg>
              </button>
            ) : (
              <button
                id="btn-buka-kamera"
                onClick={startCamera}
                style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #00878A)', border: '4px solid white', boxShadow: 'var(--shadow-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, zIndex: 11 }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            )}

            {/* Stop camera / spacer */}
            {cameraOn ? (
              <button
                onClick={stopCamera}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'white', fontFamily: 'Poppins, sans-serif' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600 }}>Stop</span>
              </button>
            ) : (
              <div style={{ width: 52 }} />
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
      {scanState !== 'result' && <BottomNav />}
    </div>
  );
}
