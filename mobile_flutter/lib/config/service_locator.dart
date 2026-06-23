import 'package:dio/dio.dart';
import 'package:get_it/get_it.dart';

import '../data/datasources/remote/api_datasource.dart';
import '../data/datasources/remote/http_api_datasource.dart';
import '../data/repositories/user_repository_impl.dart';
import '../data/repositories/order_repository_impl.dart';
import '../data/repositories/invoice_repository_impl.dart';
import '../data/repositories/inventory_repository_impl.dart';
import '../data/repositories/customer_repository_impl.dart';
import '../data/repositories/fleet_repository_impl.dart';

import '../domain/repositories/user_repository.dart';
import '../domain/repositories/order_repository.dart';
import '../domain/repositories/invoice_repository.dart';
import '../domain/repositories/inventory_repository.dart';
import '../domain/repositories/customer_repository.dart';
import '../domain/repositories/fleet_repository.dart';

import '../domain/usecases/auth_usecases.dart';
import '../domain/usecases/order_usecases.dart';
import '../domain/usecases/invoice_usecases.dart';
import '../domain/usecases/inventory_usecases.dart';
import '../domain/usecases/customer_usecases.dart';
import '../domain/usecases/fleet_usecases.dart';

final getIt = GetIt.instance;

void setupServiceLocator({required String apiBaseUrl}) {
  // Dio setup
  final dio = Dio();
  dio.options.baseUrl = apiBaseUrl;
  dio.options.connectTimeout = const Duration(seconds: 30);
  dio.options.receiveTimeout = const Duration(seconds: 30);

  // Data sources
  getIt.registerSingleton<ApiDataSource>(
    HttpApiDataSource(dio: dio, baseUrl: apiBaseUrl),
  );

  // Repositories
  getIt.registerSingleton<UserRepository>(
    UserRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );
  getIt.registerSingleton<OrderRepository>(
    OrderRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );
  getIt.registerSingleton<InvoiceRepository>(
    InvoiceRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );
  getIt.registerSingleton<InventoryRepository>(
    InventoryRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );
  getIt.registerSingleton<CustomerRepository>(
    CustomerRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );
  getIt.registerSingleton<FleetRepository>(
    FleetRepositoryImpl(apiDataSource: getIt<ApiDataSource>()),
  );

  // Auth Use Cases
  getIt.registerSingleton<LoginUseCase>(
    LoginUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<LogoutUseCase>(
    LogoutUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<GetCurrentUserUseCase>(
    GetCurrentUserUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<GetAllUsersUseCase>(
    GetAllUsersUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<CreateUserUseCase>(
    CreateUserUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<UpdateUserUseCase>(
    UpdateUserUseCase(getIt<UserRepository>()),
  );
  getIt.registerSingleton<DeleteUserUseCase>(
    DeleteUserUseCase(getIt<UserRepository>()),
  );

  // Order Use Cases
  getIt.registerSingleton<GetAllOrdersUseCase>(
    GetAllOrdersUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<GetOrderByIdUseCase>(
    GetOrderByIdUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<GetOrdersByCustomerIdUseCase>(
    GetOrdersByCustomerIdUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<CreateOrderUseCase>(
    CreateOrderUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<UpdateOrderUseCase>(
    UpdateOrderUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<DeleteOrderUseCase>(
    DeleteOrderUseCase(getIt<OrderRepository>()),
  );
  getIt.registerSingleton<GetOrdersByStatusUseCase>(
    GetOrdersByStatusUseCase(getIt<OrderRepository>()),
  );

  // Invoice Use Cases
  getIt.registerSingleton<GetAllInvoicesUseCase>(
    GetAllInvoicesUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<GetInvoiceByIdUseCase>(
    GetInvoiceByIdUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<GetInvoicesByCustomerIdUseCase>(
    GetInvoicesByCustomerIdUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<CreateInvoiceUseCase>(
    CreateInvoiceUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<UpdateInvoiceUseCase>(
    UpdateInvoiceUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<DeleteInvoiceUseCase>(
    DeleteInvoiceUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<GetInvoicesByStatusUseCase>(
    GetInvoicesByStatusUseCase(getIt<InvoiceRepository>()),
  );
  getIt.registerSingleton<GeneratePdfInvoiceUseCase>(
    GeneratePdfInvoiceUseCase(getIt<InvoiceRepository>()),
  );

  // Inventory Use Cases
  getIt.registerSingleton<GetAllProductsUseCase>(
    GetAllProductsUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<GetProductByIdUseCase>(
    GetProductByIdUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<CreateProductUseCase>(
    CreateProductUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<UpdateProductUseCase>(
    UpdateProductUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<DeleteProductUseCase>(
    DeleteProductUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<GetAllInventoryUseCase>(
    GetAllInventoryUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<GetInventoryByProductIdUseCase>(
    GetInventoryByProductIdUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<UpdateInventoryUseCase>(
    UpdateInventoryUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<GetTransactionHistoryUseCase>(
    GetTransactionHistoryUseCase(getIt<InventoryRepository>()),
  );
  getIt.registerSingleton<RecordTransactionUseCase>(
    RecordTransactionUseCase(getIt<InventoryRepository>()),
  );

  // Customer Use Cases
  getIt.registerSingleton<GetAllCustomersUseCase>(
    GetAllCustomersUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<GetCustomerByIdUseCase>(
    GetCustomerByIdUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<CreateCustomerUseCase>(
    CreateCustomerUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<UpdateCustomerUseCase>(
    UpdateCustomerUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<DeleteCustomerUseCase>(
    DeleteCustomerUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<SearchCustomersUseCase>(
    SearchCustomersUseCase(getIt<CustomerRepository>()),
  );
  getIt.registerSingleton<GetCustomersByRegionUseCase>(
    GetCustomersByRegionUseCase(getIt<CustomerRepository>()),
  );

  // Fleet Use Cases
  getIt.registerSingleton<GetAllVehiclesUseCase>(
    GetAllVehiclesUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<GetVehicleByIdUseCase>(
    GetVehicleByIdUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<CreateVehicleUseCase>(
    CreateVehicleUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<UpdateVehicleUseCase>(
    UpdateVehicleUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<DeleteVehicleUseCase>(
    DeleteVehicleUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<GetVehiclesByStatusUseCase>(
    GetVehiclesByStatusUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<GetAllDeliveryRoutesUseCase>(
    GetAllDeliveryRoutesUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<GetDeliveryRouteByIdUseCase>(
    GetDeliveryRouteByIdUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<CreateDeliveryRouteUseCase>(
    CreateDeliveryRouteUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<UpdateDeliveryRouteUseCase>(
    UpdateDeliveryRouteUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<DeleteDeliveryRouteUseCase>(
    DeleteDeliveryRouteUseCase(getIt<FleetRepository>()),
  );
  getIt.registerSingleton<GetRoutesByVehicleIdUseCase>(
    GetRoutesByVehicleIdUseCase(getIt<FleetRepository>()),
  );
}
