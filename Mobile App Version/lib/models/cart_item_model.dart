class CartItemModel {
  final String productId;
  final String name;
  final String store;
  final String storeId;
  final String imageUrl;
  final int price;
  final int? oldPrice;
  final String size;
  final String color;
  final int quantity;
  final bool inStock;

  const CartItemModel({
    required this.productId,
    required this.name,
    required this.store,
    required this.storeId,
    required this.imageUrl,
    required this.price,
    this.oldPrice,
    required this.size,
    required this.color,
    required this.quantity,
    this.inStock = true,
  });

  int get subtotal => price * quantity;

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      productId: json['product_id'] as String,
      name: json['name'] as String? ?? '',
      store: json['store'] as String? ?? '',
      storeId: json['store_id'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      oldPrice: (json['old_price'] as num?)?.toInt(),
      size: json['size'] as String? ?? '',
      color: json['color'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      inStock: json['in_stock'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'name': name,
        'store': store,
        'store_id': storeId,
        'image_url': imageUrl,
        'price': price,
        if (oldPrice != null) 'old_price': oldPrice,
        'size': size,
        'color': color,
        'quantity': quantity,
        'in_stock': inStock,
      };

  CartItemModel copyWith({
    String? productId,
    String? name,
    String? store,
    String? storeId,
    String? imageUrl,
    int? price,
    int? oldPrice,
    String? size,
    String? color,
    int? quantity,
    bool? inStock,
  }) {
    return CartItemModel(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      store: store ?? this.store,
      storeId: storeId ?? this.storeId,
      imageUrl: imageUrl ?? this.imageUrl,
      price: price ?? this.price,
      oldPrice: oldPrice ?? this.oldPrice,
      size: size ?? this.size,
      color: color ?? this.color,
      quantity: quantity ?? this.quantity,
      inStock: inStock ?? this.inStock,
    );
  }
}
