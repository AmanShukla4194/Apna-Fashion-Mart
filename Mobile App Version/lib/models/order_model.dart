import 'address_model.dart';

// Valid statuses in lifecycle order
const orderStatuses = [
  'pending',
  'confirmed',
  'packed',
  'in_transit',
  'delivered',
  'cancelled',
];

class OrderModel {
  final String id;
  final String userId;
  final DateTime createdAt;
  final String status;
  final List<OrderItemModel> items;
  final int subtotal;
  final int deliveryFee;
  final int discount;
  final int total;
  final AddressModel deliveryAddress;
  final String paymentMethod; // razorpay | cod | wallet
  final String? razorpayOrderId;
  final String? razorpayPaymentId;
  final List<TrackingStep> timeline;

  const OrderModel({
    required this.id,
    required this.userId,
    required this.createdAt,
    required this.status,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.total,
    required this.deliveryAddress,
    required this.paymentMethod,
    this.razorpayOrderId,
    this.razorpayPaymentId,
    required this.timeline,
  });

  bool get isCancellable =>
      status == 'pending' || status == 'confirmed';

  bool get isReturnable => status == 'delivered';

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['order_items'] as List<dynamic>? ?? [])
        .map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final timelineList = (json['timeline'] as List<dynamic>? ?? [])
        .map((e) => TrackingStep.fromJson(e as Map<String, dynamic>))
        .toList();

    // Build default timeline from status if server doesn't provide one
    final resolvedTimeline = timelineList.isNotEmpty
        ? timelineList
        : _buildTimeline(json['status'] as String? ?? 'pending');

    return OrderModel(
      id: json['id'] as String,
      userId: json['user_id'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String),
      status: json['status'] as String? ?? 'pending',
      items: itemsList,
      subtotal: (json['subtotal'] as num?)?.toInt() ?? 0,
      deliveryFee: (json['delivery_fee'] as num?)?.toInt() ?? 0,
      discount: (json['discount'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
      deliveryAddress: AddressModel.fromJson(
        json['delivery_address'] as Map<String, dynamic>? ?? {},
      ),
      paymentMethod: json['payment_method'] as String? ?? 'razorpay',
      razorpayOrderId: json['razorpay_order_id'] as String?,
      razorpayPaymentId: json['razorpay_payment_id'] as String?,
      timeline: resolvedTimeline,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'created_at': createdAt.toIso8601String(),
        'status': status,
        'order_items': items.map((e) => e.toJson()).toList(),
        'subtotal': subtotal,
        'delivery_fee': deliveryFee,
        'discount': discount,
        'total': total,
        'delivery_address': deliveryAddress.toJson(),
        'payment_method': paymentMethod,
        if (razorpayOrderId != null) 'razorpay_order_id': razorpayOrderId,
        if (razorpayPaymentId != null)
          'razorpay_payment_id': razorpayPaymentId,
        'timeline': timeline.map((e) => e.toJson()).toList(),
      };

  static List<TrackingStep> _buildTimeline(String currentStatus) {
    const steps = [
      'Order Placed',
      'Confirmed',
      'Packed',
      'Out for Delivery',
      'Delivered',
    ];
    const statusMap = {
      'pending': 0,
      'confirmed': 1,
      'packed': 2,
      'in_transit': 3,
      'delivered': 4,
      'cancelled': -1,
    };
    final currentIdx = statusMap[currentStatus] ?? 0;

    return List.generate(steps.length, (i) {
      return TrackingStep(
        label: steps[i],
        time: null,
        isDone: i < currentIdx,
        isCurrent: i == currentIdx,
      );
    });
  }
}

class OrderItemModel {
  final String productId;
  final String name;
  final String imageUrl;
  final int price;
  final int quantity;
  final String size;
  final String color;

  const OrderItemModel({
    required this.productId,
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.quantity,
    required this.size,
    required this.color,
  });

  int get subtotal => price * quantity;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productId: json['product_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      price: (json['price'] as num?)?.toInt() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      size: json['size'] as String? ?? '',
      color: json['color'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'name': name,
        'image_url': imageUrl,
        'price': price,
        'quantity': quantity,
        'size': size,
        'color': color,
      };
}

class TrackingStep {
  final String label;
  final DateTime? time;
  final bool isDone;
  final bool isCurrent;

  const TrackingStep({
    required this.label,
    required this.time,
    required this.isDone,
    required this.isCurrent,
  });

  factory TrackingStep.fromJson(Map<String, dynamic> json) {
    return TrackingStep(
      label: json['label'] as String? ?? '',
      time: json['time'] != null
          ? DateTime.tryParse(json['time'] as String)
          : null,
      isDone: json['is_done'] as bool? ?? false,
      isCurrent: json['is_current'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        if (time != null) 'time': time!.toIso8601String(),
        'is_done': isDone,
        'is_current': isCurrent,
      };
}
