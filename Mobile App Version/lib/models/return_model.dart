class ReturnModel {
  final String id;
  final String orderId;
  final String userId;
  final String status; // requested | approved | pickup_scheduled | picked_up | refund_initiated | refund_done | rejected
  final String reason;
  final List<ReturnItemModel> items;
  final int refundAmount;
  final String? refundStatus; // pending | initiated | done
  final List<ReturnTimelineStep> timeline;
  final DateTime createdAt;
  final String? rejectionReason;

  const ReturnModel({
    required this.id,
    required this.orderId,
    required this.userId,
    required this.status,
    required this.reason,
    required this.items,
    required this.refundAmount,
    this.refundStatus,
    required this.timeline,
    required this.createdAt,
    this.rejectionReason,
  });

  factory ReturnModel.fromJson(Map<String, dynamic> json) {
    final itemsList = (json['items'] as List<dynamic>? ?? [])
        .map((e) => ReturnItemModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final timelineList = (json['timeline'] as List<dynamic>? ?? [])
        .map((e) =>
            ReturnTimelineStep.fromJson(e as Map<String, dynamic>))
        .toList();

    return ReturnModel(
      id: json['id'] as String,
      orderId: json['order_id'] as String? ?? '',
      userId: json['user_id'] as String? ?? '',
      status: json['status'] as String? ?? 'requested',
      reason: json['reason'] as String? ?? '',
      items: itemsList,
      refundAmount: (json['refund_amount'] as num?)?.toInt() ?? 0,
      refundStatus: json['refund_status'] as String?,
      timeline: timelineList,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      rejectionReason: json['rejection_reason'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'order_id': orderId,
        'user_id': userId,
        'status': status,
        'reason': reason,
        'items': items.map((e) => e.toJson()).toList(),
        'refund_amount': refundAmount,
        if (refundStatus != null) 'refund_status': refundStatus,
        'timeline': timeline.map((e) => e.toJson()).toList(),
        'created_at': createdAt.toIso8601String(),
        if (rejectionReason != null) 'rejection_reason': rejectionReason,
      };

  ReturnModel copyWith({
    String? id,
    String? orderId,
    String? userId,
    String? status,
    String? reason,
    List<ReturnItemModel>? items,
    int? refundAmount,
    String? refundStatus,
    List<ReturnTimelineStep>? timeline,
    DateTime? createdAt,
    String? rejectionReason,
  }) {
    return ReturnModel(
      id: id ?? this.id,
      orderId: orderId ?? this.orderId,
      userId: userId ?? this.userId,
      status: status ?? this.status,
      reason: reason ?? this.reason,
      items: items ?? this.items,
      refundAmount: refundAmount ?? this.refundAmount,
      refundStatus: refundStatus ?? this.refundStatus,
      timeline: timeline ?? this.timeline,
      createdAt: createdAt ?? this.createdAt,
      rejectionReason: rejectionReason ?? this.rejectionReason,
    );
  }
}

class ReturnItemModel {
  final String productId;
  final String name;
  final String imageUrl;
  final int quantity;
  final String size;
  final String color;

  const ReturnItemModel({
    required this.productId,
    required this.name,
    required this.imageUrl,
    required this.quantity,
    required this.size,
    required this.color,
  });

  factory ReturnItemModel.fromJson(Map<String, dynamic> json) {
    return ReturnItemModel(
      productId: json['product_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      imageUrl: json['image_url'] as String? ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      size: json['size'] as String? ?? '',
      color: json['color'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'product_id': productId,
        'name': name,
        'image_url': imageUrl,
        'quantity': quantity,
        'size': size,
        'color': color,
      };
}

class ReturnTimelineStep {
  final String label;
  final DateTime? time;
  final bool isDone;

  const ReturnTimelineStep({
    required this.label,
    required this.time,
    required this.isDone,
  });

  factory ReturnTimelineStep.fromJson(Map<String, dynamic> json) {
    return ReturnTimelineStep(
      label: json['label'] as String? ?? '',
      time: json['time'] != null
          ? DateTime.tryParse(json['time'] as String)
          : null,
      isDone: json['is_done'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'label': label,
        if (time != null) 'time': time!.toIso8601String(),
        'is_done': isDone,
      };
}
