import '../../models/user_model.dart';
import '../../models/order_model.dart';
import '../../models/invoice_model.dart';
import '../../models/product_model.dart';
import '../../models/customer_model.dart';
import '../../models/vehicle_model.dart';

abstract class ApiDataSource {
  // Auth
  Future<UserModel> login(String email, String password);
  Future<UserModel> getCurrentUser();
  Future<void> logout();

  // Users
  Future<List<UserModel>> getAllUsers();
  Future<UserModel> getUserById(String id);
  Future<UserModel> createUser(UserModel user);
  Future<UserModel> updateUser(UserModel user);
  Future<void> deleteUser(String id);

  // Orders
  Future<List<OrderModel>> getAllOrders();
  Future<OrderModel> getOrderById(String id);
  Future<List<OrderModel>> getOrdersByCustomerId(String customerId);
  Future<OrderModel> createOrder(OrderModel order);
  Future<OrderModel> updateOrder(OrderModel order);
  Future<void> deleteOrder(String id);

  // Invoices
  Future<List<InvoiceModel>> getAllInvoices();
  Future<InvoiceModel> getInvoiceById(String id);
  Future<List<InvoiceModel>> getInvoicesByCustomerId(String customerId);
  Future<InvoiceModel> createInvoice(InvoiceModel invoice);
  Future<InvoiceModel> updateInvoice(InvoiceModel invoice);
  Future<void> deleteInvoice(String id);
  Future<String> generatePdfInvoice(String invoiceId);

  // Products
  Future<List<ProductModel>> getAllProducts();
  Future<ProductModel> getProductById(String id);
  Future<ProductModel> createProduct(ProductModel product);
  Future<ProductModel> updateProduct(ProductModel product);
  Future<void> deleteProduct(String id);

  // Customers
  Future<List<CustomerModel>> getAllCustomers();
  Future<CustomerModel> getCustomerById(String id);
  Future<CustomerModel> createCustomer(CustomerModel customer);
  Future<CustomerModel> updateCustomer(CustomerModel customer);
  Future<void> deleteCustomer(String id);
  Future<List<CustomerModel>> searchCustomers(String query);

  // Vehicles
  Future<List<VehicleModel>> getAllVehicles();
  Future<VehicleModel> getVehicleById(String id);
  Future<VehicleModel> createVehicle(VehicleModel vehicle);
  Future<VehicleModel> updateVehicle(VehicleModel vehicle);
  Future<void> deleteVehicle(String id);
}
