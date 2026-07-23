import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:scan_wisata/models/community_post.dart';
import 'package:scan_wisata/screens/comments_screen.dart';
import 'package:scan_wisata/screens/upload_post_screen.dart';
import 'package:scan_wisata/services/community_service.dart';
import 'package:scan_wisata/theme.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});
  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen>
    with SingleTickerProviderStateMixin {
  final _service = CommunityService();
  late AnimationController _fabAnim;
  int _selectedFilter = 0;
  final List<String> _filters = ['Semua', 'Terbaru', 'Populer', 'Dekat Saya'];

  @override
  void initState() {
    super.initState();
    _fabAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    )..forward();
  }

  @override
  void dispose() {
    _fabAnim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: ScaleTransition(
        scale: CurvedAnimation(parent: _fabAnim, curve: Curves.elasticOut),
        child: FloatingActionButton.extended(
          backgroundColor: primaryColor,
          elevation: 8,
          onPressed: () {
            HapticFeedback.lightImpact();
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const UploadPostScreen()),
            );
          },
          icon: const Icon(Icons.add_photo_alternate_outlined, color: Colors.white, size: 20),
          label: Text('Bagikan',
              style: GoogleFonts.poppins(
                  color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
        ),
      ),
      body: Column(
        children: [
          _buildHeader(),
          _buildFilterChips(),
          Expanded(
            child: FutureBuilder<List<CommunityPost>>(
              future: _service.getPosts(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return _buildShimmerLoading();
                }
                if (snapshot.hasError) {
                  return _buildErrorState();
                }
                final posts = snapshot.data ?? [];
                if (posts.isEmpty) {
                  return _buildEmptyState();
                }
                return ListView.builder(
                  padding: const EdgeInsets.only(bottom: 100, top: 4),
                  itemCount: posts.length,
                  itemBuilder: (_, i) => _PostCard(
                    post: posts[i],
                    service: _service,
                    index: i,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16,
        left: 20, right: 20, bottom: 8,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('✨ Explore Together',
                    style: GoogleFonts.poppins(
                        color: primaryColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5)),
                Text('Komunitas',
                    style: GoogleFonts.poppins(
                        color: const Color(0xFF1E293B),
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        height: 1.1)),
              ],
            ),
          ),
          // Search button
          _glassButton(Icons.search_rounded, () {}),
          const SizedBox(width: 8),
          // Notif button
          _glassButton(Icons.notifications_none_rounded, () {}),
        ],
      ),
    );
  }

  Widget _glassButton(IconData icon, VoidCallback onTap) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 42, height: 42,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white, width: 1.5),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2))
              ],
            ),
            child: Icon(icon, color: const Color(0xFF475569), size: 20),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 44,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _filters.length,
        itemBuilder: (_, i) {
          final selected = i == _selectedFilter;
          return GestureDetector(
            onTap: () {
              HapticFeedback.selectionClick();
              setState(() => _selectedFilter = i);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 8, bottom: 4, top: 4),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
              decoration: BoxDecoration(
                color: selected ? primaryColor : Colors.white.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: selected ? primaryColor : Colors.grey.shade300,
                    width: 1.5),
                boxShadow: selected
                    ? [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))]
                    : [],
              ),
              child: Text(_filters[i],
                  style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: selected ? Colors.white : Colors.grey.shade600)),
            ),
          );
        },
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: 3,
      itemBuilder: (_, __) => Container(
        margin: const EdgeInsets.only(bottom: 16),
        height: 380,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(24),
        ),
        child: const Center(child: CircularProgressIndicator(color: primaryColor, strokeWidth: 2)),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100, height: 100,
            decoration: BoxDecoration(
              color: primaryColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.photo_library_outlined, size: 48, color: primaryColor.withValues(alpha: 0.6)),
          ),
          const SizedBox(height: 20),
          Text('Belum ada postingan',
              style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1E293B))),
          const SizedBox(height: 8),
          Text('Jadilah yang pertama berbagi\nmomen wisatamu! 🌟',
              style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade500),
              textAlign: TextAlign.center),
          const SizedBox(height: 28),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              elevation: 8,
              shadowColor: primaryColor.withValues(alpha: 0.4),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
            ),
            icon: const Icon(Icons.add_photo_alternate_outlined, color: Colors.white),
            label: Text('Upload Sekarang',
                style: GoogleFonts.poppins(
                    color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            onPressed: () => Navigator.push(
                context, MaterialPageRoute(builder: (_) => const UploadPostScreen())),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.wifi_off_rounded, size: 40, color: Colors.redAccent),
          ),
          const SizedBox(height: 16),
          Text('Gagal memuat feed',
              style: GoogleFonts.poppins(
                  fontSize: 16, fontWeight: FontWeight.bold, color: Colors.grey.shade700)),
          const SizedBox(height: 6),
          Text('Cek koneksi internet kamu.',
              style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade500)),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════
// Post Card — Modern Instagram-style
// ══════════════════════════════════════════════════════
class _PostCard extends StatefulWidget {
  final CommunityPost post;
  final CommunityService service;
  final int index;
  const _PostCard({required this.post, required this.service, required this.index});

  @override
  State<_PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<_PostCard> with SingleTickerProviderStateMixin {
  late bool _isLiked;
  late int _likeCount;
  late AnimationController _likeAnim;
  bool _showFullCaption = false;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.post.isLikedByMe;
    _likeCount = widget.post.likeCount;
    _likeAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
  }

  @override
  void dispose() {
    _likeAnim.dispose();
    super.dispose();
  }

  void _handleLike() async {
    HapticFeedback.lightImpact();
    setState(() {
      _isLiked = !_isLiked;
      _likeCount += _isLiked ? 1 : -1;
    });
    _likeAnim.forward().then((_) => _likeAnim.reverse());
    await widget.service.toggleLike(widget.post.id, !_isLiked);
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final timeStr = DateFormat('dd MMM • HH:mm', 'id').format(post.createdAt);
    final initial = post.userName.isNotEmpty ? post.userName[0].toUpperCase() : 'A';
    // Generate consistent color based on name
    final avatarColors = [
      const Color(0xFF6366F1), const Color(0xFF8B5CF6),
      const Color(0xFF06B6D4), const Color(0xFF10B981),
      const Color(0xFFF59E0B), primaryColor,
    ];
    final avatarColor = avatarColors[post.userName.length % avatarColors.length];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.07),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: Row(
              children: [
                // Avatar with ring
                Container(
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [primaryColor, primaryColor.withValues(alpha: 0.4)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: CircleAvatar(
                    radius: 20,
                    backgroundColor: avatarColor,
                    child: Text(initial,
                        style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.userName,
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: const Color(0xFF1E293B))),
                      Row(
                        children: [
                          const Icon(Icons.location_on_rounded,
                              size: 11, color: primaryColor),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Text(post.destinationName,
                                style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    color: Colors.grey.shade500,
                                    fontWeight: FontWeight.w500),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(timeStr,
                        style: GoogleFonts.poppins(
                            fontSize: 10, color: Colors.grey.shade400)),
                    const SizedBox(height: 4),
                    Icon(Icons.more_horiz, color: Colors.grey.shade400, size: 20),
                  ],
                ),
              ],
            ),
          ),

          // ── Foto Post with Gradient Overlay ──
          if (post.imageUrl.isNotEmpty)
            GestureDetector(
              onDoubleTap: _handleLike,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.zero),
                    child: Image.network(
                      post.imageUrl,
                      width: double.infinity,
                      height: 260,
                      fit: BoxFit.cover,
                      loadingBuilder: (_, child, progress) => progress == null
                          ? child
                          : Container(
                              height: 260,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                              ),
                              child: const Center(
                                  child: CircularProgressIndicator(
                                      color: primaryColor, strokeWidth: 2)),
                            ),
                      errorBuilder: (_, __, ___) => Container(
                        height: 260,
                        color: Colors.grey.shade100,
                        child: const Center(
                            child: Icon(Icons.broken_image_outlined,
                                size: 48, color: Colors.grey)),
                      ),
                    ),
                  ),
                  // Bottom fade gradient
                  Positioned(
                    bottom: 0, left: 0, right: 0,
                    child: Container(
                      height: 60,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.25),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // ── Action Bar ──
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 4),
            child: Row(
              children: [
                // Like button with animation
                GestureDetector(
                  onTap: _handleLike,
                  child: AnimatedBuilder(
                    animation: _likeAnim,
                    builder: (_, child) => Transform.scale(
                      scale: 1.0 + (_likeAnim.value * 0.3),
                      child: child,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _isLiked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                          color: _isLiked ? Colors.red : Colors.grey.shade500,
                          size: 24,
                        ),
                        const SizedBox(width: 5),
                        Text('$_likeCount',
                            style: GoogleFonts.poppins(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: _isLiked ? Colors.red : Colors.grey.shade600)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 18),
                // Comment button
                GestureDetector(
                  onTap: () {
                    HapticFeedback.selectionClick();
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => CommentsScreen(post: post)),
                    );
                  },
                  child: Row(
                    children: [
                      Icon(Icons.chat_bubble_outline_rounded,
                          color: Colors.grey.shade500, size: 22),
                      const SizedBox(width: 5),
                      Text('${post.commentCount}',
                          style: GoogleFonts.poppins(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade600)),
                    ],
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () {},
                  child: Icon(Icons.bookmark_border_rounded,
                      color: Colors.grey.shade400, size: 22),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () {},
                  child: Icon(Icons.send_rounded,
                      color: Colors.grey.shade400, size: 22),
                ),
              ],
            ),
          ),

          // ── Caption ──
          if (post.caption.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 6, 14, 14),
              child: GestureDetector(
                onTap: () => setState(() => _showFullCaption = !_showFullCaption),
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: '${post.userName} ',
                        style: GoogleFonts.poppins(
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                            color: const Color(0xFF1E293B)),
                      ),
                      TextSpan(
                        text: post.caption,
                        style: GoogleFonts.poppins(
                            fontSize: 13,
                            color: Colors.grey.shade700,
                            height: 1.5),
                      ),
                    ],
                  ),
                  maxLines: _showFullCaption ? null : 2,
                  overflow: _showFullCaption ? TextOverflow.visible : TextOverflow.ellipsis,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
