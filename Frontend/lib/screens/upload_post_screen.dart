import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:scan_wisata/services/community_service.dart';
import 'package:scan_wisata/services/destination_service.dart';
import 'package:scan_wisata/theme.dart';

class UploadPostScreen extends StatefulWidget {
  const UploadPostScreen({super.key});
  @override
  State<UploadPostScreen> createState() => _UploadPostScreenState();
}

class _UploadPostScreenState extends State<UploadPostScreen> {
  final _captionCtrl = TextEditingController();
  final _service = CommunityService();
  final _picker = ImagePicker();

  File? _selectedImage;
  String? _selectedDestination;
  bool _isUploading = false;

  List<String> _destinations = ['Lainnya'];
  bool _isLoadingDestinations = true;

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final dests = await DestinationService().fetchDestinations();
      setState(() {
        _destinations = dests.map((e) => e.name).toList();
        if (!_destinations.contains('Lainnya')) {
          _destinations.add('Lainnya');
        }
        _isLoadingDestinations = false;
      });
    } catch (e) {
      setState(() => _isLoadingDestinations = false);
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final picked = await _picker.pickImage(source: source, imageQuality: 85);
    if (picked != null) {
      setState(() => _selectedImage = File(picked.path));
    }
  }

  void _showImageSourceSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        margin: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.camera_alt, color: primaryColor),
              ),
              title: Text('Buka Kamera', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.camera); },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.photo_library, color: primaryColor),
              ),
              title: Text('Pilih dari Galeri', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
              onTap: () { Navigator.pop(context); _pickImage(ImageSource.gallery); },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Future<void> _handleUpload() async {
    if (_selectedImage == null) {
      _showSnackbar('Pilih foto terlebih dahulu!', isError: true);
      return;
    }
    if (_selectedDestination == null) {
      _showSnackbar('Pilih destinasi wisata!', isError: true);
      return;
    }
    if (_captionCtrl.text.trim().isEmpty) {
      _showSnackbar('Tulis caption untuk postmu!', isError: true);
      return;
    }

    setState(() => _isUploading = true);
    final success = await _service.uploadPost(
      imageFile: _selectedImage!,
      destinationName: _selectedDestination!,
      caption: _captionCtrl.text.trim(),
    );
    setState(() => _isUploading = false);

    if (!mounted) return;
    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Postingan berhasil dibagikan! 🎉', style: GoogleFonts.poppins()),
          backgroundColor: primaryColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } else {
      _showSnackbar('Gagal upload. Cek koneksimu dan coba lagi!', isError: true);
    }
  }

  void _showSnackbar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: GoogleFonts.poppins()),
        backgroundColor: isError ? Colors.red : primaryColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  void dispose() {
    _captionCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F4),
      appBar: AppBar(
        title: Text('Bagikan Momen', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 18, color: Colors.white)),
        backgroundColor: primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _isUploading ? null : _handleUpload,
            child: Text('Bagikan',
                style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Foto Preview / Picker ──
                GestureDetector(
                  onTap: _showImageSourceSheet,
                  child: Container(
                    width: double.infinity,
                    height: 240,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _selectedImage == null ? Colors.grey.shade200 : primaryColor,
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4)),
                      ],
                    ),
                    child: _selectedImage != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                Image.file(_selectedImage!, fit: BoxFit.cover),
                                // Edit overlay
                                Positioned(
                                  right: 12, bottom: 12,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withValues(alpha: 0.6),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.edit, color: Colors.white, size: 14),
                                        const SizedBox(width: 4),
                                        Text('Ganti', style: GoogleFonts.poppins(color: Colors.white, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: primaryColor.withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.add_photo_alternate_outlined, size: 40, color: primaryColor),
                              ),
                              const SizedBox(height: 12),
                              Text('Tambahkan Foto', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 15, color: primaryColor)),
                              const SizedBox(height: 4),
                              Text('Tap untuk memilih dari kamera atau galeri',
                                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade400)),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Pilih Destinasi ──
                Text('Lokasi Wisata', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B))),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedDestination,
                      isExpanded: true,
                      hint: Text(_isLoadingDestinations ? 'Loading lokasi...' : 'Pilih destinasi...', style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade400)),
                      icon: const Icon(Icons.keyboard_arrow_down, color: primaryColor),
                      borderRadius: BorderRadius.circular(16),
                      style: GoogleFonts.poppins(fontSize: 14, color: const Color(0xFF1E293B)),
                      items: _destinations.map((d) => DropdownMenuItem(value: d, child: Text(d))).toList(),
                      onChanged: (val) => setState(() => _selectedDestination = val),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Caption ──
                Text('Caption', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF1E293B))),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
                  ),
                  child: TextField(
                    controller: _captionCtrl,
                    maxLines: 4,
                    maxLength: 200,
                    style: GoogleFonts.poppins(fontSize: 14, color: const Color(0xFF1E293B)),
                    decoration: InputDecoration(
                      hintText: 'Ceritakan pengalaman wisatamu...',
                      hintStyle: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade400),
                      contentPadding: const EdgeInsets.all(16),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: primaryColor, width: 1.5),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // ── Tombol Bagikan ──
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 16, offset: const Offset(0, 8))],
                  ),
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      minimumSize: const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: _isUploading ? null : _handleUpload,
                    icon: const Icon(Icons.send_rounded),
                    label: Text('Bagikan ke Community', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),

          // ── Loading Overlay ──
          if (_isUploading)
            Container(
              color: Colors.black.withValues(alpha: 0.5),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(color: primaryColor),
                      const SizedBox(height: 16),
                      Text('Mengupload foto...', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text('Mohon tunggu sebentar', style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

