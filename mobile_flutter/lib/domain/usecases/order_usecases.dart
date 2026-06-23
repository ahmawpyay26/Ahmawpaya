import 'package:dartz/dartz.dart';
import '../entities/order_entity.dart';
import '../repositories/order_repository.dart';

class GetAllOrdersUseCase {
  final OrderRepository repository;

  GetAllOrdersUseCase(this.repository);

  Future<Either<Exception, List<OrderEntity>>> call() {
    return repository.getAllOrders();
  }
}

class GetOrderByIdUseCase {
  final OrderRepository repository;

  GetOrderByIdUseCase(this.repository);

  Future<Either<Exception, OrderEntity>> call(String id) {
    return repository.getOrderById(id);
  }
}

class GetOrdersByCustomerIdUseCase {
  final OrderRepository repository;

  GetOrdersByCustomerIdUseCase(this.repository);

  Future<Either<Exception, List<OrderEntity>>> call(String customerId) {
    return repository.getOrdersByCustomerId(customerId);
  }
}

class CreateOrderUseCase {
  final OrderRepository repository;

  CreateOrderUseCase(this.repository);

  Future<Either<Exception, OrderEntity>> call(OrderEntity order) {
    return repository.createOrder(order);
  }
}

class UpdateOrderUseCase {
  final OrderRepository repository;

  UpdateOrderUseCase(this.repository);

  Future<Either<Exception, OrderEntity>> call(OrderEntity order) {
    return repository.updateOrder(order);
  }
}

class DeleteOrderUseCase {
  final OrderRepository repository;

  DeleteOrderUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteOrder(id);
  }
}

class GetOrdersByStatusUseCase {
  final OrderRepository repository;

  GetOrdersByStatusUseCase(this.repository);

  Future<Either<Exception, List<OrderEntity>>> call(String status) {
    return repository.getOrdersByStatus(status);
  }
}
