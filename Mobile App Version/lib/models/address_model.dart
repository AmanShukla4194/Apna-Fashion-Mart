class AddressModel {
  final String id;
  final String userId;
  final String label; // HOME, WORK, OTHER
  final String name;
  final String line1;
  final String? line2;
  final String city;
  final String state;
  final String pincode;
  final String phone;
  final bool isDefault;

  const AddressModel({
    required this.id,
    required this.userId,
    required this.label,
    required this.name,
    required this.line1,
    this.line2,
    required this.city,
    required this.state,
    required this.pincode,
    required this.phone,
    this.isDefault = false,
  });

  String get fullAddress {
    final parts = [line1];
    if (line2 != null && line2!.isNotEmpty) parts.add(line2!);
    parts.add(city);
    parts.add(state);
    parts.add(pincode);
    return parts.join(', ');
  }

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] as String,
      userId: json['user_id'] as String? ?? '',
      label: json['label'] as String? ?? 'HOME',
      name: json['name'] as String? ?? '',
      line1: json['line1'] as String? ?? '',
      line2: json['line2'] as String?,
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      pincode: json['pincode'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      isDefault: json['is_default'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'label': label,
        'name': name,
        'line1': line1,
        if (line2 != null) 'line2': line2,
        'city': city,
        'state': state,
        'pincode': pincode,
        'phone': phone,
        'is_default': isDefault,
      };

  AddressModel copyWith({
    String? id,
    String? userId,
    String? label,
    String? name,
    String? line1,
    String? line2,
    String? city,
    String? state,
    String? pincode,
    String? phone,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      label: label ?? this.label,
      name: name ?? this.name,
      line1: line1 ?? this.line1,
      line2: line2 ?? this.line2,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      phone: phone ?? this.phone,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
