import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/models/destination.dart';
import 'package:scan_wisata/screens/quiz_screen.dart';
import 'package:scan_wisata/screens/chat_screen.dart';
import 'package:scan_wisata/theme.dart';

class DetailWisataScreen extends StatelessWidget {
  final Destination destination;
  const DetailWisataScreen({super.key, required this.destination});

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // ── Background Image ──
          Positioned(
            top: 0, left: 0, right: 0,
            height: MediaQuery.of(context).size.height * 0.45,
            child: Container(
              color: const Color(0xFFC4D5D4),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.image, size: 80, color: Colors.white.withValues(alpha: 0.6)),
                    const SizedBox(height: 8),
                    Text('[Gambar Patung / GIF]',
                        style: GoogleFonts.poppins(
                            color: Colors.white, fontSize: 13)),
                  ],
                ),
              ),
            ),
          ),

          // ── Transparent AppBar ──
          Positioned(
            top: 0, left: 0, right: 0,
            child: Container(
              padding: EdgeInsets.only(top: topPad, left: 4, right: 16, bottom: 12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withValues(alpha: 0.5), Colors.transparent],
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                  Expanded(
                    child: Center(
                      child: Text('Detail Wisata',
                          style: GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          )),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
          ),

          // ── Overlapping Bottom Sheet Content ──
          Positioned.fill(
            top: MediaQuery.of(context).size.height * 0.4 - 30, // overlaps the image
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(28, 32, 28, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      destination.name.isNotEmpty
                          ? destination.name
                          : 'Patung KH Zainal Mustofa',
                      style: GoogleFonts.poppins(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      destination.description.isNotEmpty
                          ? destination.description
                          : 'Pahlawan Nasional yang memimpin perlawanan terhadap '
                            'penjajah Belanda di Tasikmalaya pada tahun 1940 1944. '
                            'Monumen ini didirikan untuk mengenang jasa-jasa beliau.',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Audio button
                    _actionButton(
                      icon: Icons.headphones,
                      label: 'Dengarkan Audio',
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    
                    // Quiz button
                    _actionButton(
                      icon: Icons.play_circle_fill,
                      label: 'Mulai Kuis',
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const QuizScreen()),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Chatbot button
                    _actionButton(
                      icon: Icons.chat_bubble_outline,
                      label: 'Tanya Pemandu Virtual (AI)',
                      colorOverride: const Color(0xFF003D3D), // Dark teal to differentiate
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => ChatScreen(
                          destinationName: destination.name.isNotEmpty 
                            ? destination.name 
                            : 'Patung KH Zainal Mustofa',
                        )),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    Color? colorOverride,
  }) {
    final bgColor = colorOverride ?? primaryColor;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: bgColor.withValues(alpha: 0.3),
              blurRadius: 10, offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(label,
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  )),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 16),
          ],
        ),
      ),
    );
  }
}
