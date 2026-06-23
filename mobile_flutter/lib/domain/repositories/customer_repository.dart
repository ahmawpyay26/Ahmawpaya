import 'package:dartz/dartz.dart';
import '../entities/customer_entity.dart';

abstract class CustomerRepository {
  Future<Either<Exception, List<CustomerEntity>>> getAllCustomers();
  Future<Either<Exception, CustomerEntity>> getCustomerById(String id);
  Future<Either<Exception, CustomerEntity>> createCustomer(CustomerEntity customer);
  Future<Either<Exception, CustomerEntity>> updateCustomer(CustomerEntity customer);
  Future<Either<Exception, void>> deleteCustomer(String id);
  Future<Either<Exception, List<CustomerEntity>>> searchCustomers(String query);
  Future<Either<Exception, List<CustomerEntity>>> getCustomersByRegion(String region);
}
