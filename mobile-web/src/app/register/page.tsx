'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Semua field wajib diisi'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setIsLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      auth.saveSession(res.user, res.token);
      router.replace('/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-no-nav fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', padding: '60px 32px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
        <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800, margin: 0 }}>Bergabung!</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '6px 0 0' }}>Daftar & mulai petualangan wisata</p>
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Buat Akun Baru</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 28 }}>Gratis & cepat 🚀</p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {error.split('\n').map((line, i) => (
              <p key={i} style={{ margin: 0, fontSize: i === 0 ? 13 : 12, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#DC2626' : '#B91C1C' }}>
                {i === 0 ? '⚠️ ' : '💡 '}{line}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div className="input-group">
            <label className="input-label">Nama Lengkap</label>
            <div className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <input id="input-name" className="input" type="text" placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <input id="input-email" className="input" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input id="input-password" className="input" type="password" placeholder="Min. 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
          </div>

          <button id="btn-register" type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: 8 }}>
            {isLoading ? (
              <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Mendaftar...</>
            ) : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sudah punya akun?{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => router.push('/login')}>
              Masuk
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
