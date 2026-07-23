import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AiChatService {
  static const String _baseUrl = 'http://nusaedu.kotapintar.my.id/api/ai';

  String? _tourSpotName;

  /// Memulai sesi chat baru dengan konteks nama tempat wisata.
  void startChat(String tourSpotName) {
    _tourSpotName = tourSpotName;
  }

  /// Mengirim pesan ke AI Lokal dan mendapatkan balasannya.
  Future<String> sendMessage(String message) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/chat'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'context': _tourSpotName,
          'message': message,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['reply'] ?? 'Maaf, saya tidak mengerti.';
      } else {
        return 'Maaf, server lokal merespons dengan kode ${response.statusCode} (Endpoint belum dibuat?)';
      }
    } catch (e) {
      debugPrint('Local AI Chat Error: $e');
      return 'Ups! Tidak bisa menghubungi server.\n\nError: $e';
    }
  }
}
