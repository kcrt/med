# Medicalculator Library

A comprehensive medical calculation library that can be used in any JavaScript/TypeScript application.

## Installation

```bash
npm install med
```

## Usage

The library exports calculation functions, formula data, and types that can be used for medical calculations.

### Basic Example

```typescript
import { getFormula, evaluateFormulaOutputs } from 'med';

// Get BMI formula
const bmiFormula = getFormula('bmi_adult');

if (bmiFormula) {
  // Calculate BMI
  const results = evaluateFormulaOutputs(bmiFormula, {
    height: 170,  // cm
    weight: 70    // kg
  });
  
  console.log(results);
  // Output: { BMI: 24.2, who_diag: "normal", ... }
}
```

### Available Functions

#### Core Formula Functions

- **`getFormulaData()`** - Get all formula data
- **`getFormula(id: string)`** - Get a specific formula by ID
- **`evaluateFormula(formula: string, inputValues: FormulaInputValues)`** - Evaluate a single formula expression
- **`evaluateFormulaOutputs(formula: Formula, inputValues: FormulaInputValues)`** - Evaluate all outputs for a formula
- **`validateAssertions(assertions, inputValues)`** - Validate input assertions
- **`formatOutput(value, precision?)`** - Format output values
- **`isCalculationFormula(formula)`** - Type guard for calculation formulas
- **`isHtmlFormula(formula)`** - Type guard for HTML formulas
- **`getMenuItems(locale?)`** - Get menu structure for all formulas
- **`getAllFormulaIds()`** - Get array of all formula IDs
- **`getCategoryMap()`** - Get map of formula IDs to categories
- **`iterateFormulas(callback)`** - Iterate over all formulas

#### Medical Calculation Utilities

- **`BSA_DuBois(height, weight)`** - Calculate body surface area using Du Bois formula
- **`GetZScore(value, average, sd)`** - Calculate Z-score
- **`GetZScoreStr(value, average, sd)`** - Get formatted Z-score string
- **`GetZScoreFromLMS(value, l, m, s)`** - Get Z-score from LMS parameters
- **`GetPercentileFromZScore(sd)`** - Get percentile from Z-score
- **`GetValueFromZScore(zscore, l, m, s)`** - Get value from Z-score using LMS
- **`iif(...args)`** - Conditional function (like Excel's IF)
- **`concat(...args)`** - Concatenate values into a string
- **`dateparse(dateString)`** - Parse ISO date string to timestamp
- **`erf(x)`** - Error function approximation

#### Export/Formatting Utilities

- **`buildHumanReadableData(formula, formulaId, inputValues, outputResults, locale?)`** - Build human-readable result string

### Formula IDs

Some commonly used formula IDs:

- `bmi_adult` - BMI (Adult)
- `bmi_child` - BMI/Kaup/Rohrer Index (Child)
- `egfr_mdrd` - eGFR (MDRD)
- `egfr_ckd_epi` - eGFR (CKD-EPI)
- `ccr` - Creatinine Clearance
- `child_pugh` - Child-Pugh Score
- ... and many more

Use `getAllFormulaIds()` to get the complete list.

### Advanced Example

```typescript
import {
  getFormula,
  evaluateFormulaOutputs,
  validateAssertions,
  buildHumanReadableData,
  isCalculationFormula
} from 'med';

const formulaId = 'egfr_ckd_epi';
const formula = getFormula(formulaId);

if (formula && isCalculationFormula(formula)) {
  const inputValues = {
    age: 45,
    sex: 'male',
    creatinine: 1.2
  };
  
  // Validate assertions if any
  if (formula.assert) {
    const errors = validateAssertions(formula.assert, inputValues);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return;
    }
  }
  
  // Calculate results
  const results = evaluateFormulaOutputs(formula, inputValues);
  console.log('Results:', results);
  
  // Build human-readable output
  const readable = buildHumanReadableData(
    formula,
    formulaId,
    inputValues,
    results,
    'en'
  );
  console.log(readable);
}
```

### TypeScript Support

The library includes full TypeScript type definitions:

```typescript
import type {
  Formula,
  FormulaData,
  FormulaInput,
  FormulaOutput,
  CalculationFormula,
  FormulaInputValues,
  FormulaOutputValues
} from 'med';
```

## Dependencies

The library has minimal core dependencies required for calculation functionality:

- `expr-eval` - For formula evaluation
- `zod` - For runtime type validation

These are automatically installed when you install the package.

Note: The full `med` package also includes Next.js, React, and Mantine UI components for the web application. When using just the calculation library, these additional dependencies are installed but not required for core calculation features.

## License

Copyright © 2012-2025 TAKAHASHI, Kyohei

See the main [repository](https://github.com/kcrt/med) for license details.
