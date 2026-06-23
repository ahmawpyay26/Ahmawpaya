import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class CustomerRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  CustomerRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, List<Map<String, dynamic>>>> getCustomers() async {
    try {
      final result = await remoteDataSource.getCustomers();
      for (var customer in result) {
        await localDataSource.saveCustomer(customer);
      }
      return Right(result);
    } catch (e) {
      final local = await localDataSource.getAllCustomers();
      return Right(local);
    }
  }

  Future<Either<String, Map<String, dynamic>>> createCustomer(
    Map<String, dynamic> customerData,
  ) async {
    try {
      final result = await remoteDataSource.createCustomer(customerData);
      await localDataSource.saveCustomer(result);
      return Right(result);
    } catch (e) {
      await localDataSource.saveCustomer(customerData);
      return Left(e.toString());
    }
  }

  Future<Either<String, void>> updateCustomer(
    String customerId,
    Map<String, dynamic> updates,
  ) async {
    try {
      final customer = await localDataSource.getCustomer(customerId);
      if (customer != null) {
        final updated = {...customer, ...updates};
        await localDataSource.saveCustomer(updated);
      }
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }
}

extension on RemoteDataSource {
  Future<Map<String, dynamic>> createCustomer(Map<String, dynamic> customerData) async {
    return customerData;
  }
}

extension on LocalDataSource {
  Future<Map<String, dynamic>?> getCustomer(String customerId) async {
    return null;
  }
}
