import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/screens/pengaturan_screen.dart';
import 'package:scan_wisata/screens/riwayat_kunjungan_screen.dart';
import 'package:scan_wisata/screens/login_screen.dart';
import 'package:scan_wisata/services/auth_service.dart';
import 'package:scan_wisata/theme.dart';
class ProfilScreen extends StatelessWidget {
  const ProfilScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent, // Let the HomeScreen mesh gradient show
      body: Column(
        children: [
          // Modern Glass AppBar
          Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 12,
              left: 20, right: 20, bottom: 12,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Account',
                      style: GoogleFonts.poppins(color: const Color(0xFF64748B), fontSize: 13),
                    ),
                    Text(
                      'Profil Pengguna',
                      style: GoogleFonts.poppins(
                          color: const Color(0xFF1E293B), fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white, width: 1.5),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.info_outline, color: primaryColor),
                    onPressed: () {},
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // User info card setup for glassmorphism
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 24,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            // Avatar circle
                            CircleAvatar(
                              radius: 36,
                              backgroundColor: Colors.grey.shade300,
                              child: Icon(Icons.person,
                                  size: 40, color: Colors.grey.shade500),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(AuthService.currentUser ?? 'Adi Pratama',
                                      style: GoogleFonts.poppins(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold)),
                                  Text('Poin: ${AuthService.userPoints}',
                                      style: GoogleFonts.poppins(
                                          fontSize: 13,
                                          color: Colors.grey.shade600)),
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: primaryColor,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text('Level: ${AuthService.userLevel}',
                                        style: GoogleFonts.poppins(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        // Badge row
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _badge(Icons.hexagon, secondaryColor),
                            _badge(Icons.shield, Colors.blue),
                            _badge(Icons.star, Colors.orange),
                            _badge(Icons.eco, Colors.teal),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Menu list card with glassmorphism
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 24,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        _menuItem(Icons.badge_outlined, 'Badge', () {}),
                        Divider(height: 1, color: Colors.grey.shade100),
                        _menuItem(Icons.history, 'Riwayat Kunjungan', () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const RiwayatKunjunganScreen()),
                          );
                        }),
                        Divider(height: 1, color: Colors.grey.shade100),
                        _menuItem(Icons.settings_outlined, 'Pengaturan', () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const PengaturanScreen()),
                          );
                        }),
                        Divider(height: 1, color: Colors.grey.shade100),
                        ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.red.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.logout, color: Colors.red, size: 22),
                          ),
                          title: Text('Keluar Akun',
                              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.red)),
                          onTap: () {
                            showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: Text('Konfirmasi', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                                content: Text('Apakah Anda yakin ingin keluar dari akun?', style: GoogleFonts.poppins(fontSize: 14)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(ctx),
                                    child: Text('Batal', style: GoogleFonts.poppins(color: Colors.grey)),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.red,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () {
                                      Navigator.pushAndRemoveUntil(
                                        context,
                                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                                        (route) => false,
                                      );
                                    },
                                    child: Text('Keluar', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(IconData icon, Color color) {
    return Icon(icon, size: 42, color: color);
  }

  Widget _menuItem(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: primaryColor.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: primaryColor, size: 22),
      ),
      title: Text(title,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 14)),
      trailing: Icon(Icons.arrow_forward_ios, size: 15, color: Colors.grey.shade400),
      onTap: onTap,
    );
  }
}
