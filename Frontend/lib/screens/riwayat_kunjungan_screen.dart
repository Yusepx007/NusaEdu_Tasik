import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/theme.dart';
import 'package:scan_wisata/services/history_service.dart';
import 'package:scan_wisata/services/auth_service.dart';

class RiwayatKunjunganScreen extends StatelessWidget {
  const RiwayatKunjunganScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: AppBar(
        title: Text('Riwayat Kunjungan',
            style: GoogleFonts.poppins(
                fontWeight: FontWeight.w600, fontSize: 18, color: Colors.white)),
        backgroundColor: primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: HistoryService.fetchHistory(AuthService.userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Gagal memuat histori', style: GoogleFonts.poppins()));
          }

          final history = snapshot.data ?? [];

          return history.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.history_toggle_off,
                          size: 80, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text('Belum ada riwayat kunjungan.',
                          style: GoogleFonts.poppins(
                              color: Colors.grey.shade600, fontSize: 15)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    final item = history[index];
                    return _buildHistoryCard(item);
                  },
                );
        },
      ),
    );
  }
  Widget _buildHistoryCard(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Row(
        children: [
          // Gambar placeholder
          Container(
            width: 90, height: 90,
            decoration: const BoxDecoration(
              color: Color(0xFFE0EAE9),
              borderRadius: BorderRadius.horizontal(left: Radius.circular(16)),
            ),
            child: Icon(item['image'], color: primaryColor, size: 36),
          ),
          const SizedBox(width: 16),
          // Info teks
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['location'] ?? '-',
                    style: GoogleFonts.poppins(
                        fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 12, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(item['date'],
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF3E0),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      item['points'] ?? '0 Poin',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.bold, fontSize: 11, color: secondaryColor),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
    );
  }
}
