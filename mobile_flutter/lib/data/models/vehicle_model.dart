import '../../domain/entities/fleet_entity.dart';

class VehicleModel extends VehicleEntity {
  const VehicleModel({
    required String id,
    required String licensePlate,
    required String model,
    required String manufacturer,
    required int year,
    required VehicleStatus status,
    String? assignedDriverId,
    double? currentLatitude,
    double? currentLongitude,
    required int currentCapacity,
    required int maxCapacity,
    required DateTime lastMaintenanceDate,
    required DateTime createdAt,
  }) : super(
    id: id,
    licensePlate: licensePlate,
    model: model,
    manufacturer: manufacturer,
    year: year,
    status: status,
    assignedDriverId: assignedDriverId,
    currentLatitude: currentLatitude,
    currentLongitude: currentLongitude,
    currentCapacity: currentCapacity,
    maxCapacity: maxCapacity,
    lastMaintenanceDate: lastMaintenanceDate,
    createdAt: createdAt,
  );

  factory VehicleModel.fromJson(Map<String, dynamic> json) {
    return VehicleModel(
      id: json['id'] as String,
      licensePlate: json['licensePlate'] as String,
      model: json['model'] as String,
      manufacturer: json['manufacturer'] as String,
      year: json['year'] as int,
      status: VehicleStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => VehicleStatus.active,
      ),
      assignedDriverId: json['assignedDriverId'] as String?,
      currentLatitude: json['currentLatitude'] != null ? (json['currentLatitude'] as num).toDouble() : null,
      currentLongitude: json['currentLongitude'] != null ? (json['currentLongitude'] as num).toDouble() : null,
      currentCapacity: json['currentCapacity'] as int,
      maxCapacity: json['maxCapacity'] as int,
      lastMaintenanceDate: DateTime.parse(json['lastMaintenanceDate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'licensePlate': licensePlate,
      'model': model,
      'manufacturer': manufacturer,
      'year': year,
      'status': status.toString().split('.').last,
      'assignedDriverId': assignedDriverId,
      'currentLatitude': currentLatitude,
      'currentLongitude': currentLongitude,
      'currentCapacity': currentCapacity,
      'maxCapacity': maxCapacity,
      'lastMaintenanceDate': lastMaintenanceDate.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class DeliveryRouteModel extends DeliveryRouteEntity {
  const DeliveryRouteModel({
    required String id,
    required String vehicleId,
    required String driverId,
    required DateTime scheduledDate,
    required int totalStops,
    required int completedStops,
    required double totalDistance,
    required String status,
    required DateTime createdAt,
  }) : super(
    id: id,
    vehicleId: vehicleId,
    driverId: driverId,
    scheduledDate: scheduledDate,
    totalStops: totalStops,
    completedStops: completedStops,
    totalDistance: totalDistance,
    status: status,
    createdAt: createdAt,
  );

  factory DeliveryRouteModel.fromJson(Map<String, dynamic> json) {
    return DeliveryRouteModel(
      id: json['id'] as String,
      vehicleId: json['vehicleId'] as String,
      driverId: json['driverId'] as String,
      scheduledDate: DateTime.parse(json['scheduledDate'] as String),
      totalStops: json['totalStops'] as int,
      completedStops: json['completedStops'] as int? ?? 0,
      totalDistance: (json['totalDistance'] as num).toDouble(),
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'vehicleId': vehicleId,
      'driverId': driverId,
      'scheduledDate': scheduledDate.toIso8601String(),
      'totalStops': totalStops,
      'completedStops': completedStops,
      'totalDistance': totalDistance,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
