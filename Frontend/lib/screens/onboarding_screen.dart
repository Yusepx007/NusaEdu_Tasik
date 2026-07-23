import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/screens/home_screen.dart';
import 'package:scan_wisata/theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});
  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _ctrl = PageController();
  int _page = 0;

  final List<_OnboardPage> _pages = const [
    _OnboardPage(
      title: 'Scan Objek Wisata',
      subtitle: 'Pindai patung & tempat bersejarah',
      icon: Icons.qr_code_scanner,
      bgColor: Color(0xFFE4F0EF),
      features: [
        _Feature(Icons.qr_code_scanner, 'Scan Objek Wisata', 'Pindai patung & tempat bersejarah'),
        _Feature(Icons.headphones, 'Pelajari Sejarah', 'Dengarkan cerita & sejarah budaya'),
        _Feature(Icons.quiz, 'Ikuti Kuis Seru', 'Jawab kuis & raih poin!'),
      ],
    ),
    _OnboardPage(
      title: 'Pelajari Sejarah',
      subtitle: 'Dengarkan cerita & sejarah budaya',
      icon: Icons.history_edu,
      bgColor: Color(0xFFE4F0EF),
      features: [
        _Feature(Icons.history_edu, 'Audio Guide', 'Panduan audio di setiap lokasi'),
        _Feature(Icons.translate, 'Multi Bahasa', 'Tersedia dalam bahasa Indonesia & Inggris'),
        _Feature(Icons.star, 'Poin & Reward', 'Raih poin setiap kunjungan'),
      ],
    ),
    _OnboardPage(
      title: 'Ikuti Kuis Seru',
      subtitle: 'Jawab kuis & raih poin!',
      icon: Icons.emoji_events,
      bgColor: Color(0xFFE4F0EF),
      features: [
        _Feature(Icons.quiz, 'Kuis Interaktif', 'Uji pengetahuan sejarahmu'),
        _Feature(Icons.leaderboard, 'Papan Skor', 'Bersaing dengan wisatawan lain'),
        _Feature(Icons.card_giftcard, 'Hadiah Menarik', 'Tukar poin dengan hadiah seru'),
      ],
    ),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _page == _pages.length - 1;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _ctrl,
                onPageChanged: (v) => setState(() => _page = v),
                itemCount: _pages.length,
                itemBuilder: (_, i) => _buildPage(_pages[i]),
              ),
            ),
            // Bottom bar
            Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    offset: const Offset(0, -2),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // dots
                  Row(
                    children: List.generate(_pages.length, (i) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.only(right: 6),
                        width: _page == i ? 22 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _page == i ? primaryColor : Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  // Button
                  GestureDetector(
                    onTap: () {
                      if (isLast) {
                        Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const HomeScreen()));
                      } else {
                        _ctrl.nextPage(
                            duration: const Duration(milliseconds: 350),
                            curve: Curves.easeInOut);
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                      decoration: BoxDecoration(
                        color: secondaryColor,
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: secondaryColor.withValues(alpha: 0.35),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Text(
                        isLast ? 'Get Started' : 'Next',
                        style: GoogleFonts.poppins(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage(_OnboardPage data) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 24),
          // Illustration box
          Expanded(
            flex: 5,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: data.bgColor,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(data.icon, size: 100,
                      color: primaryColor.withValues(alpha: 0.5)),
                  const SizedBox(height: 10),
                  Text('[Ganti dengan Gambar / GIF]',
                      style: GoogleFonts.poppins(
                          fontSize: 11, color: Colors.grey.shade400)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 28),
          // Title block
          Expanded(
            flex: 4,
            child: Column(
              children: [
                Text(data.title,
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.center),
                const SizedBox(height: 4),
                Text(data.subtitle,
                    style: GoogleFonts.poppins(
                        fontSize: 13, color: Colors.grey.shade500),
                    textAlign: TextAlign.center),
                const SizedBox(height: 20),
                // Feature list
                ...data.features.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(f.icon, size: 20, color: primaryColor),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(f.title,
                                    style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                        color: Colors.black87)),
                                Text(f.subtitle,
                                    style: GoogleFonts.poppins(
                                        fontSize: 11,
                                        color: Colors.grey.shade500)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _OnboardPage {
  final String title, subtitle;
  final IconData icon;
  final Color bgColor;
  final List<_Feature> features;
  const _OnboardPage({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.bgColor,
    required this.features,
  });
}

class _Feature {
  final IconData icon;
  final String title, subtitle;
  const _Feature(this.icon, this.title, this.subtitle);
}
