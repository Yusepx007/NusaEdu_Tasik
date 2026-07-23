/// Model data dari hasil scan AI — kompatibel dengan Python Flask API
class ScanResult {
  /// ID unik objek (contoh: 'alun_alun')
  final String id;

  /// Nama objek wisata
  final String name;

  /// Deskripsi / sejarah singkat
  final String description;

  /// Tingkat keyakinan AI (0.0 - 1.0)
  final double confidence;

  /// Apakah objek ini punya kuis
  final bool hasQuiz;

  /// URL gambar resmi objek (kosong jika tidak ada)
  final String imageUrl;

  // ── Field tambahan dari Python API ──────────────────
  final String lokasi;
  final String jamBuka;
  final String tiket;
  final String kategori;
  final double? lat;
  final double? lng;

  const ScanResult({
    required this.id,
    required this.name,
    required this.description,
    required this.confidence,
    this.hasQuiz = false,
    this.imageUrl = '',
    this.lokasi = '',
    this.jamBuka = '',
    this.tiket = '',
    this.kategori = '',
    this.lat,
    this.lng,
  });

  /// Parse dari JSON respons Python Flask API kita
  /// Respons Python:
  /// {
  ///   "success": true, "recognized": true,
  ///   "wisata_key": "alun_alun", "confidence": 91.2,
  ///   "info": { "nama": "...", "deskripsi": "...", "lokasi": "...",
  ///             "jam_buka": "...", "tiket": "...", "kategori": "...",
  ///             "koordinat": {"lat": -7.xx, "lng": 108.xx} },
  ///   "thumbnail_url": "/python_ai/images/..."
  /// }
  factory ScanResult.fromJson(Map<String, dynamic> json) {
    // ── Jika response dari Python Flask API kita ──────
    if (json.containsKey('wisata_key') || json.containsKey('recognized')) {
      final bool recognized = json['recognized'] as bool? ?? false;

      if (!recognized) {
        return ScanResult(
          id: 'tidak_dikenal',
          name: 'Tempat Tidak Dikenali',
          description: json['message'] as String? ??
              'Coba arahkan kamera lebih jelas ke objek wisata.',
          confidence: ((json['confidence'] as num?)?.toDouble() ?? 0.0) / 100.0,
        );
      }

      final info = json['info'] as Map<String, dynamic>? ?? {};
      final koordinat = info['koordinat'] as Map<String, dynamic>? ?? {};
      final rawConf = (json['confidence'] as num?)?.toDouble() ?? 0.0;

      // Bangun URL thumbnail lengkap
      final thumbRel = json['thumbnail_url'] as String? ?? '';
      final thumbUrl = thumbRel.isNotEmpty
          ? 'http://192.168.100.232$thumbRel'
          : '';

      return ScanResult(
        id: json['wisata_key'] as String? ?? '',
        name: info['nama'] as String? ?? 'Objek Tidak Dikenal',
        description: info['deskripsi'] as String? ?? '',
        confidence: (rawConf / 100.0).clamp(0.0, 1.0),
        hasQuiz: false,
        imageUrl: thumbUrl,
        lokasi: info['lokasi'] as String? ?? '',
        jamBuka: info['jam_buka'] as String? ?? '',
        tiket: info['tiket'] as String? ?? '',
        kategori: info['kategori'] as String? ?? '',
        lat: (koordinat['lat'] as num?)?.toDouble(),
        lng: (koordinat['lng'] as num?)?.toDouble(),
      );
    }

    // ── Format lama / demo data ───────────────────────
    return ScanResult(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Objek Tidak Dikenal',
      description: json['description'] as String? ?? '',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.0,
      hasQuiz: json['quiz_available'] as bool? ?? false,
      imageUrl: json['image_url'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'confidence': confidence,
        'quiz_available': hasQuiz,
        'image_url': imageUrl,
        'lokasi': lokasi,
        'jam_buka': jamBuka,
        'tiket': tiket,
        'kategori': kategori,
        'koordinat': {'lat': lat, 'lng': lng},
      };

  /// Persentase keyakinan sebagai string
  String get confidencePercent => '${(confidence * 100).toStringAsFixed(0)}%';

  /// Apakah hasil scan cukup yakin? (di atas 60%)
  bool get isReliable => confidence >= 0.6;

  /// Apakah ada info lokasi?
  bool get hasLocation => lat != null && lng != null;
}
