import 'package:dartz/dartz.dart';
import '../../domain/entities/invoice_entity.dart';
import '../../domain/repositories/invoice_repository.dart';
import '../datasources/remote/api_datasource.dart';
import '../models/invoice_model.dart';

class InvoiceRepositoryImpl implements InvoiceRepository {
  final ApiDataSource apiDataSource;

  InvoiceRepositoryImpl({required this.apiDataSource});

  @override
  Future<Either<Exception, List<InvoiceEntity>>> getAllInvoices() async {
    try {
      final invoices = await apiDataSource.getAllInvoices();
      return Right(invoices.cast<InvoiceEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InvoiceEntity>> getInvoiceById(String id) async {
    try {
      final invoice = await apiDataSource.getInvoiceById(id);
      return Right(invoice);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<InvoiceEntity>>> getInvoicesByCustomerId(String customerId) async {
    try {
      final invoices = await apiDataSource.getInvoicesByCustomerId(customerId);
      return Right(invoices.cast<InvoiceEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InvoiceEntity>> createInvoice(InvoiceEntity invoice) async {
    try {
      final items = invoice.items.map((item) {
        return InvoiceItemModel(
          id: item.id,
          invoiceId: item.invoiceId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        );
      }).toList();

      final invoiceModel = InvoiceModel(
        id: invoice.id,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
        issuedDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        notes: invoice.notes,
        items: items,
      );
      final createdInvoice = await apiDataSource.createInvoice(invoiceModel);
      return Right(createdInvoice);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, InvoiceEntity>> updateInvoice(InvoiceEntity invoice) async {
    try {
      final items = invoice.items.map((item) {
        return InvoiceItemModel(
          id: item.id,
          invoiceId: item.invoiceId,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        );
      }).toList();

      final invoiceModel = InvoiceModel(
        id: invoice.id,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
        issuedDate: invoice.issuedDate,
        dueDate: invoice.dueDate,
        paidDate: invoice.paidDate,
        notes: invoice.notes,
        items: items,
      );
      final updatedInvoice = await apiDataSource.updateInvoice(invoiceModel);
      return Right(updatedInvoice);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, void>> deleteInvoice(String id) async {
    try {
      await apiDataSource.deleteInvoice(id);
      return const Right(null);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, List<InvoiceEntity>>> getInvoicesByStatus(String status) async {
    try {
      final allInvoices = await apiDataSource.getAllInvoices();
      final filteredInvoices = allInvoices.where((invoice) => invoice.status.toString().split('.').last == status).toList();
      return Right(filteredInvoices.cast<InvoiceEntity>());
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }

  @override
  Future<Either<Exception, String>> generatePdfInvoice(String invoiceId) async {
    try {
      final pdfUrl = await apiDataSource.generatePdfInvoice(invoiceId);
      return Right(pdfUrl);
    } catch (e) {
      return Left(Exception(e.toString()));
    }
  }
}
