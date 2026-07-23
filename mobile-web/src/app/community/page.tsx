'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { communityApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import type { CommunityPost, Comment } from '@/lib/types';
import { useRouter } from 'next/navigation';

const FILTERS = ['Semua', 'Terbaru', 'Populer'];

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = async () => {
    try {
      const data = await communityApi.getPosts();
      setPosts(data);
      // Init like state
      const lc: Record<number, number> = {};
      const lp = new Set<number>();
      data.forEach(p => {
        lc[p.id] = p.like_count;
        if (p.is_liked_by_me) lp.add(p.id);
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
    const wasLiked = likedPosts.has(postId);
    // Optimistic update
    setLikedPosts(prev => {
      const s = new Set(prev);
      wasLiked ? s.delete(postId) : s.add(postId);
      return s;
    });
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? -1 : 1) }));
    try {
      await communityApi.toggleLike(postId);
    } catch {
      // revert on error
      setLikedPosts(prev => {
        const s = new Set(prev);
        wasLiked ? s.add(postId) : s.delete(postId);
        return s;
      });
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? 1 : -1) }));
    }
  };

  const loadComments = async (postId: number) => {
    if (comments[postId]) { setExpandedPost(expandedPost === postId ? null : postId); return; }
    try {
      const data = await communityApi.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
      setExpandedPost(postId);
    } catch { /* silently fail */ }
  };

  const submitComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    const user = auth.getUser();
    try {
      const res = await communityApi.addComment(postId, content, user?.id);
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.comment] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch { /* silently fail */ }
  };

  const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#00696A'];

  const filteredPosts = filter === 2
    ? [...posts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    : filter === 1
    ? [...posts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    : posts;

  return (
    <div className="page fade-in">
      {/* ── Header ── */}
      <div style={{ padding: '52px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600, margin: 0 }}>✨ Explore Together</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Komunitas</h1>
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
          <div className="icon-circle" style={{ background: '#FEE2E2' }}>
            <span style={{ fontSize: 36 }}>📶</span>
          </div>
          <h3>Gagal memuat feed</h3>
          <p>{error}</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '10px 24px' }} onClick={loadPosts}>Coba Lagi</button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="icon-circle"><span style={{ fontSize: 36 }}>📸</span></div>
          <h3>Belum ada postingan</h3>
          <p>Jadilah yang pertama berbagi momen wisatamu! 🌟</p>
          <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }} onClick={() => router.push('/community/upload')}>Upload Sekarang</button>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          {filteredPosts.map((post, idx) => {
            const isLiked = likedPosts.has(post.id);
            const likeCount = likeCounts[post.id] ?? post.like_count ?? 0;
            const userName = post.user_name || 'Pengguna NusaEdu';
            const initial = userName[0]?.toUpperCase() || 'N';
            const avatarColor = AVATAR_COLORS[userName.length % AVATAR_COLORS.length];
            const timeStr = post.created_at ? new Date(post.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            const isExpanded = expandedPost === post.id;

            return (
              <div key={post.id} style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 24, border: '1.5px solid white', boxShadow: '0 8px 24px rgba(0,0,0,0.07)', marginBottom: 16, overflow: 'hidden', animation: `fadeIn ${0.1 + idx * 0.05}s ease` }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 14px 10px', gap: 10 }}>
                  <div style={{ padding: 2, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', flexShrink: 0 }}>
                    <div className="avatar" style={{ width: 40, height: 40, background: avatarColor, fontSize: 15 }}>{initial}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{post.user_name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                      📍 {post.destination_name}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{timeStr}</span>
                </div>

                {/* Image */}
                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt={post.destination_name} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} loading="lazy" />
                )}

                {/* Action bar */}
                <div style={{ padding: '12px 14px 6px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button id={`btn-like-${post.id}`} onClick={() => handleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: isLiked ? '#EF4444' : 'var(--text-muted)', padding: 0, transition: 'transform 0.15s', transform: isLiked ? 'scale(1.15)' : 'scale(1)' }}>
                    {isLiked ? '❤️' : '🤍'} {likeCount}
                  </button>
                  <button onClick={() => loadComments(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', padding: 0 }}>
                    💬 {post.comment_count}
                  </button>
                  <div style={{ flex: 1 }} />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0 }}>🔖</button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div style={{ padding: '4px 14px 14px' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{post.user_name} </span>
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Comments section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 14px' }}>
                    {(comments[post.id] || []).map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <div className="avatar" style={{ width: 28, height: 28, background: AVATAR_COLORS[c.user_name.length % AVATAR_COLORS.length], fontSize: 11, borderRadius: '50%' }}>
                          {c.user_name[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, background: '#F8FAFC', borderRadius: 12, padding: '8px 12px' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{c.user_name}</p>
                          <p style={{ fontSize: 12, margin: 0, color: 'var(--text-secondary)' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
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
