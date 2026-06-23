import 'package:equatable/equatable.dart';

enum VehicleStatus { active, maintenance, inactive }

class VehicleEntity extends Equatable {
  final String id;
  final String licensePlate;
  final String model;
  final String manufacturer;
  final int year;
  final VehicleStatus status;
  final String? assignedDriverId;
  final double? currentLatitude;
  final double? currentLongitude;
  final int currentCapacity;
  final int maxCapacity;
  final DateTime lastMaintenanceDate;
  final DateTime createdAt;

  const VehicleEntity({
    required this.id,
    required this.licensePlate,
    required this.model,
    required this.manufacturer,
    required this.year,
    required this.status,
    this.assignedDriverId,
    this.currentLatitude,
    this.currentLongitude,
    required this.currentCapacity,
    required this.maxCapacity,
    required this.lastMaintenanceDate,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    licensePlate,
    model,
    manufacturer,
    year,
    status,
    assignedDriverId,
    currentLatitude,
    currentLongitude,
    currentCapacity,
    maxCapacity,
    lastMaintenanceDate,
    createdAt,
  ];
}

class DeliveryRouteEntity extends Equatable {
  final String id;
  final String vehicleId;
  final String driverId;
  final DateTime scheduledDate;
  final int totalStops;
  final int completedStops;
  final double totalDistance;
  final String status; // 'pending', 'in_progress', 'completed', 'cancelled'
  final DateTime createdAt;

  const DeliveryRouteEntity({
    required this.id,
    required this.vehicleId,
    required this.driverId,
    required this.scheduledDate,
    required this.totalStops,
    required this.completedStops,
    required this.totalDistance,
    required this.status,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    vehicleId,
    driverId,
    scheduledDate,
    totalStops,
    completedStops,
    totalDistance,
    status,
    createdAt,
  ];
}
