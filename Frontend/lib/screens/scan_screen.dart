import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:scan_wisata/models/scan_result.dart';
import 'package:scan_wisata/screens/detail_wisata_screen.dart';
import 'package:scan_wisata/screens/home_screen.dart';
import 'package:scan_wisata/screens/quiz_screen.dart';
import 'package:scan_wisata/services/ai_scan_service.dart';
import 'package:scan_wisata/theme.dart';
import 'package:scan_wisata/models/destination.dart';

/// Layar utama fitur Scan AI.
/// Tampilkan preview kamera, tombol capture, dan pilihan galeri.
/// Setelah scan, tampilkan hasil di bottom sheet.
class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> with WidgetsBindingObserver {
  CameraController? _camCtrl;
  List<CameraDescription> _cameras = [];
  bool _isCamReady = false;
  bool _isScanning = false;
  final _service = AiScanService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _camCtrl?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_camCtrl == null || !_camCtrl!.value.isInitialized) return;
    if (state == AppLifecycleState.inactive) {
      _camCtrl?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) return;
      _camCtrl = CameraController(
        _cameras.first,
        ResolutionPreset.high,
        enableAudio: false,
      );
      await _camCtrl!.initialize();
      if (mounted) setState(() => _isCamReady = true);
    } catch (_) {
      // Kamera tidak tersedia — tampilkan fallback
      if (mounted) setState(() => _isCamReady = false);
    }
  }

  // ── CAPTURE dari Kamera ─────────────────────────────────────────────
  Future<void> _captureAndScan() async {
    if (_isScanning) return;
    setState(() => _isScanning = true);
    try {
      final xFile = await _camCtrl!.takePicture();
      final file = File(xFile.path);
      await _doScan(file);
    } catch (e) {
      _showError('Gagal mengambil foto: $e');
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  // ── PILIH dari Galeri ───────────────────────────────────────────────
  Future<void> _pickAndScan() async {
    if (_isScanning) return;
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;
    setState(() => _isScanning = true);
    try {
      await _doScan(File(picked.path));
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  // ── Kirim ke AI ─────────────────────────────────────────────────────
  Future<void> _doScan(File imageFile) async {
    final result = await _service.scanImage(imageFile);
    if (mounted) _showResult(result, imageFile);
  }

  // ── Tampilkan Hasil di Bottom Sheet ─────────────────────────────────
  void _showResult(ScanResult result, File imageFile) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ResultSheet(
        result: result,
        imageFile: imageFile,
        onViewDetail: () {
          Navigator.pop(context);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => DetailWisataScreen(
                destination: Destination(
                  name: result.name,
                  description: result.description,
                  imageUrl: result.imageUrl,
                ),
              ),
            ),
          );
        },
        onStartQuiz: result.hasQuiz
            ? () {
                Navigator.pop(context);
                Navigator.push(
                    context, MaterialPageRoute(builder: (_) => const QuizScreen()));
              }
            : null,
      ),
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
  }

  // ── BUILD ────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Camera Preview ──
          _isCamReady
              ? Positioned.fill(child: CameraPreview(_camCtrl!))
              : Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.camera_alt, color: Colors.white54, size: 64),
                      const SizedBox(height: 12),
                      Text('Kamera tidak tersedia',
                          style: GoogleFonts.poppins(
                              color: Colors.white54, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text('Gunakan tombol Galeri untuk memilih gambar',
                          style: GoogleFonts.poppins(
                              color: Colors.white30, fontSize: 12),
                          textAlign: TextAlign.center),
                    ],
                  ),
                ),

          // ── Scan Overlay Frame ──
          if (_isCamReady) _buildScanFrame(),

          // ── Top bar ──
          _buildTopBar(),

          // ── Bottom Controls ──
          _buildBottomBar(),

          // ── Loading overlay ──
          if (_isScanning) _buildLoadingOverlay(),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    final topPad = MediaQuery.of(context).padding.top;
    return Positioned(
      top: 0, left: 0, right: 0,
      child: Container(
        padding: EdgeInsets.only(top: topPad, left: 4, right: 4, bottom: 8),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.black.withValues(alpha: 0.6), Colors.transparent],
          ),
        ),
        child: Row(
          children: [
            // Home button — goes to Dashboard
            IconButton(
              icon: const Icon(Icons.home_outlined, color: Colors.white, size: 24),
              onPressed: () => Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const HomeScreen()),
                (route) => false,
              ),
            ),
            Expanded(
              child: Center(
                child: Text('Scan Wisata',
                    style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600)),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.flash_off, color: Colors.white, size: 22),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScanFrame() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 260,
            height: 260,
            decoration: BoxDecoration(
              border: Border.all(color: primaryColor, width: 2.5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Stack(
              children: [
                // Corner decorations
                ..._corners(),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Arahkan kamera ke objek wisata',
              style: GoogleFonts.poppins(color: Colors.white, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _corners() {
    const size = 22.0;
    const thick = 3.0;
    color() => primaryColor;
    return [
      // Top-left
      Positioned(top: 0, left: 0, child: _corner(size, thick, color(), 0)),
      // Top-right
      Positioned(top: 0, right: 0, child: _corner(size, thick, color(), 1)),
      // Bottom-left
      Positioned(bottom: 0, left: 0, child: _corner(size, thick, color(), 2)),
      // Bottom-right
      Positioned(bottom: 0, right: 0, child: _corner(size, thick, color(), 3)),
    ];
  }

  Widget _corner(double size, double thick, Color c, int pos) {
    final borders = [
      Border(top: BorderSide(color: c, width: thick), left: BorderSide(color: c, width: thick)),
      Border(top: BorderSide(color: c, width: thick), right: BorderSide(color: c, width: thick)),
      Border(bottom: BorderSide(color: c, width: thick), left: BorderSide(color: c, width: thick)),
      Border(bottom: BorderSide(color: c, width: thick), right: BorderSide(color: c, width: thick)),
    ];
    final radii = [
      const BorderRadius.only(topLeft: Radius.circular(6)),
      const BorderRadius.only(topRight: Radius.circular(6)),
      const BorderRadius.only(bottomLeft: Radius.circular(6)),
      const BorderRadius.only(bottomRight: Radius.circular(6)),
    ];
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(border: borders[pos], borderRadius: radii[pos]),
    );
  }

  Widget _buildBottomBar() {
    final botPad = MediaQuery.of(context).padding.bottom;
    return Positioned(
      bottom: 0, left: 0, right: 0,
      child: Container(
        padding: EdgeInsets.only(bottom: botPad + 20, top: 24, left: 32, right: 32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [Colors.black.withValues(alpha: 0.75), Colors.transparent],
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            // Galeri button
            _iconBtn(Icons.photo_library_outlined, 'Galeri', _pickAndScan),
            // Shutter (Scan)
            GestureDetector(
              onTap: _isCamReady ? _captureAndScan : _pickAndScan,
              child: Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  color: primaryColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: primaryColor.withValues(alpha: 0.5),
                      blurRadius: 16, offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: const Icon(Icons.document_scanner, color: Colors.white, size: 32),
              ),
            ),
            // Flip camera
            _iconBtn(Icons.flip_camera_ios_outlined, 'Balik', () {
              // TODO: flip camera
            }),
          ],
        ),
      ),
    );
  }

  Widget _iconBtn(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 28),
          const SizedBox(height: 4),
          Text(label, style: GoogleFonts.poppins(color: Colors.white70, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.65),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: primaryColor, strokeWidth: 3),
            const SizedBox(height: 20),
            Text('Menganalisis gambar...',
                style: GoogleFonts.poppins(color: Colors.white, fontSize: 15)),
            const SizedBox(height: 6),
            Text('Memuat hasil dari AI',
                style: GoogleFonts.poppins(
                    color: Colors.white60, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════
// Bottom Sheet — Tampilkan Hasil Scan
// ════════════════════════════════════════════════════════════════════════
class _ResultSheet extends StatelessWidget {
  final ScanResult result;
  final File imageFile;
  final VoidCallback onViewDetail;
  final VoidCallback? onStartQuiz;

  const _ResultSheet({
    required this.result,
    required this.imageFile,
    required this.onViewDetail,
    this.onStartQuiz,
  });

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      builder: (_, ctrl) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: ListView(
          controller: ctrl,
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 32),
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Thumbnail foto yang dipindai
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.file(imageFile,
                  height: 160, width: double.infinity, fit: BoxFit.cover),
            ),
            const SizedBox(height: 20),

            // Confidence badge
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: result.isReliable
                        ? const Color(0xFFE8F5E9)
                        : const Color(0xFFFFF3E0),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        result.isReliable ? Icons.check_circle : Icons.warning_amber,
                        size: 14,
                        color: result.isReliable ? Colors.green : Colors.orange,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Keyakinan AI: ${result.confidencePercent}',
                        style: GoogleFonts.poppins(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: result.isReliable ? Colors.green : Colors.orange,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Name
            Text(result.name,
                style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87)),
            const SizedBox(height: 8),

            // Description
            Text(
              result.description.isEmpty
                  ? 'Tidak ada deskripsi tersedia.'
                  : result.description,
              style: GoogleFonts.poppins(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.6),
            ),
            const SizedBox(height: 16),

            // Info tambahan (lokasi, jam, tiket)
            if (result.lokasi.isNotEmpty) _infoRow(Icons.location_on_outlined, result.lokasi),
            if (result.jamBuka.isNotEmpty) _infoRow(Icons.access_time_outlined, result.jamBuka),
            if (result.tiket.isNotEmpty) _infoRow(Icons.confirmation_number_outlined, result.tiket),
            if (result.kategori.isNotEmpty) _infoRow(Icons.category_outlined, result.kategori),
            const SizedBox(height: 24),

            // Detail button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.info_outline),
                label: Text('Lihat Detail',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 15)),
                onPressed: onViewDetail,
              ),
            ),

            // Quiz button (hanya jika ada)
            if (onStartQuiz != null) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: secondaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.quiz_outlined),
                  label: Text('Mulai Kuis',
                      style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600, fontSize: 15)),
                  onPressed: onStartQuiz,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF2E7D32)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade700),
            ),
          ),
        ],
      ),
    );
  }
}
