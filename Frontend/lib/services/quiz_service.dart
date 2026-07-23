import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:scan_wisata/services/auth_service.dart';

class QuizService {
  static const String baseUrl = 'http://nusaedu.kotapintar.my.id/api';

  static Future<List<Map<String, dynamic>>> fetchQuizzes() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/quizzes'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => {
          'id': json['id'],
          'question': json['question'],
          'options': List<String>.from(json['options']),
          'answer': json['answer'],
        }).toList();
      } else {
        throw Exception('Failed to load quizzes');
      }
    } catch (e) {
      debugPrint('Error fetching quizzes: $e');
      return [];
    }
  }

  static Future<bool> submitScore(int userId, int score) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/quizzes/submit'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'user_id': userId,
          'score': score,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['user'] != null) {
          AuthService.setPointsAndLevel(data['user']['points'] ?? 0, data['user']['level'] ?? 'Penjelajah');
        }
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error submitting score: $e');
      return false;
    }
  }
}
