import 'package:equatable/equatable.dart';

class ProductEntity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String unit;
  final int minimumStock;
  final bool isActive;
  final DateTime createdAt;

  const ProductEntity({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.unit,
    required this.minimumStock,
    required this.isActive,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    name,
    description,
    price,
    unit,
    minimumStock,
    isActive,
    createdAt,
  ];
}

class InventoryEntity extends Equatable {
  final String id;
  final String productId;
  final int quantity;
  final int reserved;
  final int available;
  final DateTime lastUpdated;

  const InventoryEntity({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.reserved,
    required this.available,
    required this.lastUpdated,
  });

  @override
  List<Object?> get props => [
    id,
    productId,
    quantity,
    reserved,
    available,
    lastUpdated,
  ];
}

class InventoryTransactionEntity extends Equatable {
  final String id;
  final String inventoryId;
  final String type; // 'in', 'out', 'adjustment'
  final int quantity;
  final String? reference;
  final String? notes;
  final DateTime createdAt;

  const InventoryTransactionEntity({
    required this.id,
    required this.inventoryId,
    required this.type,
    required this.quantity,
    this.reference,
    this.notes,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    inventoryId,
    type,
    quantity,
    reference,
    notes,
    createdAt,
  ];
}
