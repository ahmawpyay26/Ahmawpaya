import { COOKIE_NAME, STAFF_COOKIE_NAME, ADMIN_COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { ENV } from "./_core/env";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

// Admin JWT helpers
const getAdminSecret = () => new TextEncoder().encode(ENV.cookieSecret + "_admin");

async function signAdminToken(staffId: number, username: string): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ staffId, username, type: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getAdminSecret());
}

async function verifyAdminToken(token: string | undefined | null): Promise<{ staffId: number; username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAdminSecret(), { algorithms: ["HS256"] });
    if (typeof payload.staffId !== "number" || typeof payload.username !== "string") return null;
    return { staffId: payload.staffId as number, username: payload.username as string };
  } catch {
    return null;
  }
}

function getAdminFromRequest(req: any): Promise<{ staffId: number; username: string } | null> {
  const cookieHeader = req.headers?.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  return verifyAdminToken(cookies[ADMIN_COOKIE_NAME]);
}

// Staff JWT helpers
const getStaffSecret = () => new TextEncoder().encode(ENV.cookieSecret + "_staff");

async function signStaffToken(staffId: number, username: string): Promise<string> {
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ staffId, username, type: "staff" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getStaffSecret());
}

async function verifyStaffToken(token: string | undefined | null): Promise<{ staffId: number; username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getStaffSecret(), { algorithms: ["HS256"] });
    if (typeof payload.staffId !== "number" || typeof payload.username !== "string") return null;
    return { staffId: payload.staffId as number, username: payload.username as string };
  } catch {
    return null;
  }
}

// Extract staff session from request cookies
function getStaffFromRequest(req: any): Promise<{ staffId: number; username: string } | null> {
  const cookieHeader = req.headers?.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  return verifyStaffToken(cookies[STAFF_COOKIE_NAME]);
}

// Admin-only procedure (OAuth-based, kept for compatibility)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// Staff-only procedure (username/password-based)
const staffProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const staffSession = await getStaffFromRequest(ctx.req);
  if (!staffSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please login" });
  const staff = await db.getStaffByUsername(staffSession.username);
  if (!staff) throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff not found" });
  return next({
    ctx: {
      ...ctx,
      staffId: staff.id,
      staffName: staff.fullName,
      username: staff.username,
    },
  });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    staffLogin: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // RBAC: Block admin account from staff login
        if (input.username === "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin အကောင့်ဖြင့် ဝန်ထမ်း Login ဝင်၍မရပါ။" });
        }
        const staff = await db.getStaffByUsername(input.username);
        if (!staff || !staff.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "အကောင့်ဝင်ရောက်မှု မမှန်ကန်ပါ။" });
        }
        const valid = await bcrypt.compare(input.password, staff.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "အကောင့်ဝင်ရောက်မှု မမှန်ကန်ပါ။" });
        }
        // Issue staff session cookie
        const token = await signStaffToken(staff.id, staff.username);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(STAFF_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "staff" as const };
      }),
    staffMe: publicProcedure.query(async ({ ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) return null;
      const staff = await db.getStaffByUsername(staffSession.username);
      if (!staff || !staff.isActive) return null;
      return { id: staff.id, username: staff.username, fullName: staff.fullName, phone: staff.phone, role: "staff" as const };
    }),
    staffLogout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(STAFF_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Staff management (Admin CRUD)
  staff: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getAllStaff();
    }),
    create: publicProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(4),
        fullName: z.string().min(1),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        // Block creating account with username "admin"
        if (input.username === "admin") {
          throw new TRPCError({ code: "CONFLICT", message: "Cannot create staff with username 'admin'" });
        }
        const existing = await db.getStaffByUsername(input.username);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already exists" });
        const passwordHash = await bcrypt.hash(input.password, 10);
        await db.createStaffAccount({
          username: input.username,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone,
        });
        return { success: true };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        username: z.string().min(3).optional(),
        fullName: z.string().min(1).optional(),
        phone: z.string().optional(),
        password: z.string().min(4).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        const { id, password, ...data } = input;
        const updateData: any = { ...data };
        if (password) {
          updateData.passwordHash = await bcrypt.hash(password, 10);
        }
        await db.updateStaffAccount(id, updateData);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        const staff = await db.getStaffById(input.id);
        if (staff && staff.username === "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete the Super Admin account" });
        }
        await db.deleteStaffAccount(input.id);
        return { success: true };
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),
    listAdmin: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getAllProductsAdmin();
    }),
    updatePrice: publicProcedure
      .input(z.object({ id: z.number(), unitPrice: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.updateProduct(input.id, { unitPrice: input.unitPrice });
        return { success: true };
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        nameMyanmar: z.string().optional(),
        type: z.enum(["20L", "1L", "0.5L", "0.35L", "other"]),
        unitPrice: z.string(),
        shellPrice: z.string().optional(),
        waterPrice: z.string().optional(),
        description: z.string().optional(),
        descriptionMyanmar: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameMyanmar: z.string().optional(),
        type: z.enum(["20L", "1L", "0.5L", "0.35L", "other"]).optional(),
        unitPrice: z.string().optional(),
        shellPrice: z.string().optional(),
        waterPrice: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    bulkUpdatePrices: publicProcedure
      .input(z.object({
        prices: z.array(z.object({ id: z.number(), unitPrice: z.string() })),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        for (const item of input.prices) {
          await db.updateProduct(item.id, { unitPrice: item.unitPrice });
        }
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // Inventory
  inventory: router({
    list: protectedProcedure.query(async () => {
      return db.getInventoryWithProducts();
    }),
    stockIn: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().positive(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.adjustInventory(input.productId, input.quantity);
        await db.createInventoryTransaction({
          productId: input.productId,
          type: "stock_in",
          quantity: input.quantity,
          note: input.note,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    stockOut: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().positive(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.adjustInventory(input.productId, -input.quantity);
        await db.createInventoryTransaction({
          productId: input.productId,
          type: "stock_out",
          quantity: input.quantity,
          note: input.note,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    transactions: protectedProcedure
      .input(z.object({ productId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getInventoryTransactions(input?.productId);
      }),
    initProduct: adminProcedure
      .input(z.object({ productId: z.number(), stock: z.number(), minLevel: z.number().optional() }))
      .mutation(async ({ input }) => {
        await db.upsertInventory(input.productId, input.stock);
        return { success: true };
      }),
  }),

  // Customers
  customers: router({
    list: protectedProcedure.query(async () => {
      return db.getAllCustomers();
    }),
    findByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return db.getCustomerByPhone(input.phone);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        address: z.string().optional(),
        zone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomer(input);
        return { success: true };
      }),
  }),

  // Orders
  orders: router({
    list: publicProcedure
      .input(z.object({ status: z.enum(["pending", "processing", "delivered", "cancelled"]).optional() }).optional())
      .query(async ({ input, ctx }) => {
        // Allow both admin and staff to list orders (staff = read-only)
        const adminSession = await getAdminFromRequest(ctx.req);
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!adminSession && !staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        const allOrders = await db.getAllOrders(200);
        if (input?.status) {
          return allOrders.filter(o => o.status === input.status);
        }
        return allOrders;
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!adminSession && !staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        const order = await db.getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
    trackByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const order = await db.getOrderByNumber(input.orderNumber);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        return { id: order.id, orderNumber: order.orderNumber, status: order.status, customerName: order.customerName, customerPhone: order.customerPhone, totalAmount: order.totalAmount, createdAt: order.createdAt };
      }),
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        customerAddress: z.string().optional(),
        items: z.array(z.object({
          productId: z.number().optional(),
          productName: z.string(),
          quantity: z.number().positive(),
          unitPrice: z.string(),
        })),
        note: z.string().optional(),
        isPublicOrder: z.boolean().optional(),
        deliveryFee: z.string().optional(),
        discount: z.string().optional(),
        redeemPoints: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Generate order number
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        const orderNumber = `ORD-${timestamp}-${random}`;
        
        // Calculate total
        let subtotal = 0;
        const orderItemsData = input.items.map(item => {
          const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
          subtotal += itemSubtotal;
          return {
            productName: item.productName,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: itemSubtotal.toFixed(2),
          };
        });
        
        const deliveryFee = parseFloat(input.deliveryFee || "0");
        let discount = parseFloat(input.discount || "0");
        
        // Apply loyalty points redemption as discount
        let pointsRedeemed = 0;
        if (input.redeemPoints && input.redeemPoints > 0 && input.customerPhone) {
          const redemptionRate = await db.getSystemSetting("points_redemption_rate");
          const rate = parseFloat(redemptionRate || "100");
          const loyaltyEnabled = await db.getSystemSetting("loyalty_enabled");
          if (loyaltyEnabled === "true") {
            const account = await db.getLoyaltyByPhone(input.customerPhone);
            if (account && account.availablePoints >= input.redeemPoints) {
              pointsRedeemed = input.redeemPoints;
              discount += pointsRedeemed * rate;
            }
          }
        }
        
        const totalAmount = subtotal + deliveryFee - discount;
        
        // Check if customer exists, create if not
        let customer = await db.getCustomerByPhone(input.customerPhone);
        if (!customer) {
          await db.createCustomer({
            name: input.customerName,
            phone: input.customerPhone,
            address: input.customerAddress,
          });
          customer = await db.getCustomerByPhone(input.customerPhone);
        }
        
        // Create order
        await db.createOrder({
          orderNumber,
          customerId: customer?.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          totalAmount: totalAmount.toFixed(2),
          deliveryFee: input.deliveryFee || "0",
          discount: discount.toFixed(2),
          note: input.note,
          isPublicOrder: input.isPublicOrder || false,
        });
        
        // Get the created order
        const order = await db.getOrderByNumber(orderNumber);
        if (order) {
          const items = orderItemsData.map(item => ({ ...item, orderId: order.id }));
          await db.createOrderItems(items);
        }

        // Deduct loyalty points if redeemed
        if (pointsRedeemed > 0 && order) {
          await db.redeemPoints(input.customerPhone, pointsRedeemed, order.id, orderNumber);
        }
        
        // Notify owner about new order
        notifyOwner({
          title: `New Order: ${orderNumber}`,
          content: `New order from ${input.customerName} (${input.customerPhone}).\nItems: ${input.items.map(i => `${i.productName} x${i.quantity}`).join(", ")}\nTotal: ${totalAmount.toFixed(0)} MMK${input.isPublicOrder ? " (Public Order)" : ""}`,
        }).then(ok => { if (!ok) console.warn("[Notification] Failed to notify owner about new order"); }).catch(err => console.warn("[Notification] Error:", err));

        // Send customer notification
        db.createCustomerNotification({
          orderId: order?.id,
          customerPhone: input.customerPhone,
          customerName: input.customerName,
          type: "order_placed",
          title: `Order Confirmed: ${orderNumber}`,
          message: `Your order ${orderNumber} has been placed successfully. Total: ${totalAmount.toFixed(0)} MMK. We will process it shortly.`,
        }).catch(err => console.warn("[CustomerNotification] Error:", err));
        
        return { orderNumber, totalAmount };
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "processing", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can update order status
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required to update orders" });
        }
        const order = await db.getOrderById(input.id);
        await db.updateOrderStatus(input.id, input.status);
        
        if (order) {
          const statusLabels: Record<string, string> = {
            pending: "Pending",
            processing: "Processing",
            delivered: "Delivered",
            cancelled: "Cancelled",
          };
          notifyOwner({
            title: `Order ${order.orderNumber} - Status Updated`,
            content: `Order for ${order.customerName} (${order.customerPhone}) has been updated to: ${statusLabels[input.status] || input.status}.\nTotal: ${order.totalAmount} MMK`,
          }).then(ok => { if (!ok) console.warn("[Notification] Failed to notify owner about status change"); }).catch(err => console.warn("[Notification] Error:", err));

          db.createCustomerNotification({
            orderId: order.id,
            customerPhone: order.customerPhone,
            customerName: order.customerName,
            type: "status_change",
            title: `Order ${order.orderNumber} - ${statusLabels[input.status]}`,
            message: `Order status updated to ${input.status}`,
          }).catch(err => console.warn("[CustomerNotification] Error:", err));

          // Auto-earn loyalty points when order is delivered
          if (input.status === "delivered") {
            const pointsSetting = await db.getSystemSetting("points_per_order");
            const loyaltyEnabled = await db.getSystemSetting("loyalty_enabled");
            if (loyaltyEnabled === "true" && pointsSetting) {
              const points = parseInt(pointsSetting) || 10;
              db.earnPoints(order.customerPhone, order.customerName, points, order.id, order.orderNumber)
                .catch(err => console.warn("[Loyalty] Error earning points:", err));
            }
          }
        }
        return { success: true };
      }),
    assignStaff: publicProcedure
      .input(z.object({ orderId: z.number(), staffId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        const dbConn = await db.getDb();
        if (!dbConn) throw new Error("DB not available");
        const { orders: ordersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbConn.update(ordersTable).set({ assignedStaffId: input.staffId }).where(eq(ordersTable.id, input.orderId));
        await db.createDelivery({ orderId: input.orderId, staffId: input.staffId });
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // RBAC: Only admin can delete orders
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "FORBIDDEN", message: "ဝန်ထမ်းများ Order ဖျက်ခွင့်မရှိပါ။ Admin သာ ဖျက်နိုင်ပါသည်။" });
        await db.deleteOrder(input.id);
        return { success: true };
      }),
    deleteAll: publicProcedure
      .mutation(async ({ ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        await db.deleteAllOrders();
        return { success: true };
      }),
  }),

  // Invoices (Admin + Staff with audit logging)
  invoices: router({
    sendEmail: staffProcedure
      .input(z.object({ invoiceId: z.number(), customerEmail: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        const { sendInvoiceEmail } = await import("./email");
        const invoice = await db.getInvoiceById(input.invoiceId);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        if (invoice.createdBy !== ctx.staffId) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot send other staff's invoice" });
        
        const { generateInvoicePDF } = await import("./pdf");
        const items = await db.getInvoiceItems(input.invoiceId);
        const pdfBuffer = await generateInvoicePDF({ ...invoice, items });
        
        const staffAccount = await db.getStaffByUsername(ctx.username);
        const success = await sendInvoiceEmail(
          input.customerEmail,
          invoice.customerName,
          invoice.invoiceNumber,
          pdfBuffer,
          staffAccount?.fullName || ctx.username
        );
        
        if (success) {
          await notifyOwner({
            title: "📧 Invoice Email Sent",
            content: `Staff "${staffAccount?.fullName || ctx.username}" sent invoice ${invoice.invoiceNumber} to ${input.customerEmail}`,
          });
        }
        
        return { success };
      }),
    exportPDF: staffProcedure
      .input(z.object({ invoiceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const invoice = await db.getInvoiceById(input.invoiceId);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        if (invoice.createdBy !== ctx.staffId) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot export other staff's invoice" });
        
        const { generateInvoicePDF } = await import("./pdf");
        const items = await db.getInvoiceItems(input.invoiceId);
        const pdfBuffer = await generateInvoicePDF({ ...invoice, items });
        return { success: true, pdfBuffer: pdfBuffer.toString("base64"), fileName: `invoice-${invoice.invoiceNumber}.docx` };
      }),
    list: staffProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (adminSession) {
        return db.getAllInvoices();
      }
      // Staff can only see their own invoices
      const staffSession = await getStaffFromRequest(ctx.req);
      if (staffSession) {
        return db.getInvoicesByStaff(staffSession.staffId);
      }
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!adminSession && !staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        const invoice = await db.getInvoiceById(input.id);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
        // Staff can only view their own invoices
        if (staffSession && !adminSession && invoice.createdBy !== staffSession.staffId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only view your own invoices" });
        }
        const items = await db.getInvoiceItems(input.id);
        return { ...invoice, items };
      }),
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        orderId: z.number().optional(),
        customerId: z.number().optional(),
        items: z.array(z.object({
          productId: z.number().optional(),
          productName: z.string(),
          quantity: z.number().positive(),
          unitPrice: z.string(),
        })),
        deliveryFee: z.string().optional(),
        discount: z.string().optional(),
        taxRate: z.string().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        
        const createdBy = staffSession.staffId;
        const invoiceNumber = await db.getNextInvoiceNumber();
        
        let subtotal = 0;
        const invoiceItemsData = input.items.map(item => {
          const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
          subtotal += itemSubtotal;
          return {
            productName: item.productName,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: itemSubtotal.toFixed(2),
          };
        });
        
        const deliveryFee = parseFloat(input.deliveryFee || "0");
        const discount = parseFloat(input.discount || "0");
        const taxRate = parseFloat(input.taxRate || "0");
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        const totalAmount = subtotal + deliveryFee - discount + taxAmount;
        
        await db.createInvoice({
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
          note: input.note,
        });
        
        // Get the invoice to get its ID
        const dbConn = await db.getDb();
        if (dbConn) {
          const { invoices: invoicesTable } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const [inv] = await dbConn.select().from(invoicesTable).where(eq(invoicesTable.invoiceNumber, invoiceNumber)).limit(1);
          if (inv) {
            const items = invoiceItemsData.map(item => ({ ...item, invoiceId: inv.id }));
            await db.createInvoiceItems(items);
            
            // Create sales records
            for (const item of input.items) {
              await db.createSalesRecord({
                invoiceId: inv.id,
                customerId: input.customerId,
                staffId: createdBy,
                totalAmount: (item.quantity * parseFloat(item.unitPrice)).toFixed(2),
                quantity: item.quantity,
              });
            }

            // Audit log for staff invoice creation
            if (staffSession) {
              const staffAccount = await db.getStaffByUsername(staffSession.username);
              await db.createAuditLog({
                staffId: staffSession.staffId,
                staffName: staffAccount?.fullName || staffSession.username,
                action: "create",
                entityType: "invoice",
                entityId: inv.id,
                entityLabel: invoiceNumber,
                newData: { customerName: input.customerName, totalAmount: totalAmount.toFixed(2), items: input.items },
              });
              // Notify Super Admin
              notifyOwner({
                title: `📋 Invoice Created by Staff`,
                content: `Staff "${staffAccount?.fullName || staffSession.username}" created invoice ${invoiceNumber} for ${input.customerName}. Total: ${totalAmount.toFixed(0)} MMK`,
              }).catch(err => console.warn("[AuditNotification] Error:", err));
            }
          }
        }
        
        return { invoiceNumber, totalAmount };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        items: z.array(z.object({
          productId: z.number().optional(),
          productName: z.string(),
          quantity: z.number().positive(),
          unitPrice: z.string(),
        })).optional(),
        deliveryFee: z.string().optional(),
        discount: z.string().optional(),
        taxRate: z.string().optional(),
        note: z.string().optional(),
        status: z.enum(["draft", "issued", "paid", "overdue"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!adminSession && !staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        
        const existingInvoice = await db.getInvoiceById(input.id);
        if (!existingInvoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        
        // Staff can only edit their own invoices
        if (staffSession && !adminSession && existingInvoice.createdBy !== staffSession.staffId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own invoices" });
        }
        
        const updateData: any = {};
        if (input.customerName) updateData.customerName = input.customerName;
        if (input.customerPhone !== undefined) updateData.customerPhone = input.customerPhone;
        if (input.customerAddress !== undefined) updateData.customerAddress = input.customerAddress;
        if (input.note !== undefined) updateData.note = input.note;
        if (input.status) updateData.status = input.status;
        
        // Recalculate if items provided
        if (input.items) {
          let subtotal = 0;
          const invoiceItemsData = input.items.map(item => {
            const itemSubtotal = item.quantity * parseFloat(item.unitPrice);
            subtotal += itemSubtotal;
            return {
              productName: item.productName,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: itemSubtotal.toFixed(2),
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
          
          // Replace invoice items
          await db.deleteInvoiceItems(input.id);
          const items = invoiceItemsData.map(item => ({ ...item, invoiceId: input.id }));
          await db.createInvoiceItems(items);
        }
        
        await db.updateInvoice(input.id, updateData);
        
        // Audit log if staff updated
        if (staffSession && !adminSession) {
          const staffAccount = await db.getStaffByUsername(staffSession.username);
          const oldItems = await db.getInvoiceItems(input.id);
          await db.createAuditLog({
            staffId: staffSession.staffId,
            staffName: staffAccount?.fullName || staffSession.username,
            action: "update",
            entityType: "invoice",
            entityId: input.id,
            entityLabel: existingInvoice.invoiceNumber,
            oldData: { customerName: existingInvoice.customerName, totalAmount: existingInvoice.totalAmount?.toString() },
            newData: { customerName: input.customerName || existingInvoice.customerName, totalAmount: updateData.totalAmount || existingInvoice.totalAmount?.toString(), changes: Object.keys(updateData) },
          });
          notifyOwner({
            title: `✏️ Invoice Updated by Staff`,
            content: `Staff "${staffAccount?.fullName || staffSession.username}" updated invoice ${existingInvoice.invoiceNumber}. Changes: ${Object.keys(updateData).join(", ")}`,
          }).catch(err => console.warn("[AuditNotification] Error:", err));
        }
        
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!adminSession && !staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
        }
        
        const existingInvoice = await db.getInvoiceById(input.id);
        if (!existingInvoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        
        // Staff can only delete their own invoices
        if (staffSession && !adminSession && existingInvoice.createdBy !== staffSession.staffId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own invoices" });
        }
        
        await db.deleteInvoice(input.id);
        
        // Audit log if staff deleted
        if (staffSession && !adminSession) {
          const staffAccount = await db.getStaffByUsername(staffSession.username);
          await db.createAuditLog({
            staffId: staffSession.staffId,
            staffName: staffAccount?.fullName || staffSession.username,
            action: "delete",
            entityType: "invoice",
            entityId: input.id,
            entityLabel: existingInvoice.invoiceNumber,
            oldData: { customerName: existingInvoice.customerName, totalAmount: existingInvoice.totalAmount?.toString(), invoiceNumber: existingInvoice.invoiceNumber },
          });
          notifyOwner({
            title: `🗑️ Invoice Deleted by Staff`,
            content: `Staff "${staffAccount?.fullName || staffSession.username}" deleted invoice ${existingInvoice.invoiceNumber} (Customer: ${existingInvoice.customerName}, Total: ${existingInvoice.totalAmount} MMK)`,
          }).catch(err => console.warn("[AuditNotification] Error:", err));
        }
        
        return { success: true };
      }),
  }),

  // Deliveries (Staff) - server-side staff cookie auth
  deliveries: router({
    myDeliveries: publicProcedure
      .input(z.object({ staffId: z.number() }))
      .query(async ({ input, ctx }) => {
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!staffSession || staffSession.staffId !== input.staffId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff authentication required" });
        }
        return db.getDeliveriesByStaff(input.staffId);
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["assigned", "in_transit", "delivered", "failed"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!staffSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff authentication required" });
        }
        await db.updateDeliveryStatus(input.id, input.status);
        return { success: true };
      }),
    assign: publicProcedure
      .input(z.object({
        orderId: z.number(),
        staffId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.createDelivery({ orderId: input.orderId, staffId: input.staffId });
        await db.updateOrderStatus(input.orderId, "processing");
        return { success: true };
      }),
  }),

  // Truck Stock - server-side staff cookie auth
  truckStockRouter: router({
    getByStaff: publicProcedure
      .input(z.object({ staffId: z.number() }))
      .query(async ({ input, ctx }) => {
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!staffSession || staffSession.staffId !== input.staffId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff authentication required" });
        }
        return db.getTruckStockByStaff(input.staffId);
      }),
    update: publicProcedure
      .input(z.object({
        staffId: z.number(),
        productId: z.number(),
        quantity: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const staffSession = await getStaffFromRequest(ctx.req);
        if (!staffSession || staffSession.staffId !== input.staffId) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff authentication required" });
        }
        await db.updateTruckStock(input.staffId, input.productId, input.quantity);
        return { success: true };
      }),
  }),

  // Dashboard & Analytics (Admin only)
  dashboard: router({
    stats: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getDashboardStats();
    }),
    revenueChart: publicProcedure
      .input(z.object({ days: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        return db.getRevenueByDay(input?.days || 30);
      }),
    topCustomers: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        return db.getTopCustomers(input?.limit || 10);
      }),
    bottleBreakdown: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getBottleTypeBreakdown();
    }),
    deliveryPerformance: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getDeliveryPerformance();
    }),
  }),

  // Sales Reports
  reports: router({
    sales: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        const start = input?.startDate ? new Date(input.startDate) : undefined;
        const end = input?.endDate ? new Date(input.endDate) : undefined;
        return db.getSalesRecords(start, end);
      }),
    // Staff can see their own sales
    mySales: publicProcedure.query(async ({ ctx }) => {
      const staffSession = await getStaffFromRequest(ctx.req);
      if (!staffSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Staff authentication required" });
      return db.getSalesRecordsByStaff(staffSession.staffId);
    }),
  }),

  // Customer Notifications
  notifications: router({
    getByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return db.getNotificationsByPhone(input.phone);
      }),
    getByOrder: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return db.getNotificationsByOrderId(input.orderId);
      }),
    markRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationRead(input.id);
        return { success: true };
      }),
  }),

  // Delivery Zones
  zones: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getAllZones();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        return db.getZoneById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        nameMyanmar: z.string().optional(),
        color: z.string().optional(),
        centerLat: z.string().optional(),
        centerLng: z.string().optional(),
        assignedStaffId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.createZone(input);
        return { success: true };
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameMyanmar: z.string().optional(),
        color: z.string().optional(),
        centerLat: z.string().optional(),
        centerLng: z.string().optional(),
        assignedStaffId: z.number().nullable().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        const { id, ...data } = input;
        await db.updateZone(id, data);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.deleteZone(input.id);
        return { success: true };
      }),
    assignStaff: publicProcedure
      .input(z.object({ staffId: z.number(), zoneId: z.number().nullable() }))
      .mutation(async ({ input, ctx }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        await db.assignStaffToZone(input.staffId, input.zoneId);
        return { success: true };
      }),
  }),

  // Admin login (STRICT: ONLY admin/admin123 allowed)
  adminAuth: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // RBAC STRICT: Only the "admin" username is allowed to login here
        if (input.username !== "admin") {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin Login သည် Super Admin အတွက်သာ ဖြစ်ပါသည်။ ဝန်ထမ်းများ Staff Login ကို အသုံးပြုပါ။" });
        }
        const staff = await db.getStaffByUsername(input.username);
        if (!staff || !staff.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "အကောင့်ဝင်ရောက်မှု မမှန်ကန်ပါ၊ ပြန်လည်စစ်ဆေးပါ။" });
        }
        const valid = await bcrypt.compare(input.password, staff.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "အကောင့်ဝင်ရောက်မှု မမှန်ကန်ပါ၊ ပြန်လည်စစ်ဆေးပါ။" });
        }
        // Issue admin session cookie
        const token = await signAdminToken(staff.id, staff.username);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "admin" as const };
      }),
    me: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) return null;
      const staff = await db.getStaffByUsername(adminSession.username);
      if (!staff || !staff.isActive) return null;
      return { id: staff.id, username: staff.username, fullName: staff.fullName, role: "admin" as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Audit Logs (Admin only)
  auditLogs: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      return db.getAllAuditLogs();
    }),
  }),

  // System settings (admin-configurable)
  settings: router({
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getSystemSetting(input.key);
        return { key: input.key, value };
      }),
    getAll: publicProcedure.query(async () => {
      return db.getAllSystemSettings();
    }),
    update: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        }
        await db.setSystemSetting(input.key, input.value);
        return { success: true };
      }),
  }),

  // Loyalty points system
  loyalty: router({
    getByPhone: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return db.getLoyaltyByPhone(input.phone);
      }),
    getAll: publicProcedure.query(async ({ ctx }) => {
      const adminSession = await getAdminFromRequest(ctx.req);
      if (!adminSession) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
      }
      return db.getAllLoyaltyAccounts();
    }),
    getHistory: publicProcedure
      .input(z.object({ phone: z.string() }))
      .query(async ({ input }) => {
        return db.getPointsHistory(input.phone);
      }),
    redeem: publicProcedure
      .input(z.object({ phone: z.string(), points: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        }
        const success = await db.redeemPoints(input.phone, input.points, null, null);
        if (!success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points" });
        }
        return { success: true };
      }),
    redeemForOrder: publicProcedure
      .input(z.object({ phone: z.string(), points: z.number().min(1) }))
      .query(async ({ input }) => {
        const redemptionRate = await db.getSystemSetting("points_redemption_rate");
        const rate = parseFloat(redemptionRate || "100");
        const account = await db.getLoyaltyByPhone(input.phone);
        if (!account) return { available: 0, maxPoints: 0, discountValue: 0, rate };
        const maxRedeemable = Math.min(input.points, account.availablePoints);
        return { available: account.availablePoints, maxPoints: maxRedeemable, discountValue: maxRedeemable * rate, rate };
      }),
    addBonus: publicProcedure
      .input(z.object({ phone: z.string(), points: z.number().min(1), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        }
        const account = await db.getLoyaltyByPhone(input.phone);
        if (!account) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }
        await db.earnPoints(input.phone, account.customerName || "", input.points, 0, "BONUS");
        return { success: true };
      }),
  }),

  // Admin password change
  adminPassword: router({
    change: publicProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(6) }))
      .mutation(async ({ ctx, input }) => {
        const adminSession = await getAdminFromRequest(ctx.req);
        if (!adminSession) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
        }
        const staff = await db.getStaffById(adminSession.staffId);
        if (!staff) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Admin account not found" });
        }
        const valid = await bcrypt.compare(input.currentPassword, staff.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "လက်ရှိ Password မမှန်ကန်ပါ" });
        }
        const newHash = await bcrypt.hash(input.newPassword, 10);
        await db.updateStaffPassword(adminSession.staffId, newHash);
        return { success: true };
      }),
  }),



  // ===== EXPENSES (Staff Tracking) =====
  expenses: router({
    // Staff: Create expense
    create: staffProcedure
      .input(z.object({
        date: z.string(),
        category: z.enum(["fuel", "meals", "transport", "maintenance", "supplies", "other"]),
        amount: z.string(),
        description: z.string().optional(),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createExpense({
          staffId: ctx.staffId,
          staffName: ctx.staffName,
          date: new Date(input.date),
          category: input.category,
          amount: input.amount,
          description: input.description,
          receiptUrl: input.receiptUrl,
          isApproved: false,
        });
        return { success: true, expenseId: (result as any).insertId || 0 };
      }),

    // Staff: Get own expenses
    getMyExpenses: staffProcedure
      .query(async ({ ctx }) => {
        return db.getExpensesByStaff(ctx.staffId);
      }),

    // Staff: Update own expense (only if not approved)
    update: staffProcedure
      .input(z.object({
        id: z.number(),
        date: z.string().optional(),
        category: z.enum(["fuel", "meals", "transport", "maintenance", "supplies", "other"]).optional(),
        amount: z.string().optional(),
        description: z.string().optional(),
        receiptUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const expense = await db.getExpenseById(input.id);
        if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
        if (expense.staffId !== ctx.staffId) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot edit other staff's expense" });
        if (expense.isApproved) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot edit approved expense" });

        const updateData: any = {};
        if (input.date) updateData.date = new Date(input.date);
        if (input.category) updateData.category = input.category;
        if (input.amount) updateData.amount = input.amount;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.receiptUrl !== undefined) updateData.receiptUrl = input.receiptUrl;

        await db.updateExpense(input.id, updateData);
        return { success: true };
      }),

    // Staff: Delete own expense (only if not approved)
    delete: staffProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const expense = await db.getExpenseById(input.id);
        if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
        if (expense.staffId !== ctx.staffId) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete other staff's expense" });
        if (expense.isApproved) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete approved expense" });

        await db.deleteExpense(input.id);
        return { success: true };
      }),

    // Admin: Get all expenses (pending)
    getPending: adminProcedure
      .query(async () => {
        return db.getPendingExpenses();
      }),

    // Admin: Get all expenses
    getAll: adminProcedure
      .query(async () => {
        return db.getAllExpenses();
      }),

    // Admin: Approve expense
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const expense = await db.getExpenseById(input.id);
        if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
        
        const admin = await db.getStaffById((ctx as any).staffId);
        const adminName = admin?.fullName || "Admin";
        
        await db.approveExpense(input.id, (ctx as any).staffId, adminName);
        await notifyOwner({
          title: "Expense Approved",
          content: `Staff ${expense.staffName} expense of ${expense.amount} MMK (${expense.category}) approved.`,
        });
        return { success: true };
      }),

    // Admin: Reject expense
    reject: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const expense = await db.getExpenseById(input.id);
        if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });
        
        await db.rejectExpense(input.id, input.reason);
        return { success: true };
      }),
  }),

  // Water Quality Inspection (Admin only)
  waterQuality: router({
    create: adminProcedure
      .input(z.object({
        inspectionDate: z.string(),
        pH: z.number(),
        turbidity: z.number(),
        chlorineLevel: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const admin = await getAdminFromRequest(ctx.req);
        if (!admin) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const result = await db.createWaterQualityInspection({
          inspectionDate: new Date(input.inspectionDate),
          pH: input.pH.toString() as any,
          turbidity: input.turbidity.toString() as any,
          chlorineLevel: input.chlorineLevel.toString() as any,
          notes: input.notes,
          inspectedBy: admin.username,
        });
        
        await notifyOwner({
          title: "💧 Water Quality Inspection",
          content: `New inspection recorded: pH ${input.pH}, Turbidity ${input.turbidity}, Chlorine ${input.chlorineLevel}`,
        });
        
        return { success: true };
      }),
    list: publicProcedure.query(async () => {
      return db.getWaterQualityInspections(50);
    }),
    latest: publicProcedure.query(async () => {
      return db.getLatestWaterQualityInspection();
    }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        inspectionDate: z.string().optional(),
        pH: z.number().optional(),
        turbidity: z.number().optional(),
        chlorineLevel: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const admin = await getAdminFromRequest(ctx.req);
        if (!admin) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        const updateData: any = {};
        if (input.inspectionDate) updateData.inspectionDate = new Date(input.inspectionDate);
        if (input.pH !== undefined) updateData.pH = input.pH.toString();
        if (input.turbidity !== undefined) updateData.turbidity = input.turbidity.toString();
        if (input.chlorineLevel !== undefined) updateData.chlorineLevel = input.chlorineLevel.toString();
        if (input.notes !== undefined) updateData.notes = input.notes;
        
        await db.updateWaterQualityInspection(input.id, updateData);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const admin = await getAdminFromRequest(ctx.req);
        if (!admin) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        await db.deleteWaterQualityInspection(input.id);
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
