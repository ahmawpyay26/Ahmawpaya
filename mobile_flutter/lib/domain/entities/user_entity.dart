import 'package:equatable/equatable.dart';

enum UserRole { admin, staff, customer }

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String username;
  final String fullName;
  final String? phone;
  final UserRole role;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? lastLogin;

  const UserEntity({
    required this.id,
    required this.email,
    required this.username,
    required this.fullName,
    this.phone,
    required this.role,
    required this.isActive,
    required this.createdAt,
    this.lastLogin,
  });

  @override
  List<Object?> get props => [
    id,
    email,
    username,
    fullName,
    phone,
    role,
    isActive,
    createdAt,
    lastLogin,
  ];
}
