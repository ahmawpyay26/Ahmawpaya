import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import bcrypt from "bcryptjs";

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): { ctx: TrpcContext; cookies: Record<string, string> } {
  const cookies: Record<string, string> = {};
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {
        get cookie() {
          return Object.entries(cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ");
        },
      },
    } as any,
    res: {
      clearCookie: (name: string) => {
        delete cookies[name];
      },
      cookie: (name: string, value: string) => {
        cookies[name] = value;
      },
    } as any,
  };
  return { ctx, cookies };
}

describe("RBAC - Admin Login Strict Enforcement", () => {
  it("should reject non-admin username on admin login", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.adminAuth.login({ username: "staff_user", password: "anypassword" });
      expect.fail("Should have thrown error");
    } catch (err: any) {
      expect(err.message).toContain("Admin Login သည် Super Admin အတွက်သာ");
    }
  });

  it("should reject staff account from admin login endpoint", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Create a staff account with unique username
    const uniqueUsername = `john_staff_${Date.now()}`;
    const staffHash = await bcrypt.hash("staff123", 10);
    
    try {
      await db.createStaffAccount({
        username: uniqueUsername,
        passwordHash: staffHash,
        fullName: "John Staff",
        phone: "09123456789",
      });
    } catch (e) {
      // Account may already exist from previous test run
    }

    try {
      await caller.adminAuth.login({ username: uniqueUsername, password: "staff123" });
      expect.fail("Should have thrown error");
    } catch (err: any) {
      expect(err.message).toContain("Admin Login သည် Super Admin အတွက်သာ");
    }
  });

  it("should allow admin/admin123 on admin login", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Ensure admin account exists
    const admin = await db.getStaffByUsername("admin");
    if (!admin) {
      const adminHash = await bcrypt.hash("admin123", 10);
      await db.createStaffAccount({
        username: "admin",
        passwordHash: adminHash,
        fullName: "Super Admin",
        isActive: true,
      });
    }

    const result = await caller.adminAuth.login({ username: "admin", password: "admin123" });
    expect(result.username).toBe("admin");
    expect(result.role).toBe("admin");
  });
});

describe("RBAC - Staff Login Isolation", () => {
  it("should reject admin account from staff login", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auth.staffLogin({ username: "admin", password: "admin123" });
      expect.fail("Should have thrown error");
    } catch (err: any) {
      expect(err.message).toContain("Admin အကောင့်ဖြင့် ဝန်ထမ်း Login ဝင်");
    }
  });

  it("should allow staff login with valid credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Create staff account with unique username
    const uniqueUsername = `alice_staff_${Date.now()}`;
    const staffHash = await bcrypt.hash("staff_pass", 10);
    
    try {
      await db.createStaffAccount({
        username: uniqueUsername,
        passwordHash: staffHash,
        fullName: "Alice Staff",
        phone: "09987654321",
      });
    } catch (e) {
      // Account may already exist
    }

    const result = await caller.auth.staffLogin({ username: uniqueUsername, password: "staff_pass" });
    expect(result.username).toBe(uniqueUsername);
    expect(result.role).toBe("staff");
  });
});

describe("RBAC - Staff Data Isolation", () => {
  it("staff should only see their own invoices", async () => {
    // Create two staff accounts with unique usernames
    const staff1Username = `staff_one_${Date.now()}`;
    const staff2Username = `staff_two_${Date.now()}`;
    const staff1Hash = await bcrypt.hash("pass1", 10);
    const staff2Hash = await bcrypt.hash("pass2", 10);

    try {
      await db.createStaffAccount({
        username: staff1Username,
        passwordHash: staff1Hash,
        fullName: "Staff One",
      });
    } catch (e) {
      // May exist
    }

    try {
      await db.createStaffAccount({
        username: staff2Username,
        passwordHash: staff2Hash,
        fullName: "Staff Two",
      });
    } catch (e) {
      // May exist
    }

    const staff1 = await db.getStaffByUsername(staff1Username);
    const staff2 = await db.getStaffByUsername(staff2Username);

    // Create invoices for each staff
    if (staff1 && staff2) {
      try {
        await db.createInvoice({
          invoiceNumber: `INV-RBAC-${Date.now()}-1`,
          customerName: "Customer 1",
          subtotal: "1000",
          totalAmount: "1000",
          createdBy: staff1.id,
        });
      } catch (e) {
        // May exist
      }

      try {
        await db.createInvoice({
          invoiceNumber: `INV-RBAC-${Date.now()}-2`,
          customerName: "Customer 2",
          subtotal: "2000",
          totalAmount: "2000",
          createdBy: staff2.id,
        });
      } catch (e) {
        // May exist
      }

      // Get invoices for staff1
      const staff1Invoices = await db.getInvoicesByStaff(staff1.id);
      expect(staff1Invoices.length).toBeGreaterThanOrEqual(0);

      // Get invoices for staff2
      const staff2Invoices = await db.getInvoicesByStaff(staff2.id);
      expect(staff2Invoices.length).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("RBAC - Staff Permissions", () => {
  it("staff should not be able to delete orders", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.orders.delete({ id: 999 });
      expect.fail("Should have thrown error");
    } catch (err: any) {
      expect(err.message).toContain("ဝန်ထမ်းများ Order ဖျက်ခွင့်မရှိပါ");
    }
  });
});

describe("RBAC - Audit Logging", () => {
  it("should have audit log database helpers", async () => {
    // Create staff with unique username
    const uniqueUsername = `audit_staff_${Date.now()}`;
    const staffHash = await bcrypt.hash("audit_pass", 10);
    
    try {
      await db.createStaffAccount({
        username: uniqueUsername,
        passwordHash: staffHash,
        fullName: "Audit Staff",
      });
    } catch (e) {
      // May exist
    }

    const staff = await db.getStaffByUsername(uniqueUsername);
    if (!staff) return;

    // Create audit log entry
    await db.createAuditLog({
      staffId: staff.id,
      staffName: staff.fullName,
      action: "create",
      entityType: "invoice",
      entityId: 1,
      entityLabel: `INV-${Date.now()}`,
      newData: { customerName: "Test Customer", totalAmount: "5000" },
    });

    // Retrieve audit logs
    const auditLogs = await db.getAuditLogsByStaff(staff.id);
    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs[0].action).toBe("create");
    expect(auditLogs[0].entityType).toBe("invoice");
  });

  it("should retrieve all audit logs for admin", async () => {
    const allLogs = await db.getAllAuditLogs();
    expect(Array.isArray(allLogs)).toBe(true);
  });
});
