class UserModel {
  final String id;
  final String? email;
  final String? phone;
  final String fullName;
  final String? avatarUrl;
  final String? defaultCity;
  final String? sizeTop;
  final String? sizeBottom;
  final List<String> stylePreferences;
  final String language;
  final DateTime? createdAt;

  const UserModel({
    required this.id,
    this.email,
    this.phone,
    required this.fullName,
    this.avatarUrl,
    this.defaultCity,
    this.sizeTop,
    this.sizeBottom,
    this.stylePreferences = const [],
    this.language = 'en',
    this.createdAt,
  });

  String get displayName =>
      fullName.isNotEmpty ? fullName : (email?.split('@').first ?? 'User');

  String get initials {
    final parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return fullName.isNotEmpty ? fullName[0].toUpperCase() : 'U';
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      fullName: json['full_name'] as String? ?? '',
      avatarUrl: json['avatar_url'] as String?,
      defaultCity: json['default_city'] as String?,
      sizeTop: json['size_top'] as String?,
      sizeBottom: json['size_bottom'] as String?,
      stylePreferences: _parseStringList(json['style_preferences']),
      language: json['language'] as String? ?? 'en',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        'full_name': fullName,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        if (defaultCity != null) 'default_city': defaultCity,
        if (sizeTop != null) 'size_top': sizeTop,
        if (sizeBottom != null) 'size_bottom': sizeBottom,
        'style_preferences': stylePreferences,
        'language': language,
        if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
      };

  UserModel copyWith({
    String? id,
    String? email,
    String? phone,
    String? fullName,
    String? avatarUrl,
    String? defaultCity,
    String? sizeTop,
    String? sizeBottom,
    List<String>? stylePreferences,
    String? language,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      fullName: fullName ?? this.fullName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      defaultCity: defaultCity ?? this.defaultCity,
      sizeTop: sizeTop ?? this.sizeTop,
      sizeBottom: sizeBottom ?? this.sizeBottom,
      stylePreferences: stylePreferences ?? this.stylePreferences,
      language: language ?? this.language,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}
