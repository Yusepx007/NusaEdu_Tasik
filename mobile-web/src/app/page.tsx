'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'Poppins, sans-serif', color: '#00696A', fontWeight: 600 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 24, margin: '0 0 8px' }}>🌴 NUSAEDU</p>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Mengarahkan ke Halaman Utama...</p>
      </div>
    </div>
  );
}
