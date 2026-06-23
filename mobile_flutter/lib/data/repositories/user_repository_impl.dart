import 'package:dartz/dartz.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/user_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/user_model.dart';

class UserRepositoryImpl implements UserRepository {
  final ApiDataSource apiDataSource;

  UserRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, UserEntity>> login(String email, String password) async {
    try {
      final user = await apiDataSource.login(email, password);
      return Right(user);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, UserEntity>> getCurrentUser() async {
    try {
      final user = await apiDataSource.getCurrentUser();
      return Right(user);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> logout() async {
    try {
      await apiDataSource.logout();
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<UserEntity>>> getAllUsers() async {
    try {
      final users = await apiDataSource.getAllUsers();
      return Right(users.cast<UserEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, UserEntity>> getUserById(String id) async {
    try {
      final user = await apiDataSource.getUserById(id);
      return Right(user);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, UserEntity>> createUser(UserEntity user) async {
    try {
      final userModel = UserModel(
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      );
      final createdUser = await apiDataSource.createUser(userModel);
      return Right(createdUser);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, UserEntity>> updateUser(UserEntity user) async {
    try {
      final userModel = UserModel(
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      );
      final updatedUser = await apiDataSource.updateUser(userModel);
      return Right(updatedUser);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteUser(String id) async {
    try {
      await apiDataSource.deleteUser(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
