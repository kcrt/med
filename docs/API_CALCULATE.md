# Calculate API Endpoint

## Overview
POST API endpoint for performing formula-based calculations. This endpoint uses the formula system defined in the `src/formulas` directory, providing a consistent and extensible approach to calculations.

## Endpoint
```
POST /api/calculate
```

## Architecture
The endpoint leverages the existing formula evaluation system:
- Formulas are defined in JSON files in `src/formulas/` directory
- The four basic arithmetic operations (add, subtract, multiply, divide) are defined in `src/formulas/others.json`
- Uses the formula validation and evaluation system from `@/lib/formula`
- Supports all formula features including assertions, type checking, and test cases

## Request Format
```json
{
  "formula": "add",  // The formula ID from the formula system
  "parameters": {
    "a": 5,         // Parameters as defined by the formula's input specification
    "b": 3
  }
}
```

## Supported Formulas
Basic arithmetic operations are defined in `src/formulas/others.json`:
- `add`: Returns the sum of two numbers
- `subtract`: Returns the difference between two numbers  
- `multiply`: Returns the product of two numbers
- `divide`: Returns the quotient of two numbers (handles division by zero via assertions)

## Response Format

### Success Response (200 OK)
```json
{
  "result": 8
}
```

### Error Responses (400 Bad Request)

**Formula not found:**
```json
{
  "error": "Formula not supported"
}
```

**Invalid input (missing parameters, wrong types, etc.):**
```json
{
  "error": "Invalid input"
}
```

**Assertion failures (e.g., division by zero):**
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
- Uses the formula evaluation system from `@/lib/formula`
- Input validation with Zod schemas
- Type checking based on formula input definitions
- Assertion validation for runtime constraints
- Comprehensive error handling
- Fully tested with 20 test cases

## Formula System Integration
This endpoint can work with any formula defined in the formula system. To add new formulas:
1. Add the formula definition to the appropriate JSON file in `src/formulas/`
2. Define inputs, outputs, and optional assertions
3. Add test cases to validate the formula
4. The API endpoint will automatically support the new formula

## Testing
Run the API tests with:
```bash
npm test -- src/app/api/calculate/__tests__/route.test.ts
```

Run all formula tests (including the new arithmetic formulas):
```bash
npm test -- src/lib/__tests__/formula.test.ts
```

