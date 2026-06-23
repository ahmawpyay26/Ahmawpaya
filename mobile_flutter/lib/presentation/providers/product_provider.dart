import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/service_locator.dart';
import '../../domain/entities/inventory_entity.dart';
import '../../domain/usecases/inventory_usecases.dart';

// Product state
class ProductState {
  final List<ProductEntity> products;
  final ProductEntity? selectedProduct;
  final bool isLoading;
  final String? error;

  ProductState({
    this.products = const [],
    this.selectedProduct,
    this.isLoading = false,
    this.error,
  });

  ProductState copyWith({
    List<ProductEntity>? products,
    ProductEntity? selectedProduct,
    bool? isLoading,
    String? error,
  }) {
    return ProductState(
      products: products ?? this.products,
      selectedProduct: selectedProduct ?? this.selectedProduct,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Product notifier
class ProductNotifier extends StateNotifier<ProductState> {
  final GetAllProductsUseCase getAllProductsUseCase;
  final GetProductByIdUseCase getProductByIdUseCase;
  final CreateProductUseCase createProductUseCase;
  final UpdateProductUseCase updateProductUseCase;
  final DeleteProductUseCase deleteProductUseCase;

  ProductNotifier({
    required this.getAllProductsUseCase,
    required this.getProductByIdUseCase,
    required this.createProductUseCase,
    required this.updateProductUseCase,
    required this.deleteProductUseCase,
  }) : super(ProductState());

  Future<void> getAllProducts() async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getAllProductsUseCase();
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (products) {
        state = state.copyWith(
          isLoading: false,
          products: products,
          error: null,
        );
      },
    );
  }

  Future<void> getProductById(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await getProductByIdUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (product) {
        state = state.copyWith(
          isLoading: false,
          selectedProduct: product,
          error: null,
        );
      },
    );
  }

  Future<void> createProduct(ProductEntity product) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await createProductUseCase(product);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (createdProduct) {
        state = state.copyWith(
          isLoading: false,
          products: [...state.products, createdProduct],
          error: null,
        );
      },
    );
  }

  Future<void> updateProduct(ProductEntity product) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await updateProductUseCase(product);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (updatedProduct) {
        final updatedProducts = state.products.map((p) => p.id == updatedProduct.id ? updatedProduct : p).toList();
        state = state.copyWith(
          isLoading: false,
          products: updatedProducts,
          selectedProduct: updatedProduct,
          error: null,
        );
      },
    );
  }

  Future<void> deleteProduct(String id) async {
    state = state.copyWith(isLoading: true, error: null);
    
    final result = await deleteProductUseCase(id);
    
    result.fold(
      (exception) {
        state = state.copyWith(
          isLoading: false,
          error: exception.toString(),
        );
      },
      (_) {
        final updatedProducts = state.products.where((p) => p.id != id).toList();
        state = state.copyWith(
          isLoading: false,
          products: updatedProducts,
          selectedProduct: null,
          error: null,
        );
      },
    );
  }
}

// Product provider
final productProvider = StateNotifierProvider<ProductNotifier, ProductState>((ref) {
  return ProductNotifier(
    getAllProductsUseCase: getIt<GetAllProductsUseCase>(),
    getProductByIdUseCase: getIt<GetProductByIdUseCase>(),
    createProductUseCase: getIt<CreateProductUseCase>(),
    updateProductUseCase: getIt<UpdateProductUseCase>(),
    deleteProductUseCase: getIt<DeleteProductUseCase>(),
  );
});

// Selectors
final allProductsProvider = Provider<List<ProductEntity>>((ref) {
  return ref.watch(productProvider).products;
});

final selectedProductProvider = Provider<ProductEntity?>((ref) {
  return ref.watch(productProvider).selectedProduct;
});

final productLoadingProvider = Provider<bool>((ref) {
  return ref.watch(productProvider).isLoading;
});

final productErrorProvider = Provider<String?>((ref) {
  return ref.watch(productProvider).error;
});
