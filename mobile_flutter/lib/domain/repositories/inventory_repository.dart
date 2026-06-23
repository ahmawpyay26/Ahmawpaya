import 'package:dartz/dartz.dart';
import '../entities/inventory_entity.dart';

abstract class InventoryRepository {
  Future<Either<Exception, List<ProductEntity>>> getAllProducts();
  Future<Either<Exception, ProductEntity>> getProductById(String id);
  Future<Either<Exception, ProductEntity>> createProduct(ProductEntity product);
  Future<Either<Exception, ProductEntity>> updateProduct(ProductEntity product);
  Future<Either<Exception, void>> deleteProduct(String id);
  
  Future<Either<Exception, List<InventoryEntity>>> getAllInventory();
  Future<Either<Exception, InventoryEntity>> getInventoryByProductId(String productId);
  Future<Either<Exception, InventoryEntity>> updateInventory(InventoryEntity inventory);
  
  Future<Either<Exception, List<InventoryTransactionEntity>>> getTransactionHistory(String inventoryId);
  Future<Either<Exception, InventoryTransactionEntity>> recordTransaction(InventoryTransactionEntity transaction);
}
