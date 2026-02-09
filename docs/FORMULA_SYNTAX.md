formula.json Syntax
===================

The Medicalculator reads `src/formulas/*.json` files to display formulas and perform calculations.

## Formula Structure

```json
{
  "_meta": {
    "version": "1.0",
    "lastModified": "2025-01-01",
    "description": "Medical calculation formulas"
  },
  "category_name": {
    "formula_id": {
      "name": "Formula Name",
      "info": "Description of what this formula calculates",
      "input": {
        "field_name": {
          "label": "Field Label",
          "type": "float",
          "unit": "unit",
          "default": 0,
          "min": 0,
          "max": 100
        }
      },
      "output": {
        "result_name": {
          "label": "Result Label",
          "formula": "field_name * 2",
          "unit": "unit",
          "precision": 2
        }
      }
    }
  }
}
```

## Input Field Types

| Type | Description | Example |
|------|-------------|---------|
| `float` | Decimal number input | `{"type": "float", "min": 0, "max": 300}` |
| `int` | Integer number input | `{"type": "int", "min": 0, "max": 150}` |
| `string` | Text input | `{"type": "string"}` |
| `onoff` | Boolean toggle (Yes/No) | `{"type": "onoff",", "default": false}` |
| `sex` | Sex selector (Male/Female) | `{"type": "sex"}` |
| `date` | Date picker | `{"type": "date"}` |
| `select` | Dropdown selection | `{"type": "select", "options": [...]}` |
| `heading` | Non-interactive section heading | `{"type": "heading", "label": "Section Name"}` |
| `info` | Non-interactive info display | `{"type": "info", "label": "Information text"}` |

### Special Input Types

**`heading`** - Creates a section heading for organizing form fields. Does not collect user input.

```json
{
  "section_heading": {
    "type": "heading",
    "label": "Patient Information"
  }
}
```

**`info`** - Displays informational text that doesn't accept user input. Useful for instructions or notes.

```json
{
  "info_text": {
    "type": "info",
    "label": "Please enter values in SI units"
  }
}
```

## Input Field Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Display label for the field |
| `type` | string | Yes | Input type (see table above) |
| `unit` | string | No | Unit of measurement displayed after input |
| `default` | number/string | No | Default value for the field |
| `min` | number | No | Minimum value for numeric inputs |
| `max` | number | No | Maximum value for numeric inputs |
| `options` | array | No | Required for `select` type - array of `{value, label}` objects |
| `locales_in` | array | No | Array of locale codes where field is shown (e.g., `["ja"]`) |
| `locales_not_in` | array | No | Array of locale codes where field is hidden |
| `visibleWhen` | string | No | Conditional visibility expression |

## Output Field Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | string | Yes | Display label for the result |
| `formula` | string | No* | Calculation expression using input field names |
| `unit` | string | No | Unit of measurement |
| `precision` | number | No | Number of decimal places for rounding |
| `text` | string | No | Static text to display (for text-only outputs) |
| `locales_in` | array | No | Array of locale codes where output is shown |
| `locales_not_in` | array | No | Array of locale codes where output is hidden |

*Either `formula` or `text` should be provided for outputs. Use `text` for static informational outputs.

## Conditional Visibility

Fields can be shown/hidden based on other field values using the `visibleWhen` property:

```json
{
  "show_conditionally": {
    "label": "Conditional Field",
    "type": "float",
    "visibleWhen": "other_field > 10"
  }
}
```

The expression uses the same formula evaluation engine as output calculations. Supported operators include:
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Functions: `iif(condition, true_value, false_value)`

### Example: Conditional Fields

```json
{
  "name": "Conditional Example",
  "input": {
    "use_metric": {
      "label": "Use metric units",
      "type": "onoff"
    },
    "weight_lbs": {
      "label": "Weight (lbs)",
      "type": "float",
      "visibleWhen": "use_metric == 0"
    },
    "weight_kg": {
      "label": "Weight (kg)",
      "type": "float",
      "visibleWhen": "use_metric == 1"
    }
  },
  "output": {
    "weight_display": {
      "label": "Weight",
      "formula": "iif(use_metric == 1, weight_kg, weight_lbs * 0.453592)"
    }
  }
}
```

## Locale Filtering

Formulas, individual inputs, and outputs can be filtered by locale to show/hide them based on the user's language setting.

### Formula-Level Filtering

```json
{
  "name": "Japan-specific Formula",
  "locales_in": ["ja"],
  "input": { ... }
}
```

### Field-Level Filtering

```json
{
  "japan_only_field": {
    "label": "Only in Japanese",
    "type": "float",
    "locales_in": ["ja"]
  },
  "not_in_japanese": {
    "label": "Hidden in Japanese",
    "type": "float",
    "locales_not_in": ["ja"]
  }
}
```

Supported locale codes:
- `en` - English (default)
- `ja` - Japanese
- `zh-Hans` - Simplified Chinese
- `zh-Hant` - Traditional Chinese

## Formula Metadata

Optional metadata fields provide additional information about formulas:

```json
{
  "name": "Example Formula",
  "metadata": {
    "obsolete": "This formula has been replaced by newer_method",
    "caution": "Use with caution in pediatric patients",
    "recommended": "Use newer_formula instead for better accuracy"
  }
}
```

| Property | Description |
|----------|-------------|
| `obsolete` | Reason why the formula is obsolete (shows warning banner) |
| `caution` | Usage warnings (shows info banner) |
| `recommended` | Recommended alternative formula |

## Assertions (Cross-field Validation)

Formulas can include validation rules that check relationships between input fields:

```json
{
  "name": "Validation Example",
  "input": {
    "gestational_age": {
      "label": "Gestational Age (weeks)",
      "type": "int",
      "min": 0,
      "max": 45
    },
    "birth_weight": {
      "label": "Birth Weight (g)",
      "type": "int",
      "min": 0
    }
  },
  "assert": [
    {
      "condition": "gestational_age >= 37 || birth_weight >= 2500",
      "message": "Either gestational age >= 37 weeks OR birth weight >= 2500g is required"
    }
  ]
}
```

## Test Cases

Formulas can include test cases for verification:

```json
{
  "name": "BMI (Adult)",
  "input": {
    "height": {
      "label": "Height (cm)",
      "type": "float",
      "min": 0,
      "max": 300
    },
    "weight": {
      "label": "Weight (kg)",
      "type": "float",
      "min": 0,
      "max": 500
    }
  },
  "output": {
    "bmi": {
      "label": "BMI",
      "formula": "weight / ((height / 100) ^ 2)",
      "precision": 1
    }
  },
  "test": [
    {
      "input": {"height": 170, "weight": 70},
      "output": {"bmi": 24.2}
    }
  ]
}
```

## Reference Links

Formulas can include reference links to literature:

```json
{
  "name": "Example Formula",
  "ref": {
    "PubMed": "https://pubmed.ncbi.nlm.nih.gov/12345678/",
    "DOI": "https://doi.org/10.1000/example"
  }
}
```

## HTML-Only Formulas

For reference charts and tables without calculations:

```json
{
  "type": "html",
  "name": "Reference Table",
  "info": "Quick reference chart",
  "html": "<table>...</table>"
}
```
