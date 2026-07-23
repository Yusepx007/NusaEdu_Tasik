import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';

class HistoryService {
  static const String baseUrl = 'http://nusaedu.kotapintar.my.id/api';

  static Future<List<Map<String, dynamic>>> fetchHistory(int? userId) async {
    if (userId == null) return [];
    try {
      final response = await http.get(Uri.parse('$baseUrl/history?user_id=$userId'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => {
          'id': json['id'],
          'location': json['destination_name'],
          'date': json['date'],
          'points': '+${json['points']} Poin',
          'image': _parseIcon(json['image_type']),
          'color': _parseColor(json['image_type']),
        }).toList();
      } else {
        throw Exception('Failed to load history');
      }
    } catch (e) {
      debugPrint('Error fetching history: $e');
      return [];
    }
  }

  static IconData _parseIcon(dynamic type) {
    if (type == 'history') return Icons.history;
    if (type == 'location_city') return Icons.location_city;
    if (type == 'landscape') return Icons.landscape;
    if (type == 'water') return Icons.water;
    if (type == 'museum') return Icons.museum;
    return Icons.location_on;
  }

  static Color _parseColor(dynamic type) {
    if (type == 'history') return Colors.orange;
    if (type == 'location_city') return Colors.teal;
    if (type == 'landscape') return Colors.green;
    if (type == 'water') return Colors.blue;
    if (type == 'museum') return Colors.brown;
    return Colors.grey;
  }
}
