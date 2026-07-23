'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@/lib/types';

const NAV_ITEMS = [
  {
    label: 'Beranda',
    path: '/home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      </svg>
    ),
  },
  {
    label: 'Destinasi',
    path: '/destinations',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    label: 'Peta Digital',
    path: '/peta',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      </svg>
    ),
  },
  {
    label: 'Mitra UMKM',
    path: '/umkm',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
      </svg>
    ),
  },
  {
    label: 'Kuis Edukasi',
    path: '/quiz',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      </svg>
    ),
  },
  {
    label: 'Komunitas',
    path: '/community',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
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
                <span className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
                <span className="desktop-user-points" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"/>
                  </svg>
                  {user.points ?? 0} Poin
                </span>
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
