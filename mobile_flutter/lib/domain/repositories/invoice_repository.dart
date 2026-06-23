import 'package:dartz/dartz.dart';
import '../entities/invoice_entity.dart';

abstract class InvoiceRepository {
  Future<Either<Exception, List<InvoiceEntity>>> getAllInvoices();
  Future<Either<Exception, InvoiceEntity>> getInvoiceById(String id);
  Future<Either<Exception, List<InvoiceEntity>>> getInvoicesByCustomerId(String customerId);
  Future<Either<Exception, InvoiceEntity>> createInvoice(InvoiceEntity invoice);
  Future<Either<Exception, InvoiceEntity>> updateInvoice(InvoiceEntity invoice);
  Future<Either<Exception, void>> deleteInvoice(String id);
  Future<Either<Exception, List<InvoiceEntity>>> getInvoicesByStatus(String status);
  Future<Either<Exception, String>> generatePdfInvoice(String invoiceId);
}
