import 'package:drift/drift.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'dart:io';
import 'package:drift/native.dart';

part 'drift_database.g.dart';

// Tables
@DataClassName("UserModel")
class Users extends Table {
  TextColumn get id => text()();
  TextColumn get email => text()();
  TextColumn get username => text()();
  TextColumn get fullName => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get role => text()(); // 'admin', 'staff', 'customer'
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastLogin => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("ProductModel")
class Products extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get description => text().nullable()();
  RealColumn get price => real()();
  TextColumn get unit => text()(); // '20L', '1L', '0.5L', etc.
  IntColumn get minimumStock => integer()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("InventoryModel")
class Inventories extends Table {
  TextColumn get id => text()();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get quantity => integer()();
  IntColumn get reserved => integer().withDefault(const Constant(0))();
  IntColumn get available => integer()();
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("CustomerModel")
class Customers extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get email => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get address => text().nullable()();
  TextColumn get city => text().nullable()();
  TextColumn get region => text().nullable()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  RealColumn get creditLimit => real()();
  RealColumn get currentBalance => real()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get lastOrderDate => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("OrderModel")
class Orders extends Table {
  TextColumn get id => text()();
  TextColumn get customerId => text().references(Customers, #id)();
  TextColumn get staffId => text().nullable()();
  TextColumn get status => text()(); // 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'
  RealColumn get totalAmount => real()();
  RealColumn get discountAmount => real().nullable()();
  RealColumn get finalAmount => real()();
  TextColumn get notes => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get deliveryDate => dateTime().nullable()();
  DateTimeColumn get completedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("OrderItemModel")
class OrderItems extends Table {
  TextColumn get id => text()();
  TextColumn get orderId => text().references(Orders, #id)();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get quantity => integer()();
  RealColumn get unitPrice => real()();
  RealColumn get totalPrice => real()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("InvoiceModel")
class Invoices extends Table {
  TextColumn get id => text()();
  TextColumn get orderId => text().references(Orders, #id)();
  TextColumn get customerId => text().references(Customers, #id)();
  TextColumn get invoiceNumber => text()();
  TextColumn get status => text()(); // 'draft', 'issued', 'paid', 'overdue', 'cancelled'
  RealColumn get subtotal => real()();
  RealColumn get taxAmount => real()();
  RealColumn get discountAmount => real()();
  RealColumn get totalAmount => real()();
  DateTimeColumn get issuedDate => dateTime()();
  DateTimeColumn get dueDate => dateTime()();
  DateTimeColumn get paidDate => dateTime().nullable()();
  TextColumn get notes => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("InvoiceItemModel")
class InvoiceItems extends Table {
  TextColumn get id => text()();
  TextColumn get invoiceId => text().references(Invoices, #id)();
  TextColumn get productId => text().references(Products, #id)();
  TextColumn get description => text()();
  IntColumn get quantity => integer()();
  RealColumn get unitPrice => real()();
  RealColumn get totalPrice => real()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("VehicleModel")
class Vehicles extends Table {
  TextColumn get id => text()();
  TextColumn get licensePlate => text()();
  TextColumn get model => text()();
  TextColumn get manufacturer => text()();
  IntColumn get year => integer()();
  TextColumn get status => text()(); // 'active', 'maintenance', 'inactive'
  TextColumn get assignedDriverId => text().nullable()();
  RealColumn get currentLatitude => real().nullable()();
  RealColumn get currentLongitude => real().nullable()();
  IntColumn get currentCapacity => integer()();
  IntColumn get maxCapacity => integer()();
  DateTimeColumn get lastMaintenanceDate => dateTime()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("DeliveryRouteModel")
class DeliveryRoutes extends Table {
  TextColumn get id => text()();
  TextColumn get vehicleId => text().references(Vehicles, #id)();
  TextColumn get driverId => text()();
  DateTimeColumn get scheduledDate => dateTime()();
  IntColumn get totalStops => integer()();
  IntColumn get completedStops => integer().withDefault(const Constant(0))();
  RealColumn get totalDistance => real()();
  TextColumn get status => text()(); // 'pending', 'in_progress', 'completed', 'cancelled'
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName("SyncQueueModel")
class SyncQueues extends Table {
  TextColumn get id => text()();
  TextColumn get entityType => text()(); // 'order', 'invoice', 'product', etc.
  TextColumn get entityId => text()();
  TextColumn get action => text()(); // 'create', 'update', 'delete'
  TextColumn get payload => text()(); // JSON serialized data
  DateTimeColumn get createdAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  DateTimeColumn get syncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(tables: [
  Users,
  Products,
  Inventories,
  Customers,
  Orders,
  OrderItems,
  Invoices,
  InvoiceItems,
  Vehicles,
  DeliveryRoutes,
  SyncQueues,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return LazyDatabase(() async {
      final dir = await getApplicationDocumentsDirectory();
      final file = File(p.join(dir.path, 'amaw_pyay_db.sqlite'));
      return NativeDatabase(file);
    });
  }
}
