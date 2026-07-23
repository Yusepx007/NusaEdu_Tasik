import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:scan_wisata/models/comment.dart';
import 'package:scan_wisata/models/community_post.dart';
import 'package:scan_wisata/services/community_service.dart';
import 'package:scan_wisata/theme.dart';

class CommentsScreen extends StatefulWidget {
  final CommunityPost post;
  const CommentsScreen({super.key, required this.post});

  @override
  State<CommentsScreen> createState() => _CommentsScreenState();
}

class _CommentsScreenState extends State<CommentsScreen> {
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _service = CommunityService();
  bool _isSending = false;

  Future<void> _sendComment() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _isSending = true);
    _textCtrl.clear();

    await _service.addComment(postId: widget.post.id, text: text);

    setState(() => _isSending = false);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Komentar', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 18, color: Colors.white)),
            Text(post.destinationName, style: GoogleFonts.poppins(fontSize: 12, color: Colors.white70)),
          ],
        ),
        backgroundColor: primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // ── Ringkasan Post ──
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Foto thumbnail
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: post.imageUrl.isNotEmpty
                      ? Image.network(post.imageUrl, width: 60, height: 60, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(width: 60, height: 60, color: Colors.grey.shade200, child: const Icon(Icons.image, color: Colors.grey)))
                      : Container(width: 60, height: 60, color: Colors.grey.shade200, child: const Icon(Icons.image, color: Colors.grey)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.userName, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text(post.caption, style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // ── Daftar Komentar ──
          Expanded(
            child: FutureBuilder<List<Comment>>(
              future: _service.getComments(post.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: primaryColor, strokeWidth: 2));
                }
                final comments = snapshot.data ?? [];
                if (comments.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline, size: 56, color: Colors.grey.shade300),
                        const SizedBox(height: 12),
                        Text('Belum ada komentar.', style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade400)),
                        const SizedBox(height: 4),
                        Text('Jadilah yang pertama berkomentar!',
                            style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade300)),
                      ],
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: comments.length,
                  itemBuilder: (_, i) => _buildCommentItem(comments[i]),
                );
              },
            ),
          ),

          // ── Input Komentar ──
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -3))],
            ),
            child: Row(
              children: [
                // Avatar user sendiri
                CircleAvatar(
                  radius: 18,
                  backgroundColor: primaryColor,
                  child: Text('A', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _textCtrl,
                    style: GoogleFonts.poppins(fontSize: 14),
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendComment(),
                    decoration: InputDecoration(
                      hintText: 'Tambahkan komentar...',
                      hintStyle: GoogleFonts.poppins(color: Colors.grey, fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _isSending ? null : _sendComment,
                  child: Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))],
                    ),
                    child: _isSending
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentItem(Comment comment) {
    final timeStr = DateFormat('dd MMM, HH:mm', 'id').format(comment.createdAt);
    final initial = comment.userName.isNotEmpty ? comment.userName[0].toUpperCase() : 'A';
    final isMe = comment.userName == 'Adi Pratama';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: isMe ? primaryColor : Colors.grey.shade300,
            child: Text(initial,
                style: GoogleFonts.poppins(
                  color: isMe ? Colors.white : Colors.grey.shade600,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                )),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.zero,
                      topRight: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(comment.userName,
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: primaryColor)),
                      const SizedBox(height: 2),
                      Text(comment.text, style: GoogleFonts.poppins(fontSize: 13, height: 1.4, color: Colors.black87)),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Text(timeStr, style: GoogleFonts.poppins(fontSize: 10, color: Colors.grey.shade400)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
