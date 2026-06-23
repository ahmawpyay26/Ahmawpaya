import '../../domain/entities/customer_entity.dart';

class CustomerModel extends CustomerEntity {
  const CustomerModel({
    required String id,
    required String name,
    required String email,
    String? phone,
    String? address,
    String? city,
    String? region,
    double? latitude,
    double? longitude,
    required double creditLimit,
    required double currentBalance,
    required bool isActive,
    required DateTime createdAt,
    DateTime? lastOrderDate,
  }) : super(
    id: id,
    name: name,
    email: email,
    phone: phone,
    address: address,
    city: city,
    region: region,
    latitude: latitude,
    longitude: longitude,
    creditLimit: creditLimit,
    currentBalance: currentBalance,
    isActive: isActive,
    createdAt: createdAt,
    lastOrderDate: lastOrderDate,
  );

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      region: json['region'] as String?,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      creditLimit: (json['creditLimit'] as num).toDouble(),
      currentBalance: (json['currentBalance'] as num).toDouble(),
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastOrderDate: json['lastOrderDate'] != null ? DateTime.parse(json['lastOrderDate'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'address': address,
      'city': city,
      'region': region,
      'latitude': latitude,
      'longitude': longitude,
      'creditLimit': creditLimit,
      'currentBalance': currentBalance,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'lastOrderDate': lastOrderDate?.toIso8601String(),
    };
  }
}
