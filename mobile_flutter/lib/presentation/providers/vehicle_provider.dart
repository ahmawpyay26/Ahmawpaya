import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/fleet_entity.dart';
import '../../domain/usecases/fleet_usecases.dart';

// Vehicle state
class VehicleState {
  final List<VehicleEntity> vehicles;
  final VehicleEntity? selectedVehicle;
  final bool isLoading;
  final String? error;

  VehicleState({
    this.vehicles = const [],
    this.selectedVehicle,
    this.isLoading = false,
    this.error,
  });

  VehicleState copyWith({
    List<VehicleEntity>? vehicles,
    VehicleEntity? selectedVehicle,
    bool? isLoading,
    String? error,
  }) {
    return VehicleState(
      vehicles: vehicles ?? this.vehicles,
      selectedVehicle: selectedVehicle ?? this.selectedVehicle,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Vehicle notifier
class VehicleNotifier extends StateNotifier<VehicleState> {
  final GetAllVehiclesUseCase getAllVehiclesUseCase;
  final GetVehicleByIdUseCase getVehicleByIdUseCase;
  final CreateVehicleUseCase createVehicleUseCase;
  final UpdateVehicleUseCase updateVehicleUseCase;
  final DeleteVehicleUseCase deleteVehicleUseCase;
  final GetVehiclesByStatusUseCase getVehiclesByStatusUseCase;

  VehicleNotifier({
    required this.getAllVehiclesUseCase,
    required this.getVehicleByIdUseCase,
    required this.createVehicleUseCase,
    required this.updateVehicleUseCase,
    required this.deleteVehicleUseCase,
    required this.getVehiclesByStatusUseCase,
  }) : super(VehicleState());

  Future<void> getAllVehicles() async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getAllVehiclesUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (vehicles) {
        state = state.copyWith(
          isLoading: false,
          vehicles: vehicles,
          error: null,
        );
      },
    );
  }

  Future<void> getVehicleById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getVehicleByIdUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (vehicle) {
        state = state.copyWith(
          isLoading: false,
          selectedVehicle: vehicle,
          error: null,
        );
      },
    );
  }

  Future<void> createVehicle(VehicleEntity vehicle) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await createVehicleUseCase(vehicle);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (createdVehicle) {
        state = state.copyWith(
          isLoading: false,
          vehicles: [...state.vehicles, createdVehicle],
          error: null,
        );
      },
    );
  }

  Future<void> updateVehicle(VehicleEntity vehicle) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await updateVehicleUseCase(vehicle);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (updatedVehicle) {
        final updatedVehicles = state.vehicles.map((v) => v.id == updatedVehicle.id ? updatedVehicle : v).toList();
        state = state.copyWith(
          isLoading: false,
          vehicles: updatedVehicles,
          selectedVehicle: updatedVehicle,
          error: null,
        );
      },
    );
  }

  Future<void> deleteVehicle(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await deleteVehicleUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        final updatedVehicles = state.vehicles.where((v) => v.id != id).toList();
        state = state.copyWith(
          isLoading: false,
          vehicles: updatedVehicles,
          selectedVehicle: null,
          error: null,
        );
      },
    );
  }

  Future<void> getVehiclesByStatus(String status) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getVehiclesByStatusUseCase(status);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (vehicles) {
        state = state.copyWith(
          isLoading: false,
          vehicles: vehicles,
          error: null,
        );
      },
    );
  }
}

// Vehicle provider
final vehicleProvider = StateNotifierProvider<VehicleNotifier, VehicleState>((ref) {
  return VehicleNotifier(
    getAllVehiclesUseCase: getIt<GetAllVehiclesUseCase>(),
    getVehicleByIdUseCase: getIt<GetVehicleByIdUseCase>(),
    createVehicleUseCase: getIt<CreateVehicleUseCase>(),
    updateVehicleUseCase: getIt<UpdateVehicleUseCase>(),
    deleteVehicleUseCase: getIt<DeleteVehicleUseCase>(),
    getVehiclesByStatusUseCase: getIt<GetVehiclesByStatusUseCase>(),
  );
});

// Selectors
final allVehiclesProvider = Provider<List<VehicleEntity>>((ref) {
  return ref.watch(vehicleProvider).vehicles;
});

final selectedVehicleProvider = Provider<VehicleEntity?>((ref) {
  return ref.watch(vehicleProvider).selectedVehicle;
});

final vehicleLoadingProvider = Provider<bool>((ref) {
  return ref.watch(vehicleProvider).isLoading;
});

final vehicleErrorProvider = Provider<String?>((ref) {
  return ref.watch(vehicleProvider).error;
});
