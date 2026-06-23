import 'package:dartz/dartz.dart';
import '../entities/inventory_entity.dart';
import '../repositories/inventory_repository.dart';

// Product Use Cases
class GetAllProductsUseCase {
  final InventoryRepository repository;

  GetAllProductsUseCase(this.repository);

  Future<Either<Exception, List<ProductEntity>>> call() {
    return repository.getAllProducts();
  }
}

class GetProductByIdUseCase {
  final InventoryRepository repository;

  GetProductByIdUseCase(this.repository);

  Future<Either<Exception, ProductEntity>> call(String id) {
    return repository.getProductById(id);
  }
}

class CreateProductUseCase {
  final InventoryRepository repository;

  CreateProductUseCase(this.repository);

  Future<Either<Exception, ProductEntity>> call(ProductEntity product) {
    return repository.createProduct(product);
  }
}

class UpdateProductUseCase {
  final InventoryRepository repository;

  UpdateProductUseCase(this.repository);

  Future<Either<Exception, ProductEntity>> call(ProductEntity product) {
    return repository.updateProduct(product);
  }
}

class DeleteProductUseCase {
  final InventoryRepository repository;

  DeleteProductUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteProduct(id);
  }
}

// Inventory Use Cases
class GetAllInventoryUseCase {
  final InventoryRepository repository;

  GetAllInventoryUseCase(this.repository);

  Future<Either<Exception, List<InventoryEntity>>> call() {
    return repository.getAllInventory();
  }
}

class GetInventoryByProductIdUseCase {
  final InventoryRepository repository;

  GetInventoryByProductIdUseCase(this.repository);

  Future<Either<Exception, InventoryEntity>> call(String productId) {
    return repository.getInventoryByProductId(productId);
  }
}

class UpdateInventoryUseCase {
  final InventoryRepository repository;

  UpdateInventoryUseCase(this.repository);

  Future<Either<Exception, InventoryEntity>> call(InventoryEntity inventory) {
    return repository.updateInventory(inventory);
  }
}

// Transaction Use Cases
class GetTransactionHistoryUseCase {
  final InventoryRepository repository;

  GetTransactionHistoryUseCase(this.repository);

  Future<Either<Exception, List<InventoryTransactionEntity>>> call(String inventoryId) {
    return repository.getTransactionHistory(inventoryId);
  }
}

class RecordTransactionUseCase {
  final InventoryRepository repository;

  RecordTransactionUseCase(this.repository);

  Future<Either<Exception, InventoryTransactionEntity>> call(InventoryTransactionEntity transaction) {
    return repository.recordTransaction(transaction);
  }
}
