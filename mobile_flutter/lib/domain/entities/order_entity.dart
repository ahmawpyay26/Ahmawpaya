import 'package:equatable/equatable.dart';

enum OrderStatus { pending, confirmed, processing, delivered, cancelled }

class OrderEntity extends Equatable {
  final String id;
  final String customerId;
  final String? staffId;
  final OrderStatus status;
  final double totalAmount;
  final double? discountAmount;
  final double finalAmount;
  final String? notes;
  final DateTime createdAt;
  final DateTime? deliveryDate;
  final DateTime? completedAt;
  final List<OrderItemEntity> items;

  const OrderEntity({
    required this.id,
    required this.customerId,
    this.staffId,
    required this.status,
    required this.totalAmount,
    this.discountAmount,
    required this.finalAmount,
    this.notes,
    required this.createdAt,
    this.deliveryDate,
    this.completedAt,
    required this.items,
  });

  @override
  List<Object?> get props => [
    id,
    customerId,
    staffId,
    status,
    totalAmount,
    discountAmount,
    finalAmount,
    notes,
    createdAt,
    deliveryDate,
    completedAt,
    items,
  ];
}

class OrderItemEntity extends Equatable {
  final String id;
  final String orderId;
  final String productId;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const OrderItemEntity({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  @override
  List<Object?> get props => [
    id,
    orderId,
    productId,
    quantity,
    unitPrice,
    totalPrice,
  ];
}
