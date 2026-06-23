import 'package:get_it/get_it.dart';
import '../data/datasources/local_datasource.dart';
import '../data/datasources/remote_datasource.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/order_repository.dart';
import '../data/repositories/invoice_repository.dart';
import '../data/repositories/inventory_repository.dart';
import '../data/repositories/customer_repository.dart';
import '../data/repositories/delivery_repository.dart';
import '../services/sync_service.dart';
import '../services/storage_service.dart';

final getIt = GetIt.instance;

Future<void> setupServiceLocator() async {
  // Data Sources
  getIt.registerSingleton<LocalDataSource>(
    LocalDataSource(),
  );

  getIt.registerSingleton<RemoteDataSource>(
    RemoteDataSource(),
  );

  // Services
  getIt.registerSingleton<StorageService>(
    StorageService(),
  );

  getIt.registerSingleton<SyncService>(
    SyncService(
      localDataSource: getIt<LocalDataSource>(),
      remoteDataSource: getIt<RemoteDataSource>(),
    ),
  );

  // Repositories
  getIt.registerSingleton<AuthRepository>(
    AuthRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );

  getIt.registerSingleton<OrderRepository>(
    OrderRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );

  getIt.registerSingleton<InvoiceRepository>(
    InvoiceRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );

  getIt.registerSingleton<InventoryRepository>(
    InventoryRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );

  getIt.registerSingleton<CustomerRepository>(
    CustomerRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );

  getIt.registerSingleton<DeliveryRepository>(
    DeliveryRepository(
      remoteDataSource: getIt<RemoteDataSource>(),
      localDataSource: getIt<LocalDataSource>(),
    ),
  );
}
