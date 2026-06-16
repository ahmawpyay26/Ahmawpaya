import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Water Quality Inspections", () => {
  it("should create a water quality inspection", async () => {
    const result = await db.createWaterQualityInspection({
      inspectionDate: new Date(),
      pH: "7.5" as any,
      turbidity: "0.5" as any,
      chlorineLevel: "0.2" as any,
      notes: "Test inspection",
      inspectedBy: "admin",
    });
    expect(result).toBeDefined();
  });

  it("should get latest water quality inspection", async () => {
    const latest = await db.getLatestWaterQualityInspection();
    if (latest) {
      expect(latest.pH).toBeDefined();
      expect(latest.turbidity).toBeDefined();
      expect(latest.chlorineLevel).toBeDefined();
    }
  });

  it("should get water quality inspections list", async () => {
    const inspections = await db.getWaterQualityInspections(10);
    expect(Array.isArray(inspections)).toBe(true);
  });

  it("should validate pH level is reasonable", async () => {
    const latest = await db.getLatestWaterQualityInspection();
    if (latest) {
      const pH = parseFloat(latest.pH);
      expect(pH).toBeGreaterThan(0);
      expect(pH).toBeLessThan(14);
    }
  });

  it("should validate turbidity is non-negative", async () => {
    const latest = await db.getLatestWaterQualityInspection();
    if (latest) {
      const turbidity = parseFloat(latest.turbidity);
      expect(turbidity).toBeGreaterThanOrEqual(0);
    }
  });

  it("should validate chlorine level is safe", async () => {
    const latest = await db.getLatestWaterQualityInspection();
    if (latest) {
      const chlorine = parseFloat(latest.chlorineLevel);
      expect(chlorine).toBeGreaterThanOrEqual(0);
      expect(chlorine).toBeLessThan(5); // Safe upper limit
    }
  });
});
