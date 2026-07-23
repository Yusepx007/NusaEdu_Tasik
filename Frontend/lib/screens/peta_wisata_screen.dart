import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:scan_wisata/theme.dart';
import 'package:scan_wisata/models/destination.dart';
import 'package:scan_wisata/screens/detail_wisata_screen.dart';
import 'package:scan_wisata/services/destination_service.dart';

class PetaWisataScreen extends StatefulWidget {
  const PetaWisataScreen({super.key});
  @override
  State<PetaWisataScreen> createState() => _PetaWisataScreenState();
}

class _MapDestination {
  final Destination destination;
  final LatLng point;
  final IconData icon;
  final Color color;

  const _MapDestination({
    required this.destination,
    required this.point,
    required this.icon,
    required this.color,
  });
}

class _PetaWisataScreenState extends State<PetaWisataScreen> {
  final MapController _mapController = MapController();

  // Tasikmalaya Center coordinates
  final LatLng _tasikmalayaCenter = const LatLng(-7.3195, 108.2040);
  double _currentZoom = 13.5;

  List<_MapDestination> _mapDestinations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final dests = await DestinationService().fetchDestinations();
      setState(() {
        _mapDestinations = dests.where((d) => d.latitude != null && d.longitude != null).map((dest) {
          IconData i;
          Color c;
          if (dest.category.toLowerCase().contains('sejarah')) {
            i = Icons.history;
            c = Colors.orange;
          } else if (dest.category.toLowerCase().contains('alam')) {
            i = Icons.landscape;
            c = Colors.blue;
          } else if (dest.category.toLowerCase().contains('budaya')) {
            i = Icons.temple_buddhist;
            c = Colors.brown;
          } else {
            i = Icons.location_city;
            c = Colors.teal;
          }
          return _MapDestination(
            destination: dest,
            point: LatLng(dest.latitude!, dest.longitude!),
            icon: i,
            color: c,
          );
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showDestinationBottomSheet(_MapDestination mapDest) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => Container(
        margin: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10)),
          ]
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              child: Image.network(
                mapDest.destination.imageUrl,
                height: 180,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(height: 180, color: Colors.grey.shade300, child: const Icon(Icons.broken_image, size: 50, color: Colors.grey)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          mapDest.destination.name,
                          style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(12)),
                        child: Row(
                          children: [
                            const Icon(Icons.star, color: Colors.orange, size: 14),
                            const SizedBox(width: 4),
                            Text('${mapDest.destination.rating}', style: GoogleFonts.poppins(color: Colors.orange.shade800, fontWeight: FontWeight.bold, fontSize: 13)),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    mapDest.destination.description,
                    style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      minimumSize: const Size(double.infinity, 50),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => DetailWisataScreen(destination: mapDest.destination)),
                      );
                    },
                    child: Text('Lihat Detail', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _zoomMap(double delta) {
    setState(() {
      _currentZoom += delta;
      _mapController.move(_mapController.camera.center, _currentZoom);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // FlutterMap interactive layer
          _isLoading ? const Center(child: CircularProgressIndicator()) : FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _tasikmalayaCenter,
              initialZoom: _currentZoom,
              onPositionChanged: (pos, hasGesture) {
                if (hasGesture) {
                  _currentZoom = pos.zoom;
                }
              },
              interactionOptions: const InteractionOptions(flags: InteractiveFlag.all & ~InteractiveFlag.rotate),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.aplikasi_wisata',
              ),
              MarkerLayer(
                markers: _mapDestinations.map((mapDest) => Marker(
                  point: mapDest.point,
                  width: 50, height: 50,
                  alignment: Alignment.topCenter,
                  child: GestureDetector(
                    onTap: () {
                       _mapController.move(mapDest.point, 15.0); // zoom in slighly when tapped
                       _currentZoom = 15.0;
                       _showDestinationBottomSheet(mapDest);
                    },
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: mapDest.color, 
                            shape: BoxShape.circle, 
                            border: Border.all(color: Colors.white, width: 2), 
                            boxShadow: [BoxShadow(color: mapDest.color.withValues(alpha: 0.5), blurRadius: 10, offset: const Offset(0, 4))],
                          ),
                          child: Icon(mapDest.icon, color: Colors.white, size: 20),
                        ),
                      ],
                    ),
                  ),
                )).toList(),
              ),
            ],
          ),
          
          // Modern Glass AppBar for Map
          Positioned(
            top: 0, left: 0, right: 0,
            child: Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 12,
                left: 20, right: 20, bottom: 12,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.white.withValues(alpha: 0.9), Colors.white.withValues(alpha: 0.0)],
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Location',
                        style: GoogleFonts.poppins(color: const Color(0xFF64748B), fontSize: 13),
                      ),
                      Text(
                        'Peta Wisata',
                        style: GoogleFonts.poppins(
                            color: const Color(0xFF1E293B), fontSize: 22, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          // Floating search bar
          Positioned(
            top: kToolbarHeight + MediaQuery.of(context).padding.top + 10,
            left: 16, right: 16,
            child: Container(
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  )
                ],
              ),
              child: TextField(
                style: GoogleFonts.poppins(fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Cari Lokasi...',
                  hintStyle: GoogleFonts.poppins(color: Colors.grey, fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: Colors.grey),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // Map Controls Panel (Zoom In, Zoom Out, Near Me)
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 120, // Above bottom bar padding
            right: 16,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.near_me, color: primaryColor),
                    onPressed: () {
                       _currentZoom = 13.5;
                       _mapController.move(_tasikmalayaCenter, _currentZoom);
                    },
                  ),
                  Container(height: 1, width: 30, color: Colors.grey.shade200),
                  IconButton(
                    icon: const Icon(Icons.add, color: Color(0xFF1E293B)),
                    onPressed: () => _zoomMap(1.0),
                  ),
                  Container(height: 1, width: 30, color: Colors.grey.shade200),
                  IconButton(
                    icon: const Icon(Icons.remove, color: Color(0xFF1E293B)),
                    onPressed: () => _zoomMap(-1.0),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

