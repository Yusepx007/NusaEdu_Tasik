import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:scan_wisata/models/destination.dart';

class DestinationService {
  // Gunakan 10.0.2.2 untuk mengakses localhost XAMPP dari Android Emulator
  // Gunakan IP lokal network Wi-Fi (mis. 192.168.x.x) jika di HP fisik
  static const String baseUrl = 'http://nusaedu.kotapintar.my.id/api';

  Future<List<Destination>> fetchDestinations() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/destinations'));

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        
        if (responseData['data'] != null) {
          final List<dynamic> data = responseData['data'];
          return data.map((item) => Destination.fromJson(item)).toList();
        } else {
          // Fallback if the Laravel controller directly returns array
          final List<dynamic> jsonList = json.decode(response.body);
          return jsonList.map((item) => Destination.fromJson(item)).toList();
        }
      } else {
        throw Exception('Gagal memuat daftar destinasi');
      }
    } catch (e) {
      throw Exception('Kesalahan Jaringan: $e');
    }
  }
}


