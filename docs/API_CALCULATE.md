# Calculate API Endpoint

## Overview
POST API endpoint for performing formula-based calculations with basic arithmetic operations.

## Endpoint
```
POST /api/calculate
```

## Request Format
```json
{
  "formula": "add",  // The operation to perform: "add", "subtract", "multiply", or "divide"
  "parameters": {
    "a": 5,         // First operand (number)
    "b": 3          // Second operand (number)
  }
}
```

## Supported Formulas
- `add`: Returns the sum of two numbers
- `subtract`: Returns the difference between two numbers  
- `multiply`: Returns the product of two numbers
- `divide`: Returns the quotient of two numbers (handles division by zero)

## Response Format

### Success Response (200 OK)
```json
{
  "result": 8
}
```

### Error Responses (400 Bad Request)

**Invalid Formula:**
```json
{
  "error": "Formula not supported"
}
```

**Invalid Input (missing parameters, wrong types, etc.):**
```json
{
  "error": "Invalid input"
}
```

**Division by Zero:**
```json
{
  "error": "Division by zero"
}
```

## Example Usage

### Addition
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"formula": "add", "parameters": {"a": 5, "b": 3}}'
```
Response: `{"result": 8}`

### Subtraction
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"formula": "subtract", "parameters": {"a": 10, "b": 3}}'
```
Response: `{"result": 7}`

### Multiplication
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"formula": "multiply", "parameters": {"a": 4, "b": 5}}'
```
Response: `{"result": 20}`

### Division
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"formula": "divide", "parameters": {"a": 20, "b": 4}}'
```
Response: `{"result": 5}`

## Implementation Details
- Built with Next.js 16 App Router
- Input validation using Zod schemas
- Comprehensive error handling
- Fully tested with 20 test cases
- Type-safe TypeScript implementation

## Testing
Run the API tests with:
```bash
npm test -- src/app/api/calculate/__tests__/route.test.ts
```
