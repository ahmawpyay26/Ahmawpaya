import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class InventoryRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  InventoryRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, Map<String, dynamic>>> getInventory(String productId) async {
    try {
      final result = await remoteDataSource.getInventory(productId);
      await localDataSource.saveInventory(result);
      return Right(result);
    } catch (e) {
      final local = await localDataSource.getInventory(productId);
      if (local != null) {
        return Right(local);
      }
      return Left(e.toString());
    }
  }

  Future<Either<String, void>> updateInventory(
    String productId,
    Map<String, dynamic> updates,
  ) async {
    try {
      final inventory = await localDataSource.getInventory(productId);
      if (inventory != null) {
        final updated = {...inventory, ...updates};
        await localDataSource.saveInventory(updated);
      }
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }
}
