import '../../domain/entities/invoice_entity.dart';

class InvoiceModel extends InvoiceEntity {
  const InvoiceModel({
    required String id,
    required String orderId,
    required String customerId,
    required String invoiceNumber,
    required InvoiceStatus status,
    required double subtotal,
    required double taxAmount,
    required double discountAmount,
    required double totalAmount,
    required DateTime issuedDate,
    required DateTime dueDate,
    DateTime? paidDate,
    String? notes,
    required List<InvoiceItemModel> items,
  }) : super(
    id: id,
    orderId: orderId,
    customerId: customerId,
    invoiceNumber: invoiceNumber,
    status: status,
    subtotal: subtotal,
    taxAmount: taxAmount,
    discountAmount: discountAmount,
    totalAmount: totalAmount,
    issuedDate: issuedDate,
    dueDate: dueDate,
    paidDate: paidDate,
    notes: notes,
    items: items,
  );

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      customerId: json['customerId'] as String,
      invoiceNumber: json['invoiceNumber'] as String,
      status: InvoiceStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => InvoiceStatus.draft,
      ),
      subtotal: (json['subtotal'] as num).toDouble(),
      taxAmount: (json['taxAmount'] as num).toDouble(),
      discountAmount: (json['discountAmount'] as num).toDouble(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
      issuedDate: DateTime.parse(json['issuedDate'] as String),
      dueDate: DateTime.parse(json['dueDate'] as String),
      paidDate: json['paidDate'] != null ? DateTime.parse(json['paidDate'] as String) : null,
      notes: json['notes'] as String?,
      items: (json['items'] as List<dynamic>?)?.map((e) => InvoiceItemModel.fromJson(e as Map<String, dynamic>)).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'customerId': customerId,
      'invoiceNumber': invoiceNumber,
      'status': status.toString().split('.').last,
      'subtotal': subtotal,
      'taxAmount': taxAmount,
      'discountAmount': discountAmount,
      'totalAmount': totalAmount,
      'issuedDate': issuedDate.toIso8601String(),
      'dueDate': dueDate.toIso8601String(),
      'paidDate': paidDate?.toIso8601String(),
      'notes': notes,
      'items': items.map((e) => (e as InvoiceItemModel).toJson()).toList(),
    };
  }
}

class InvoiceItemModel extends InvoiceItemEntity {
  const InvoiceItemModel({
    required String id,
    required String invoiceId,
    required String productId,
    required String description,
    required int quantity,
    required double unitPrice,
    required double totalPrice,
  }) : super(
    id: id,
    invoiceId: invoiceId,
    productId: productId,
    description: description,
    quantity: quantity,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
  );

  factory InvoiceItemModel.fromJson(Map<String, dynamic> json) {
    return InvoiceItemModel(
      id: json['id'] as String,
      invoiceId: json['invoiceId'] as String,
      productId: json['productId'] as String,
      description: json['description'] as String,
      quantity: json['quantity'] as int,
      unitPrice: (json['unitPrice'] as num).toDouble(),
      totalPrice: (json['totalPrice'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'invoiceId': invoiceId,
      'productId': productId,
      'description': description,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'totalPrice': totalPrice,
    };
  }
}
