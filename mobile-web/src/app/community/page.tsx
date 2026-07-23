'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { communityApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { CommunityPost, Comment } from '@/lib/types';
import { useRouter } from 'next/navigation';

const FILTERS = ['Semua', 'Terbaru', 'Populer'];
const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#00696A'];

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(0);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await communityApi.getPosts();
      const safeData = Array.isArray(data) ? data : [];
      setPosts(safeData);

      // Init like state safely
      const lc: Record<number, number> = {};
      const lp = new Set<number>();
      safeData.forEach(p => {
        if (p && typeof p.id === 'number') {
          lc[p.id] = Number(p.like_count || 0);
          if (p.is_liked_by_me) lp.add(p.id);
        }
      });
      setLikeCounts(lc);
      setLikedPosts(lp);
    } catch {
      setError('Gagal memuat postingan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    if (!postId) return;
    const wasLiked = likedPosts.has(postId);
    // Optimistic update
    setLikedPosts(prev => {
      const s = new Set(prev);
      wasLiked ? s.delete(postId) : s.add(postId);
      return s;
    });
    setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasLiked ? -1 : 1)) }));
    try {
      await communityApi.toggleLike(postId);
    } catch {
      // revert on error
      setLikedPosts(prev => {
        const s = new Set(prev);
        wasLiked ? s.add(postId) : s.delete(postId);
        return s;
      });
      setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) + (wasLiked ? 1 : -1)) }));
    }
  };

  const loadComments = async (postId: number) => {
    if (!postId) return;
    if (comments[postId]) {
      setExpandedPost(expandedPost === postId ? null : postId);
      return;
    }
    try {
      const data = await communityApi.getComments(postId);
      const safeComments = Array.isArray(data) ? data : [];
      setComments(prev => ({ ...prev, [postId]: safeComments }));
      setExpandedPost(postId);
    } catch {
      setComments(prev => ({ ...prev, [postId]: [] }));
      setExpandedPost(postId);
    }
  };

  const submitComment = async (postId: number) => {
    if (!postId) return;
    const content = newComment[postId]?.trim();
    if (!content) return;
    const user = auth.getUser();
    try {
      const res = await communityApi.addComment(postId, content, user?.id);
      if (res && res.comment) {
        setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.comment] }));
      }
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch { /* silently fail */ }
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const filteredPosts = filter === 2
    ? [...safePosts].sort((a, b) => Number(b?.like_count || 0) - Number(a?.like_count || 0))
    : filter === 1
    ? [...safePosts].sort((a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime())
    : safePosts;

  return (
    <div className="page fade-in">
      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: 'var(--primary-bg)', padding: '3px 10px', borderRadius: 20 }}>
              Berbagi Pengalaman
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>Komunitas</h1>
          </div>
          <button
            id="btn-upload-post"
            onClick={() => router.push('/community/upload')}
            style={{ background: 'var(--primary)', border: 'none', borderRadius: 14, padding: '10px 16px', cursor: 'pointer', boxShadow: 'var(--shadow-primary)', color: 'white', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Bagikan
          </button>
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className="filter-chips" style={{ marginBottom: 12 }}>
        {FILTERS.map((f, i) => (
          <button key={f} className={`chip ${filter === i ? 'active' : ''}`} onClick={() => setFilter(i)}>{f}</button>
        ))}
      </div>

      {/* ── Posts Feed ── */}
      {isLoading ? (
        <div style={{ padding: '20px' }}>
          {[1, 2].map(k => (
            <div key={k} className="skeleton" style={{ height: 380, borderRadius: 24, marginBottom: 16 }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="icon-circle" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3>Gagal memuat feed</h3>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '10px 24px' }} onClick={loadPosts}>Coba Lagi</button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="icon-circle" style={{ color: 'var(--primary)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </div>
          <h3>Belum ada postingan</h3>
          <p>Jadilah yang pertama berbagi momen wisatamu!</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }} onClick={() => router.push('/community/upload')}>Upload Sekarang</button>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {filteredPosts.map((post, idx) => {
            if (!post || typeof post.id !== 'number') return null;

            const isLiked = likedPosts.has(post.id);
            const likeCount = likeCounts[post.id] ?? Number(post.like_count || 0);
            const userName = (post.user_name || 'Pengguna').trim();
            const initial = userName[0]?.toUpperCase() || 'P';
            const avatarColor = AVATAR_COLORS[userName.length % AVATAR_COLORS.length];
            const timeStr = post.created_at ? new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            const isExpanded = expandedPost === post.id;
            const destName = post.destination_name || 'Wisata Tasikmalaya';

            return (
              <div key={post.id} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 24, border: '1.5px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.07)', marginBottom: 16, overflow: 'hidden', animation: `fadeIn ${0.1 + idx * 0.05}s ease` }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 14px 10px', gap: 10 }}>
                  <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', flexShrink: 0 }}>
                    <div className="avatar" style={{ width: 40, height: 40, background: avatarColor, fontSize: 15 }}>{initial}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{userName}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      {destName}
                    </p>
                  </div>
                  {timeStr && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeStr}</span>}
                </div>

                {/* Image */}
                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt={destName} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} loading="lazy" />
                )}

                {/* Action bar */}
                <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button id={`btn-like-${post.id}`} onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: isLiked ? '#EF4444' : 'var(--text-muted)', padding: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? '#EF4444' : 'none'} stroke={isLiked ? '#EF4444' : 'currentColor'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    {likeCount}
                  </button>
                  <button onClick={() => loadComments(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', padding: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    {Number(post.comment_count || 0)}
                  </button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div style={{ padding: '4px 14px 14px' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{userName} </span>
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Comments section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 14px' }}>
                    {(comments[post.id] || []).map(c => {
                      if (!c) return null;
                      const commentUser = (c.user_name || 'Pengguna').trim();
                      const commentInitial = commentUser[0]?.toUpperCase() || 'P';
                      const commentAvatarColor = AVATAR_COLORS[commentUser.length % AVATAR_COLORS.length];

                      return (
                        <div key={c.id || Math.random()} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                          <div className="avatar" style={{ width: 28, height: 28, background: commentAvatarColor, fontSize: 11, borderRadius: '50%', flexShrink: 0 }}>
                            {commentInitial}
                          </div>
                          <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '8px 12px' }}>
                            <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{commentUser}</p>
                            <p style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>{c.content || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input
                        className="input"
                        style={{ flex: 1, padding: '10px 14px', fontSize: 12 }}
                        placeholder="Tulis komentar..."
                        value={newComment[post.id] || ''}
                        onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                      />
                      <button onClick={() => submitComment(post.id)} style={{ background: 'var(--primary)', border: 'none', borderRadius: 12, padding: '0 14px', cursor: 'pointer', color: 'white', fontSize: 16 }}>
                        ➤
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
