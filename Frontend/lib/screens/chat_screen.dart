import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/services/ai_chat_service.dart';
import 'package:scan_wisata/theme.dart';

class ChatScreen extends StatefulWidget {
  final String destinationName;

  const ChatScreen({super.key, required this.destinationName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _service = AiChatService();
  final _textCtrl = TextEditingController();
  final List<Message> _messages = [];
  bool _isLoading = false;
  final ScrollController _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    // Memulai chat dengan memberikan konteks tempat wisata ke AI
    _service.startChat(widget.destinationName);
    
    // Pesan pembuka dari AI
    _messages.add(
      Message(
        text: 'Halo! Saya pemandu maya kamu di ${widget.destinationName}. Ada yang ingin kamu tanyakan soal sejarah, fakta unik, atau asal ulas tempat ini?',
        isMe: false,
      ),
    );
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty) return;

    _textCtrl.clear();
    setState(() {
      // Tambahkan pesan pengguna
      _messages.add(Message(text: text, isMe: true));
      _isLoading = true;
    });

    _scrollToBottom();

    // Kirim ke Gemini AI
    final botReply = await _service.sendMessage(text);

    setState(() {
      _messages.add(Message(text: botReply, isMe: false));
      _isLoading = false;
    });

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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tanya AI',
                style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w600, fontSize: 18, color: Colors.white)),
            Text('Pemandu Wisata Virtual',
                style: GoogleFonts.poppins(fontSize: 12, color: Colors.white70)),
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
          // ── Chat Area ──
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final m = _messages[index];
                return _buildBubble(m);
              },
            ),
          ),
          
          // Indikator AI mengetik
          if (_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    const SizedBox(
                      width: 14, height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: primaryColor),
                    ),
                    const SizedBox(width: 8),
                    Text('AI sedang mengetik...',
                        style: GoogleFonts.poppins(
                            color: Colors.grey.shade600, fontSize: 12)),
                  ],
                ),
              ),
            ),

          // ── Input Area ──
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10, offset: const Offset(0, -4),
                )
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textCtrl,
                    style: GoogleFonts.poppins(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Tulis pertanyaanmu...',
                      hintStyle: GoogleFonts.poppins(color: Colors.grey, fontSize: 14),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: _isLoading ? null : _sendMessage,
                  child: Container(
                    height: 50, width: 50,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withValues(alpha: 0.3),
                          blurRadius: 8, offset: const Offset(0, 3),
                        )
                      ],
                    ),
                    child: const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBubble(Message m) {
    return Align(
      alignment: m.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: m.isMe ? primaryColor : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(m.isMe ? 16 : 0),
            bottomRight: Radius.circular(m.isMe ? 0 : 16),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 5, offset: const Offset(0, 2),
            )
          ],
        ),
        child: Text(
          m.text,
          style: GoogleFonts.poppins(
            fontSize: 14,
            height: 1.5,
            color: m.isMe ? Colors.white : Colors.black87,
          ),
        ),
      ),
    );
  }
}

class Message {
  final String text;
  final bool isMe;
  Message({required this.text, required this.isMe});
}
