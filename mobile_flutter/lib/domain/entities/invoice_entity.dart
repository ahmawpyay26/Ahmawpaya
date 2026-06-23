import 'package:equatable/equatable.dart';

enum InvoiceStatus { draft, issued, paid, overdue, cancelled }

class InvoiceEntity extends Equatable {
  final String id;
  final String orderId;
  final String customerId;
  final String invoiceNumber;
  final InvoiceStatus status;
  final double subtotal;
  final double taxAmount;
  final double discountAmount;
  final double totalAmount;
  final DateTime issuedDate;
  final DateTime dueDate;
  final DateTime? paidDate;
  final String? notes;
  final List<InvoiceItemEntity> items;

  const InvoiceEntity({
    required this.id,
    required this.orderId,
    required this.customerId,
    required this.invoiceNumber,
    required this.status,
    required this.subtotal,
    required this.taxAmount,
    required this.discountAmount,
    required this.totalAmount,
    required this.issuedDate,
    required this.dueDate,
    this.paidDate,
    this.notes,
    required this.items,
  });

  @override
  List<Object?> get props => [
    id,
    orderId,
    customerId,
    invoiceNumber,
    status,
    subtotal,
    taxAmount,
    discountAmount,
    totalAmount,
    issuedDate,
    dueDate,
    paidDate,
    notes,
    items,
  ];
}

class InvoiceItemEntity extends Equatable {
  final String id;
  final String invoiceId;
  final String productId;
  final String description;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const InvoiceItemEntity({
    required this.id,
    required this.invoiceId,
    required this.productId,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  @override
  List<Object?> get props => [
    id,
    invoiceId,
    productId,
    description,
    quantity,
    unitPrice,
    totalPrice,
  ];
}
