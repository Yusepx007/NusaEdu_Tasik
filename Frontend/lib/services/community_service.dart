import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:scan_wisata/models/community_post.dart';
import 'package:scan_wisata/models/comment.dart';

/// Service untuk fitur Community dengan REST API Laravel
class CommunityService {
  static const String _currentUser = 'Adi Pratama'; // Nanti sesuaikan Auth

  // Base URL Laravel API (Pakai 10.0.2.2 untuk Localhost Android Emulator)
  static const String _baseUrl = 'http://nusaedu.kotapintar.my.id/api';

  // ── UPLOAD Foto & Buat Post ───────────────────────────────────────────
  Future<bool> uploadPost({
    required File imageFile,
    required String destinationName,
    required String caption,
  }) async {
    try {
      final request =
          http.MultipartRequest('POST', Uri.parse('$_baseUrl/posts'));
      request.fields['destinationName'] = destinationName;
      request.fields['caption'] = caption;
      request.fields['userName'] = _currentUser;

      request.files.add(await http.MultipartFile.fromPath(
        'image',
        imageFile.path,
      ));

      final response = await request.send();
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('uploadPost error: $e');
      return false;
    }
  }

  // ── BACA Feed (REST API) ───────────────────────────────────────────────
  Future<List<CommunityPost>> getPosts() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/posts'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List postsRaw = data['data'] ?? [];
        return postsRaw.map((e) => CommunityPost.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('getPosts error: $e');
      return [];
    }
  }

  // ── KOMENTAR ─────────────────────────────────────────────────────────
  Future<List<Comment>> getComments(String postId) async {
    try {
      final response =
          await http.get(Uri.parse('$_baseUrl/posts/$postId/comments'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List commentsRaw = data['data'] ?? [];
        return commentsRaw.map((e) => Comment.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('getComments error: $e');
      return [];
    }
  }

  Future<bool> addComment({
    required String postId,
    required String text,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/posts/$postId/comments'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'text': text,
          'userName': _currentUser,
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('addComment error: $e');
      return false;
    }
  }

  // ── LIKE ──────────────────────────────────────────────────────────────
  Future<void> toggleLike(String postId, bool isCurrentlyLiked) async {
    try {
      await http.post(
        Uri.parse('$_baseUrl/posts/$postId/likes'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userName': _currentUser,
          'isLiked': isCurrentlyLiked,
        }),
      );
    } catch (e) {
      debugPrint('toggleLike error: $e');
    }
  }
}

