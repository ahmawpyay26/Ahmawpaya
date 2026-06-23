import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/customer_entity.dart';
import '../../domain/usecases/customer_usecases.dart';

// Customer state
class CustomerState {
  final List<CustomerEntity> customers;
  final CustomerEntity? selectedCustomer;
  final bool isLoading;
  final String? error;

  CustomerState({
    this.customers = const [],
    this.selectedCustomer,
    this.isLoading = false,
    this.error,
  });

  CustomerState copyWith({
    List<CustomerEntity>? customers,
    CustomerEntity? selectedCustomer,
    bool? isLoading,
    String? error,
  }) {
    return CustomerState(
      customers: customers ?? this.customers,
      selectedCustomer: selectedCustomer ?? this.selectedCustomer,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Customer notifier
class CustomerNotifier extends StateNotifier<CustomerState> {
  final GetAllCustomersUseCase getAllCustomersUseCase;
  final GetCustomerByIdUseCase getCustomerByIdUseCase;
  final CreateCustomerUseCase createCustomerUseCase;
  final UpdateCustomerUseCase updateCustomerUseCase;
  final DeleteCustomerUseCase deleteCustomerUseCase;
  final SearchCustomersUseCase searchCustomersUseCase;
  final GetCustomersByRegionUseCase getCustomersByRegionUseCase;

  CustomerNotifier({
    required this.getAllCustomersUseCase,
    required this.getCustomerByIdUseCase,
    required this.createCustomerUseCase,
    required this.updateCustomerUseCase,
    required this.deleteCustomerUseCase,
    required this.searchCustomersUseCase,
    required this.getCustomersByRegionUseCase,
  }) : super(CustomerState());

  Future<void> getAllCustomers() async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getAllCustomersUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (customers) {
        state = state.copyWith(
          isLoading: false,
          customers: customers,
          error: null,
        );
      },
    );
  }

  Future<void> getCustomerById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getCustomerByIdUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (customer) {
        state = state.copyWith(
          isLoading: false,
          selectedCustomer: customer,
          error: null,
        );
      },
    );
  }

  Future<void> createCustomer(CustomerEntity customer) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await createCustomerUseCase(customer);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (createdCustomer) {
        state = state.copyWith(
          isLoading: false,
          customers: [...state.customers, createdCustomer],
          error: null,
        );
      },
    );
  }

  Future<void> updateCustomer(CustomerEntity customer) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await updateCustomerUseCase(customer);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (updatedCustomer) {
        final updatedCustomers = state.customers.map((c) => c.id == updatedCustomer.id ? updatedCustomer : c).toList();
        state = state.copyWith(
          isLoading: false,
          customers: updatedCustomers,
          selectedCustomer: updatedCustomer,
          error: null,
        );
      },
    );
  }

  Future<void> deleteCustomer(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await deleteCustomerUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        final updatedCustomers = state.customers.where((c) => c.id != id).toList();
        state = state.copyWith(
          isLoading: false,
          customers: updatedCustomers,
          selectedCustomer: null,
          error: null,
        );
      },
    );
  }

  Future<void> searchCustomers(String query) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await searchCustomersUseCase(query);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (customers) {
        state = state.copyWith(
          isLoading: false,
          customers: customers,
          error: null,
        );
      },
    );
  }

  Future<void> getCustomersByRegion(String region) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getCustomersByRegionUseCase(region);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (customers) {
        state = state.copyWith(
          isLoading: false,
          customers: customers,
          error: null,
        );
      },
    );
  }
}

// Customer provider
final customerProvider = StateNotifierProvider<CustomerNotifier, CustomerState>((ref) {
  return CustomerNotifier(
    getAllCustomersUseCase: getIt<GetAllCustomersUseCase>(),
    getCustomerByIdUseCase: getIt<GetCustomerByIdUseCase>(),
    createCustomerUseCase: getIt<CreateCustomerUseCase>(),
    updateCustomerUseCase: getIt<UpdateCustomerUseCase>(),
    deleteCustomerUseCase: getIt<DeleteCustomerUseCase>(),
    searchCustomersUseCase: getIt<SearchCustomersUseCase>(),
    getCustomersByRegionUseCase: getIt<GetCustomersByRegionUseCase>(),
  );
});

// Selectors
final allCustomersProvider = Provider<List<CustomerEntity>>((ref) {
  return ref.watch(customerProvider).customers;
});

final selectedCustomerProvider = Provider<CustomerEntity?>((ref) {
  return ref.watch(customerProvider).selectedCustomer;
});

final customerLoadingProvider = Provider<bool>((ref) {
  return ref.watch(customerProvider).isLoading;
});

final customerErrorProvider = Provider<String?>((ref) {
  return ref.watch(customerProvider).error;
});
