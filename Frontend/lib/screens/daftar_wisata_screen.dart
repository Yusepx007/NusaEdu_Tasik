import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:scan_wisata/models/destination.dart';
import 'package:scan_wisata/screens/detail_wisata_screen.dart';
import 'package:scan_wisata/widgets/destination_card.dart';

class DaftarWisataScreen extends StatelessWidget {
  final List<Destination> destinations;

  const DaftarWisataScreen({super.key, required this.destinations});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F4),
      body: Stack(
        children: [
          // Mesh Background for modern look
          Positioned(
            top: -100, right: -50,
            child: Container(width: 300, height: 300, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFB2DFDB))),
          ),
          Positioned(
            bottom: -50, left: -50,
            child: Container(width: 250, height: 250, decoration: const BoxDecoration(shape: BoxShape.circle, color: Color(0xFFFFCCBC))),
          ),
          Positioned.fill(child: BackdropFilter(filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80), child: const SizedBox())),

          SafeArea(
            child: Column(
              children: [
                // AppBar Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF1E293B)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Semua Destinasi',
                        style: GoogleFonts.poppins(color: const Color(0xFF1E293B), fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                // Grid of Destinations
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(20),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.85, 
                    ),
                    itemCount: destinations.length,
                    itemBuilder: (context, i) {
                      final dest = destinations[i];
                      return Container(
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
              ],
            ),
          ),
        ],
      ),
    );
  }
}
