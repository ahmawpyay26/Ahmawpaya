import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/invoice_entity.dart';
import '../../domain/usecases/invoice_usecases.dart';

// Invoice state
class InvoiceState {
  final List<InvoiceEntity> invoices;
  final InvoiceEntity? selectedInvoice;
  final bool isLoading;
  final String? error;

  InvoiceState({
    this.invoices = const [],
    this.selectedInvoice,
    this.isLoading = false,
    this.error,
  });

  InvoiceState copyWith({
    List<InvoiceEntity>? invoices,
    InvoiceEntity? selectedInvoice,
    bool? isLoading,
    String? error,
  }) {
    return InvoiceState(
      invoices: invoices ?? this.invoices,
      selectedInvoice: selectedInvoice ?? this.selectedInvoice,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Invoice notifier
class InvoiceNotifier extends StateNotifier<InvoiceState> {
  final GetAllInvoicesUseCase getAllInvoicesUseCase;
  final GetInvoiceByIdUseCase getInvoiceByIdUseCase;
  final GetInvoicesByCustomerIdUseCase getInvoicesByCustomerIdUseCase;
  final CreateInvoiceUseCase createInvoiceUseCase;
  final UpdateInvoiceUseCase updateInvoiceUseCase;
  final DeleteInvoiceUseCase deleteInvoiceUseCase;
  final GetInvoicesByStatusUseCase getInvoicesByStatusUseCase;
  final GeneratePdfInvoiceUseCase generatePdfInvoiceUseCase;

  InvoiceNotifier({
    required this.getAllInvoicesUseCase,
    required this.getInvoiceByIdUseCase,
    required this.getInvoicesByCustomerIdUseCase,
    required this.createInvoiceUseCase,
    required this.updateInvoiceUseCase,
    required this.deleteInvoiceUseCase,
    required this.getInvoicesByStatusUseCase,
    required this.generatePdfInvoiceUseCase,
  }) : super(InvoiceState());

  Future<void> getAllInvoices() async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getAllInvoicesUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (invoices) {
        state = state.copyWith(
          isLoading: false,
          invoices: invoices,
          error: null,
        );
      },
    );
  }

  Future<void> getInvoiceById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getInvoiceByIdUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (invoice) {
        state = state.copyWith(
          isLoading: false,
          selectedInvoice: invoice,
          error: null,
        );
      },
    );
  }

  Future<void> getInvoicesByCustomerId(String customerId) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getInvoicesByCustomerIdUseCase(customerId);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (invoices) {
        state = state.copyWith(
          isLoading: false,
          invoices: invoices,
          error: null,
        );
      },
    );
  }

  Future<void> createInvoice(InvoiceEntity invoice) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await createInvoiceUseCase(invoice);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (createdInvoice) {
        state = state.copyWith(
          isLoading: false,
          invoices: [...state.invoices, createdInvoice],
          error: null,
        );
      },
    );
  }

  Future<void> updateInvoice(InvoiceEntity invoice) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await updateInvoiceUseCase(invoice);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (updatedInvoice) {
        final updatedInvoices = state.invoices.map((i) => i.id == updatedInvoice.id ? updatedInvoice : i).toList();
        state = state.copyWith(
          isLoading: false,
          invoices: updatedInvoices,
          selectedInvoice: updatedInvoice,
          error: null,
        );
      },
    );
  }

  Future<void> deleteInvoice(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await deleteInvoiceUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        final updatedInvoices = state.invoices.where((i) => i.id != id).toList();
        state = state.copyWith(
          isLoading: false,
          invoices: updatedInvoices,
          selectedInvoice: null,
          error: null,
        );
      },
    );
  }

  Future<void> getInvoicesByStatus(String status) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getInvoicesByStatusUseCase(status);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (invoices) {
        state = state.copyWith(
          isLoading: false,
          invoices: invoices,
          error: null,
        );
      },
    );
  }

  Future<String?> generatePdfInvoice(String invoiceId) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await generatePdfInvoiceUseCase(invoiceId);
    
    return result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
        return null;
      },
      (pdfUrl) {
        state = state.copyWith(
          isLoading: false,
          error: null,
        );
        return pdfUrl;
      },
    );
  }
}

// Invoice provider
final invoiceProvider = StateNotifierProvider<InvoiceNotifier, InvoiceState>((ref) {
  return InvoiceNotifier(
    getAllInvoicesUseCase: getIt<GetAllInvoicesUseCase>(),
    getInvoiceByIdUseCase: getIt<GetInvoiceByIdUseCase>(),
    getInvoicesByCustomerIdUseCase: getIt<GetInvoicesByCustomerIdUseCase>(),
    createInvoiceUseCase: getIt<CreateInvoiceUseCase>(),
    updateInvoiceUseCase: getIt<UpdateInvoiceUseCase>(),
    deleteInvoiceUseCase: getIt<DeleteInvoiceUseCase>(),
    getInvoicesByStatusUseCase: getIt<GetInvoicesByStatusUseCase>(),
    generatePdfInvoiceUseCase: getIt<GeneratePdfInvoiceUseCase>(),
  );
});

// Selectors
final allInvoicesProvider = Provider<List<InvoiceEntity>>((ref) {
  return ref.watch(invoiceProvider).invoices;
});

final selectedInvoiceProvider = Provider<InvoiceEntity?>((ref) {
  return ref.watch(invoiceProvider).selectedInvoice;
});

final invoiceLoadingProvider = Provider<bool>((ref) {
  return ref.watch(invoiceProvider).isLoading;
});

final invoiceErrorProvider = Provider<String?>((ref) {
  return ref.watch(invoiceProvider).error;
});
