import 'package:dartz/dartz.dart';
import '../entities/order_entity.dart';

abstract class OrderRepository {
  Future<Either<Exception, List<OrderEntity>>> getAllOrders();
  Future<Either<Exception, OrderEntity>> getOrderById(String id);
  Future<Either<Exception, List<OrderEntity>>> getOrdersByCustomerId(String customerId);
  Future<Either<Exception, OrderEntity>> createOrder(OrderEntity order);
  Future<Either<Exception, OrderEntity>> updateOrder(OrderEntity order);
  Future<Either<Exception, void>> deleteOrder(String id);
  Future<Either<Exception, List<OrderEntity>>> getOrdersByStatus(String status);
}
