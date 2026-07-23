class Comment {
  final String id;
  final String postId;
  final String userName;
  final String text;
  final DateTime createdAt;

  Comment({
    required this.id,
    required this.postId,
    required this.userName,
    required this.text,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id']?.toString() ?? '',
      postId: json['postId']?.toString() ?? '',
      userName: json['userName'] ?? 'Anonim',
      text: json['text'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson(String targetPostId) {
    return {
      'postId': targetPostId,
      'userName': userName,
      'text': text,
    };
  }
}
