import 'package:dartz/dartz.dart';
import '../entities/user_entity.dart';
import '../repositories/user_repository.dart';

class LoginUseCase {
  final UserRepository repository;

  LoginUseCase(this.repository);

  Future<Either<Exception, UserEntity>> call(String email, String password) {
    return repository.login(email, password);
  }
}

class LogoutUseCase {
  final UserRepository repository;

  LogoutUseCase(this.repository);

  Future<Either<Exception, void>> call() {
    return repository.logout();
  }
}

class GetCurrentUserUseCase {
  final UserRepository repository;

  GetCurrentUserUseCase(this.repository);

  Future<Either<Exception, UserEntity>> call() {
    return repository.getCurrentUser();
  }
}

class GetAllUsersUseCase {
  final UserRepository repository;

  GetAllUsersUseCase(this.repository);

  Future<Either<Exception, List<UserEntity>>> call() {
    return repository.getAllUsers();
  }
}

class CreateUserUseCase {
  final UserRepository repository;

  CreateUserUseCase(this.repository);

  Future<Either<Exception, UserEntity>> call(UserEntity user) {
    return repository.createUser(user);
  }
}

class UpdateUserUseCase {
  final UserRepository repository;

  UpdateUserUseCase(this.repository);

  Future<Either<Exception, UserEntity>> call(UserEntity user) {
    return repository.updateUser(user);
  }
}

class DeleteUserUseCase {
  final UserRepository repository;

  DeleteUserUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteUser(id);
  }
}
