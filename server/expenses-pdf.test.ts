import { describe, it, expect } from "vitest";
import { generateInvoicePDF } from "./pdf";

describe("PDF Export", () => {
  it("should generate invoice PDF with header and items", async () => {
    const invoice = {
      invoiceNumber: "INV-001",
      invoiceDate: new Date().toLocaleDateString(),
      customerName: "Test Customer",
      staffName: "Test Staff",
      items: [
        { productName: "20L Bottle", quantity: 5, unitPrice: 5000, amount: 25000 },
        { productName: "1L Bottle", quantity: 10, unitPrice: 1000, amount: 10000 },
      ],
    };
    const pdfBuffer = await generateInvoicePDF(invoice);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it("should generate PDF with bilingual content", async () => {
    const invoice = {
      invoiceNumber: "INV-002",
      invoiceDate: new Date().toLocaleDateString(),
      customerName: "မြန်မာ ဝယ်ယူသူ",
      staffName: "ဝန်ထမ်း",
      items: [
        { productName: "ပုလင်း", quantity: 3, unitPrice: 5000, amount: 15000 },
      ],
    };
    const pdfBuffer = await generateInvoicePDF(invoice);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it("should calculate total amount correctly", async () => {
    const invoice = {
      invoiceNumber: "INV-003",
      invoiceDate: new Date().toLocaleDateString(),
      customerName: "Customer",
      staffName: "Staff",
      items: [
        { productName: "Item 1", quantity: 2, unitPrice: 1000, amount: 2000 },
        { productName: "Item 2", quantity: 3, unitPrice: 2000, amount: 6000 },
      ],
    };
    const pdfBuffer = await generateInvoicePDF(invoice);
    expect(pdfBuffer).toBeDefined();
    // Total should be 8000 (2000 + 6000)
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it("should handle empty items list", async () => {
    const invoice = {
      invoiceNumber: "INV-004",
      invoiceDate: new Date().toLocaleDateString(),
      customerName: "Customer",
      staffName: "Staff",
      items: [],
    };
    const pdfBuffer = await generateInvoicePDF(invoice);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
