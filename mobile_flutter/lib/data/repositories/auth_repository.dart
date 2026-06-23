import 'package:dartz/dartz.dart';
import 'package:amaw_pyay/data/datasources/local_datasource.dart';
import 'package:amaw_pyay/data/datasources/remote_datasource.dart';

class AuthRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;

  AuthRepository({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  Future<Either<String, Map<String, dynamic>>> login(
    String email,
    String password,
  ) async {
    try {
      final result = await remoteDataSource.login(email, password);
      await localDataSource.saveUser(result);
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, Map<String, dynamic>>> register(
    Map<String, dynamic> userData,
  ) async {
    try {
      final result = await remoteDataSource.register(userData);
      await localDataSource.saveUser(result);
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, Map<String, dynamic>?>> getUser(String id) async {
    try {
      final result = await localDataSource.getUser(id);
      return Right(result);
    } catch (e) {
      return Left(e.toString());
    }
  }

  Future<Either<String, void>> logout() async {
    try {
      await localDataSource.clearAllData();
      return const Right(null);
    } catch (e) {
      return Left(e.toString());
    }
  }
}
