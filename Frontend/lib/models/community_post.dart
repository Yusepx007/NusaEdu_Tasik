class CommunityPost {
  final String id;
  final String userName;
  final String userAvatar; // inisial atau URL avatar
  final String destinationName;
  final String caption;
  final String imageUrl;
  final DateTime createdAt;
  int likeCount;
  int commentCount;
  bool isLikedByMe;

  CommunityPost({
    required this.id,
    required this.userName,
    this.userAvatar = '',
    required this.destinationName,
    required this.caption,
    required this.imageUrl,
    required this.createdAt,
    this.likeCount = 0,
    this.commentCount = 0,
    this.isLikedByMe = false,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    return CommunityPost(
      id: json['id']?.toString() ?? '',
      userName: json['userName'] ?? 'Anonim',
      userAvatar: json['userAvatar'] ?? '',
      destinationName: json['destinationName'] ?? '',
      caption: json['caption'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      likeCount: json['likeCount'] ?? 0,
      commentCount: json['commentCount'] ?? 0,
      isLikedByMe: json['isLikedByMe'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userName': userName,
      'userAvatar': userAvatar,
      'destinationName': destinationName,
      'caption': caption,
      'imageUrl': imageUrl,
      // createdAt tidak perlu dikirim karena di-handle database backend (timestamp)
      'likeCount': likeCount,
      'commentCount': commentCount,
    };
  }
}
