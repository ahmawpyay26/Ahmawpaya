import 'package:dartz/dartz.dart';
import '../../domain/entities/fleet_entity.dart';
import '../../domain/repositories/fleet_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/vehicle_model.dart';

class FleetRepositoryImpl implements FleetRepository {
  final ApiDataSource apiDataSource;

  FleetRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, List<VehicleEntity>>> getAllVehicles() async {
    try {
      final vehicles = await apiDataSource.getAllVehicles();
      return Right(vehicles.cast<VehicleEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, VehicleEntity>> getVehicleById(String id) async {
    try {
      final vehicle = await apiDataSource.getVehicleById(id);
      return Right(vehicle);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, VehicleEntity>> createVehicle(VehicleEntity vehicle) async {
    try {
      final vehicleModel = VehicleModel(
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        model: vehicle.model,
        manufacturer: vehicle.manufacturer,
        year: vehicle.year,
        status: vehicle.status,
        assignedDriverId: vehicle.assignedDriverId,
        currentLatitude: vehicle.currentLatitude,
        currentLongitude: vehicle.currentLongitude,
        currentCapacity: vehicle.currentCapacity,
        maxCapacity: vehicle.maxCapacity,
        lastMaintenanceDate: vehicle.lastMaintenanceDate,
        createdAt: vehicle.createdAt,
      );
      final createdVehicle = await apiDataSource.createVehicle(vehicleModel);
      return Right(createdVehicle);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, VehicleEntity>> updateVehicle(VehicleEntity vehicle) async {
    try {
      final vehicleModel = VehicleModel(
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        model: vehicle.model,
        manufacturer: vehicle.manufacturer,
        year: vehicle.year,
        status: vehicle.status,
        assignedDriverId: vehicle.assignedDriverId,
        currentLatitude: vehicle.currentLatitude,
        currentLongitude: vehicle.currentLongitude,
        currentCapacity: vehicle.currentCapacity,
        maxCapacity: vehicle.maxCapacity,
        lastMaintenanceDate: vehicle.lastMaintenanceDate,
        createdAt: vehicle.createdAt,
      );
      final updatedVehicle = await apiDataSource.updateVehicle(vehicleModel);
      return Right(updatedVehicle);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteVehicle(String id) async {
    try {
      await apiDataSource.deleteVehicle(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<VehicleEntity>>> getVehiclesByStatus(String status) async {
    try {
      final allVehicles = await apiDataSource.getAllVehicles();
      final filteredVehicles = allVehicles.where((vehicle) => vehicle.status.toString().split('.').last == status).toList();
      return Right(filteredVehicles.cast<VehicleEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<DeliveryRouteEntity>>> getAllDeliveryRoutes() async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, DeliveryRouteEntity>> getDeliveryRouteById(String id) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, DeliveryRouteEntity>> createDeliveryRoute(DeliveryRouteEntity route) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, DeliveryRouteEntity>> updateDeliveryRoute(DeliveryRouteEntity route) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteDeliveryRoute(String id) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<DeliveryRouteEntity>>> getRoutesByVehicleId(String vehicleId) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
