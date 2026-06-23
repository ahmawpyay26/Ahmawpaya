import '../../domain/entities/inventory_entity.dart';

class ProductModel extends ProductEntity {
  const ProductModel({
    required String id,
    required String name,
    String? description,
    required double price,
    required String unit,
    required int minimumStock,
    required bool isActive,
    required DateTime createdAt,
  }) : super(
    id: id,
    name: name,
    description: description,
    price: price,
    unit: unit,
    minimumStock: minimumStock,
    isActive: isActive,
    createdAt: createdAt,
  );

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      unit: json['unit'] as String,
      minimumStock: json['minimumStock'] as int,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'unit': unit,
      'minimumStock': minimumStock,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class InventoryModel extends InventoryEntity {
  const InventoryModel({
    required String id,
    required String productId,
    required int quantity,
    required int reserved,
    required int available,
    required DateTime lastUpdated,
  }) : super(
    id: id,
    productId: productId,
    quantity: quantity,
    reserved: reserved,
    available: available,
    lastUpdated: lastUpdated,
  );

  factory InventoryModel.fromJson(Map<String, dynamic> json) {
    return InventoryModel(
      id: json['id'] as String,
      productId: json['productId'] as String,
      quantity: json['quantity'] as int,
      reserved: json['reserved'] as int? ?? 0,
      available: json['available'] as int,
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'quantity': quantity,
      'reserved': reserved,
      'available': available,
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }
}

class InventoryTransactionModel extends InventoryTransactionEntity {
  const InventoryTransactionModel({
    required String id,
    required String inventoryId,
    required String type,
    required int quantity,
    String? reference,
    String? notes,
    required DateTime createdAt,
  }) : super(
    id: id,
    inventoryId: inventoryId,
    type: type,
    quantity: quantity,
    reference: reference,
    notes: notes,
    createdAt: createdAt,
  );

  factory InventoryTransactionModel.fromJson(Map<String, dynamic> json) {
    return InventoryTransactionModel(
      id: json['id'] as String,
      inventoryId: json['inventoryId'] as String,
      type: json['type'] as String,
      quantity: json['quantity'] as int,
      reference: json['reference'] as String?,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'inventoryId': inventoryId,
      'type': type,
      'quantity': quantity,
      'reference': reference,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
