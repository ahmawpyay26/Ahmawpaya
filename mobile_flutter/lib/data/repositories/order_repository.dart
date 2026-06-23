import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class OrderRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  OrderRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, Map<String, dynamic>>> createOrder(
    Map<String, dynamic> orderData,
  ) async {
    try {
      final result = await remoteDataSource.createOrder(orderData);
      await localDataSource.saveOrder(result);
      return Right(result);
    } catch (e) {
      await localDataSource.saveOrder(orderData);
      return Left(e.toString());
    }
  }

  Future<Either<String, List<Map<String, dynamic>>>> getOrders() async {
    try {
      final result = await remoteDataSource.getOrders();
      for (var order in result) {
        await localDataSource.saveOrder(order);
      }
      return Right(result);
    } catch (e) {
      final localOrders = await localDataSource.getAllOrders();
      return Right(localOrders);
    }
  }

  Future<Either<String, void>> updateOrder(
    String orderId,
    Map<String, dynamic> updates,
  ) async {
    try {
      final order = await localDataSource.getOrder(orderId);
      if (order != null) {
        final updated = {...order, ...updates};
        await localDataSource.saveOrder(updated);
      }
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, void>> deleteOrder(String orderId) async {
    try {
      await localDataSource.deleteOrder(orderId);
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }
}

extension on LocalDataSource {
  Future<Map<String, dynamic>?> getOrder(String orderId) async {
    return null;
  }

  Future<void> deleteOrder(String orderId) async {}
}
