import { eq, desc, and, gte, lte, sql, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, staffAccounts, products, inventory, inventoryTransactions, orders, orderItems, invoices, invoiceItems, customers, deliveries, truckStock, salesRecords, customerNotifications, InsertCustomerNotification, deliveryZones, InsertDeliveryZone, systemSettings, loyaltyPoints, pointsTransactions, auditLogs, InsertAuditLog, expenses, InsertExpense, Expense, waterQualityInspections, InsertWaterQualityInspection, WaterQualityInspection } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== STAFF ACCOUNTS =====
export async function getStaffByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(staffAccounts).where(eq(staffAccounts.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffAccounts).orderBy(desc(staffAccounts.createdAt));
}

export async function createStaffAccount(data: { username: string; passwordHash: string; fullName: string; phone?: string; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(staffAccounts).values(data);
  return result;
}

// ===== PRODUCTS =====
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// ===== INVENTORY =====
export async function getInventoryWithProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    inventory: inventory,
    product: products,
  }).from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .orderBy(products.name);
}

export async function getInventoryByProductId(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(inventory).where(eq(inventory.productId, productId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertInventory(productId: number, stock: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getInventoryByProductId(productId);
  if (existing) {
    return db.update(inventory).set({ currentStock: stock, lastRestocked: new Date() }).where(eq(inventory.productId, productId));
  } else {
    return db.insert(inventory).values({ productId, currentStock: stock, lastRestocked: new Date() });
  }
}

export async function adjustInventory(productId: number, quantityChange: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inventory)
    .set({ currentStock: sql`currentStock + ${quantityChange}` })
    .where(eq(inventory.productId, productId));
}

export async function createInventoryTransaction(data: { productId: number; type: "stock_in" | "stock_out" | "adjustment"; quantity: number; note?: string; createdBy?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(inventoryTransactions).values(data);
}

export async function getInventoryTransactions(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (productId) {
    return db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId)).orderBy(desc(inventoryTransactions.createdAt));
  }
  return db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt)).limit(100);
}

// ===== CUSTOMERS =====
export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomer(data: { name: string; phone: string; address?: string; zone?: string; isRegistered?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data);
}

// ===== ORDERS =====
export async function getAllOrders(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function getOrdersByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.assignedStaffId, staffId)).orderBy(desc(orders.createdAt));
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function createOrderItems(items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(items);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ===== INVOICES =====
export async function getAllInvoices(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(limit);
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInvoice(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(invoices).values(data);
}

export async function createInvoiceItems(items: any[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(invoiceItems).values(items);
}

export async function getInvoiceItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function getNextInvoiceNumber() {
  const db = await getDb();
  if (!db) return "AMP-000001";
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(invoices);
  const count = result[0]?.count || 0;
  const num = count + 1;
  return `AMP-${String(num).padStart(6, "0")}`;
}

// ===== DELIVERIES =====
export async function getDeliveriesByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    delivery: deliveries,
    order: orders,
  }).from(deliveries)
    .innerJoin(orders, eq(deliveries.orderId, orders.id))
    .where(eq(deliveries.staffId, staffId))
    .orderBy(desc(deliveries.createdAt));
}

export async function createDelivery(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(deliveries).values(data);
}

export async function updateDeliveryStatus(id: number, status: "assigned" | "in_transit" | "delivered" | "failed") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status };
  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  }
  return db.update(deliveries).set(updateData).where(eq(deliveries.id, id));
}

// ===== TRUCK STOCK =====
export async function getTruckStockByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    truckStock: truckStock,
    product: products,
  }).from(truckStock)
    .innerJoin(products, eq(truckStock.productId, products.id))
    .where(eq(truckStock.staffId, staffId));
}

export async function updateTruckStock(staffId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(truckStock)
    .where(and(eq(truckStock.staffId, staffId), eq(truckStock.productId, productId)))
    .limit(1);
  if (existing.length > 0) {
    return db.update(truckStock).set({ quantity }).where(eq(truckStock.id, existing[0].id));
  } else {
    return db.insert(truckStock).values({ staffId, productId, quantity });
  }
}

// ===== SALES RECORDS =====
export async function createSalesRecord(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(salesRecords).values(data);
}

export async function getSalesRecords(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  if (startDate && endDate) {
    return db.select().from(salesRecords)
      .where(and(gte(salesRecords.saleDate, startDate), lte(salesRecords.saleDate, endDate)))
      .orderBy(desc(salesRecords.saleDate));
  }
  return db.select().from(salesRecords).orderBy(desc(salesRecords.saleDate)).limit(500);
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, pendingOrders: 0, todaySales: 0, totalRevenue: 0, lowStockItems: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [orderCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
  const [pendingCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, "pending"));
  const [todaySalesResult] = await db.select({ total: sql<string>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(and(gte(orders.createdAt, today), eq(orders.status, "delivered")));
  const [totalRevenueResult] = await db.select({ total: sql<string>`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(eq(orders.status, "delivered"));
  const [lowStockResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(inventory).where(sql`currentStock <= minStockLevel`);
  
  return {
    totalOrders: orderCount?.count || 0,
    pendingOrders: pendingCount?.count || 0,
    todaySales: parseFloat(todaySalesResult?.total || "0"),
    totalRevenue: parseFloat(totalRevenueResult?.total || "0"),
    lowStockItems: lowStockResult?.count || 0,
  };
}

export async function getRevenueByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.select({
    date: sql<string>`DATE(createdAt)`,
    revenue: sql<string>`COALESCE(SUM(totalAmount), 0)`,
    orderCount: sql<number>`COUNT(*)`,
  }).from(orders)
    .where(and(gte(orders.createdAt, startDate), eq(orders.status, "delivered")))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);
}

export async function getTopCustomers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    customerName: orders.customerName,
    customerPhone: orders.customerPhone,
    totalOrders: sql<number>`COUNT(*)`,
    totalSpent: sql<string>`COALESCE(SUM(totalAmount), 0)`,
  }).from(orders)
    .where(eq(orders.status, "delivered"))
    .groupBy(orders.customerName, orders.customerPhone)
    .orderBy(sql`SUM(totalAmount) DESC`)
    .limit(limit);
}

export async function getBottleTypeBreakdown() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    productType: salesRecords.productType,
    totalQuantity: sql<number>`COALESCE(SUM(quantity), 0)`,
    totalRevenue: sql<string>`COALESCE(SUM(totalAmount), 0)`,
  }).from(salesRecords)
    .groupBy(salesRecords.productType);
}

export async function getDeliveryPerformance() {
  const db = await getDb();
  if (!db) return { totalDeliveries: 0, delivered: 0, failed: 0, inTransit: 0, assigned: 0, successRate: 0 };
  
  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveries);
  const [deliveredCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "delivered"));
  const [failedCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "failed"));
  const [inTransitCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "in_transit"));
  const [assignedCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "assigned"));
  
  const totalDel = total?.count || 0;
  const delivered = deliveredCount?.count || 0;
  const successRate = totalDel > 0 ? Math.round((delivered / totalDel) * 100) : 0;
  
  return {
    totalDeliveries: totalDel,
    delivered,
    failed: failedCount?.count || 0,
    inTransit: inTransitCount?.count || 0,
    assigned: assignedCount?.count || 0,
    successRate,
  };
}

// ============ Customer Notifications ============

export async function createCustomerNotification(data: InsertCustomerNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(customerNotifications).values(data);
}

export async function getNotificationsByPhone(phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerNotifications)
    .where(eq(customerNotifications.customerPhone, phone))
    .orderBy(desc(customerNotifications.createdAt))
    .limit(50);
}

export async function getNotificationsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerNotifications)
    .where(eq(customerNotifications.orderId, orderId))
    .orderBy(desc(customerNotifications.createdAt));
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(customerNotifications).set({ isRead: true }).where(eq(customerNotifications.id, id));
}

// ============ Delivery Zones ============

export async function getAllZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryZones).orderBy(deliveryZones.name);
}

export async function getZoneById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);
  return result[0];
}

export async function createZone(data: InsertDeliveryZone) {
  const db = await getDb();
  if (!db) return;
  await db.insert(deliveryZones).values(data);
}

export async function updateZone(id: number, data: Partial<InsertDeliveryZone>) {
  const db = await getDb();
  if (!db) return;
  await db.update(deliveryZones).set(data).where(eq(deliveryZones.id, id));
}

export async function deleteZone(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
}

export async function assignStaffToZone(staffId: number, zoneId: number | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(staffAccounts).set({ zoneId }).where(eq(staffAccounts.id, staffId));
}

// ============ System Settings ============

export async function getSystemSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : null;
}

export async function setSystemSetting(key: string, value: string, description?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemSettings).values({ settingKey: key, settingValue: value, description: description || null })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getAllSystemSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(systemSettings);
}

// ==================== LOYALTY POINTS ====================

export async function getLoyaltyByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerPhone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllLoyaltyAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyPoints).orderBy(desc(loyaltyPoints.availablePoints));
}

export async function earnPoints(customerPhone: string, customerName: string, points: number, orderId: number, orderNumber: string) {
  const db = await getDb();
  if (!db) return;

  // Upsert loyalty account
  const existing = await getLoyaltyByPhone(customerPhone);
  if (existing) {
    await db.update(loyaltyPoints)
      .set({
        totalPoints: existing.totalPoints + points,
        availablePoints: existing.availablePoints + points,
        customerName: customerName || existing.customerName,
        tier: calculateTier(existing.totalPoints + points),
      })
      .where(eq(loyaltyPoints.customerPhone, customerPhone));
  } else {
    await db.insert(loyaltyPoints).values({
      customerPhone,
      customerName,
      totalPoints: points,
      availablePoints: points,
      tier: calculateTier(points),
    });
  }

  // Record transaction
  await db.insert(pointsTransactions).values({
    customerPhone,
    type: "earn",
    points,
    orderId,
    orderNumber,
    description: `Earned ${points} points for order ${orderNumber}`,
  });
}

export async function redeemPoints(customerPhone: string, points: number, orderId: number | null, orderNumber: string | null) {
  const db = await getDb();
  if (!db) return false;

  const account = await getLoyaltyByPhone(customerPhone);
  if (!account || account.availablePoints < points) return false;

  await db.update(loyaltyPoints)
    .set({
      redeemedPoints: account.redeemedPoints + points,
      availablePoints: account.availablePoints - points,
    })
    .where(eq(loyaltyPoints.customerPhone, customerPhone));

  await db.insert(pointsTransactions).values({
    customerPhone,
    type: "redeem",
    points: -points,
    orderId,
    orderNumber,
    description: `Redeemed ${points} points for discount`,
  });

  return true;
}

export async function getPointsHistory(customerPhone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointsTransactions)
    .where(eq(pointsTransactions.customerPhone, customerPhone))
    .orderBy(desc(pointsTransactions.createdAt))
    .limit(50);
}

function calculateTier(totalPoints: number): "bronze" | "silver" | "gold" | "platinum" {
  if (totalPoints >= 500) return "platinum";
  if (totalPoints >= 200) return "gold";
  if (totalPoints >= 50) return "silver";
  return "bronze";
}

// ==================== ADMIN PASSWORD CHANGE ====================

export async function updateStaffPassword(staffId: number, newPasswordHash: string) {
  const db = await getDb();
  if (!db) return false;
  await db.update(staffAccounts)
    .set({ passwordHash: newPasswordHash })
    .where(eq(staffAccounts.id, staffId));
  return true;
}

export async function getStaffById(staffId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staffAccounts).where(eq(staffAccounts.id, staffId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== STAFF CRUD (Admin) =====
export async function updateStaffAccount(staffId: number, data: { username?: string; fullName?: string; phone?: string; passwordHash?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staffAccounts).set(data).where(eq(staffAccounts.id, staffId));
}

export async function deleteStaffAccount(staffId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(staffAccounts).where(eq(staffAccounts.id, staffId));
}

// ===== PRODUCTS (Admin - include inactive) =====
export async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

// ===== ORDER DELETION =====
export async function deleteOrder(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete order items first
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
  // Delete related deliveries
  await db.delete(deliveries).where(eq(deliveries.orderId, orderId));
  // Delete the order
  await db.delete(orders).where(eq(orders.id, orderId));
  return true;
}

export async function deleteAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete all order items first
  await db.delete(orderItems);
  // Delete all deliveries
  await db.delete(deliveries);
  // Delete all orders
  await db.delete(orders);
  return true;
}

// ===== AUDIT LOGS =====
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLogs).values(data);
}

export async function getAllAuditLogs(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getAuditLogsByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.staffId, staffId)).orderBy(desc(auditLogs.createdAt)).limit(100);
}

// ===== STAFF-SCOPED INVOICES =====
export async function getInvoicesByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.createdBy, staffId)).orderBy(desc(invoices.createdAt));
}

export async function updateInvoice(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoiceItems(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  return db.delete(invoices).where(eq(invoices.id, id));
}

// ===== STAFF-SCOPED SALES =====
export async function getSalesRecordsByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesRecords).where(eq(salesRecords.staffId, staffId)).orderBy(desc(salesRecords.saleDate)).limit(200);
}


// ===== EXPENSES (Staff Tracking) =====
export async function createExpense(data: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(data);
}

export async function getExpenseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getExpensesByStaff(staffId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(eq(expenses.staffId, staffId))
    .orderBy(desc(expenses.date));
}

export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .orderBy(desc(expenses.date));
}

export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(and(
      gte(sql`DATE(${expenses.date})`, sql`DATE(${startDate})`),
      lte(sql`DATE(${expenses.date})`, sql`DATE(${endDate})`)
    ))
    .orderBy(desc(expenses.date));
}

export async function updateExpense(id: number, data: Partial<Expense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set(data).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(expenses).where(eq(expenses.id, id));
}

export async function approveExpense(id: number, approvedBy: number, approvedByName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set({
    isApproved: true,
    approvedBy,
    approvedByName,
    approvalDate: new Date(),
  }).where(eq(expenses.id, id));
}

export async function rejectExpense(id: number, rejectionReason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set({
    isApproved: false,
    rejectionReason,
  }).where(eq(expenses.id, id));
}

export async function getPendingExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses)
    .where(eq(expenses.isApproved, false))
    .orderBy(desc(expenses.date));
}


// Water Quality Inspection helpers
export async function createWaterQualityInspection(data: InsertWaterQualityInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(waterQualityInspections).values(data);
  return result;
}

export async function getWaterQualityInspections(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waterQualityInspections)
    .orderBy(desc(waterQualityInspections.inspectionDate))
    .limit(limit);
}

export async function getLatestWaterQualityInspection(): Promise<WaterQualityInspection | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(waterQualityInspections)
    .orderBy(desc(waterQualityInspections.inspectionDate))
    .limit(1);
  return result[0] || null;
}

export async function updateWaterQualityInspection(id: number, data: Partial<InsertWaterQualityInspection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(waterQualityInspections).set(data).where(eq(waterQualityInspections.id, id));
}

export async function deleteWaterQualityInspection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(waterQualityInspections).where(eq(waterQualityInspections.id, id));
}
