'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { communityApi } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function UploadPostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [destName, setDestName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName) { setError('Nama destinasi wajib diisi'); return; }
    const user = auth.getUser();
    if (!user) { router.push('/login'); return; }
    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('user_name', user.name);
      formData.append('destination_name', destName);
      formData.append('caption', caption);
      if (imageFile) formData.append('image', imageFile);
      await communityApi.createPost(formData);
      router.replace('/community');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-no-nav fade-in" style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '52px 16px 16px', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Bagikan Momen</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Photo picker */}
        <label htmlFor="img-upload" style={{ display: 'block', cursor: 'pointer' }}>
          <div style={{ width: '100%', height: 200, borderRadius: 20, background: previewUrl ? 'none' : '#F1F5F9', border: '2px dashed #CBD5E1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 40 }}>📷</span>
                <p style={{ fontSize: 13, marginTop: 8 }}>Ketuk untuk pilih foto</p>
              </div>
            )}
          </div>
          <input id="img-upload" type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
        </label>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Nama Destinasi *</label>
          <input className="input" type="text" placeholder="Contoh: Alun-Alun Tasikmalaya" value={destName} onChange={e => setDestName(e.target.value)} />
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label className="input-label">Caption</label>
          <textarea
            className="input"
            placeholder="Ceritakan pengalaman kamu..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={3}
            style={{ resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', borderRadius: 12, padding: '12px 16px', color: '#DC2626', fontSize: 13 }}>⚠️ {error}</div>
        )}

        <button id="btn-submit-post" type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: 8 }}>
          {isLoading ? 'Mengunggah...' : '📤 Bagikan Sekarang'}
        </button>
      </form>
    </div>
  );
}
