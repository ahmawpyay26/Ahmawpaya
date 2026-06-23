import '../../domain/entities/order_entity.dart';

class OrderModel extends OrderEntity {
  const OrderModel({
    required String id,
    required String customerId,
    String? staffId,
    required OrderStatus status,
    required double totalAmount,
    double? discountAmount,
    required double finalAmount,
    String? notes,
    required DateTime createdAt,
    DateTime? deliveryDate,
    DateTime? completedAt,
    required List<OrderItemModel> items,
  }) : super(
    id: id,
    customerId: customerId,
    staffId: staffId,
    status: status,
    totalAmount: totalAmount,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
    notes: notes,
    createdAt: createdAt,
    deliveryDate: deliveryDate,
    completedAt: completedAt,
    items: items,
  );

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as String,
      customerId: json['customerId'] as String,
      staffId: json['staffId'] as String?,
      status: OrderStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => OrderStatus.pending,
      ),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      discountAmount: json['discountAmount'] != null ? (json['discountAmount'] as num).toDouble() : null,
      finalAmount: (json['finalAmount'] as num).toDouble(),
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      deliveryDate: json['deliveryDate'] != null ? DateTime.parse(json['deliveryDate'] as String) : null,
      completedAt: json['completedAt'] != null ? DateTime.parse(json['completedAt'] as String) : null,
      items: (json['items'] as List<dynamic>?)?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>)).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'staffId': staffId,
      'status': status.toString().split('.').last,
      'totalAmount': totalAmount,
      'discountAmount': discountAmount,
      'finalAmount': finalAmount,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'deliveryDate': deliveryDate?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'items': items.map((e) => (e as OrderItemModel).toJson()).toList(),
    };
  }
}

class OrderItemModel extends OrderItemEntity {
  const OrderItemModel({
    required String id,
    required String orderId,
    required String productId,
    required int quantity,
    required double unitPrice,
    required double totalPrice,
  }) : super(
    id: id,
    orderId: orderId,
    productId: productId,
    quantity: quantity,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
  );

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      productId: json['productId'] as String,
      quantity: json['quantity'] as int,
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalPrice: (json['totalPrice'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'productId': productId,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }
}
