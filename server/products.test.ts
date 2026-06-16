import { describe, it, expect, vi } from "vitest";
import * as db from "./db";

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Products - Edit/Delete", () => {
  it("should create a product via db helper", async () => {
    const productName = `Test Product ${Date.now()}`;
    
    await db.createProduct({
      name: productName,
      nameMyanmar: "စမ်းသပ်ထုတ်ကုန်",
      type: "20L",
      unitPrice: "5000",
      shellPrice: "1000",
      waterPrice: "4000",
    });

    const products = await db.getAllProducts();
    const product = products.find(p => p.name === productName);
    expect(product).toBeDefined();
    expect(product?.name).toBe(productName);
  });

  it("should update product details via db helper", async () => {
    const productName = `Test Update ${Date.now()}`;
    
    // Create product
    await db.createProduct({
      name: productName,
      type: "1L",
      unitPrice: "2000",
    });

    const products = await db.getAllProducts();
    const product = products.find(p => p.name === productName);
    if (!product) return;

    // Update product
    await db.updateProduct(product.id, {
      name: `Updated ${productName}`,
      unitPrice: "3000",
    });

    // Verify update
    const updated = await db.getProductById(product.id);
    expect(updated?.name).toContain("Updated");
    expect(updated?.unitPrice).toContain("3000");
  });

  it("should delete a product via db helper", async () => {
    const productName = `Delete Me ${Date.now()}`;
    
    // Create product
    await db.createProduct({
      name: productName,
      type: "0.5L",
      unitPrice: "1500",
    });

    const products = await db.getAllProducts();
    const product = products.find(p => p.name === productName);
    if (!product) return;

    // Delete product
    await db.deleteProduct(product.id);

    // Verify deletion
    const deleted = await db.getProductById(product.id);
    expect(deleted).toBeUndefined();
  });

  it("should list all products", async () => {
    const products = await db.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  it("should get product by id", async () => {
    const products = await db.getAllProducts();
    if (products.length === 0) return;

    const product = await db.getProductById(products[0].id);
    expect(product).toBeDefined();
    expect(product?.id).toBe(products[0].id);
  });

  it("should handle product with all fields", async () => {
    const productName = `Full Product ${Date.now()}`;
    
    await db.createProduct({
      name: productName,
      nameMyanmar: "အပြည့်အစုံထုတ်ကုန်",
      type: "20L",
      unitPrice: "5500",
      shellPrice: "1200",
      waterPrice: "4300",
      description: "Premium water product",
      descriptionMyanmar: "အရည်အသွေးမြင့် ရေထုတ်ကုန်",
    });

    const products = await db.getAllProducts();
    const product = products.find(p => p.name === productName);
    expect(product?.nameMyanmar).toBe("အပြည့်အစုံထုတ်ကုန်");
    expect(product?.description).toBe("Premium water product");
  });
});
