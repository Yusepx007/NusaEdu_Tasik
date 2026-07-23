import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:scan_wisata/models/scan_result.dart';

class AiScanService {
  /// Base URL Laravel backend
  static const String _laravelUrl = 'http://nusaedu.kotapintar.my.id/api';

  /// URL Python AI server (deployed di kotapintar.my.id/ai)
  static const String _scanUrl = 'https://kotapintar.my.id/ai';

  /// Kirim [imageFile] ke Python Flask API, lalu auto-save ke Laravel DB.
  /// [userId] = null jika belum login (guest mode)
  Future<ScanResult> scanImage(File imageFile, {int? userId}) async {
    try {
      final result = await _callPythonScanner(imageFile);

      // Jika scan berhasil & tempat dikenali → simpan ke Laravel DB
      if (result.id != 'error' && result.id != 'tidak_dikenal') {
        _saveScanToDatabase(result, userId: userId);  // fire & forget, jangan tunggu
      }

      return result;
    } catch (e) {
      debugPrint('Scan Exception: $e');
      return _errorResult('Koneksi ke server AI gagal. Pastikan internet aktif.');
    }
  }

  /// Kirim gambar ke Laravel (yang akan proxy ke Python Flask scanner)
  Future<ScanResult> _callPythonScanner(File imageFile) async {
    final uri = Uri.parse('$_scanUrl/scan');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));

    final streamed = await request.send().timeout(
      const Duration(seconds: 30),
      onTimeout: () => throw Exception('Python server tidak merespons dalam 30 detik'),
    );

    final resStr = await streamed.stream.bytesToString();
    debugPrint('Python Scan [${streamed.statusCode}]: $resStr');

    if (streamed.statusCode != 200) {
      throw Exception('Python server error: ${streamed.statusCode}');
    }

    final Map<String, dynamic> jsonMap = jsonDecode(resStr);
    if (jsonMap['success'] != true) {
      return _errorResult(jsonMap['error'] as String? ?? 'Terjadi kesalahan di scanner');
    }

    return ScanResult.fromJson(jsonMap);
  }

  /// Simpan hasil scan ke Laravel database (fire & forget)
  Future<void> _saveScanToDatabase(ScanResult result, {int? userId}) async {
    try {
      final uri = Uri.parse('$_laravelUrl/scan/save');
      final body = {
        'destination_name': result.name,
        'wisata_key':       result.id,
        'confidence':       (result.confidence * 100).toStringAsFixed(1),
        'lokasi':           result.lokasi,
        'kategori':         result.kategori,
        if (userId != null) 'user_id': userId.toString(),
      };

      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 10));

      debugPrint('Save to Laravel [${response.statusCode}]: ${response.body}');

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        debugPrint('Poin diperoleh: ${data['points_earned']} | Total: ${data['total_points']}');
      }
    } catch (e) {
      // Gagal save ke DB tidak ganggu UX — scan tetap tampil
      debugPrint('Gagal simpan ke database: $e');
    }
  }

  ScanResult _errorResult(String pesan) {
    return ScanResult(
      id: 'error',
      name: 'Gagal Menghubungi AI',
      description: pesan,
      confidence: 0.0,
    );
  }
}
