import 'package:dartz/dartz.dart';
import '../entities/invoice_entity.dart';
import '../repositories/invoice_repository.dart';

class GetAllInvoicesUseCase {
  final InvoiceRepository repository;

  GetAllInvoicesUseCase(this.repository);

  Future<Either<Exception, List<InvoiceEntity>>> call() {
    return repository.getAllInvoices();
  }
}

class GetInvoiceByIdUseCase {
  final InvoiceRepository repository;

  GetInvoiceByIdUseCase(this.repository);

  Future<Either<Exception, InvoiceEntity>> call(String id) {
    return repository.getInvoiceById(id);
  }
}

class GetInvoicesByCustomerIdUseCase {
  final InvoiceRepository repository;

  GetInvoicesByCustomerIdUseCase(this.repository);

  Future<Either<Exception, List<InvoiceEntity>>> call(String customerId) {
    return repository.getInvoicesByCustomerId(customerId);
  }
}

class CreateInvoiceUseCase {
  final InvoiceRepository repository;

  CreateInvoiceUseCase(this.repository);

  Future<Either<Exception, InvoiceEntity>> call(InvoiceEntity invoice) {
    return repository.createInvoice(invoice);
  }
}

class UpdateInvoiceUseCase {
  final InvoiceRepository repository;

  UpdateInvoiceUseCase(this.repository);

  Future<Either<Exception, InvoiceEntity>> call(InvoiceEntity invoice) {
    return repository.updateInvoice(invoice);
  }
}

class DeleteInvoiceUseCase {
  final InvoiceRepository repository;

  DeleteInvoiceUseCase(this.repository);

  Future<Either<Exception, void>> call(String id) {
    return repository.deleteInvoice(id);
  }
}

class GetInvoicesByStatusUseCase {
  final InvoiceRepository repository;

  GetInvoicesByStatusUseCase(this.repository);

  Future<Either<Exception, List<InvoiceEntity>>> call(String status) {
    return repository.getInvoicesByStatus(status);
  }
}

class GeneratePdfInvoiceUseCase {
  final InvoiceRepository repository;

  GeneratePdfInvoiceUseCase(this.repository);

  Future<Either<Exception, String>> call(String invoiceId) {
    return repository.generatePdfInvoice(invoiceId);
  }
}
