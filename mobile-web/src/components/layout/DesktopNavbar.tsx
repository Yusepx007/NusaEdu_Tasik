'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@/lib/types';

const NAV_ITEMS = [
  { label: 'Beranda', path: '/home', icon: '🏠' },
  { label: 'Destinasi', path: '/destinations', icon: '🌴' },
  { label: 'Peta Digital', path: '/peta', icon: '🗺️' },
  { label: 'Mitra UMKM', path: '/umkm', icon: '🏪' },
  { label: 'Kuis Edukasi', path: '/quiz', icon: '🧠' },
  { label: 'Komunitas', path: '/community', icon: '💬' },
];

export default function DesktopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, [pathname]);

  return (
    <header className="desktop-navbar">
      <div className="desktop-nav-container">
        {/* Brand Logo */}
        <div className="desktop-brand" onClick={() => router.push('/home')}>
          <div className="desktop-brand-icon">
            <span>✨</span>
          </div>
          <div>
            <h1 className="desktop-brand-title">NusaEdu</h1>
            <p className="desktop-brand-sub">Tasikmalaya</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="desktop-nav-links">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                className={`desktop-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => router.push(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA & User info */}
        <div className="desktop-nav-right">
          <button
            className="desktop-scan-btn"
            onClick={() => router.push('/scan')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 3v3m8-3v3M3 8h3m12 0h3M3 16h3m12 0h3M8 21v-3m8 3v-3"/>
            </svg>
            Scan AI
          </button>

          {user ? (
            <div className="desktop-user-pill" onClick={() => router.push('/profil')}>
              <div className="desktop-avatar">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="desktop-user-info">
                <span className="desktop-user-name">{user.name}</span>
                <span className="desktop-user-points">🏆 {user.points ?? 0} Poin</span>
              </div>
            </div>
          ) : (
            <button className="desktop-login-btn" onClick={() => router.push('/login')}>
              Masuk / Daftar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
