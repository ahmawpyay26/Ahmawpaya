import 'package:dartz/dartz.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/order_model.dart';

class OrderRepositoryImpl implements OrderRepository {
  final ApiDataSource apiDataSource;

  OrderRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, List<OrderEntity>>> getAllOrders() async {
    try {
      final orders = await apiDataSource.getAllOrders();
      return Right(orders.cast<OrderEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, OrderEntity>> getOrderById(String id) async {
    try {
      final order = await apiDataSource.getOrderById(id);
      return Right(order);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<OrderEntity>>> getOrdersByCustomerId(String customerId) async {
    try {
      final orders = await apiDataSource.getOrdersByCustomerId(customerId);
      return Right(orders.cast<OrderEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, OrderEntity>> createOrder(OrderEntity order) async {
    try {
      final items = order.items.map((item) {
        return OrderItemModel(
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        );
      }).toList();

      final orderModel = OrderModel(
        id: order.id,
        customerId: order.customerId,
        staffId: order.staffId,
        status: order.status,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        notes: order.notes,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate,
        completedAt: order.completedAt,
        items: items,
      );
      final createdOrder = await apiDataSource.createOrder(orderModel);
      return Right(createdOrder);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, OrderEntity>> updateOrder(OrderEntity order) async {
    try {
      final items = order.items.map((item) {
        return OrderItemModel(
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        );
      }).toList();

      final orderModel = OrderModel(
        id: order.id,
        customerId: order.customerId,
        staffId: order.staffId,
        status: order.status,
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        finalAmount: order.finalAmount,
        notes: order.notes,
        createdAt: order.createdAt,
        deliveryDate: order.deliveryDate,
        completedAt: order.completedAt,
        items: items,
      );
      final updatedOrder = await apiDataSource.updateOrder(orderModel);
      return Right(updatedOrder);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteOrder(String id) async {
    try {
      await apiDataSource.deleteOrder(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<OrderEntity>>> getOrdersByStatus(String status) async {
    try {
      final allOrders = await apiDataSource.getAllOrders();
      final filteredOrders = allOrders.where((order) => order.status.toString().split('.').last == status).toList();
      return Right(filteredOrders.cast<OrderEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
