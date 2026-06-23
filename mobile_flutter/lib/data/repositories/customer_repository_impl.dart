import 'package:dartz/dartz.dart';
import '../../domain/entities/customer_entity.dart';
import '../../domain/repositories/customer_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/customer_model.dart';

class CustomerRepositoryImpl implements CustomerRepository {
  final ApiDataSource apiDataSource;

  CustomerRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, List<CustomerEntity>>> getAllCustomers() async {
    try {
      final customers = await apiDataSource.getAllCustomers();
      return Right(customers.cast<CustomerEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, CustomerEntity>> getCustomerById(String id) async {
    try {
      final customer = await apiDataSource.getCustomerById(id);
      return Right(customer);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, CustomerEntity>> createCustomer(CustomerEntity customer) async {
    try {
      final customerModel = CustomerModel(
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        region: customer.region,
        latitude: customer.latitude,
        longitude: customer.longitude,
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        lastOrderDate: customer.lastOrderDate,
      );
      final createdCustomer = await apiDataSource.createCustomer(customerModel);
      return Right(createdCustomer);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, CustomerEntity>> updateCustomer(CustomerEntity customer) async {
    try {
      final customerModel = CustomerModel(
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        region: customer.region,
        latitude: customer.latitude,
        longitude: customer.longitude,
        creditLimit: customer.creditLimit,
        currentBalance: customer.currentBalance,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        lastOrderDate: customer.lastOrderDate,
      );
      final updatedCustomer = await apiDataSource.updateCustomer(customerModel);
      return Right(updatedCustomer);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteCustomer(String id) async {
    try {
      await apiDataSource.deleteCustomer(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<CustomerEntity>>> searchCustomers(String query) async {
    try {
      final customers = await apiDataSource.searchCustomers(query);
      return Right(customers.cast<CustomerEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<CustomerEntity>>> getCustomersByRegion(String region) async {
    try {
      final allCustomers = await apiDataSource.getAllCustomers();
      final filteredCustomers = allCustomers.where((customer) => customer.region == region).toList();
      return Right(filteredCustomers.cast<CustomerEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
