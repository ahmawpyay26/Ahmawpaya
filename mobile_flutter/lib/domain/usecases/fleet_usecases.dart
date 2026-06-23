import 'package:dartz/dartz.dart';
import '../entities/fleet_entity.dart';
import '../repositories/fleet_repository.dart';

// Vehicle Use Cases
class GetAllVehiclesUseCase {
  final FleetRepository repository;

  GetAllVehiclesUseCase(this.repository);

  Future<Either<Exception, List<VehicleEntity>>> call() {
    return repository.getAllVehicles();
  }
}

class GetVehicleByIdUseCase {
  final FleetRepository repository;

  GetVehicleByIdUseCase(this.repository);

  Future<Either<Exception, VehicleEntity>> call(String id) {
    return repository.getVehicleById(id);
  }
}

class CreateVehicleUseCase {
  final FleetRepository repository;

  CreateVehicleUseCase(this.repository);

  Future<Either<Exception, VehicleEntity>> call(VehicleEntity vehicle) {
    return repository.createVehicle(vehicle);
  }
}

class UpdateVehicleUseCase {
  final FleetRepository repository;

  UpdateVehicleUseCase(this.repository);

  Future<Either<Exception, VehicleEntity>> call(VehicleEntity vehicle) {
    return repository.updateVehicle(vehicle);
  }
}

class DeleteVehicleUseCase {
  final FleetRepository repository;

  DeleteVehicleUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteVehicle(id);
  }
}

class GetVehiclesByStatusUseCase {
  final FleetRepository repository;

  GetVehiclesByStatusUseCase(this.repository);

  Future<Either<Exception, List<VehicleEntity>>> call(String status) {
    return repository.getVehiclesByStatus(status);
  }
}

// Delivery Route Use Cases
class GetAllDeliveryRoutesUseCase {
  final FleetRepository repository;

  GetAllDeliveryRoutesUseCase(this.repository);

  Future<Either<Exception, List<DeliveryRouteEntity>>> call() {
    return repository.getAllDeliveryRoutes();
  }
}

class GetDeliveryRouteByIdUseCase {
  final FleetRepository repository;

  GetDeliveryRouteByIdUseCase(this.repository);

  Future<Either<Exception, DeliveryRouteEntity>> call(String id) {
    return repository.getDeliveryRouteById(id);
  }
}

class CreateDeliveryRouteUseCase {
  final FleetRepository repository;

  CreateDeliveryRouteUseCase(this.repository);

  Future<Either<Exception, DeliveryRouteEntity>> call(DeliveryRouteEntity route) {
    return repository.createDeliveryRoute(route);
  }
}

class UpdateDeliveryRouteUseCase {
  final FleetRepository repository;

  UpdateDeliveryRouteUseCase(this.repository);

  Future<Either<Exception, DeliveryRouteEntity>> call(DeliveryRouteEntity route) {
    return repository.updateDeliveryRoute(route);
  }
}

class DeleteDeliveryRouteUseCase {
  final FleetRepository repository;

  DeleteDeliveryRouteUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteDeliveryRoute(id);
  }
}

class GetRoutesByVehicleIdUseCase {
  final FleetRepository repository;

  GetRoutesByVehicleIdUseCase(this.repository);

  Future<Either<Exception, List<DeliveryRouteEntity>>> call(String vehicleId) {
    return repository.getRoutesByVehicleId(vehicleId);
  }
}
