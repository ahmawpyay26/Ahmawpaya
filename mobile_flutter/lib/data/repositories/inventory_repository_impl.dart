import 'package:dartz/dartz.dart';
import '../../domain/entities/inventory_entity.dart';
import '../../domain/repositories/inventory_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/product_model.dart';

class InventoryRepositoryImpl implements InventoryRepository {
  final ApiDataSource apiDataSource;

  InventoryRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, List<ProductEntity>>> getAllProducts() async {
    try {
      final products = await apiDataSource.getAllProducts();
      return Right(products.cast<ProductEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, ProductEntity>> getProductById(String id) async {
    try {
      final product = await apiDataSource.getProductById(id);
      return Right(product);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, ProductEntity>> createProduct(ProductEntity product) async {
    try {
      final productModel = ProductModel(
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        minimumStock: product.minimumStock,
        isActive: product.isActive,
        createdAt: product.createdAt,
      );
      final createdProduct = await apiDataSource.createProduct(productModel);
      return Right(createdProduct);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, ProductEntity>> updateProduct(ProductEntity product) async {
    try {
      final productModel = ProductModel(
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        minimumStock: product.minimumStock,
        isActive: product.isActive,
        createdAt: product.createdAt,
      );
      final updatedProduct = await apiDataSource.updateProduct(productModel);
      return Right(updatedProduct);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteProduct(String id) async {
    try {
      await apiDataSource.deleteProduct(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<InventoryEntity>>> getAllInventory() async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InventoryEntity>> getInventoryByProductId(String productId) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InventoryEntity>> updateInventory(InventoryEntity inventory) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<InventoryTransactionEntity>>> getTransactionHistory(String inventoryId) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InventoryTransactionEntity>> recordTransaction(InventoryTransactionEntity transaction) async {
    try {
      // This would require an additional API endpoint
      return Left(Exception('Not implemented'));
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
