class ShopModel {
  final String id;
  final String name;
  final String ownerName;
  final String description;
  final String imageUrl;
  final String address;
  final String city;
  final double lat;
  final double lng;
  final double rating;
  final int reviewCount;
  final List<String> tags;
  final bool isVerified;
  final String? openingHours;
  final String? phone;
  final String? distance;
  final String? coverImageUrl;
  final bool isOpen;

  const ShopModel({
    required this.id,
    required this.name,
    required this.ownerName,
    required this.description,
    required this.imageUrl,
    required this.address,
    required this.city,
    required this.lat,
    required this.lng,
    required this.rating,
    required this.reviewCount,
    required this.tags,
    required this.isVerified,
    this.openingHours,
    this.phone,
    this.distance,
    this.coverImageUrl,
    this.isOpen = true,
  });

  factory ShopModel.fromJson(Map<String, dynamic> json) {
    return ShopModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      ownerName: json['owner_name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['review_count'] as num?)?.toInt() ?? 0,
      tags: _parseStringList(json['tags']),
      isVerified: json['is_verified'] as bool? ?? false,
      openingHours: json['opening_hours'] as String?,
      phone: json['phone'] as String?,
      distance: json['distance'] as String?,
      coverImageUrl: json['cover_image_url'] as String?,
      isOpen: json['is_open'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'owner_name': ownerName,
        'description': description,
        'image_url': imageUrl,
        'address': address,
        'city': city,
        'lat': lat,
        'lng': lng,
        'rating': rating,
        'review_count': reviewCount,
        'tags': tags,
        'is_verified': isVerified,
        if (openingHours != null) 'opening_hours': openingHours,
        if (phone != null) 'phone': phone,
        if (distance != null) 'distance': distance,
        if (coverImageUrl != null) 'cover_image_url': coverImageUrl,
        'is_open': isOpen,
      };

  ShopModel copyWith({
    String? id,
    String? name,
    String? ownerName,
    String? description,
    String? imageUrl,
    String? address,
    String? city,
    double? lat,
    double? lng,
    double? rating,
    int? reviewCount,
    List<String>? tags,
    bool? isVerified,
    String? openingHours,
    String? phone,
    String? distance,
    String? coverImageUrl,
    bool? isOpen,
  }) {
    return ShopModel(
      id: id ?? this.id,
      name: name ?? this.name,
      ownerName: ownerName ?? this.ownerName,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      address: address ?? this.address,
      city: city ?? this.city,
      lat: lat ?? this.lat,
      lng: lng ?? this.lng,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      tags: tags ?? this.tags,
      isVerified: isVerified ?? this.isVerified,
      openingHours: openingHours ?? this.openingHours,
      phone: phone ?? this.phone,
      distance: distance ?? this.distance,
      coverImageUrl: coverImageUrl ?? this.coverImageUrl,
      isOpen: isOpen ?? this.isOpen,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}
