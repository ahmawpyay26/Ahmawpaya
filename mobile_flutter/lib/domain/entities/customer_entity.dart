import 'package:equatable/equatable.dart';

class CustomerEntity extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? address;
  final String? city;
  final String? region;
  final double? latitude;
  final double? longitude;
  final double creditLimit;
  final double currentBalance;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? lastOrderDate;

  const CustomerEntity({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.city,
    this.region,
    this.latitude,
    this.longitude,
    required this.creditLimit,
    required this.currentBalance,
    required this.isActive,
    required this.createdAt,
    this.lastOrderDate,
  });

  @override
  List<Object?> get props => [
    id,
    name,
    email,
    phone,
    address,
    city,
    region,
    latitude,
    longitude,
    creditLimit,
    currentBalance,
    isActive,
    createdAt,
    lastOrderDate,
  ];
}
