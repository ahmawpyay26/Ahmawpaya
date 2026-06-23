import 'package:dio/dio.dart';
import 'api_datasource.dart';
import '../../models/user_model.dart';
import '../../models/order_model.dart';
import '../../models/invoice_model.dart';
import '../../models/product_model.dart';
import '../../models/customer_model.dart';
import '../../models/vehicle_model.dart';

class HttpApiDataSource implements ApiDataSource {
  final Dio dio;
  final String baseUrl;

  HttpApiDataSource({
    required this.dio,
    required this.baseUrl,
  });

  void setAuthToken(String token) {
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    dio.options.headers.remove('Authorization');
  }

  @override
  Future<UserModel> login(String email, String password) async {
    try {
      final response = await dio.post(
        '$baseUrl/auth/login',
        data: {'email': email, 'password': password},
      );
      final user = UserModel.fromJson(response.data['user']);
      setAuthToken(response.data['token']);
      return user;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await dio.get('$baseUrl/auth/me');
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> logout() async {
    try {
      await dio.post('$baseUrl/auth/logout');
      clearAuthToken();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<UserModel>> getAllUsers() async {
    try {
      final response = await dio.get('$baseUrl/users');
      return (response.data as List).map((e) => UserModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<UserModel> getUserById(String id) async {
    try {
      final response = await dio.get('$baseUrl/users/$id');
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<UserModel> createUser(UserModel user) async {
    try {
      final response = await dio.post('$baseUrl/users', data: user.toJson());
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<UserModel> updateUser(UserModel user) async {
    try {
      final response = await dio.put('$baseUrl/users/${user.id}', data: user.toJson());
      return UserModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteUser(String id) async {
    try {
      await dio.delete('$baseUrl/users/$id');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<OrderModel>> getAllOrders() async {
    try {
      final response = await dio.get('$baseUrl/orders');
      return (response.data as List).map((e) => OrderModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<OrderModel> getOrderById(String id) async {
    try {
      final response = await dio.get('$baseUrl/orders/$id');
      return OrderModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<OrderModel>> getOrdersByCustomerId(String customerId) async {
    try {
      final response = await dio.get('$baseUrl/orders?customerId=$customerId');
      return (response.data as List).map((e) => OrderModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<OrderModel> createOrder(OrderModel order) async {
    try {
      final response = await dio.post('$baseUrl/orders', data: order.toJson());
      return OrderModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<OrderModel> updateOrder(OrderModel order) async {
    try {
      final response = await dio.put('$baseUrl/orders/${order.id}', data: order.toJson());
      return OrderModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteOrder(String id) async {
    try {
      await dio.delete('$baseUrl/orders/$id');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<InvoiceModel>> getAllInvoices() async {
    try {
      final response = await dio.get('$baseUrl/invoices');
      return (response.data as List).map((e) => InvoiceModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<InvoiceModel> getInvoiceById(String id) async {
    try {
      final response = await dio.get('$baseUrl/invoices/$id');
      return InvoiceModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<InvoiceModel>> getInvoicesByCustomerId(String customerId) async {
    try {
      final response = await dio.get('$baseUrl/invoices?customerId=$customerId');
      return (response.data as List).map((e) => InvoiceModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<InvoiceModel> createInvoice(InvoiceModel invoice) async {
    try {
      final response = await dio.post('$baseUrl/invoices', data: invoice.toJson());
      return InvoiceModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<InvoiceModel> updateInvoice(InvoiceModel invoice) async {
    try {
      final response = await dio.put('$baseUrl/invoices/${invoice.id}', data: invoice.toJson());
      return InvoiceModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteInvoice(String id) async {
    try {
      await dio.delete('$baseUrl/invoices/$id');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<String> generatePdfInvoice(String invoiceId) async {
    try {
      final response = await dio.get('$baseUrl/invoices/$invoiceId/pdf');
      return response.data['pdfUrl'];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<ProductModel>> getAllProducts() async {
    try {
      final response = await dio.get('$baseUrl/products');
      return (response.data as List).map((e) => ProductModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<ProductModel> getProductById(String id) async {
    try {
      final response = await dio.get('$baseUrl/products/$id');
      return ProductModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<ProductModel> createProduct(ProductModel product) async {
    try {
      final response = await dio.post('$baseUrl/products', data: product.toJson());
      return ProductModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<ProductModel> updateProduct(ProductModel product) async {
    try {
      final response = await dio.put('$baseUrl/products/${product.id}', data: product.toJson());
      return ProductModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteProduct(String id) async {
    try {
      await dio.delete('$baseUrl/products/$id');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<CustomerModel>> getAllCustomers() async {
    try {
      final response = await dio.get('$baseUrl/customers');
      return (response.data as List).map((e) => CustomerModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<CustomerModel> getCustomerById(String id) async {
    try {
      final response = await dio.get('$baseUrl/customers/$id');
      return CustomerModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<CustomerModel> createCustomer(CustomerModel customer) async {
    try {
      final response = await dio.post('$baseUrl/customers', data: customer.toJson());
      return CustomerModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<CustomerModel> updateCustomer(CustomerModel customer) async {
    try {
      final response = await dio.put('$baseUrl/customers/${customer.id}', data: customer.toJson());
      return CustomerModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteCustomer(String id) async {
    try {
      await dio.delete('$baseUrl/customers/$id');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<CustomerModel>> searchCustomers(String query) async {
    try {
      final response = await dio.get('$baseUrl/customers/search?q=$query');
      return (response.data as List).map((e) => CustomerModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<VehicleModel>> getAllVehicles() async {
    try {
      final response = await dio.get('$baseUrl/vehicles');
      return (response.data as List).map((e) => VehicleModel.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<VehicleModel> getVehicleById(String id) async {
    try {
      final response = await dio.get('$baseUrl/vehicles/$id');
      return VehicleModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<VehicleModel> createVehicle(VehicleModel vehicle) async {
    try {
      final response = await dio.post('$baseUrl/vehicles', data: vehicle.toJson());
      return VehicleModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<VehicleModel> updateVehicle(VehicleModel vehicle) async {
    try {
      final response = await dio.put('$baseUrl/vehicles/${vehicle.id}', data: vehicle.toJson());
      return VehicleModel.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteVehicle(String id) async {
    try {
      await dio.delete('$baseUrl/vehicles/$id');
    } catch (e) {
      rethrow;
    }
  }
}
