# Calculate API Endpoint

## Overview
POST API endpoint for performing formula-based calculations using the existing formula system. This endpoint provides programmatic access to all calculation formulas defined in the `src/formulas` directory.

## Endpoint
```
POST /api/calculate
```

## Architecture
The endpoint leverages the existing formula evaluation system:
- Uses formulas defined in JSON files in `src/formulas/` directory
- Integrates with the formula validation and evaluation system from `@/lib/formula`
- Supports all formula features including assertions, type checking, and test cases
- Returns all calculated outputs from the formula

## Request Format
```json
{
  "formula": "bmi_adult",  // The formula ID from the formula system
  "parameters": {
    "height": 170,        // Parameters as defined by the formula's input specification
    "weight": 70
  }
}
```

## Available Formulas
The API supports all formulas defined in the formula system. Some examples:

### Body Structure Index
- `bmi_adult`: BMI calculation for adults
- `bmi_child`: BMI/Kaup/Rohrer Index for children

### Renal Function
- Various kidney function calculations

### Cardiology
- Cardiac-related calculations

### And many more...
See `src/formulas/` directory for all available formulas.

## Response Format

### Success Response (200 OK)
Returns all calculated outputs from the formula:

```json
{
  "BMI": 24.2,
  "who_diag": "normal"
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

**Assertion failures:**
```json
{
  "error": "<assertion error message>"
}
```

## Example Usage

### BMI Calculation (Adult)
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "bmi_adult",
    "parameters": {
      "height": 170,
      "weight": 70
    }
  }'
```

**Response:**
```json
{
  "BMI": 24.2,
  "who_diag": "normal"
}
```

### LMS Z-Score Calculation
```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "lms_zscore",
    "parameters": {
      "value": 50,
      "l": 1,
      "m": 50,
      "s": 0.1
    }
  }'
```

**Response:**
```json
{
  "zscore": 0,
  "percentile": 50.0
}
```

## Implementation Details
- Built with Next.js 16 App Router
- Uses the formula evaluation system from `@/lib/formula`
- Input validation with Zod schemas
- Type checking based on formula input definitions
- Assertion validation for runtime constraints
- Comprehensive error handling
- Fully tested with 10+ test cases

## Formula System Integration
This endpoint provides API access to the entire formula system. Key features:

1. **Type Safety**: Validates input types match formula definitions
2. **Assertions**: Enforces formula-defined constraints
3. **All Outputs**: Returns all calculated outputs from the formula
4. **Extensible**: Automatically supports new formulas added to the system

## Adding New Formulas
To add a new formula that's accessible via this API:
1. Add the formula definition to the appropriate JSON file in `src/formulas/`
2. Define inputs, outputs, and optional assertions
3. Add test cases to validate the formula
4. The API endpoint will automatically support the new formula

## Testing
Run the API tests with:
```bash
npm test -- src/app/api/calculate/__tests__/route.test.ts
```

Run all formula tests:
```bash
npm test -- src/lib/__tests__/formula.test.ts
```
