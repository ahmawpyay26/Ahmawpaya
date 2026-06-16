import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "staff"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Staff accounts created by Admin (username/password based)
 */
export const staffAccounts = mysqlTable("staff_accounts", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  fullName: varchar("fullName", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  zoneId: int("zoneId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Delivery zones for geographic area management
 */
export const deliveryZones = mysqlTable("delivery_zones", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameMyanmar: varchar("nameMyanmar", { length: 200 }),
  color: varchar("color", { length: 20 }).default("#0ea5e9").notNull(),
  centerLat: decimal("centerLat", { precision: 10, scale: 7 }),
  centerLng: decimal("centerLng", { precision: 10, scale: 7 }),
  assignedStaffId: int("assignedStaffId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type InsertDeliveryZone = typeof deliveryZones.$inferInsert;

export type StaffAccount = typeof staffAccounts.$inferSelect;
export type InsertStaffAccount = typeof staffAccounts.$inferInsert;

/**
 * Products table - water bottles and related items
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameMyanmar: varchar("nameMyanmar", { length: 200 }),
  type: mysqlEnum("type", ["20L", "1L", "0.5L", "0.35L", "other"]).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  shellPrice: decimal("shellPrice", { precision: 10, scale: 2 }).default("0"),
  waterPrice: decimal("waterPrice", { precision: 10, scale: 2 }).default("0"),
  description: text("description"),
  descriptionMyanmar: text("descriptionMyanmar"),
  isActive: boolean("isActive").default(true).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Inventory tracking
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  currentStock: int("currentStock").default(0).notNull(),
  minStockLevel: int("minStockLevel").default(10).notNull(),
  lastRestocked: timestamp("lastRestocked"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Inventory transactions (stock in/out log)
 */
export const inventoryTransactions = mysqlTable("inventory_transactions", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  type: mysqlEnum("type", ["stock_in", "stock_out", "adjustment"]).notNull(),
  quantity: int("quantity").notNull(),
  note: text("note"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert;

/**
 * Customers (both registered and guest)
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  zone: varchar("zone", { length: 100 }),
  priceTier: mysqlEnum("priceTier", ["retail", "wholesale", "vip"]).default("retail").notNull(),
  isRegistered: boolean("isRegistered").default(false).notNull(),
  orderCount: int("orderCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerAddress: text("customerAddress"),
  status: mysqlEnum("status", ["pending", "processing", "delivered", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  note: text("note"),
  assignedStaffId: int("assignedStaffId"),
  isPublicOrder: boolean("isPublicOrder").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items
 */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 200 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Invoices
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  orderId: int("orderId"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerAddress: text("customerAddress"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("invoiceStatus", ["draft", "issued", "paid", "overdue"]).default("issued").notNull(),
  createdBy: int("createdBy"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Invoice items
 */
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  productId: int("productId"),
  productName: varchar("productName", { length: 200 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

/**
 * Deliveries assigned to staff
 */
export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  staffId: int("staffId").notNull(),
  status: mysqlEnum("deliveryStatus", ["assigned", "in_transit", "delivered", "failed"]).default("assigned").notNull(),
  truckStockBefore: json("truckStockBefore"),
  truckStockAfter: json("truckStockAfter"),
  deliveredAt: timestamp("deliveredAt"),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = typeof deliveries.$inferInsert;

/**
 * Truck stock tracking for staff
 */
export const truckStock = mysqlTable("truck_stock", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TruckStock = typeof truckStock.$inferSelect;
export type InsertTruckStock = typeof truckStock.$inferInsert;

/**
 * Sales records for reporting
 */
export const salesRecords = mysqlTable("sales_records", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId"),
  invoiceId: int("invoiceId"),
  staffId: int("staffId"),
  customerId: int("customerId"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  productType: mysqlEnum("productType", ["20L", "1L", "0.5L", "0.35L", "other"]),
  quantity: int("quantity").default(0),
  saleDate: timestamp("saleDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesRecord = typeof salesRecords.$inferSelect;
export type InsertSalesRecord = typeof salesRecords.$inferInsert;

/**
 * Customer notifications (SMS-like notification log)
 */
export const customerNotifications = mysqlTable("customer_notifications", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId"),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerName: varchar("customerName", { length: 200 }),
  type: mysqlEnum("notificationType", ["order_placed", "status_change", "delivery_assigned", "delivery_complete"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type InsertCustomerNotification = typeof customerNotifications.$inferInsert;

/**
 * System settings (key-value store for admin-configurable settings)
 */
export const systemSettings = mysqlTable("system_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Customer loyalty points balance
 */
export const loyaltyPoints = mysqlTable("loyalty_points", {
  id: int("id").autoincrement().primaryKey(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull().unique(),
  customerName: varchar("customerName", { length: 200 }),
  totalPoints: int("totalPoints").default(0).notNull(),
  redeemedPoints: int("redeemedPoints").default(0).notNull(),
  availablePoints: int("availablePoints").default(0).notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyPoint = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoint = typeof loyaltyPoints.$inferInsert;

/**
 * Points transaction history (earn/redeem)
 */
export const pointsTransactions = mysqlTable("points_transactions", {
  id: int("id").autoincrement().primaryKey(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  type: mysqlEnum("transactionType", ["earn", "redeem", "bonus", "expire"]).notNull(),
  points: int("points").notNull(),
  orderId: int("orderId"),
  orderNumber: varchar("orderNumber", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type InsertPointsTransaction = typeof pointsTransactions.$inferInsert;

/**
 * Audit logs for tracking staff actions (invoice modifications)
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  staffName: varchar("staffName", { length: 200 }).notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  entityLabel: varchar("entityLabel", { length: 200 }),
  oldData: json("oldData"),
  newData: json("newData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Staff expense tracking (receipts, daily expenses)
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  staffName: varchar("staffName", { length: 200 }).notNull(),
  date: date("date").notNull(),
  category: mysqlEnum("category", ["fuel", "meals", "transport", "maintenance", "supplies", "other"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  isApproved: boolean("isApproved").default(false).notNull(),
  approvedBy: int("approvedBy"),
  approvedByName: varchar("approvedByName", { length: 200 }),
  approvalDate: timestamp("approvalDate"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Water quality inspection records (pH, turbidity, chlorine levels)
 */
export const waterQualityInspections = mysqlTable("water_quality_inspections", {
  id: int("id").autoincrement().primaryKey(),
  inspectionDate: date("inspectionDate").notNull(),
  pH: decimal("pH", { precision: 4, scale: 2 }).notNull(),
  turbidity: decimal("turbidity", { precision: 5, scale: 2 }).notNull(),
  chlorineLevel: decimal("chlorineLevel", { precision: 5, scale: 2 }).notNull(),
  notes: text("notes"),
  inspectedBy: varchar("inspectedBy", { length: 200 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WaterQualityInspection = typeof waterQualityInspections.$inferSelect;
export type InsertWaterQualityInspection = typeof waterQualityInspections.$inferInsert;
