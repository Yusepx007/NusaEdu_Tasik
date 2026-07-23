import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/screens/login_screen.dart';
import 'package:scan_wisata/theme.dart';

class PengaturanScreen extends StatefulWidget {
  const PengaturanScreen({super.key});

  @override
  State<PengaturanScreen> createState() => _PengaturanScreenState();
}

class _PengaturanScreenState extends State<PengaturanScreen> {
  bool _notifEnabled = true;
  bool _soundEnabled = true;
  bool _darkMode = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        title: Text('Pengaturan',
            style: GoogleFonts.poppins(
                fontWeight: FontWeight.w600, fontSize: 18, color: Colors.white)),
        backgroundColor: primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionTitle('Preferensi Aplikasi'),
            _buildSettingCard([
              _toggleRow(Icons.notifications_none, 'Notifikasi', _notifEnabled, (val) => setState(() => _notifEnabled = val)),
              const Divider(height: 1),
              _toggleRow(Icons.volume_up_outlined, 'Suara & Efek', _soundEnabled, (val) => setState(() => _soundEnabled = val)),
              const Divider(height: 1),
              _toggleRow(Icons.dark_mode_outlined, 'Mode Gelap', _darkMode, (val) => setState(() => _darkMode = val)),
            ]),
            
            const SizedBox(height: 24),
            _sectionTitle('Akun & Keamanan'),
            _buildSettingCard([
              _arrowRow(Icons.person_outline, 'Ubah Profil', () {}),
              const Divider(height: 1),
              _arrowRow(Icons.lock_outline, 'Ubah Password', () {}),
              const Divider(height: 1),
              _arrowRow(Icons.language, 'Bahasa (Indonesia)', () {}),
            ]),

            const SizedBox(height: 24),
            _sectionTitle('Lainnya'),
            _buildSettingCard([
              _arrowRow(Icons.help_outline, 'Bantuan & FAQ', () {}),
              const Divider(height: 1),
              _arrowRow(Icons.privacy_tip_outlined, 'Kebijakan Privasi', () {}),
              const Divider(height: 1),
              _arrowRow(Icons.info_outline, 'Tentang Aplikasi', () {}),
            ]),

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.logout, color: Colors.redAccent),
                label: Text('Keluar (Logout)',
                    style: GoogleFonts.poppins(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 15)),
                onPressed: () {
                  // Kembali ke root dan hancurkan rute sebelumnya
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                    (Route<dynamic> route) => false,
                  );
                },
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 12),
      child: Text(
        title,
        style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold, fontSize: 15, color: Colors.grey.shade700),
      ),
    );
  }

  Widget _buildSettingCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10, offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _toggleRow(IconData icon, String title, bool value, ValueChanged<bool> onChanged) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey.shade700),
      title: Text(title, style: GoogleFonts.poppins(fontSize: 14)),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeTrackColor: primaryColor,
      ),
    );
  }

  Widget _arrowRow(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.grey.shade700),
      title: Text(title, style: GoogleFonts.poppins(fontSize: 14)),
      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
      onTap: onTap,
    );
  }
}
