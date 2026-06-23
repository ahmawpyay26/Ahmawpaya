import 'package:dartz/dartz.dart';
import '../entities/customer_entity.dart';
import '../repositories/customer_repository.dart';

class GetAllCustomersUseCase {
  final CustomerRepository repository;

  GetAllCustomersUseCase(this.repository);

  Future<Either<Exception, List<CustomerEntity>>> call() {
    return repository.getAllCustomers();
  }
}

class GetCustomerByIdUseCase {
  final CustomerRepository repository;

  GetCustomerByIdUseCase(this.repository);

  Future<Either<Exception, CustomerEntity>> call(String id) {
    return repository.getCustomerById(id);
  }
}

class CreateCustomerUseCase {
  final CustomerRepository repository;

  CreateCustomerUseCase(this.repository);

  Future<Either<Exception, CustomerEntity>> call(CustomerEntity customer) {
    return repository.createCustomer(customer);
  }
}

class UpdateCustomerUseCase {
  final CustomerRepository repository;

  UpdateCustomerUseCase(this.repository);

  Future<Either<Exception, CustomerEntity>> call(CustomerEntity customer) {
    return repository.updateCustomer(customer);
  }
}

class DeleteCustomerUseCase {
  final CustomerRepository repository;

  DeleteCustomerUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteCustomer(id);
  }
}

class SearchCustomersUseCase {
  final CustomerRepository repository;

  SearchCustomersUseCase(this.repository);

  Future<Either<Exception, List<CustomerEntity>>> call(String query) {
    return repository.searchCustomers(query);
  }
}

class GetCustomersByRegionUseCase {
  final CustomerRepository repository;

  GetCustomersByRegionUseCase(this.repository);

  Future<Either<Exception, List<CustomerEntity>>> call(String region) {
    return repository.getCustomersByRegion(region);
  }
}
