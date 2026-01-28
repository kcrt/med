import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { POST } from "../route";

/**
 * Helper function to create a mock NextRequest object
 */
function createMockRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/calculate", () => {
  describe("BMI Calculation", () => {
    it("should calculate BMI for valid inputs", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 70 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.BMI).toBeCloseTo(24.2, 1);
      expect(data.who_diag).toBe("normal");
    });

    it("should calculate BMI for overweight person", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 80 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.BMI).toBeCloseTo(27.7, 1);
      expect(data.who_diag).toBe("preobese");
    });

    it("should calculate BMI for obese person", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 90 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.BMI).toBeCloseTo(31.1, 1);
      expect(data.who_diag).toBe("obesity class I");
    });
  });

  describe("Error Handling", () => {
    it("should return error for unsupported formula", async () => {
      const request = createMockRequest({
        formula: "nonexistent_formula",
        parameters: { a: 5, b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Formula not supported" });
    });

    it("should return error for missing parameters", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for invalid parameter types", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: "170", weight: 70 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for missing formula", async () => {
      const request = createMockRequest({
        parameters: { height: 170, weight: 70 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for empty request body", async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for malformed JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{ invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });
  });

  describe("Other Formulas", () => {
    it("should work with LMS Z-Score formula", async () => {
      const request = createMockRequest({
        formula: "lms_zscore",
        parameters: {
          value: 50,
          l: 1,
          m: 50,
          s: 0.1,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.zscore).toBe(0);
    });
  });

  describe("Locale Support", () => {
    it("should filter outputs based on locale (ja)", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 70 },
        locale: "ja",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // When locale=ja, output keys are translated to Japanese labels
      // Note: Units are now separate from labels
      expect(data["BMI [kg/m²]"]).toBeCloseTo(24.2, 1);
      expect(data["WHO (世界保健機関)"]).toBe("normal");
      expect(data["日本肥満学会による肥満度分類"]).toBe("普通体重"); // Japan-specific output
    });

    it("should filter outputs based on locale (en)", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 70 },
        locale: "en",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.BMI).toBeCloseTo(24.2, 1);
      expect(data.who_diag).toBe("normal");
      expect(data.jasso_diag).toBeUndefined(); // Japan-specific output filtered out
    });

    it("should return all outputs when locale is not specified", async () => {
      const request = createMockRequest({
        formula: "bmi_adult",
        parameters: { height: 170, weight: 70 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.BMI).toBeCloseTo(24.2, 1);
      expect(data.who_diag).toBe("normal");
      expect(data.jasso_diag).toBe("普通体重"); // Included when no locale specified
    });
  });
});
