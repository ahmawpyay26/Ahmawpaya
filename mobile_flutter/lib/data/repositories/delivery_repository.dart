import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class DeliveryRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  DeliveryRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, List<Map<String, dynamic>>>> getDeliveryRoutes() async {
    try {
      final result = await remoteDataSource.getDeliveryRoutes();
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, Map<String, dynamic>>> createDeliveryRoute(
    Map<String, dynamic> routeData,
  ) async {
    try {
      final result = await remoteDataSource.createDeliveryRoute(routeData);
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, void>> updateDeliveryRoute(
    String routeId,
    Map<String, dynamic> updates,
  ) async {
    try {
      await remoteDataSource.updateDeliveryRoute(routeId, updates);
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }
}

extension on RemoteDataSource {
  Future<List<Map<String, dynamic>>> getDeliveryRoutes() async {
    return [];
  }

  Future<Map<String, dynamic>> createDeliveryRoute(Map<String, dynamic> routeData) async {
    return routeData;
  }

  Future<void> updateDeliveryRoute(String routeId, Map<String, dynamic> updates) async {}
}
