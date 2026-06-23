import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/usecases/order_usecases.dart';

// Order state
class OrderState {
  final List<OrderEntity> orders;
  final OrderEntity? selectedOrder;
  final bool isLoading;
  final String? error;

  OrderState({
    this.orders = const [],
    this.selectedOrder,
    this.isLoading = false,
    this.error,
  });

  OrderState copyWith({
    List<OrderEntity>? orders,
    OrderEntity? selectedOrder,
    bool? isLoading,
    String? error,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      selectedOrder: selectedOrder ?? this.selectedOrder,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Order notifier
class OrderNotifier extends StateNotifier<OrderState> {
  final GetAllOrdersUseCase getAllOrdersUseCase;
  final GetOrderByIdUseCase getOrderByIdUseCase;
  final GetOrdersByCustomerIdUseCase getOrdersByCustomerIdUseCase;
  final CreateOrderUseCase createOrderUseCase;
  final UpdateOrderUseCase updateOrderUseCase;
  final DeleteOrderUseCase deleteOrderUseCase;
  final GetOrdersByStatusUseCase getOrdersByStatusUseCase;

  OrderNotifier({
    required this.getAllOrdersUseCase,
    required this.getOrderByIdUseCase,
    required this.getOrdersByCustomerIdUseCase,
    required this.createOrderUseCase,
    required this.updateOrderUseCase,
    required this.deleteOrderUseCase,
    required this.getOrdersByStatusUseCase,
  }) : super(OrderState());

  Future<void> getAllOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getAllOrdersUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (orders) {
        state = state.copyWith(
          isLoading: false,
          orders: orders,
          error: null,
        );
      },
    );
  }

  Future<void> getOrderById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getOrderByIdUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (order) {
        state = state.copyWith(
          isLoading: false,
          selectedOrder: order,
          error: null,
        );
      },
    );
  }

  Future<void> getOrdersByCustomerId(String customerId) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getOrdersByCustomerIdUseCase(customerId);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (orders) {
        state = state.copyWith(
          isLoading: false,
          orders: orders,
          error: null,
        );
      },
    );
  }

  Future<void> createOrder(OrderEntity order) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await createOrderUseCase(order);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (createdOrder) {
        state = state.copyWith(
          isLoading: false,
          orders: [...state.orders, createdOrder],
          error: null,
        );
      },
    );
  }

  Future<void> updateOrder(OrderEntity order) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await updateOrderUseCase(order);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (updatedOrder) {
        final updatedOrders = state.orders.map((o) => o.id == updatedOrder.id ? updatedOrder : o).toList();
        state = state.copyWith(
          isLoading: false,
          orders: updatedOrders,
          selectedOrder: updatedOrder,
          error: null,
        );
      },
    );
  }

  Future<void> deleteOrder(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await deleteOrderUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        final updatedOrders = state.orders.where((o) => o.id != id).toList();
        state = state.copyWith(
          isLoading: false,
          orders: updatedOrders,
          selectedOrder: null,
          error: null,
        );
      },
    );
  }

  Future<void> getOrdersByStatus(String status) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getOrdersByStatusUseCase(status);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (orders) {
        state = state.copyWith(
          isLoading: false,
          orders: orders,
          error: null,
        );
      },
    );
  }
}

// Order provider
final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  return OrderNotifier(
    getAllOrdersUseCase: getIt<GetAllOrdersUseCase>(),
    getOrderByIdUseCase: getIt<GetOrderByIdUseCase>(),
    getOrdersByCustomerIdUseCase: getIt<GetOrdersByCustomerIdUseCase>(),
    createOrderUseCase: getIt<CreateOrderUseCase>(),
    updateOrderUseCase: getIt<UpdateOrderUseCase>(),
    deleteOrderUseCase: getIt<DeleteOrderUseCase>(),
    getOrdersByStatusUseCase: getIt<GetOrdersByStatusUseCase>(),
  );
});

// Selectors
final allOrdersProvider = Provider<List<OrderEntity>>((ref) {
  return ref.watch(orderProvider).orders;
});

final selectedOrderProvider = Provider<OrderEntity?>((ref) {
  return ref.watch(orderProvider).selectedOrder;
});

final orderLoadingProvider = Provider<bool>((ref) {
  return ref.watch(orderProvider).isLoading;
});

final orderErrorProvider = Provider<String?>((ref) {
  return ref.watch(orderProvider).error;
});
