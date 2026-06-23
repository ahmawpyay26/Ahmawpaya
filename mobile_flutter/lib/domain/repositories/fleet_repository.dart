import 'package:dartz/dartz.dart';
import '../entities/fleet_entity.dart';

abstract class FleetRepository {
  Future<Either<Exception, List<VehicleEntity>>> getAllVehicles();
  Future<Either<Exception, VehicleEntity>> getVehicleById(String id);
  Future<Either<Exception, VehicleEntity>> createVehicle(VehicleEntity vehicle);
  Future<Either<Exception, VehicleEntity>> updateVehicle(VehicleEntity vehicle);
  Future<Either<Exception, void>> deleteVehicle(String id);
  Future<Either<Exception, List<VehicleEntity>>> getVehiclesByStatus(String status);
  
  Future<Either<Exception, List<DeliveryRouteEntity>>> getAllDeliveryRoutes();
  Future<Either<Exception, DeliveryRouteEntity>> getDeliveryRouteById(String id);
  Future<Either<Exception, DeliveryRouteEntity>> createDeliveryRoute(DeliveryRouteEntity route);
  Future<Either<Exception, DeliveryRouteEntity>> updateDeliveryRoute(DeliveryRouteEntity route);
  Future<Either<Exception, void>> deleteDeliveryRoute(String id);
  Future<Either<Exception, List<DeliveryRouteEntity>>> getRoutesByVehicleId(String vehicleId);
}
