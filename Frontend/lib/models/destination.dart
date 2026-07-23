class Destination {
  final int? id;
  final String name;
  final String description;
  final String category;
  final double? latitude;
  final double? longitude;
  final String imageUrl;
  final double rating;

  Destination({
    this.id,
    required this.name,
    required this.description,
    this.category = 'Lainnya',
    this.latitude,
    this.longitude,
    required this.imageUrl,
    this.rating = 4.5,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    return Destination(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Lainnya',
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      imageUrl: json['imageUrl'] ?? 'https://via.placeholder.com/400',
      rating: json['rating'] != null ? double.tryParse(json['rating'].toString()) ?? 4.5 : 4.5,
    );
  }
}
