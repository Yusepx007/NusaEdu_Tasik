import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/models/destination.dart';
import 'package:scan_wisata/screens/community_screen.dart';
import 'package:scan_wisata/screens/daftar_wisata_screen.dart';
import 'package:scan_wisata/screens/detail_wisata_screen.dart';
import 'package:scan_wisata/screens/peta_wisata_screen.dart';
import 'package:scan_wisata/screens/profil_screen.dart';
import 'package:scan_wisata/screens/quiz_screen.dart';
import 'package:scan_wisata/screens/scan_screen.dart';
import 'package:scan_wisata/widgets/destination_card.dart';
import 'package:scan_wisata/services/destination_service.dart';
import 'package:scan_wisata/screens/umkm_screen.dart';
import 'package:scan_wisata/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selected = 0;
  int _carouselPage = 0;
  bool _isLoading = true;

  List<Destination> topDestinations = [];
  List<Map<String, String>> carouselItems = [];

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final dests = await DestinationService().fetchDestinations();
      setState(() {
        topDestinations = dests;
        // Ambil 3 destinasi dengan rating tertinggi atau pertama untuk carousel
        carouselItems = dests.take(3).map((d) => {
          'name': d.name,
          'desc': d.category,
          'img': d.imageUrl,
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F4), // Modern off-white background
      extendBody: true, // For floating bottom bar
      body: Stack(
        children: [
          // â”€â”€â”€ Mesh Gradient Background Elements â”€â”€â”€
          Positioned(
            top: -100, right: -50,
            child: Container(
              width: 300, height: 300,
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFB2DFDB)),
            ),
          ),
          Positioned(
            bottom: -50, left: -50,
            child: Container(
              width: 250, height: 250,
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFFFCCBC)),
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).size.height * 0.4, left: -100,
            child: Container(
              width: 200, height: 200,
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFE0F2F1)),
            ),
          ),
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
              child: const SizedBox(),
            ),
          ),

          // Main Pages
          IndexedStack(
            index: _selected,
            children: [
              _buildScanWisata(),
              const PetaWisataScreen(),
              const CommunityScreen(),
              const ProfilScreen(),
            ],
          ),
        ],
      ),
      bottomNavigationBar: _buildFloatingBottomBar(),
    );
  }

  Widget _buildFloatingBottomBar() {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.only(left: 24, right: 24, bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.white, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: BottomNavigationBar(
              currentIndex: _selected,
              selectedItemColor: primaryColor,
              unselectedItemColor: Colors.grey.shade400,
              backgroundColor: Colors.transparent,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              showSelectedLabels: true,
              showUnselectedLabels: false,
              selectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 11),
              onTap: (i) => setState(() => _selected = i),
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Beranda'),
                BottomNavigationBarItem(icon: Icon(Icons.map_outlined), activeIcon: Icon(Icons.map), label: 'Peta'),
                BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'Community'),
                BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profil'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScanWisata() {
    final topPad = MediaQuery.of(context).padding.top;
    return SingleChildScrollView(
      padding: EdgeInsets.only(top: topPad, bottom: 100), // padding bottom for floating bar
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // â”€â”€â”€ Modern Glass AppBar â”€â”€â”€
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Explore',
                      style: GoogleFonts.poppins(color: const Color(0xFF64748B), fontSize: 13),
                    ),
                    Text(
                      'NUSAEDU',
                      style: GoogleFonts.poppins(
                          color: const Color(0xFF1E293B), fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    color: primaryColor,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: primaryColor.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.document_scanner, color: Colors.white),
                    tooltip: 'Scan AI',
                    onPressed: () {
                      // Navigate to Login first, then Scan Screen
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ScanScreen()),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // â”€â”€â”€ Carousel Banner â”€â”€â”€
          SizedBox(
            height: 380,
            child: Stack(
              children: [
                // Image Pager
                Positioned(
                  top: 0, left: 20, right: 20, bottom: 60,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, 10))
                      ]
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: PageView.builder(
                        itemCount: carouselItems.isNotEmpty ? carouselItems.length : 1,
                        onPageChanged: (v) => setState(() => _carouselPage = v),
                        itemBuilder: (_, i) => _isLoading ? const Center(child: CircularProgressIndicator(color: Colors.white)) : carouselItems.isEmpty ? Container() : Container(
                          color: const Color(0xFF1E293B).withValues(alpha: 0.1),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              if (carouselItems[i]['img'] != null)
                                Image.network(
                                  carouselItems[i]['img']!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.error, color: Colors.white)),
                                ),
                              Container(color: Colors.black.withValues(alpha: 0.3)), // Dark overlay
                              if (carouselItems[i]['img'] == null)
                                Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.landscape, size: 80, color: Colors.white.withValues(alpha: 0.8)),
                                      const SizedBox(height: 8),
                                      Text('[Gambar]', style: GoogleFonts.poppins(color: Colors.white, fontSize: 14)),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Overlay Info Box (Glassmorphism)
                if (carouselItems.isNotEmpty && !_isLoading)
                  Positioned(
                    bottom: 20, left: 40, right: 40,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.75),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white, width: 1.5),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10)
                          ]
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              carouselItems[_carouselPage]['name']!,
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF1E293B),
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              carouselItems[_carouselPage]['desc']!,
                              style: GoogleFonts.poppins(color: const Color(0xFF64748B), fontSize: 12),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 12),
                            // Action Button
                            SizedBox(
                              width: double.infinity,
                              height: 40,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: secondaryColor,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                onPressed: () {
                                  // Can navigate to quiz or detail here
                                  Navigator.push(context, MaterialPageRoute(builder: (_) => const QuizScreen()));
                                },
                                child: Text('Mulai Kuis', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Carousel Dots
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                carouselItems.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _carouselPage == i ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _carouselPage == i ? primaryColor : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // â”€â”€â”€ Quick Category Menu (Grid Pintasan) â”€â”€â”€
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCategoryItem(context, Icons.storefront, "Mitra UMKM", Colors.orange, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const UmkmScreen()));
                }),
                _buildCategoryItem(context, Icons.map, "Peta Digital", Colors.teal, () {
                  setState(() => _selected = 1); // Pindah Tab Peta
                }),
                _buildCategoryItem(context, Icons.lightbulb, "Kuis Edukasi", Colors.indigo, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const QuizScreen()));
                }),
                _buildCategoryItem(context, Icons.camera_alt, "Scan AI", secondaryColor, () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ScanScreen()));
                }),
              ],
            ),
          ),
          
          const SizedBox(height: 32),

          // â”€â”€â”€ Top Destinations â”€â”€â”€
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Top Destinations',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E293B),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DaftarWisataScreen(destinations: topDestinations),
                      ),
                    );
                  },
                  child: Text(
                    'View All',
                    style: GoogleFonts.poppins(fontSize: 13, color: primaryColor, fontWeight: FontWeight.w600),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: _isLoading ? const Center(child: CircularProgressIndicator()) : ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: topDestinations.length,
              itemBuilder: (_, i) {
                final dest = topDestinations[i];
                return Container(
                  width: 150,
                  margin: const EdgeInsets.symmetric(horizontal: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))
                    ]
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: DestinationCard(
                      destination: dest,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => DetailWisataScreen(destination: dest)),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildCategoryItem(BuildContext context, IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: GoogleFonts.poppins(color: const Color(0xFF1E293B), fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

