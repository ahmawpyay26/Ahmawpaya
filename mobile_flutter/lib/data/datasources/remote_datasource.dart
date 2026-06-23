import 'package:dio/dio.dart';

class RemoteDataSource {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: 'http://localhost:3000/api',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  // Auth operations
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await _dio.post('/auth/register', data: userData);
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  // Order operations
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    try {
      final response = await _dio.post('/orders', data: orderData);
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getOrders() async {
    try {
      final response = await _dio.get('/orders');
      return List<Map<String, dynamic>>.from(response.data as List);
    } catch (e) {
      rethrow;
    }
  }

  // Invoice operations
  Future<Map<String, dynamic>> createInvoice(Map<String, dynamic> invoiceData) async {
    try {
      final response = await _dio.post('/invoices', data: invoiceData);
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getInvoices() async {
    try {
      final response = await _dio.get('/invoices');
      return List<Map<String, dynamic>>.from(response.data as List);
    } catch (e) {
      rethrow;
    }
  }

  // Product operations
  Future<List<Map<String, dynamic>>> getProducts() async {
    try {
      final response = await _dio.get('/products');
      return List<Map<String, dynamic>>.from(response.data as List);
    } catch (e) {
      rethrow;
    }
  }

  // Customer operations
  Future<List<Map<String, dynamic>>> getCustomers() async {
    try {
      final response = await _dio.get('/customers');
      return List<Map<String, dynamic>>.from(response.data as List);
    } catch (e) {
      rethrow;
    }
  }

  // Inventory operations
  Future<Map<String, dynamic>> getInventory(String productId) async {
    try {
      final response = await _dio.get('/inventory/$productId');
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }

  // Sync operations
  Future<Map<String, dynamic>> syncData(List<Map<String, dynamic>> actions) async {
    try {
      final response = await _dio.post('/sync', data: {'actions': actions});
      return response.data as Map<String, dynamic>;
    } catch (e) {
      rethrow;
    }
  }
}
