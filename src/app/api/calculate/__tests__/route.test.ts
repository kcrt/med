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
  describe("Addition", () => {
    it("should add two positive numbers", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 5, b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 8 });
    });

    it("should add positive and negative numbers", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 10, b: -3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 7 });
    });

    it("should add decimal numbers", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 2.5, b: 3.7 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result).toBeCloseTo(6.2, 5);
    });
  });

  describe("Subtraction", () => {
    it("should subtract two positive numbers", async () => {
      const request = createMockRequest({
        formula: "subtract",
        parameters: { a: 10, b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 7 });
    });

    it("should handle negative results", async () => {
      const request = createMockRequest({
        formula: "subtract",
        parameters: { a: 3, b: 10 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: -7 });
    });
  });

  describe("Multiplication", () => {
    it("should multiply two positive numbers", async () => {
      const request = createMockRequest({
        formula: "multiply",
        parameters: { a: 4, b: 5 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 20 });
    });

    it("should multiply by zero", async () => {
      const request = createMockRequest({
        formula: "multiply",
        parameters: { a: 10, b: 0 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 0 });
    });

    it("should multiply negative numbers", async () => {
      const request = createMockRequest({
        formula: "multiply",
        parameters: { a: -3, b: 4 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: -12 });
    });
  });

  describe("Division", () => {
    it("should divide two positive numbers", async () => {
      const request = createMockRequest({
        formula: "divide",
        parameters: { a: 20, b: 4 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 5 });
    });

    it("should handle division resulting in decimals", async () => {
      const request = createMockRequest({
        formula: "divide",
        parameters: { a: 10, b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result).toBeCloseTo(3.3333, 4);
    });

    it("should return error for division by zero", async () => {
      const request = createMockRequest({
        formula: "divide",
        parameters: { a: 10, b: 0 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Division by zero" });
    });
  });

  describe("Error Handling", () => {
    it("should return error for unsupported formula", async () => {
      const request = createMockRequest({
        formula: "power",
        parameters: { a: 2, b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Formula not supported" });
    });

    it("should return error for missing parameters", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 5 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for invalid parameter types", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: "5", b: 3 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid input" });
    });

    it("should return error for missing formula", async () => {
      const request = createMockRequest({
        parameters: { a: 5, b: 3 },
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

  describe("Edge Cases", () => {
    it("should handle zero values", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 0, b: 0 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 0 });
    });

    it("should handle very large numbers", async () => {
      const request = createMockRequest({
        formula: "multiply",
        parameters: { a: 1000000, b: 1000000 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ result: 1000000000000 });
    });

    it("should handle very small decimal numbers", async () => {
      const request = createMockRequest({
        formula: "add",
        parameters: { a: 0.0001, b: 0.0002 },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result).toBeCloseTo(0.0003, 5);
    });
  });
});
