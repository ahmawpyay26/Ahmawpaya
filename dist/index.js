var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  customerNotifications: () => customerNotifications,
  customers: () => customers,
  deliveries: () => deliveries,
  deliveryZones: () => deliveryZones,
  expenses: () => expenses,
  inventory: () => inventory,
  inventoryTransactions: () => inventoryTransactions,
  invoiceItems: () => invoiceItems,
  invoices: () => invoices,
  loyaltyPoints: () => loyaltyPoints,
  orderItems: () => orderItems,
  orders: () => orders,
  pointsTransactions: () => pointsTransactions,
  products: () => products,
  salesRecords: () => salesRecords,
  staffAccounts: () => staffAccounts,
  systemSettings: () => systemSettings,
  truckStock: () => truckStock,
  users: () => users,
  waterQualityInspections: () => waterQualityInspections
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, date } from "drizzle-orm/mysql-core";
var users, staffAccounts, deliveryZones, products, inventory, inventoryTransactions, customers, orders, orderItems, invoices, invoiceItems, deliveries, truckStock, salesRecords, customerNotifications, systemSettings, loyaltyPoints, pointsTransactions, auditLogs, expenses, waterQualityInspections;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "staff"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    staffAccounts = mysqlTable("staff_accounts", {
      id: int("id").autoincrement().primaryKey(),
      username: varchar("username", { length: 100 }).notNull().unique(),
      passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
      fullName: varchar("fullName", { length: 200 }).notNull(),
      phone: varchar("phone", { length: 20 }),
      zoneId: int("zoneId"),
      isActive: boolean("isActive").default(true).notNull(),
      createdBy: int("createdBy"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    deliveryZones = mysqlTable("delivery_zones", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      nameMyanmar: varchar("nameMyanmar", { length: 200 }),
      color: varchar("color", { length: 20 }).default("#0ea5e9").notNull(),
      centerLat: decimal("centerLat", { precision: 10, scale: 7 }),
      centerLng: decimal("centerLng", { precision: 10, scale: 7 }),
      assignedStaffId: int("assignedStaffId"),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    products = mysqlTable("products", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    inventory = mysqlTable("inventory", {
      id: int("id").autoincrement().primaryKey(),
      productId: int("productId").notNull(),
      currentStock: int("currentStock").default(0).notNull(),
      minStockLevel: int("minStockLevel").default(10).notNull(),
      lastRestocked: timestamp("lastRestocked"),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    inventoryTransactions = mysqlTable("inventory_transactions", {
      id: int("id").autoincrement().primaryKey(),
      productId: int("productId").notNull(),
      type: mysqlEnum("type", ["stock_in", "stock_out", "adjustment"]).notNull(),
      quantity: int("quantity").notNull(),
      note: text("note"),
      createdBy: int("createdBy"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    customers = mysqlTable("customers", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      phone: varchar("phone", { length: 20 }).notNull(),
      address: text("address"),
      zone: varchar("zone", { length: 100 }),
      priceTier: mysqlEnum("priceTier", ["retail", "wholesale", "vip"]).default("retail").notNull(),
      isRegistered: boolean("isRegistered").default(false).notNull(),
      orderCount: int("orderCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    orders = mysqlTable("orders", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    orderItems = mysqlTable("order_items", {
      id: int("id").autoincrement().primaryKey(),
      orderId: int("orderId").notNull(),
      productId: int("productId"),
      productName: varchar("productName", { length: 200 }).notNull(),
      quantity: int("quantity").notNull(),
      unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    invoices = mysqlTable("invoices", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    invoiceItems = mysqlTable("invoice_items", {
      id: int("id").autoincrement().primaryKey(),
      invoiceId: int("invoiceId").notNull(),
      productId: int("productId"),
      productName: varchar("productName", { length: 200 }).notNull(),
      quantity: int("quantity").notNull(),
      unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
      subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull()
    });
    deliveries = mysqlTable("deliveries", {
      id: int("id").autoincrement().primaryKey(),
      orderId: int("orderId").notNull(),
      staffId: int("staffId").notNull(),
      status: mysqlEnum("deliveryStatus", ["assigned", "in_transit", "delivered", "failed"]).default("assigned").notNull(),
      truckStockBefore: json("truckStockBefore"),
      truckStockAfter: json("truckStockAfter"),
      deliveredAt: timestamp("deliveredAt"),
      note: text("note"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    truckStock = mysqlTable("truck_stock", {
      id: int("id").autoincrement().primaryKey(),
      staffId: int("staffId").notNull(),
      productId: int("productId").notNull(),
      quantity: int("quantity").default(0).notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    salesRecords = mysqlTable("sales_records", {
      id: int("id").autoincrement().primaryKey(),
      orderId: int("orderId"),
      invoiceId: int("invoiceId"),
      staffId: int("staffId"),
      customerId: int("customerId"),
      totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
      productType: mysqlEnum("productType", ["20L", "1L", "0.5L", "0.35L", "other"]),
      quantity: int("quantity").default(0),
      saleDate: timestamp("saleDate").defaultNow().notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    customerNotifications = mysqlTable("customer_notifications", {
      id: int("id").autoincrement().primaryKey(),
      orderId: int("orderId"),
      customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
      customerName: varchar("customerName", { length: 200 }),
      type: mysqlEnum("notificationType", ["order_placed", "status_change", "delivery_assigned", "delivery_complete"]).notNull(),
      title: varchar("title", { length: 500 }).notNull(),
      message: text("message").notNull(),
      isRead: boolean("isRead").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    systemSettings = mysqlTable("system_settings", {
      id: int("id").autoincrement().primaryKey(),
      settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
      settingValue: text("settingValue").notNull(),
      description: text("description"),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    loyaltyPoints = mysqlTable("loyalty_points", {
      id: int("id").autoincrement().primaryKey(),
      customerPhone: varchar("customerPhone", { length: 20 }).notNull().unique(),
      customerName: varchar("customerName", { length: 200 }),
      totalPoints: int("totalPoints").default(0).notNull(),
      redeemedPoints: int("redeemedPoints").default(0).notNull(),
      availablePoints: int("availablePoints").default(0).notNull(),
      tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    pointsTransactions = mysqlTable("points_transactions", {
      id: int("id").autoincrement().primaryKey(),
      customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
      type: mysqlEnum("transactionType", ["earn", "redeem", "bonus", "expire"]).notNull(),
      points: int("points").notNull(),
      orderId: int("orderId"),
      orderNumber: varchar("orderNumber", { length: 50 }),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    auditLogs = mysqlTable("audit_logs", {
      id: int("id").autoincrement().primaryKey(),
      staffId: int("staffId").notNull(),
      staffName: varchar("staffName", { length: 200 }).notNull(),
      action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
      entityType: varchar("entityType", { length: 50 }).notNull(),
      entityId: int("entityId").notNull(),
      entityLabel: varchar("entityLabel", { length: 200 }),
      oldData: json("oldData"),
      newData: json("newData"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    expenses = mysqlTable("expenses", {
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    waterQualityInspections = mysqlTable("water_quality_inspections", {
      id: int("id").autoincrement().primaryKey(),
      inspectionDate: date("inspectionDate").notNull(),
      pH: decimal("pH", { precision: 4, scale: 2 }).notNull(),
      turbidity: decimal("turbidity", { precision: 5, scale: 2 }).notNull(),
      chlorineLevel: decimal("chlorineLevel", { precision: 5, scale: 2 }).notNull(),
      notes: text("notes"),
      inspectedBy: varchar("inspectedBy", { length: 200 }).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendInvoiceEmail: () => sendInvoiceEmail
});
import nodemailer from "nodemailer";
async function sendInvoiceEmail(customerEmail, customerName, invoiceNumber, pdfBuffer, staffName) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@amaw-pyay.com",
      to: customerEmail,
      subject: `\u1015\u103C\u1031\u1005\u102C / Invoice #${invoiceNumber} - \u1021\u1019\u1031\u102C\u1015\u103C\u1031`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891b2;">\u1021\u1019\u1031\u102C\u1015\u103C\u1031 - Pure Water Delivery</h2>
          <p>\u1019\u103C\u1014\u103A\u1019\u102C</p>
          <p>\u1021\u101C\u1031\u1038\u1005\u102D\u102F\u1000\u103A\u101E\u100A\u1037\u103A ${customerName} \u1021\u102C\u1038,</p>
          <p>\u1000\u103B\u103D\u1014\u103A\u102F\u1015\u103A\u1010\u102D\u102F\u1037\u104F \u1015\u103C\u1031\u1005\u102C #${invoiceNumber} \u1000\u102D\u102F \u1021\u1015\u103A\u1006\u1031\u102C\u1004\u103A\u1015\u1031\u1038\u1015\u102B\u101E\u100A\u103A\u104B</p>
          <p>\u101D\u1014\u103A\u1011\u1019\u103A\u1038: ${staffName}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p>English</p>
          <p>Dear ${customerName},</p>
          <p>Please find attached our invoice #${invoiceNumber}.</p>
          <p>Staff: ${staffName}</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.docx`,
          content: pdfBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ]
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Invoice sent to ${customerEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send invoice to ${customerEmail}:`, error);
    return false;
  }
}
var transporter;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025"),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : void 0
    });
  }
});

// server/pdf.ts
var pdf_exports = {};
__export(pdf_exports, {
  generateInvoicePDF: () => generateInvoicePDF
});
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun } from "docx";
async function generateInvoicePDF(invoice) {
  const items = invoice.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("\u1015\u1005\u1039\u1005\u100A\u103A\u1038 | Item")] }),
        new TableCell({ children: [new Paragraph("\u1021\u101B\u1031\u1021\u1010\u103D\u1000\u103A | Qty")] }),
        new TableCell({ children: [new Paragraph("\u1005\u103B\u1031\u1038 | Price")] }),
        new TableCell({ children: [new Paragraph("\u1005\u102F\u1005\u102F\u1015\u1031\u102B\u1004\u103A\u1038 | Amount")] })
      ]
    }),
    ...items.map(
      (item) => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(item.productName || "")] }),
          new TableCell({ children: [new Paragraph(item.quantity?.toString() || "0")] }),
          new TableCell({ children: [new Paragraph(item.unitPrice?.toString() || "0")] }),
          new TableCell({ children: [new Paragraph(item.amount?.toString() || "0")] })
        ]
      })
    )
  ];
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: "\u1015\u103C\u1031\u1005\u102C | INVOICE", bold: true, size: 56 })],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph(""),
          new Paragraph(`Invoice #: ${invoice.invoiceNumber || "N/A"}`),
          new Paragraph(`Date: ${invoice.invoiceDate || (/* @__PURE__ */ new Date()).toLocaleDateString()}`),
          new Paragraph(`Customer: ${invoice.customerName || "N/A"}`),
          new Paragraph(""),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows
          }),
          new Paragraph(""),
          new Paragraph({
            children: [new TextRun({ text: `Total: ${totalAmount} MMK`, bold: true, size: 48 })]
          }),
          new Paragraph(""),
          new Paragraph(`Staff: ${invoice.staffName || "N/A"}`)
        ]
      }
    ]
  });
  return Packer.toBuffer(doc);
}
var init_pdf = __esm({
  "server/pdf.ts"() {
    "use strict";
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var STAFF_COOKIE_NAME = "staff_session_id";
var ADMIN_COOKIE_NAME = "admin_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
init_schema();
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getStaffByUsername(username) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(staffAccounts).where(eq(staffAccounts.username, username)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllStaff() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffAccounts).orderBy(desc(staffAccounts.createdAt));
}
async function createStaffAccount(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(staffAccounts).values(data);
  return result;
}
async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}
async function updateProduct(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(data).where(eq(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}
async function getInventoryWithProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    inventory,
    product: products
  }).from(inventory).innerJoin(products, eq(inventory.productId, products.id)).orderBy(products.name);
}
async function getInventoryByProductId(productId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(inventory).where(eq(inventory.productId, productId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function upsertInventory(productId, stock) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getInventoryByProductId(productId);
  if (existing) {
    return db.update(inventory).set({ currentStock: stock, lastRestocked: /* @__PURE__ */ new Date() }).where(eq(inventory.productId, productId));
  } else {
    return db.insert(inventory).values({ productId, currentStock: stock, lastRestocked: /* @__PURE__ */ new Date() });
  }
}
async function adjustInventory(productId, quantityChange) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(inventory).set({ currentStock: sql`currentStock + ${quantityChange}` }).where(eq(inventory.productId, productId));
}
async function createInventoryTransaction(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(inventoryTransactions).values(data);
}
async function getInventoryTransactions(productId) {
  const db = await getDb();
  if (!db) return [];
  if (productId) {
    return db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId)).orderBy(desc(inventoryTransactions.createdAt));
  }
  return db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt)).limit(100);
}
async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}
async function getCustomerByPhone(phone) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCustomer(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data);
}
async function getAllOrders(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}
async function getOrderByNumber(orderNumber) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getOrderById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createOrder(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data);
}
async function updateOrderStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}
async function createOrderItems(items) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(items);
}
async function getOrderItems(orderId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
async function getAllInvoices(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(limit);
}
async function getInvoiceById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createInvoice(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(invoices).values(data);
}
async function createInvoiceItems(items) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(invoiceItems).values(items);
}
async function getInvoiceItems(invoiceId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}
async function getNextInvoiceNumber() {
  const db = await getDb();
  if (!db) return "AMP-000001";
  const result = await db.select({ count: sql`COUNT(*)` }).from(invoices);
  const count = result[0]?.count || 0;
  const num = count + 1;
  return `AMP-${String(num).padStart(6, "0")}`;
}
async function getDeliveriesByStaff(staffId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    delivery: deliveries,
    order: orders
  }).from(deliveries).innerJoin(orders, eq(deliveries.orderId, orders.id)).where(eq(deliveries.staffId, staffId)).orderBy(desc(deliveries.createdAt));
}
async function createDelivery(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(deliveries).values(data);
}
async function updateDeliveryStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (status === "delivered") {
    updateData.deliveredAt = /* @__PURE__ */ new Date();
  }
  return db.update(deliveries).set(updateData).where(eq(deliveries.id, id));
}
async function getTruckStockByStaff(staffId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    truckStock,
    product: products
  }).from(truckStock).innerJoin(products, eq(truckStock.productId, products.id)).where(eq(truckStock.staffId, staffId));
}
async function updateTruckStock(staffId, productId, quantity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(truckStock).where(and(eq(truckStock.staffId, staffId), eq(truckStock.productId, productId))).limit(1);
  if (existing.length > 0) {
    return db.update(truckStock).set({ quantity }).where(eq(truckStock.id, existing[0].id));
  } else {
    return db.insert(truckStock).values({ staffId, productId, quantity });
  }
}
async function createSalesRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(salesRecords).values(data);
}
async function getSalesRecords(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  if (startDate && endDate) {
    return db.select().from(salesRecords).where(and(gte(salesRecords.saleDate, startDate), lte(salesRecords.saleDate, endDate))).orderBy(desc(salesRecords.saleDate));
  }
  return db.select().from(salesRecords).orderBy(desc(salesRecords.saleDate)).limit(500);
}
async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, pendingOrders: 0, todaySales: 0, totalRevenue: 0, lowStockItems: 0 };
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const [orderCount] = await db.select({ count: sql`COUNT(*)` }).from(orders);
  const [pendingCount] = await db.select({ count: sql`COUNT(*)` }).from(orders).where(eq(orders.status, "pending"));
  const [todaySalesResult] = await db.select({ total: sql`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(and(gte(orders.createdAt, today), eq(orders.status, "delivered")));
  const [totalRevenueResult] = await db.select({ total: sql`COALESCE(SUM(totalAmount), 0)` }).from(orders).where(eq(orders.status, "delivered"));
  const [lowStockResult] = await db.select({ count: sql`COUNT(*)` }).from(inventory).where(sql`currentStock <= minStockLevel`);
  return {
    totalOrders: orderCount?.count || 0,
    pendingOrders: pendingCount?.count || 0,
    todaySales: parseFloat(todaySalesResult?.total || "0"),
    totalRevenue: parseFloat(totalRevenueResult?.total || "0"),
    lowStockItems: lowStockResult?.count || 0
  };
}
async function getRevenueByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  return db.select({
    date: sql`DATE(createdAt)`,
    revenue: sql`COALESCE(SUM(totalAmount), 0)`,
    orderCount: sql`COUNT(*)`
  }).from(orders).where(and(gte(orders.createdAt, startDate), eq(orders.status, "delivered"))).groupBy(sql`DATE(createdAt)`).orderBy(sql`DATE(createdAt)`);
}
async function getTopCustomers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    customerName: orders.customerName,
    customerPhone: orders.customerPhone,
    totalOrders: sql`COUNT(*)`,
    totalSpent: sql`COALESCE(SUM(totalAmount), 0)`
  }).from(orders).where(eq(orders.status, "delivered")).groupBy(orders.customerName, orders.customerPhone).orderBy(sql`SUM(totalAmount) DESC`).limit(limit);
}
async function getBottleTypeBreakdown() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    productType: salesRecords.productType,
    totalQuantity: sql`COALESCE(SUM(quantity), 0)`,
    totalRevenue: sql`COALESCE(SUM(totalAmount), 0)`
  }).from(salesRecords).groupBy(salesRecords.productType);
}
async function getDeliveryPerformance() {
  const db = await getDb();
  if (!db) return { totalDeliveries: 0, delivered: 0, failed: 0, inTransit: 0, assigned: 0, successRate: 0 };
  const [total] = await db.select({ count: sql`COUNT(*)` }).from(deliveries);
  const [deliveredCount] = await db.select({ count: sql`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "delivered"));
  const [failedCount] = await db.select({ count: sql`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "failed"));
  const [inTransitCount] = await db.select({ count: sql`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "in_transit"));
  const [assignedCount] = await db.select({ count: sql`COUNT(*)` }).from(deliveries).where(eq(deliveries.status, "assigned"));
  const totalDel = total?.count || 0;
  const delivered = deliveredCount?.count || 0;
  const successRate = totalDel > 0 ? Math.round(delivered / totalDel * 100) : 0;
  return {
    totalDeliveries: totalDel,
    delivered,
    failed: failedCount?.count || 0,
    inTransit: inTransitCount?.count || 0,
    assigned: assignedCount?.count || 0,
    successRate
  };
}
async function createCustomerNotification(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(customerNotifications).values(data);
}
async function getNotificationsByPhone(phone) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerNotifications).where(eq(customerNotifications.customerPhone, phone)).orderBy(desc(customerNotifications.createdAt)).limit(50);
}
async function getNotificationsByOrderId(orderId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerNotifications).where(eq(customerNotifications.orderId, orderId)).orderBy(desc(customerNotifications.createdAt));
}
async function markNotificationRead(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(customerNotifications).set({ isRead: true }).where(eq(customerNotifications.id, id));
}
async function getAllZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deliveryZones).orderBy(deliveryZones.name);
}
async function getZoneById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);
  return result[0];
}
async function createZone(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(deliveryZones).values(data);
}
async function updateZone(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(deliveryZones).set(data).where(eq(deliveryZones.id, id));
}
async function deleteZone(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
}
async function assignStaffToZone(staffId, zoneId) {
  const db = await getDb();
  if (!db) return;
  await db.update(staffAccounts).set({ zoneId }).where(eq(staffAccounts.id, staffId));
}
async function getSystemSetting(key) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key)).limit(1);
  return result.length > 0 ? result[0].settingValue : null;
}
async function setSystemSetting(key, value, description) {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemSettings).values({ settingKey: key, settingValue: value, description: description || null }).onDuplicateKeyUpdate({ set: { settingValue: value } });
}
async function getAllSystemSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(systemSettings);
}
async function getLoyaltyByPhone(phone) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.customerPhone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getAllLoyaltyAccounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyPoints).orderBy(desc(loyaltyPoints.availablePoints));
}
async function earnPoints(customerPhone, customerName, points, orderId, orderNumber) {
  const db = await getDb();
  if (!db) return;
  const existing = await getLoyaltyByPhone(customerPhone);
  if (existing) {
    await db.update(loyaltyPoints).set({
      totalPoints: existing.totalPoints + points,
      availablePoints: existing.availablePoints + points,
      customerName: customerName || existing.customerName,
      tier: calculateTier(existing.totalPoints + points)
    }).where(eq(loyaltyPoints.customerPhone, customerPhone));
  } else {
    await db.insert(loyaltyPoints).values({
      customerPhone,
      customerName,
      totalPoints: points,
      availablePoints: points,
      tier: calculateTier(points)
    });
  }
  await db.insert(pointsTransactions).values({
    customerPhone,
    type: "earn",
    points,
    orderId,
    orderNumber,
    description: `Earned ${points} points for order ${orderNumber}`
  });
}
async function redeemPoints(customerPhone, points, orderId, orderNumber) {
  const db = await getDb();
  if (!db) return false;
  const account = await getLoyaltyByPhone(customerPhone);
  if (!account || account.availablePoints < points) return false;
  await db.update(loyaltyPoints).set({
    redeemedPoints: account.redeemedPoints + points,
    availablePoints: account.availablePoints - points
  }).where(eq(loyaltyPoints.customerPhone, customerPhone));
  await db.insert(pointsTransactions).values({
    customerPhone,
    type: "redeem",
    points: -points,
    orderId,
    orderNumber,
    description: `Redeemed ${points} points for discount`
  });
  return true;
}
async function getPointsHistory(customerPhone) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pointsTransactions).where(eq(pointsTransactions.customerPhone, customerPhone)).orderBy(desc(pointsTransactions.createdAt)).limit(50);
}
function calculateTier(totalPoints) {
  if (totalPoints >= 500) return "platinum";
  if (totalPoints >= 200) return "gold";
  if (totalPoints >= 50) return "silver";
  return "bronze";
}
async function updateStaffPassword(staffId, newPasswordHash) {
  const db = await getDb();
  if (!db) return false;
  await db.update(staffAccounts).set({ passwordHash: newPasswordHash }).where(eq(staffAccounts.id, staffId));
  return true;
}
async function getStaffById(staffId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(staffAccounts).where(eq(staffAccounts.id, staffId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateStaffAccount(staffId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staffAccounts).set(data).where(eq(staffAccounts.id, staffId));
}
async function deleteStaffAccount(staffId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(staffAccounts).where(eq(staffAccounts.id, staffId));
}
async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}
async function deleteOrder(orderId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
  await db.delete(deliveries).where(eq(deliveries.orderId, orderId));
  await db.delete(orders).where(eq(orders.id, orderId));
  return true;
}
async function deleteAllOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orderItems);
  await db.delete(deliveries);
  await db.delete(orders);
  return true;
}
async function createAuditLog(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(auditLogs).values(data);
}
async function getAllAuditLogs(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
async function getInvoicesByStaff(staffId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.createdBy, staffId)).orderBy(desc(invoices.createdAt));
}
async function updateInvoice(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(invoices).set(data).where(eq(invoices.id, id));
}
async function deleteInvoiceItems(invoiceId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}
async function deleteInvoice(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
  return db.delete(invoices).where(eq(invoices.id, id));
}
async function getSalesRecordsByStaff(staffId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salesRecords).where(eq(salesRecords.staffId, staffId)).orderBy(desc(salesRecords.saleDate)).limit(200);
}
async function createExpense(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(expenses).values(data);
}
async function getExpenseById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getExpensesByStaff(staffId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.staffId, staffId)).orderBy(desc(expenses.date));
}
async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}
async function updateExpense(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set(data).where(eq(expenses.id, id));
}
async function deleteExpense(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(expenses).where(eq(expenses.id, id));
}
async function approveExpense(id, approvedBy, approvedByName) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set({
    isApproved: true,
    approvedBy,
    approvedByName,
    approvalDate: /* @__PURE__ */ new Date()
  }).where(eq(expenses.id, id));
}
async function rejectExpense(id, rejectionReason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(expenses).set({
    isApproved: false,
    rejectionReason
  }).where(eq(expenses.id, id));
}
async function getPendingExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.isApproved, false)).orderBy(desc(expenses.date));
}
async function createWaterQualityInspection(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(waterQualityInspections).values(data);
  return result;
}
async function getWaterQualityInspections(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waterQualityInspections).orderBy(desc(waterQualityInspections.inspectionDate)).limit(limit);
}
async function getLatestWaterQualityInspection() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(waterQualityInspections).orderBy(desc(waterQualityInspections.inspectionDate)).limit(1);
  return result[0] || null;
}
async function updateWaterQualityInspection(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(waterQualityInspections).set(data).where(eq(waterQualityInspections.id, id));
}
async function deleteWaterQualityInspection(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(waterQualityInspections).where(eq(waterQualityInspections.id, id));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function parseState(state) {
  try {
    const decoded = atob(state);
    if (decoded.startsWith("{")) {
      const parsed = JSON.parse(decoded);
      return { origin: parsed.origin || "/", returnPath: parsed.returnPath || "/" };
    }
    return { origin: "/", returnPath: "/" };
  } catch {
    return { origin: "/", returnPath: "/" };
  }
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const { returnPath } = parseState(state);
      res.redirect(302, returnPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT as SignJWT2, jwtVerify as jwtVerify2 } from "jose";
import { parse as parseCookieHeader2 } from "cookie";
var getAdminSecret = () => new TextEncoder().encode(ENV.cookieSecret + "_admin");
async function signAdminToken(staffId, username) {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1e3);
  return new SignJWT2({ staffId, username, type: "admin" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(getAdminSecret());
}
async function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify2(token, getAdminSecret(), { algorithms: ["HS256"] });
    if (typeof payload.staffId !== "number" || typeof payload.username !== "string") return null;
    return { staffId: payload.staffId, username: payload.username };
  } catch {
    return null;
  }
}
function getAdminFromRequest(req) {
  const cookieHeader = req.headers?.cookie || "";
  const cookies = parseCookieHeader2(cookieHeader);
  return verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
}
var getStaffSecret = () => new TextEncoder().encode(ENV.cookieSecret + "_staff");
async function signStaffToken(staffId, username) {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1e3);
  return new SignJWT2({ staffId, username, type: "staff" }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(getStaffSecret());
}
async function verifyStaffToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify2(token, getStaffSecret(), { algorithms: ["HS256"] });
    if (typeof payload.staffId !== "number" || typeof payload.username !== "string") return null;
    return { staffId: payload.staffId, username: payload.username };
  } catch {
    return null;
  }
}
function getStaffFromRequest(req) {
  const cookieHeader = req.headers?.cookie || "";
  const cookies = parseCookieHeader2(cookieHeader);
  return verifyStaffToken(cookies[STAFF_COOKIE_NAME]);
}
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});
var staffProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const staffSession = await getStaffFromRequest(ctx.req);
  if (!staffSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Please login" });
  const staff = await getStaffByUsername(staffSession.username);
  if (!staff) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff not found" });
  return next({
    ctx: {
      ...ctx,
      staffId: staff.id,
      staffName: staff.fullName,
      username: staff.username
    }
  });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    staffLogin: publicProcedure.input(z2.object({ username: z2.string(), password: z2.string() })).mutation(async ({ input, ctx }) => {
      if (input.username === "admin") {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin \u1021\u1000\u1031\u102C\u1004\u1037\u103A\u1016\u103C\u1004\u1037\u103A \u101D\u1014\u103A\u1011\u1019\u103A\u1038 Login \u101D\u1004\u103A\u104D\u1019\u101B\u1015\u102B\u104B" });
      }
      const staff = await getStaffByUsername(input.username);
      if (!staff || !staff.isActive) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1019\u103E\u102F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B" });
      }
      const valid = await bcrypt.compare(input.password, staff.passwordHash);
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1019\u103E\u102F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104B" });
      }
      const token = await signStaffToken(staff.id, staff.username);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(STAFF_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "staff" };
    }),
    staffMe: publicProcedure.query(async ({ ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) return null;
      const staff = await getStaffByUsername(staffSession.username);
      if (!staff || !staff.isActive) return null;
      return { id: staff.id, username: staff.username, fullName: staff.fullName, phone: staff.phone, role: "staff" };
    }),
    staffLogout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(STAFF_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // Staff management (Admin CRUD)
  staff: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getAllStaff();
    }),
    create: publicProcedure.input(z2.object({
      username: z2.string().min(3),
      password: z2.string().min(4),
      fullName: z2.string().min(1),
      phone: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      if (input.username === "admin") {
        throw new TRPCError3({ code: "CONFLICT", message: "Cannot create staff with username 'admin'" });
      }
      const existing = await getStaffByUsername(input.username);
      if (existing) throw new TRPCError3({ code: "CONFLICT", message: "Username already exists" });
      const passwordHash = await bcrypt.hash(input.password, 10);
      await createStaffAccount({
        username: input.username,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone
      });
      return { success: true };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      username: z2.string().min(3).optional(),
      fullName: z2.string().min(1).optional(),
      phone: z2.string().optional(),
      password: z2.string().min(4).optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      const { id, password, ...data } = input;
      const updateData = { ...data };
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }
      await updateStaffAccount(id, updateData);
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      const staff = await getStaffById(input.id);
      if (staff && staff.username === "admin") {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot delete the Super Admin account" });
      }
      await deleteStaffAccount(input.id);
      return { success: true };
    })
  }),
  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return getAllProducts();
    }),
    listAdmin: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getAllProductsAdmin();
    }),
    updatePrice: publicProcedure.input(z2.object({ id: z2.number(), unitPrice: z2.string() })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await updateProduct(input.id, { unitPrice: input.unitPrice });
      return { success: true };
    }),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      nameMyanmar: z2.string().optional(),
      type: z2.enum(["20L", "1L", "0.5L", "0.35L", "other"]),
      unitPrice: z2.string(),
      shellPrice: z2.string().optional(),
      waterPrice: z2.string().optional(),
      description: z2.string().optional(),
      descriptionMyanmar: z2.string().optional()
    })).mutation(async ({ input }) => {
      await createProduct(input);
      return { success: true };
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      nameMyanmar: z2.string().optional(),
      type: z2.enum(["20L", "1L", "0.5L", "0.35L", "other"]).optional(),
      unitPrice: z2.string().optional(),
      shellPrice: z2.string().optional(),
      waterPrice: z2.string().optional(),
      description: z2.string().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data);
      return { success: true };
    }),
    bulkUpdatePrices: publicProcedure.input(z2.object({
      prices: z2.array(z2.object({ id: z2.number(), unitPrice: z2.string() }))
    })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      for (const item of input.prices) {
        await updateProduct(item.id, { unitPrice: item.unitPrice });
      }
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await deleteProduct(input.id);
      return { success: true };
    })
  }),
  // Inventory
  inventory: router({
    list: protectedProcedure.query(async () => {
      return getInventoryWithProducts();
    }),
    stockIn: protectedProcedure.input(z2.object({
      productId: z2.number(),
      quantity: z2.number().positive(),
      note: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      await adjustInventory(input.productId, input.quantity);
      await createInventoryTransaction({
        productId: input.productId,
        type: "stock_in",
        quantity: input.quantity,
        note: input.note,
        createdBy: ctx.user.id
      });
      return { success: true };
    }),
    stockOut: protectedProcedure.input(z2.object({
      productId: z2.number(),
      quantity: z2.number().positive(),
      note: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      await adjustInventory(input.productId, -input.quantity);
      await createInventoryTransaction({
        productId: input.productId,
        type: "stock_out",
        quantity: input.quantity,
        note: input.note,
        createdBy: ctx.user.id
      });
      return { success: true };
    }),
    transactions: protectedProcedure.input(z2.object({ productId: z2.number().optional() }).optional()).query(async ({ input }) => {
      return getInventoryTransactions(input?.productId);
    }),
    initProduct: adminProcedure2.input(z2.object({ productId: z2.number(), stock: z2.number(), minLevel: z2.number().optional() })).mutation(async ({ input }) => {
      await upsertInventory(input.productId, input.stock);
      return { success: true };
    })
  }),
  // Customers
  customers: router({
    list: protectedProcedure.query(async () => {
      return getAllCustomers();
    }),
    findByPhone: publicProcedure.input(z2.object({ phone: z2.string() })).query(async ({ input }) => {
      return getCustomerByPhone(input.phone);
    }),
    create: publicProcedure.input(z2.object({
      name: z2.string(),
      phone: z2.string(),
      address: z2.string().optional(),
      zone: z2.string().optional()
    })).mutation(async ({ input }) => {
      await createCustomer(input);
      return { success: true };
    })
  }),
  // Orders
  orders: router({
    list: publicProcedure.input(z2.object({ status: z2.enum(["pending", "processing", "delivered", "cancelled"]).optional() }).optional()).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!adminSession && !staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const allOrders = await getAllOrders(200);
      if (input?.status) {
        return allOrders.filter((o) => o.status === input.status);
      }
      return allOrders;
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!adminSession && !staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND" });
      const items = await getOrderItems(input.id);
      return { ...order, items };
    }),
    trackByNumber: publicProcedure.input(z2.object({ orderNumber: z2.string() })).query(async ({ input }) => {
      const order = await getOrderByNumber(input.orderNumber);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND", message: "Order not found" });
      return { id: order.id, orderNumber: order.orderNumber, status: order.status, customerName: order.customerName, customerPhone: order.customerPhone, totalAmount: order.totalAmount, createdAt: order.createdAt };
    }),
    create: publicProcedure.input(z2.object({
      customerName: z2.string(),
      customerPhone: z2.string(),
      customerAddress: z2.string().optional(),
      items: z2.array(z2.object({
        productId: z2.number().optional(),
        productName: z2.string(),
        quantity: z2.number().positive(),
        unitPrice: z2.string()
      })),
      note: z2.string().optional(),
      isPublicOrder: z2.boolean().optional(),
      deliveryFee: z2.string().optional(),
      discount: z2.string().optional(),
      redeemPoints: z2.number().optional()
    })).mutation(async ({ input }) => {
      const timestamp2 = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      const orderNumber = `ORD-${timestamp2}-${random}`;
      let subtotal = 0;
      const orderItemsData = input.items.map((item) => {
        const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
        subtotal += itemSubtotal;
        return {
          productName: item.productName,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: itemSubtotal.toFixed(2)
        };
      });
      const deliveryFee = parseFloat(input.deliveryFee || "0");
      let discount = parseFloat(input.discount || "0");
      let pointsRedeemed = 0;
      if (input.redeemPoints && input.redeemPoints > 0 && input.customerPhone) {
        const redemptionRate = await getSystemSetting("points_redemption_rate");
        const rate = parseFloat(redemptionRate || "100");
        const loyaltyEnabled = await getSystemSetting("loyalty_enabled");
        if (loyaltyEnabled === "true") {
          const account = await getLoyaltyByPhone(input.customerPhone);
          if (account && account.availablePoints >= input.redeemPoints) {
            pointsRedeemed = input.redeemPoints;
            discount += pointsRedeemed * rate;
          }
        }
      }
      const totalAmount = subtotal + deliveryFee - discount;
      let customer = await getCustomerByPhone(input.customerPhone);
      if (!customer) {
        await createCustomer({
          name: input.customerName,
          phone: input.customerPhone,
          address: input.customerAddress
        });
        customer = await getCustomerByPhone(input.customerPhone);
      }
      await createOrder({
        orderNumber,
        customerId: customer?.id,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        totalAmount: totalAmount.toFixed(2),
        deliveryFee: input.deliveryFee || "0",
        discount: discount.toFixed(2),
        note: input.note,
        isPublicOrder: input.isPublicOrder || false
      });
      const order = await getOrderByNumber(orderNumber);
      if (order) {
        const items = orderItemsData.map((item) => ({ ...item, orderId: order.id }));
        await createOrderItems(items);
      }
      if (pointsRedeemed > 0 && order) {
        await redeemPoints(input.customerPhone, pointsRedeemed, order.id, orderNumber);
      }
      notifyOwner({
        title: `New Order: ${orderNumber}`,
        content: `New order from ${input.customerName} (${input.customerPhone}).
Items: ${input.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}
Total: ${totalAmount.toFixed(0)} MMK${input.isPublicOrder ? " (Public Order)" : ""}`
      }).then((ok) => {
        if (!ok) console.warn("[Notification] Failed to notify owner about new order");
      }).catch((err) => console.warn("[Notification] Error:", err));
      createCustomerNotification({
        orderId: order?.id,
        customerPhone: input.customerPhone,
        customerName: input.customerName,
        type: "order_placed",
        title: `Order Confirmed: ${orderNumber}`,
        message: `Your order ${orderNumber} has been placed successfully. Total: ${totalAmount.toFixed(0)} MMK. We will process it shortly.`
      }).catch((err) => console.warn("[CustomerNotification] Error:", err));
      return { orderNumber, totalAmount };
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["pending", "processing", "delivered", "cancelled"])
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required to update orders" });
      }
      const order = await getOrderById(input.id);
      await updateOrderStatus(input.id, input.status);
      if (order) {
        const statusLabels = {
          pending: "Pending",
          processing: "Processing",
          delivered: "Delivered",
          cancelled: "Cancelled"
        };
        notifyOwner({
          title: `Order ${order.orderNumber} - Status Updated`,
          content: `Order for ${order.customerName} (${order.customerPhone}) has been updated to: ${statusLabels[input.status] || input.status}.
Total: ${order.totalAmount} MMK`
        }).then((ok) => {
          if (!ok) console.warn("[Notification] Failed to notify owner about status change");
        }).catch((err) => console.warn("[Notification] Error:", err));
        createCustomerNotification({
          orderId: order.id,
          customerPhone: order.customerPhone,
          customerName: order.customerName,
          type: "status_change",
          title: `Order ${order.orderNumber} - ${statusLabels[input.status]}`,
          message: `Order status updated to ${input.status}`
        }).catch((err) => console.warn("[CustomerNotification] Error:", err));
        if (input.status === "delivered") {
          const pointsSetting = await getSystemSetting("points_per_order");
          const loyaltyEnabled = await getSystemSetting("loyalty_enabled");
          if (loyaltyEnabled === "true" && pointsSetting) {
            const points = parseInt(pointsSetting) || 10;
            earnPoints(order.customerPhone, order.customerName, points, order.id, order.orderNumber).catch((err) => console.warn("[Loyalty] Error earning points:", err));
          }
        }
      }
      return { success: true };
    }),
    assignStaff: publicProcedure.input(z2.object({ orderId: z2.number(), staffId: z2.number() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      const dbConn = await getDb();
      if (!dbConn) throw new Error("DB not available");
      const { orders: ordersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq2 } = await import("drizzle-orm");
      await dbConn.update(ordersTable).set({ assignedStaffId: input.staffId }).where(eq2(ordersTable.id, input.orderId));
      await createDelivery({ orderId: input.orderId, staffId: input.staffId });
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "FORBIDDEN", message: "\u101D\u1014\u103A\u1011\u1019\u103A\u1038\u1019\u103B\u102C\u1038 Order \u1016\u103B\u1000\u103A\u1001\u103D\u1004\u1037\u103A\u1019\u101B\u103E\u102D\u1015\u102B\u104B Admin \u101E\u102C \u1016\u103B\u1000\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B" });
      await deleteOrder(input.id);
      return { success: true };
    }),
    deleteAll: publicProcedure.mutation(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
      await deleteAllOrders();
      return { success: true };
    })
  }),
  // Invoices (Admin + Staff with audit logging)
  invoices: router({
    sendEmail: staffProcedure.input(z2.object({ invoiceId: z2.number(), customerEmail: z2.string().email() })).mutation(async ({ ctx, input }) => {
      const { sendInvoiceEmail: sendInvoiceEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
      const invoice = await getInvoiceById(input.invoiceId);
      if (!invoice) throw new TRPCError3({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.createdBy !== ctx.staffId) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot send other staff's invoice" });
      const { generateInvoicePDF: generateInvoicePDF2 } = await Promise.resolve().then(() => (init_pdf(), pdf_exports));
      const items = await getInvoiceItems(input.invoiceId);
      const pdfBuffer = await generateInvoicePDF2({ ...invoice, items });
      const staffAccount = await getStaffByUsername(ctx.username);
      const success = await sendInvoiceEmail2(
        input.customerEmail,
        invoice.customerName,
        invoice.invoiceNumber,
        pdfBuffer,
        staffAccount?.fullName || ctx.username
      );
      if (success) {
        await notifyOwner({
          title: "\u{1F4E7} Invoice Email Sent",
          content: `Staff "${staffAccount?.fullName || ctx.username}" sent invoice ${invoice.invoiceNumber} to ${input.customerEmail}`
        });
      }
      return { success };
    }),
    exportPDF: staffProcedure.input(z2.object({ invoiceId: z2.number() })).mutation(async ({ ctx, input }) => {
      const invoice = await getInvoiceById(input.invoiceId);
      if (!invoice) throw new TRPCError3({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.createdBy !== ctx.staffId) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot export other staff's invoice" });
      const { generateInvoicePDF: generateInvoicePDF2 } = await Promise.resolve().then(() => (init_pdf(), pdf_exports));
      const items = await getInvoiceItems(input.invoiceId);
      const pdfBuffer = await generateInvoicePDF2({ ...invoice, items });
      return { success: true, pdfBuffer: pdfBuffer.toString("base64"), fileName: `invoice-${invoice.invoiceNumber}.docx` };
    }),
    list: staffProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (adminSession) {
        return getAllInvoices();
      }
      const staffSession = await getStaffFromRequest(ctx.req);
      if (staffSession) {
        return getInvoicesByStaff(staffSession.staffId);
      }
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!adminSession && !staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const invoice = await getInvoiceById(input.id);
      if (!invoice) throw new TRPCError3({ code: "NOT_FOUND" });
      if (staffSession && !adminSession && invoice.createdBy !== staffSession.staffId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "You can only view your own invoices" });
      }
      const items = await getInvoiceItems(input.id);
      return { ...invoice, items };
    }),
    create: publicProcedure.input(z2.object({
      customerName: z2.string(),
      customerPhone: z2.string().optional(),
      customerAddress: z2.string().optional(),
      orderId: z2.number().optional(),
      customerId: z2.number().optional(),
      items: z2.array(z2.object({
        productId: z2.number().optional(),
        productName: z2.string(),
        quantity: z2.number().positive(),
        unitPrice: z2.string()
      })),
      deliveryFee: z2.string().optional(),
      discount: z2.string().optional(),
      taxRate: z2.string().optional(),
      note: z2.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const createdBy = staffSession.staffId;
      const invoiceNumber = await getNextInvoiceNumber();
      let subtotal = 0;
      const invoiceItemsData = input.items.map((item) => {
        const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
        subtotal += itemSubtotal;
        return {
          productName: item.productName,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: itemSubtotal.toFixed(2)
        };
      });
      const deliveryFee = parseFloat(input.deliveryFee || "0");
      const discount = parseFloat(input.discount || "0");
      const taxRate = parseFloat(input.taxRate || "0");
      const taxAmount = (subtotal - discount) * (taxRate / 100);
      const totalAmount = subtotal + deliveryFee - discount + taxAmount;
      await createInvoice({
        invoiceNumber,
        orderId: input.orderId,
        customerId: input.customerId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        discount: discount.toFixed(2),
        taxRate: taxRate.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        createdBy,
        note: input.note
      });
      const dbConn = await getDb();
      if (dbConn) {
        const { invoices: invoicesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq2 } = await import("drizzle-orm");
        const [inv] = await dbConn.select().from(invoicesTable).where(eq2(invoicesTable.invoiceNumber, invoiceNumber)).limit(1);
        if (inv) {
          const items = invoiceItemsData.map((item) => ({ ...item, invoiceId: inv.id }));
          await createInvoiceItems(items);
          for (const item of input.items) {
            await createSalesRecord({
              invoiceId: inv.id,
              customerId: input.customerId,
              staffId: createdBy,
              totalAmount: (item.quantity * parseFloat(item.unitPrice)).toFixed(2),
              quantity: item.quantity
            });
          }
          if (staffSession) {
            const staffAccount = await getStaffByUsername(staffSession.username);
            await createAuditLog({
              staffId: staffSession.staffId,
              staffName: staffAccount?.fullName || staffSession.username,
              action: "create",
              entityType: "invoice",
              entityId: inv.id,
              entityLabel: invoiceNumber,
              newData: { customerName: input.customerName, totalAmount: totalAmount.toFixed(2), items: input.items }
            });
            notifyOwner({
              title: `\u{1F4CB} Invoice Created by Staff`,
              content: `Staff "${staffAccount?.fullName || staffSession.username}" created invoice ${invoiceNumber} for ${input.customerName}. Total: ${totalAmount.toFixed(0)} MMK`
            }).catch((err) => console.warn("[AuditNotification] Error:", err));
          }
        }
      }
      return { invoiceNumber, totalAmount };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      customerName: z2.string().optional(),
      customerPhone: z2.string().optional(),
      customerAddress: z2.string().optional(),
      items: z2.array(z2.object({
        productId: z2.number().optional(),
        productName: z2.string(),
        quantity: z2.number().positive(),
        unitPrice: z2.string()
      })).optional(),
      deliveryFee: z2.string().optional(),
      discount: z2.string().optional(),
      taxRate: z2.string().optional(),
      note: z2.string().optional(),
      status: z2.enum(["draft", "issued", "paid", "overdue"]).optional()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!adminSession && !staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const existingInvoice = await getInvoiceById(input.id);
      if (!existingInvoice) throw new TRPCError3({ code: "NOT_FOUND", message: "Invoice not found" });
      if (staffSession && !adminSession && existingInvoice.createdBy !== staffSession.staffId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "You can only edit your own invoices" });
      }
      const updateData = {};
      if (input.customerName) updateData.customerName = input.customerName;
      if (input.customerPhone !== void 0) updateData.customerPhone = input.customerPhone;
      if (input.customerAddress !== void 0) updateData.customerAddress = input.customerAddress;
      if (input.note !== void 0) updateData.note = input.note;
      if (input.status) updateData.status = input.status;
      if (input.items) {
        let subtotal = 0;
        const invoiceItemsData = input.items.map((item) => {
          const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
          subtotal += itemSubtotal;
          return {
            productName: item.productName,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: itemSubtotal.toFixed(2)
          };
        });
        const deliveryFee = parseFloat(input.deliveryFee || existingInvoice.deliveryFee?.toString() || "0");
        const discount = parseFloat(input.discount || existingInvoice.discount?.toString() || "0");
        const taxRate = parseFloat(input.taxRate || existingInvoice.taxRate?.toString() || "0");
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        const totalAmount = subtotal + deliveryFee - discount + taxAmount;
        updateData.subtotal = subtotal.toFixed(2);
        updateData.deliveryFee = deliveryFee.toFixed(2);
        updateData.discount = discount.toFixed(2);
        updateData.taxRate = taxRate.toFixed(2);
        updateData.taxAmount = taxAmount.toFixed(2);
        updateData.totalAmount = totalAmount.toFixed(2);
        await deleteInvoiceItems(input.id);
        const items = invoiceItemsData.map((item) => ({ ...item, invoiceId: input.id }));
        await createInvoiceItems(items);
      }
      await updateInvoice(input.id, updateData);
      if (staffSession && !adminSession) {
        const staffAccount = await getStaffByUsername(staffSession.username);
        const oldItems = await getInvoiceItems(input.id);
        await createAuditLog({
          staffId: staffSession.staffId,
          staffName: staffAccount?.fullName || staffSession.username,
          action: "update",
          entityType: "invoice",
          entityId: input.id,
          entityLabel: existingInvoice.invoiceNumber,
          oldData: { customerName: existingInvoice.customerName, totalAmount: existingInvoice.totalAmount?.toString() },
          newData: { customerName: input.customerName || existingInvoice.customerName, totalAmount: updateData.totalAmount || existingInvoice.totalAmount?.toString(), changes: Object.keys(updateData) }
        });
        notifyOwner({
          title: `\u270F\uFE0F Invoice Updated by Staff`,
          content: `Staff "${staffAccount?.fullName || staffSession.username}" updated invoice ${existingInvoice.invoiceNumber}. Changes: ${Object.keys(updateData).join(", ")}`
        }).catch((err) => console.warn("[AuditNotification] Error:", err));
      }
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!adminSession && !staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      const existingInvoice = await getInvoiceById(input.id);
      if (!existingInvoice) throw new TRPCError3({ code: "NOT_FOUND", message: "Invoice not found" });
      if (staffSession && !adminSession && existingInvoice.createdBy !== staffSession.staffId) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "You can only delete your own invoices" });
      }
      await deleteInvoice(input.id);
      if (staffSession && !adminSession) {
        const staffAccount = await getStaffByUsername(staffSession.username);
        await createAuditLog({
          staffId: staffSession.staffId,
          staffName: staffAccount?.fullName || staffSession.username,
          action: "delete",
          entityType: "invoice",
          entityId: input.id,
          entityLabel: existingInvoice.invoiceNumber,
          oldData: { customerName: existingInvoice.customerName, totalAmount: existingInvoice.totalAmount?.toString(), invoiceNumber: existingInvoice.invoiceNumber }
        });
        notifyOwner({
          title: `\u{1F5D1}\uFE0F Invoice Deleted by Staff`,
          content: `Staff "${staffAccount?.fullName || staffSession.username}" deleted invoice ${existingInvoice.invoiceNumber} (Customer: ${existingInvoice.customerName}, Total: ${existingInvoice.totalAmount} MMK)`
        }).catch((err) => console.warn("[AuditNotification] Error:", err));
      }
      return { success: true };
    })
  }),
  // Deliveries (Staff) - server-side staff cookie auth
  deliveries: router({
    myDeliveries: publicProcedure.input(z2.object({ staffId: z2.number() })).query(async ({ input, ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession || staffSession.staffId !== input.staffId) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      }
      return getDeliveriesByStaff(input.staffId);
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["assigned", "in_transit", "delivered", "failed"])
    })).mutation(async ({ input, ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      }
      await updateDeliveryStatus(input.id, input.status);
      return { success: true };
    }),
    assign: publicProcedure.input(z2.object({
      orderId: z2.number(),
      staffId: z2.number()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await createDelivery({ orderId: input.orderId, staffId: input.staffId });
      await updateOrderStatus(input.orderId, "processing");
      return { success: true };
    })
  }),
  // Truck Stock - server-side staff cookie auth
  truckStockRouter: router({
    getByStaff: publicProcedure.input(z2.object({ staffId: z2.number() })).query(async ({ input, ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession || staffSession.staffId !== input.staffId) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      }
      return getTruckStockByStaff(input.staffId);
    }),
    update: publicProcedure.input(z2.object({
      staffId: z2.number(),
      productId: z2.number(),
      quantity: z2.number()
    })).mutation(async ({ input, ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession || staffSession.staffId !== input.staffId) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      }
      await updateTruckStock(input.staffId, input.productId, input.quantity);
      return { success: true };
    })
  }),
  // Dashboard & Analytics (Admin only)
  dashboard: router({
    stats: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getDashboardStats();
    }),
    revenueChart: publicProcedure.input(z2.object({ days: z2.number().optional() }).optional()).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getRevenueByDay(input?.days || 30);
    }),
    topCustomers: publicProcedure.input(z2.object({ limit: z2.number().optional() }).optional()).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getTopCustomers(input?.limit || 10);
    }),
    bottleBreakdown: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getBottleTypeBreakdown();
    }),
    deliveryPerformance: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getDeliveryPerformance();
    })
  }),
  // Sales Reports
  reports: router({
    sales: publicProcedure.input(z2.object({
      startDate: z2.string().optional(),
      endDate: z2.string().optional()
    }).optional()).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      const start = input?.startDate ? new Date(input.startDate) : void 0;
      const end = input?.endDate ? new Date(input.endDate) : void 0;
      return getSalesRecords(start, end);
    }),
    // Staff can see their own sales
    mySales: publicProcedure.query(async ({ ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      return getSalesRecordsByStaff(staffSession.staffId);
    })
  }),
  // Customer Notifications
  notifications: router({
    getByPhone: publicProcedure.input(z2.object({ phone: z2.string() })).query(async ({ input }) => {
      return getNotificationsByPhone(input.phone);
    }),
    getByOrder: publicProcedure.input(z2.object({ orderId: z2.number() })).query(async ({ input }) => {
      return getNotificationsByOrderId(input.orderId);
    }),
    markRead: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await markNotificationRead(input.id);
      return { success: true };
    })
  }),
  // Delivery Zones
  zones: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getAllZones();
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getZoneById(input.id);
    }),
    create: publicProcedure.input(z2.object({
      name: z2.string(),
      nameMyanmar: z2.string().optional(),
      color: z2.string().optional(),
      centerLat: z2.string().optional(),
      centerLng: z2.string().optional(),
      assignedStaffId: z2.number().optional()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await createZone(input);
      return { success: true };
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      nameMyanmar: z2.string().optional(),
      color: z2.string().optional(),
      centerLat: z2.string().optional(),
      centerLng: z2.string().optional(),
      assignedStaffId: z2.number().nullable().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      const { id, ...data } = input;
      await updateZone(id, data);
      return { success: true };
    }),
    delete: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await deleteZone(input.id);
      return { success: true };
    }),
    assignStaff: publicProcedure.input(z2.object({ staffId: z2.number(), zoneId: z2.number().nullable() })).mutation(async ({ input, ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      await assignStaffToZone(input.staffId, input.zoneId);
      return { success: true };
    })
  }),
  // Admin login (STRICT: ONLY admin/admin123 allowed)
  adminAuth: router({
    login: publicProcedure.input(z2.object({ username: z2.string(), password: z2.string() })).mutation(async ({ input, ctx }) => {
      if (input.username !== "admin") {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin Login \u101E\u100A\u103A Super Admin \u1021\u1010\u103D\u1000\u103A\u101E\u102C \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B \u101D\u1014\u103A\u1011\u1019\u103A\u1038\u1019\u103B\u102C\u1038 Staff Login \u1000\u102D\u102F \u1021\u101E\u102F\u1036\u1038\u1015\u103C\u102F\u1015\u102B\u104B" });
      }
      const staff = await getStaffByUsername(input.username);
      if (!staff || !staff.isActive) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1019\u103E\u102F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1005\u1005\u103A\u1006\u1031\u1038\u1015\u102B\u104B" });
      }
      const valid = await bcrypt.compare(input.password, staff.passwordHash);
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u1021\u1000\u1031\u102C\u1004\u1037\u103A\u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1019\u103E\u102F \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B\u104A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1005\u1005\u103A\u1006\u1031\u1038\u1015\u102B\u104B" });
      }
      const token = await signAdminToken(staff.id, staff.username);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "admin" };
    }),
    me: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) return null;
      const staff = await getStaffByUsername(adminSession.username);
      if (!staff || !staff.isActive) return null;
      return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "admin" };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // Audit Logs (Admin only)
  auditLogs: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      return getAllAuditLogs();
    })
  }),
  // System settings (admin-configurable)
  settings: router({
    get: publicProcedure.input(z2.object({ key: z2.string() })).query(async ({ input }) => {
      const value = await getSystemSetting(input.key);
      return { key: input.key, value };
    }),
    getAll: publicProcedure.query(async () => {
      return getAllSystemSettings();
    }),
    update: publicProcedure.input(z2.object({ key: z2.string(), value: z2.string() })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      await setSystemSetting(input.key, input.value);
      return { success: true };
    })
  }),
  // Loyalty points system
  loyalty: router({
    getByPhone: publicProcedure.input(z2.object({ phone: z2.string() })).query(async ({ input }) => {
      return getLoyaltyByPhone(input.phone);
    }),
    getAll: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      return getAllLoyaltyAccounts();
    }),
    getHistory: publicProcedure.input(z2.object({ phone: z2.string() })).query(async ({ input }) => {
      return getPointsHistory(input.phone);
    }),
    redeem: publicProcedure.input(z2.object({ phone: z2.string(), points: z2.number().min(1) })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      const success = await redeemPoints(input.phone, input.points, null, null);
      if (!success) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Insufficient points" });
      }
      return { success: true };
    }),
    redeemForOrder: publicProcedure.input(z2.object({ phone: z2.string(), points: z2.number().min(1) })).query(async ({ input }) => {
      const redemptionRate = await getSystemSetting("points_redemption_rate");
      const rate = parseFloat(redemptionRate || "100");
      const account = await getLoyaltyByPhone(input.phone);
      if (!account) return { available: 0, maxPoints: 0, discountValue: 0, rate };
      const maxRedeemable = Math.min(input.points, account.availablePoints);
      return { available: account.availablePoints, maxPoints: maxRedeemable, discountValue: maxRedeemable * rate, rate };
    }),
    addBonus: publicProcedure.input(z2.object({ phone: z2.string(), points: z2.number().min(1), description: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      const account = await getLoyaltyByPhone(input.phone);
      if (!account) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Customer not found" });
      }
      await earnPoints(input.phone, account.customerName || "", input.points, 0, "BONUS");
      return { success: true };
    })
  }),
  // Admin password change
  adminPassword: router({
    change: publicProcedure.input(z2.object({ currentPassword: z2.string(), newPassword: z2.string().min(6) })).mutation(async ({ ctx, input }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      const staff = await getStaffById(adminSession.staffId);
      if (!staff) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Admin account not found" });
      }
      const valid = await bcrypt.compare(input.currentPassword, staff.passwordHash);
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "\u101C\u1000\u103A\u101B\u103E\u102D Password \u1019\u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1015\u102B" });
      }
      const newHash = await bcrypt.hash(input.newPassword, 10);
      await updateStaffPassword(adminSession.staffId, newHash);
      return { success: true };
    })
  }),
  // ===== EXPENSES (Staff Tracking) =====
  expenses: router({
    // Staff: Create expense
    create: staffProcedure.input(z2.object({
      date: z2.string(),
      category: z2.enum(["fuel", "meals", "transport", "maintenance", "supplies", "other"]),
      amount: z2.string(),
      description: z2.string().optional(),
      receiptUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await createExpense({
        staffId: ctx.staffId,
        staffName: ctx.staffName,
        date: new Date(input.date),
        category: input.category,
        amount: input.amount,
        description: input.description,
        receiptUrl: input.receiptUrl,
        isApproved: false
      });
      return { success: true, expenseId: result.insertId || 0 };
    }),
    // Staff: Get own expenses
    getMyExpenses: staffProcedure.query(async ({ ctx }) => {
      return getExpensesByStaff(ctx.staffId);
    }),
    // Staff: Update own expense (only if not approved)
    update: staffProcedure.input(z2.object({
      id: z2.number(),
      date: z2.string().optional(),
      category: z2.enum(["fuel", "meals", "transport", "maintenance", "supplies", "other"]).optional(),
      amount: z2.string().optional(),
      description: z2.string().optional(),
      receiptUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const expense = await getExpenseById(input.id);
      if (!expense) throw new TRPCError3({ code: "NOT_FOUND", message: "Expense not found" });
      if (expense.staffId !== ctx.staffId) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot edit other staff's expense" });
      if (expense.isApproved) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot edit approved expense" });
      const updateData = {};
      if (input.date) updateData.date = new Date(input.date);
      if (input.category) updateData.category = input.category;
      if (input.amount) updateData.amount = input.amount;
      if (input.description !== void 0) updateData.description = input.description;
      if (input.receiptUrl !== void 0) updateData.receiptUrl = input.receiptUrl;
      await updateExpense(input.id, updateData);
      return { success: true };
    }),
    // Staff: Delete own expense (only if not approved)
    delete: staffProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const expense = await getExpenseById(input.id);
      if (!expense) throw new TRPCError3({ code: "NOT_FOUND", message: "Expense not found" });
      if (expense.staffId !== ctx.staffId) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot delete other staff's expense" });
      if (expense.isApproved) throw new TRPCError3({ code: "FORBIDDEN", message: "Cannot delete approved expense" });
      await deleteExpense(input.id);
      return { success: true };
    }),
    // Admin: Get all expenses (pending)
    getPending: adminProcedure2.query(async () => {
      return getPendingExpenses();
    }),
    // Admin: Get all expenses
    getAll: adminProcedure2.query(async () => {
      return getAllExpenses();
    }),
    // Admin: Approve expense
    approve: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const expense = await getExpenseById(input.id);
      if (!expense) throw new TRPCError3({ code: "NOT_FOUND", message: "Expense not found" });
      const admin = await getStaffById(ctx.staffId);
      const adminName = admin?.fullName || "Admin";
      await approveExpense(input.id, ctx.staffId, adminName);
      await notifyOwner({
        title: "Expense Approved",
        content: `Staff ${expense.staffName} expense of ${expense.amount} MMK (${expense.category}) approved.`
      });
      return { success: true };
    }),
    // Admin: Reject expense
    reject: adminProcedure2.input(z2.object({ id: z2.number(), reason: z2.string() })).mutation(async ({ ctx, input }) => {
      const expense = await getExpenseById(input.id);
      if (!expense) throw new TRPCError3({ code: "NOT_FOUND", message: "Expense not found" });
      await rejectExpense(input.id, input.reason);
      return { success: true };
    })
  }),
  // Water Quality Inspection (Admin only)
  waterQuality: router({
    create: adminProcedure2.input(z2.object({
      inspectionDate: z2.string(),
      pH: z2.number(),
      turbidity: z2.number(),
      chlorineLevel: z2.number(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const admin = await getAdminFromRequest(ctx.req);
      if (!admin) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const result = await createWaterQualityInspection({
        inspectionDate: new Date(input.inspectionDate),
        pH: input.pH.toString(),
        turbidity: input.turbidity.toString(),
        chlorineLevel: input.chlorineLevel.toString(),
        notes: input.notes,
        inspectedBy: admin.username
      });
      await notifyOwner({
        title: "\u{1F4A7} Water Quality Inspection",
        content: `New inspection recorded: pH ${input.pH}, Turbidity ${input.turbidity}, Chlorine ${input.chlorineLevel}`
      });
      return { success: true };
    }),
    list: publicProcedure.query(async () => {
      return getWaterQualityInspections(50);
    }),
    latest: publicProcedure.query(async () => {
      return getLatestWaterQualityInspection();
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      inspectionDate: z2.string().optional(),
      pH: z2.number().optional(),
      turbidity: z2.number().optional(),
      chlorineLevel: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const admin = await getAdminFromRequest(ctx.req);
      if (!admin) throw new TRPCError3({ code: "UNAUTHORIZED" });
      const updateData = {};
      if (input.inspectionDate) updateData.inspectionDate = new Date(input.inspectionDate);
      if (input.pH !== void 0) updateData.pH = input.pH.toString();
      if (input.turbidity !== void 0) updateData.turbidity = input.turbidity.toString();
      if (input.chlorineLevel !== void 0) updateData.chlorineLevel = input.chlorineLevel.toString();
      if (input.notes !== void 0) updateData.notes = input.notes;
      await updateWaterQualityInspection(input.id, updateData);
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const admin = await getAdminFromRequest(ctx.req);
      if (!admin) throw new TRPCError3({ code: "UNAUTHORIZED" });
      await deleteWaterQualityInspection(input.id);
      return { success: true };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
