import 'package:dartz/dartz.dart';
import '../entities/user_entity.dart';

abstract class UserRepository {
  Future<Either<Exception, UserEntity>> login(String email, String password);
  Future<Either<Exception, UserEntity>> getCurrentUser();
  Future<Either<Exception, void>> logout();
  Future<Either<Exception, List<UserEntity>>> getAllUsers();
  Future<Either<Exception, UserEntity>> getUserById(String id);
  Future<Either<Exception, UserEntity>> createUser(UserEntity user);
  Future<Either<Exception, UserEntity>> updateUser(UserEntity user);
  Future<Either<Exception, void>> deleteUser(String id);
}
