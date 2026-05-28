class ProductModel {
  final String id;
  final String name;
  final String store;
  final String storeId;
  final int price;
  final int? oldPrice;
  final double rating;
  final int reviewCount;
  final String? distance;
  final List<String> sizes;
  final List<String> colors;
  final String imageUrl;
  final List<String> images;
  final String category;
  final String? subcat;
  final String? gender;
  final bool is3d;
  final bool isVerified;
  final Map<String, dynamic>? specs;
  final String? description;
  final bool inStock;
  final DateTime? createdAt;

  const ProductModel({
    required this.id,
    required this.name,
    required this.store,
    required this.storeId,
    required this.price,
    this.oldPrice,
    required this.rating,
    required this.reviewCount,
    this.distance,
    required this.sizes,
    required this.colors,
    required this.imageUrl,
    required this.images,
    required this.category,
    this.subcat,
    this.gender,
    this.is3d = false,
    this.isVerified = false,
    this.specs,
    this.description,
    this.inStock = true,
    this.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      store: json['store'] as String? ?? json['store_name'] as String? ?? '',
      storeId: json['store_id'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      oldPrice: (json['old_price'] as num?)?.toInt(),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['review_count'] as num?)?.toInt() ?? 0,
      distance: json['distance'] as String?,
      sizes: _parseStringList(json['sizes']),
      colors: _parseStringList(json['colors']),
      imageUrl: json['image_url'] as String? ?? '',
      images: _parseStringList(json['images']),
      category: json['category'] as String? ?? '',
      subcat: json['subcat'] as String?,
      gender: json['gender'] as String?,
      is3d: json['is_3d'] as bool? ?? false,
      isVerified: json['is_verified'] as bool? ?? false,
      specs: json['specs'] as Map<String, dynamic>?,
      description: json['description'] as String?,
      inStock: json['in_stock'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'store': store,
        'store_id': storeId,
        'price': price,
        if (oldPrice != null) 'old_price': oldPrice,
        'rating': rating,
        'review_count': reviewCount,
        if (distance != null) 'distance': distance,
        'sizes': sizes,
        'colors': colors,
        'image_url': imageUrl,
        'images': images,
        'category': category,
        if (subcat != null) 'subcat': subcat,
        if (gender != null) 'gender': gender,
        'is_3d': is3d,
        'is_verified': isVerified,
        if (specs != null) 'specs': specs,
        if (description != null) 'description': description,
        'in_stock': inStock,
        if (createdAt != null) 'created_at': createdAt!.toIso8601String(),
      };

  ProductModel copyWith({
    String? id,
    String? name,
    String? store,
    String? storeId,
    int? price,
    int? oldPrice,
    double? rating,
    int? reviewCount,
    String? distance,
    List<String>? sizes,
    List<String>? colors,
    String? imageUrl,
    List<String>? images,
    String? category,
    String? subcat,
    String? gender,
    bool? is3d,
    bool? isVerified,
    Map<String, dynamic>? specs,
    String? description,
    bool? inStock,
    DateTime? createdAt,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      store: store ?? this.store,
      storeId: storeId ?? this.storeId,
      price: price ?? this.price,
      oldPrice: oldPrice ?? this.oldPrice,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      distance: distance ?? this.distance,
      sizes: sizes ?? this.sizes,
      colors: colors ?? this.colors,
      imageUrl: imageUrl ?? this.imageUrl,
      images: images ?? this.images,
      category: category ?? this.category,
      subcat: subcat ?? this.subcat,
      gender: gender ?? this.gender,
      is3d: is3d ?? this.is3d,
      isVerified: isVerified ?? this.isVerified,
      specs: specs ?? this.specs,
      description: description ?? this.description,
      inStock: inStock ?? this.inStock,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  static List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}
