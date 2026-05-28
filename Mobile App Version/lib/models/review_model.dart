class ReviewModel {
  final String id;
  final String productId;
  final String userId;
  final String userName;
  final String? userAvatarUrl;
  final double rating;
  final String? title;
  final String body;
  final List<String> photos;
  final bool isVerified;
  final DateTime createdAt;
  final int helpfulCount;

  const ReviewModel({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.userAvatarUrl,
    required this.rating,
    this.title,
    required this.body,
    required this.photos,
    required this.isVerified,
    required this.createdAt,
    this.helpfulCount = 0,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String,
      productId: json['product_id'] as String? ?? '',
      userId: json['user_id'] as String? ?? '',
      userName: json['user_name'] as String? ?? 'Anonymous',
      userAvatarUrl: json['user_avatar_url'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      title: json['title'] as String?,
      body: json['body'] as String? ?? '',
      photos: _parseStringList(json['photos']),
      isVerified: json['is_verified'] as bool? ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      helpfulCount: (json['helpful_count'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'product_id': productId,
        'user_id': userId,
        'user_name': userName,
        if (userAvatarUrl != null) 'user_avatar_url': userAvatarUrl,
        'rating': rating,
        if (title != null) 'title': title,
        'body': body,
        'photos': photos,
        'is_verified': isVerified,
        'created_at': createdAt.toIso8601String(),
        'helpful_count': helpfulCount,
      };

  ReviewModel copyWith({
    String? id,
    String? productId,
    String? userId,
    String? userName,
    String? userAvatarUrl,
    double? rating,
    String? title,
    String? body,
    List<String>? photos,
    bool? isVerified,
    DateTime? createdAt,
    int? helpfulCount,
  }) {
    return ReviewModel(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userAvatarUrl: userAvatarUrl ?? this.userAvatarUrl,
      rating: rating ?? this.rating,
      title: title ?? this.title,
      body: body ?? this.body,
      photos: photos ?? this.photos,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      helpfulCount: helpfulCount ?? this.helpfulCount,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}
