import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user-id",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated user", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
    expect(result?.email).toBe("admin@example.com");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.staffLogin", () => {
  it("throws UNAUTHORIZED for invalid credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.staffLogin({ username: "nonexistent", password: "wrong" })
    ).rejects.toThrow();
  });
});

describe("products.list", () => {
  it("returns an array (may be empty if DB has no products)", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("orders.trackByNumber", () => {
  it("throws NOT_FOUND for non-existent order", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.orders.trackByNumber({ orderNumber: "NONEXISTENT-ORDER-123" })
    ).rejects.toThrow();
  });
});

describe("staff auth", () => {
  it("staffMe returns null without cookie", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.staffMe();
    expect(result).toBeNull();
  });

  it("staffLogout returns success", async () => {
    const { ctx } = createPublicContext();
    // Mock clearCookie on res
    (ctx.res as any).clearCookie = () => {};
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.staffLogout();
    expect(result).toEqual({ success: true });
  });
});

describe("delivery endpoints - require staff auth", () => {
  it("deliveries.myDeliveries throws UNAUTHORIZED without staff cookie", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.deliveries.myDeliveries({ staffId: 1 })
    ).rejects.toThrow();
  });

  it("truckStockRouter.getByStaff throws UNAUTHORIZED without staff cookie", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.truckStockRouter.getByStaff({ staffId: 1 })
    ).rejects.toThrow();
  });
});

describe("seed data verification", () => {
  it("products.list returns seeded products", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const products = await caller.products.list();
    expect(products.length).toBeGreaterThanOrEqual(4);
    const types = products.map((p: any) => p.type);
    expect(types).toContain("20L");
    expect(types).toContain("1L");
    expect(types).toContain("0.5L");
    expect(types).toContain("0.35L");
  });
});

describe("notification on order creation", () => {
  it("notifyOwner is called when a new order is created", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await caller.orders.create({
      customerName: "Test Customer",
      customerPhone: "09-111222333",
      items: [{ productName: "20L Gallon", quantity: 2, unitPrice: "1500" }],
      isPublicOrder: true,
    });
    
    expect(notifyOwner).toHaveBeenCalled();
    const lastCall = (notifyOwner as any).mock.calls[(notifyOwner as any).mock.calls.length - 1][0];
    expect(lastCall.title).toContain("New Order");
    expect(lastCall.content).toContain("Test Customer");
  });
});

describe("adminAuth", () => {
  it("adminAuth.login throws UNAUTHORIZED for invalid credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.adminAuth.login({ username: "admin", password: "wrongpass" })
    ).rejects.toThrow();
  });

  it("adminAuth.me returns null when no session", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.me();
    expect(result).toBeNull();
  });

  it("adminAuth.logout returns success", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.adminAuth.logout();
    expect(result).toEqual({ success: true });
  });
});

describe("settings", () => {
  it("settings.get returns MOQ setting", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.get({ key: "min_order_quantity" });
    expect(result.key).toBe("min_order_quantity");
    expect(result.value).toBeTruthy();
  });

  it("settings.getAll returns all settings", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.getAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("settings.update throws UNAUTHORIZED without admin session", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.settings.update({ key: "min_order_quantity", value: "10" })
    ).rejects.toThrow();
  });
});

describe("zones CRUD", () => {
  it("zones.create requires admin role", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.zones.create({ name: "Test Zone" })).rejects.toThrow();
  });

  it("zones.list works for admin", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const zones = await caller.zones.list();
    expect(Array.isArray(zones)).toBe(true);
  });
});

describe("admin procedures - access control", () => {
  it("dashboard.stats throws FORBIDDEN for non-admin", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.stats()).rejects.toThrow();
  });

  it("dashboard.stats works for admin", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("pendingOrders");
    expect(result).toHaveProperty("todaySales");
    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("lowStockItems");
  });

  it("dashboard.deliveryPerformance works for admin", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.deliveryPerformance();
    expect(result).toHaveProperty("totalDeliveries");
    expect(result).toHaveProperty("delivered");
    expect(result).toHaveProperty("successRate");
  });
});
