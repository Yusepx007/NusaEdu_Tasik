import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class AuthService {
  static const String _baseUrl = 'http://nusaedu.kotapintar.my.id/api';
  static String? _token;
  static String? _currentUser;
  static int? _userId;
  static int _userPoints = 0;
  static String _userLevel = 'Penjelajah';

  static String? get token => _token;
  static String? get currentUser => _currentUser;
  static int? get userId => _userId;
  static int get userPoints => _userPoints;
  static String get userLevel => _userLevel;

  static void setPointsAndLevel(int points, String level) {
    _userPoints = points;
    _userLevel = level;
  }

  // --- REGISTER ---
  static Future<String?> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/register'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        _token = data['token'];
        if (data['user'] != null) {
          _currentUser = data['user']['name']?.toString();
          _userId = int.tryParse(data['user']['id'].toString());
          _userPoints = int.tryParse(data['user']['points'].toString()) ?? 0;
          _userLevel = data['user']['level']?.toString() ?? 'Penjelajah';
        }
        return null; // Return null means success
      }
      
      // Validation error or something else
      if (data['message'] != null) {
        return data['message'].toString();
      }
      return 'Gagal mendaftar. (Code: ${response.statusCode})';
      
    } catch (e) {
      debugPrint('Register error: $e');
      return 'Koneksi ke server gagal. Pastikan internet aktif.\nError: $e';
    }
  }

  // --- LOGIN ---
  static Future<String?> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json.encode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 10)); // Force timeout

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _token = data['token'];
        if (data['user'] != null) {
            _currentUser = data['user']['name']?.toString();
            _userId = int.tryParse(data['user']['id'].toString());
            _userPoints = int.tryParse(data['user']['points'].toString()) ?? 0;
            _userLevel = data['user']['level']?.toString() ?? 'Penjelajah';
        }
        return null; // Sukses (tanpa error)
      }
      
      return data['message'] ?? 'Login gagal. Email/password mungkin salah.';
    } on TimeoutException {
      return 'Koneksi ke server API memakan waktu terlalu lama (Timeout).';
    } catch (e) {
      debugPrint('Login error: $e');
      return 'Koneksi ke server error: $e';
    }
  }

  // â”€â”€ LOGOUT â”€â”€
  static Future<void> logout() async {
    if (_token != null) {
      try {
        await http.post(
          Uri.parse('$_baseUrl/logout'),
          headers: {
            'Authorization': 'Bearer $_token',
            'Content-Type': 'application/json',
          },
        );
      } catch (e) {
        debugPrint('Logout error: $e');
      }
    }
    _token = null;
    _currentUser = null;
    _userId = null;
    _userPoints = 0;
    _userLevel = 'Penjelajah';
  }
}


