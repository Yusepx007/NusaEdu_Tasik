import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/theme.dart';
import 'package:scan_wisata/services/auth_service.dart';

class UmkmScreen extends StatefulWidget {
  const UmkmScreen({super.key});

  @override
  State<UmkmScreen> createState() => _UmkmScreenState();
}

class _UmkmScreenState extends State<UmkmScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Dummy Data for UMKM
  final List<Map<String, dynamic>> _mitraUmkm = [
    {
      'name': 'Kopi Sarasa Tasik',
      'category': 'Cafe & Resto',
      'distance': '1.2 km dari Anda',
      'rating': 4.8,
      'image': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop',
      'promo': 'Diskon 10% Member',
    },
    {
      'name': 'Payung Geulis Karya Mandiri',
      'category': 'Kerajinan',
      'distance': '2.5 km dari Anda',
      'rating': 4.9,
      'image': 'https://images.unsplash.com/photo-1574513162653-5d5d6776dbf4?q=80&w=600&auto=format&fit=crop',
      'promo': 'Cashback Poin',
    },
    {
      'name': 'Pusat Nasi Tutug Oncom',
      'category': 'Kuliner Tradisional',
      'distance': '0.8 km dari Anda',
      'rating': 4.7,
      'image': 'https://images.unsplash.com/photo-1626074964030-2d8d8cece4d1?q=80&w=600&auto=format&fit=crop', // Nasi
      'promo': 'Makan 2 Gratis 1 Minuman',
    },
  ];

  // Dummy Data for Vouchers
  final List<Map<String, dynamic>> _vouchers = [
    {
      'title': 'Voucher Rp20.000 Kopi Sarasa',
      'points': 500,
      'color': Colors.orange,
      'icon': Icons.local_cafe,
    },
    {
      'title': 'Diskon 15% Kerajinan Payung Geulis',
      'points': 300,
      'color': Colors.teal,
      'icon': Icons.umbrella,
    },
    {
      'title': 'Gratis Es Kelapa Muda Area Situ Gede',
      'points': 150,
      'color': Colors.blue,
      'icon': Icons.local_drink,
    },
    {
      'title': 'Potongan Harga Tiket Masuk Museum',
      'points': 200,
      'color': Colors.indigo,
      'icon': Icons.museum,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F4),
      body: Stack(
        children: [
          // Background Gradient Orbs
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
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
              child: const SizedBox(),
            ),
          ),

          // Main Content Area
          NestedScrollView(
            headerSliverBuilder: (context, innerBoxIsScrolled) {
              return [
                SliverAppBar(
                  expandedHeight: 220,
                  pinned: true,
                  backgroundColor: primaryColor.withValues(alpha: innerBoxIsScrolled ? 1.0 : 0.0),
                  elevation: 0,
                  leading: IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.3),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                    ),
                    onPressed: () => Navigator.pop(context),
                  ),
                  flexibleSpace: FlexibleSpaceBar(
                    background: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.network(
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop', // Cafe/shop vibe
                          fit: BoxFit.cover,
                        ),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.black.withValues(alpha: 0.2),
                                Colors.black.withValues(alpha: 0.7),
                              ],
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 20,
                          left: 20,
                          right: 20,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                decoration: BoxDecoration(
                                  color: secondaryColor,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text('NusaEdu x UMKM', style: GoogleFonts.poppins(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                "Mendukung Ekonomi Lokal",
                                style: GoogleFonts.poppins(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                "Tukarkan poin edukasi Anda dengan Voucher!",
                                style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  color: Colors.grey.shade300,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPersistentHeader(
                  pinned: true,
                  delegate: _SliverAppBarDelegate(
                    TabBar(
                      controller: _tabController,
                      labelColor: primaryColor,
                      unselectedLabelColor: Colors.grey,
                      indicatorColor: primaryColor,
                      indicatorWeight: 3,
                      labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14),
                      tabs: const [
                        Tab(text: "Mitra Terdekat"),
                        Tab(text: "Reward Poin"),
                      ],
                    ),
                  ),
                ),
              ];
            },
            body: TabBarView(
              controller: _tabController,
              children: [
                _buildMitraList(),
                _buildRewardList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- TAB 1: Mitra UMKM Terdekat ---
  Widget _buildMitraList() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      itemCount: _mitraUmkm.length,
      itemBuilder: (context, index) {
        final item = _mitraUmkm[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white, width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 15,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Gambar Merchant
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  item['image'],
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          item['category'],
                          style: GoogleFonts.poppins(fontSize: 12, color: primaryColor, fontWeight: FontWeight.bold),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 16),
                            const SizedBox(width: 4),
                            Text(item['rating'].toString(), style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item['name'],
                      style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(item['distance'], style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "Promo: ${item['promo']}",
                        style: GoogleFonts.poppins(fontSize: 11, color: Colors.green.shade700, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // --- TAB 2: Voucher Reward ---
  Widget _buildRewardList() {
    return Column(
      children: [
        // Poin Header Info
        Container(
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [primaryColor, Color(0xFF004D4E)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: primaryColor.withValues(alpha: 0.3),
                blurRadius: 15,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Poin Anda Saat Ini", style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Icon(Icons.stars, color: Colors.amber, size: 28),
                      const SizedBox(width: 8),
                      Text("${AuthService.userPoints}", style: GoogleFonts.poppins(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text("Riwayat Poin", style: GoogleFonts.poppins(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
              )
            ],
          ),
        ),
        
        // List of Vouchers
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: _vouchers.length,
            itemBuilder: (context, index) {
              final voc = _vouchers[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, 5))
                  ],
                ),
                child: Row(
                  children: [
                    // Kiri Bagian Warna
                    Container(
                      width: 100,
                      height: 110,
                      decoration: BoxDecoration(
                        color: voc['color'].withValues(alpha: 0.15),
                        borderRadius: const BorderRadius.only(topLeft: Radius.circular(18), bottomLeft: Radius.circular(18)),
                      ),
                      child: Icon(voc['icon'], size: 40, color: voc['color']),
                    ),
                    // Kanan Bagian Konten
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              voc['title'],
                              style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B)),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.stars, size: 16, color: Colors.amber),
                                    const SizedBox(width: 4),
                                    Text("${voc['points']} Poin", style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13, color: primaryColor)),
                                  ],
                                ),
                                ElevatedButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Berhasil menukarkan voucher!', style: GoogleFonts.poppins()),
                                        backgroundColor: Colors.green,
                                        behavior: SnackBarBehavior.floating,
                                      )
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: secondaryColor,
                                    minimumSize: const Size(60, 30),
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  ),
                                  child: Text("Tukar", style: GoogleFonts.poppins(fontSize: 11)),
                                )
                              ],
                            )
                          ],
                        ),
                      ),
                    )
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// Delegate for TabBar Sticky Header
class _SliverAppBarDelegate extends SliverPersistentHeaderDelegate {
  _SliverAppBarDelegate(this._tabBar);

  final TabBar _tabBar;

  @override
  double get minExtent => _tabBar.preferredSize.height + 10;
  @override
  double get maxExtent => _tabBar.preferredSize.height + 10;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Colors.white.withValues(alpha: 0.9), // Glass background for tab bar
      child: Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: _tabBar,
        ),
      ),
    );
  }

  @override
  bool shouldRebuild(_SliverAppBarDelegate oldDelegate) {
    return false;
  }
}
