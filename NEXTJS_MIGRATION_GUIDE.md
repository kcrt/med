# Next.js Migration Guide for 医療計算機 (Medical Calculator)

**Document Version:** 1.0
**Date:** 2026-01-23
**Current App Version:** 0.4.2
**Target Framework:** Next.js 15+

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Application Analysis](#current-application-analysis)
3. [Technology Stack Comparison](#technology-stack-comparison)
4. [Architecture Migration Plan](#architecture-migration-plan)
5. [Detailed Component Migration](#detailed-component-migration)
6. [Data Structure Migration](#data-structure-migration)
7. [Dependencies & Libraries](#dependencies--libraries)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)
11. [Migration Timeline & Phases](#migration-timeline--phases)
12. [Risk Assessment & Mitigation](#risk-assessment--mitigation)

---

## Executive Summary

### Current Application Overview

**医療計算機 (Medical Calculator)** is a Japanese medical calculation application designed for healthcare professionals. It performs various clinical calculations including BMI, GFR, CHADS2 scores, and other medical formulas.

**Key Characteristics:**
- Zero-build, single-page application (SPA)
- Built with jQuery 2.1.4 and jQuery Mobile 1.4.5
- Data-driven architecture with JSON-based formula definitions
- Hybrid mobile app capability via PhoneGap/Cordova
- 60+ medical calculators across 5+ categories
- Fully client-side (no backend)
- Offline-capable
- Hosted at: http://app.kcrt.net/med/

### Migration Objectives

1. **Modernize** the tech stack to Next.js 15+ with React 18+
2. **Improve** performance, SEO, and mobile experience
3. **Maintain** 100% feature parity with existing application
4. **Enhance** code maintainability and testability
5. **Preserve** offline capability and mobile-first approach
6. **Eliminate** security risks (eval usage, jQuery dependencies)

---

## Current Application Analysis

### File Structure

```
/home/user/med/
├── index.html                 # 123 lines - Single HTML entry point
├── med.js                     # 485 lines - Core application logic
├── formula.json               # 708 lines - Medical calculation definitions
├── originalformula.json       # Backup formulas
├── config.xml                 # PhoneGap/Cordova configuration
├── README.md                  # Documentation (Japanese)
├── favicon32.png              # 32px favicon
├── favicon256.png             # 256px icon
├── startup_*.png              # 3 splash screens
├── lib/                       # Third-party libraries
│   ├── jquery-2.1.4.min.js
│   ├── jquery.mobile-1.4.5.min.js
│   ├── jquery.mobile-1.4.5.min.css
│   └── images/                # jQuery Mobile theme images
└── image/
    └── epidrug.png            # Medical reference image
```

### Technical Stack (Current)

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | jQuery Mobile | 1.4.5 |
| Library | jQuery | 2.1.4 |
| Language | JavaScript (ES5) | - |
| Build Tool | None | - |
| Module System | None (global variables) | - |
| Package Manager | None | - |
| Mobile Wrapper | PhoneGap/Cordova | 3.1+ |
| Styling | jQuery Mobile CSS | 1.4.5 |
| State Management | LocalStorage + global vars | - |
| Routing | Hash-based (jQuery Mobile) | - |

### Application Features

#### Core Pages
1. **Main Menu** (`#index`) - Filterable list of calculators
2. **Settings** (`#config`) - Transition effects, ISBN search preferences
3. **About** (`#about`) - Version info, credits, license

#### Calculator Categories (60+ calculators)

1. **救急医療 (Emergency Medicine)**
   - Japan Coma Scale (JCS)
   - Pediatric consciousness assessment

2. **身長と体重 (Height & Weight)**
   - BMI (adult & pediatric)
   - Body surface area (BSA) - 6 different formulas
   - Target height prediction
   - Gestational age calculation

3. **循環器 (Cardiology)**
   - CHADS2 score
   - Ejection fraction (EF)
   - Pediatric LVDd values
   - Coronary artery diameter (Kawasaki disease)

4. **内分泌・代謝 (Endocrinology & Metabolism)**
   - Osmotic pressure
   - HOMA-IR, HOMA-β
   - LDL cholesterol (Friedewald)
   - IGF-1 Z-Score

5. **腎機能 (Renal Function)**
   - CCr, eGFR (adult & pediatric)
   - Cystatin C-based GFR
   - FENa calculation
   - %TRP calculations

### Data Flow & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User loads index.html                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              JavaScript executes on page load                │
│  1. LoadSettings() - Read from localStorage                  │
│  2. SetSettingsForm() - Apply saved settings                 │
│  3. $.getJSON("formula.json") - Load calculator data         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           onFormulaJsonReady() - Process JSON data           │
│  1. Parse menu structure                                     │
│  2. Generate main menu list                                  │
│  3. Generate calculator pages dynamically                    │
│  4. Append all pages to DOM                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            User navigates via hash-based routing             │
│  jQuery Mobile handles page transitions                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              User fills calculator inputs                    │
│  Clicks "計算" (Calculate) button                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Calc(formulaId) function executes               │
│  1. Collect input values                                     │
│  2. Validate inputs (min/max checks)                         │
│  3. Build eval string with variables                         │
│  4. Execute formulas via eval()                              │
│  5. Display results in textarea                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Code Patterns

#### 1. Dynamic Page Generation (med.js:43-191)

```javascript
function generateFormula(Name, f) {
    var formula = formuladata.formula[f];
    var pagedom = $('<div data-role="page">');

    // Generate inputs based on type
    for(var itemstr in formula.input) {
        var item = formula.input[itemstr];
        switch(item.type) {
            case "float": // number input
            case "sex":   // radio buttons
            case "select": // dropdown
            case "slider": // range slider
            case "date":  // date picker
            // ... etc
        }
    }

    // Add calculation button
    // Add output textarea
    // Add references

    return pagedom;
}
```

#### 2. Formula Calculation Engine (med.js:193-285)

```javascript
function Calc(f) {
    var d = [];
    var formula = formuladata.formula[f];

    // Collect inputs
    for(itemstr in formula.input) {
        switch(item.type) {
            case "float":
                d[itemstr] = GetFloat(id, item.min, item.max);
                break;
            case "sex":
                d[itemstr] = GetSex(id);
                break;
        }
    }

    // Build eval string
    var valdim = "";
    for(var key in d) {
        valdim += "var " + key + ' = ' + d[key] + ';';
    }

    // Execute formulas using eval()
    for(itemstr in formula.output) {
        if(item.formula) {
            code = "(function(){" + valdim + " return (" + item.formula + ");})()";
            value = eval(code);  // ⚠️ SECURITY RISK
        }
    }
}
```

#### 3. Settings Management (med.js:287-336)

```javascript
function LoadSettings() {
    if(typeof JSON == 'undefined' || typeof window.localStorage == 'undefined') {
        settings = {};
    } else {
        settings = JSON.parse(window.localStorage.settings || '{}');
    }

    // Defaults
    settings.defaultPageTransition = settings.defaultPageTransition || "slide";
    settings.ISBNLink = settings.ISBNLink || "amazon";
}
```

### Data Structure: formula.json

#### Schema Overview

```typescript
{
  "menu": {
    "CategoryName": {
      "CalculatorTitle": {
        "info": "Description text",
        "id": "calculator_id" | "http://external-url"
      }
    }
  },
  "formula": {
    "calculator_id": {
      // Type 1: HTML content
      "type": "html",
      "html": "<div>...</div>",
      "ref": { "RefName": "url" }

      // Type 2: Image display
      "type": "image",
      "src": "image_path",
      "ref": { "RefName": "url" }

      // Type 3: Interactive calculator
      "input": {
        "variableName": {
          "name": "Display Label",
          "type": "float" | "text" | "sex" | "select" | "slider" | "date" | "onoff" | "info" | "html",
          "min": number,
          "max": number,
          "placeholder": string,
          // type-specific options...
        }
      },
      "output": {
        "outputVariable": {
          "name": "Output Label" | "hidden",
          "formula": "mathematical_expression",
          "code": "javascript_code_block",
          "text": "static_text",
          "toFixed": number | ""
        }
      },
      "ref": {
        "Reference Title": "url" | "isbn:code" | "pubmed:id" | "doi:identifier" | ""
      }
    }
  }
}
```

#### Input Field Types

| Type | Purpose | Options | Variable Type |
|------|---------|---------|---------------|
| `float` | Numeric input | min, max, placeholder | number |
| `text` | Text input | placeholder | string |
| `sex` | Gender selector | (none) | 1=male, 0=female |
| `select` | Dropdown | item: {label: value} | number/string |
| `slider` | Range slider | min, max, value | number |
| `date` | Date picker | default | milliseconds |
| `onoff` | Toggle switch | on, off | 1/0 |
| `info` | Static text | text | (no variable) |
| `html` | HTML content | html | (no variable) |

#### Output Types

| Property | Purpose | Behavior |
|----------|---------|----------|
| `formula` | Math expression | Evaluated with input vars as context |
| `code` | JavaScript code | Must return value; has access to all vars |
| `text` | Static text | Displayed as-is |
| `toFixed` | Decimal places | Number formatting (default: 2) |
| `name: "hidden"` | Hidden output | Used in multi-step calculations |

#### Reference Link Formats

- `"url"` → Direct link
- `"isbn:1234567890"` → Amazon/Google Books/NDL/Calil (user preference)
- `"pubmed:12345678"` → PubMed link
- `"doi:10.1000/xyz"` → DOI resolver
- `""` (empty) → No link, text only

#### Example Formula Definition

```json
{
  "bmi_adult": {
    "input": {
      "height": {
        "name": "身長[cm]",
        "type": "float",
        "min": 30,
        "max": 300
      },
      "weight": {
        "name": "体重[kg]",
        "type": "float",
        "min": 3,
        "max": 300
      }
    },
    "output": {
      "BMI": {
        "name": "BMI",
        "formula": "weight/(height/100)/(height/100)"
      },
      "who": {
        "name": "WHO(世界保健機関)",
        "text": "≧25: overwight, ≧30: obese"
      }
    },
    "ref": {
      "Wikipedia": "http://ja.wikipedia.org/wiki/..."
    }
  }
}
```

### Custom Helper Functions (med.js:424-485)

These functions are available in formula `code` blocks:

```javascript
// Z-Score calculations
GetZScore(value, average, sd) → number
GetZScoreStr(value, average, sd) → formatted string

// Body surface area
BSA_DuBois(height, weight) → number (m²)

// Statistical functions
erf(x) → error function
GetZScoreFromLMS(value, l, m, s) → Z-Score from LMS method
GetPercentileFromZScore(sd) → percentile (0-100)
GetValueFromZScore(zscore, l, m, s) → value from Z-Score
```

---

## Technology Stack Comparison

### Proposed Next.js Stack

| Component | Current | Next.js Migration |
|-----------|---------|-------------------|
| **Framework** | jQuery Mobile 1.4.5 | Next.js 15+ with App Router |
| **UI Library** | jQuery 2.1.4 | React 18+ |
| **Language** | ES5 JavaScript | TypeScript 5+ |
| **Styling** | jQuery Mobile CSS | Tailwind CSS + shadcn/ui |
| **Build Tool** | None | Next.js (Turbopack) |
| **Package Manager** | None | pnpm / npm / yarn |
| **State Management** | Global vars + localStorage | React Context + localStorage |
| **Routing** | Hash-based (#page) | Next.js App Router (file-based) |
| **Forms** | jQuery selectors | React Hook Form + Zod |
| **Data Fetching** | $.getJSON | Static import / dynamic import |
| **PWA Support** | Manual | next-pwa plugin |
| **Mobile Wrapper** | PhoneGap/Cordova | Capacitor (optional) |
| **Testing** | None | Vitest + React Testing Library |
| **Code Quality** | None | ESLint + Prettier + TypeScript |

### Why Next.js?

**Advantages for this project:**

1. **Static Site Generation (SSG)**
   - Perfect for calculator app with no backend
   - Formula data can be bundled at build time
   - Excellent performance and SEO

2. **React Component Model**
   - Replace jQuery DOM manipulation with declarative UI
   - Reusable calculator components
   - Better code organization

3. **Modern Developer Experience**
   - TypeScript for type safety
   - Hot module replacement
   - Built-in optimization

4. **Progressive Web App (PWA)**
   - Easy offline support with next-pwa
   - Service worker generation
   - App-like experience

5. **Mobile-First**
   - Responsive by default with Tailwind
   - Touch-friendly components
   - Can still wrap with Capacitor for native apps

6. **SEO & Performance**
   - Pre-rendered pages
   - Automatic code splitting
   - Image optimization
   - Lighthouse scores 90+

---

## Architecture Migration Plan

### Directory Structure (Next.js 15 App Router)

```
medical-calculator/
├── public/
│   ├── favicon.ico
│   ├── icons/
│   │   ├── icon-32.png
│   │   ├── icon-256.png
│   │   └── apple-touch-icon.png
│   ├── splash/
│   │   └── startup_*.png
│   └── images/
│       └── epidrug.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Home page (calculator list)
│   │   ├── settings/
│   │   │   └── page.tsx               # Settings page
│   │   ├── about/
│   │   │   └── page.tsx               # About page
│   │   └── calculator/
│   │       └── [id]/
│   │           └── page.tsx           # Dynamic calculator page
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx             # App header with nav
│   │   │   ├── Footer.tsx             # App footer
│   │   │   └── Navigation.tsx         # Navigation component
│   │   ├── calculator/
│   │   │   ├── CalculatorList.tsx     # Filterable calculator list
│   │   │   ├── CalculatorCard.tsx     # Calculator menu item
│   │   │   ├── CalculatorForm.tsx     # Generic calculator form
│   │   │   ├── InputField.tsx         # Dynamic input renderer
│   │   │   ├── OutputDisplay.tsx      # Results display
│   │   │   ├── ReferenceLinks.tsx     # Reference section
│   │   │   ├── HtmlContent.tsx        # HTML type calculator
│   │   │   └── ImageContent.tsx       # Image type calculator
│   │   └── providers/
│   │       └── SettingsProvider.tsx   # Settings context
│   ├── lib/
│   │   ├── calculator/
│   │   │   ├── engine.ts              # Formula evaluation engine
│   │   │   ├── validators.ts          # Input validation
│   │   │   └── helpers.ts             # Helper functions (GetZScore, etc.)
│   │   ├── settings.ts                # Settings management
│   │   ├── utils.ts                   # Utility functions
│   │   └── constants.ts               # Constants
│   ├── data/
│   │   ├── formulas.json              # Migrated formula.json
│   │   └── formulas.ts                # TypeScript types for formulas
│   ├── types/
│   │   ├── calculator.ts              # Calculator type definitions
│   │   ├── formula.ts                 # Formula type definitions
│   │   └── settings.ts                # Settings type definitions
│   └── styles/
│       └── globals.css                # Global styles + Tailwind
├── tests/
│   ├── unit/
│   │   ├── calculator-engine.test.ts
│   │   └── helpers.test.ts
│   └── e2e/
│       └── calculator.spec.ts
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Architectural Patterns

#### 1. Component Hierarchy

```
App (layout.tsx)
├── Header
│   ├── Navigation
│   └── Settings Link
├── Main Content (page.tsx)
│   ├── Home Page
│   │   └── CalculatorList
│   │       └── CalculatorCard[]
│   ├── Calculator Page
│   │   ├── CalculatorForm
│   │   │   ├── InputField[] (dynamic)
│   │   │   ├── Calculate Button
│   │   │   └── OutputDisplay
│   │   └── ReferenceLinks
│   ├── Settings Page
│   │   └── Settings Form
│   └── About Page
│       └── Version Info
└── Footer
```

#### 2. State Management

```typescript
// Global Settings Context
SettingsProvider
├── defaultPageTransition: string
├── ISBNLink: string
└── actions: { updateSettings, resetSettings }

// Calculator Page State (React useState)
CalculatorForm
├── inputValues: Record<string, any>
├── outputValues: Record<string, any>
├── errors: Record<string, string>
└── isCalculating: boolean
```

#### 3. Data Flow

```
Build Time:
  formulas.json → Static Import → Type Generation
                       ↓
                   SSG Pages
                       ↓
                  Static HTML

Runtime:
  User Input → Validation → Calculation Engine → Output Display
       ↓
  localStorage ← Settings Context → UI Updates
```

---

## Detailed Component Migration

### 1. Main Menu / Home Page

**Current:** `index.html` lines 47-54, `med.js` lines 10-41

**Migration to:** `src/app/page.tsx`

```typescript
// src/app/page.tsx
import { CalculatorList } from '@/components/calculator/CalculatorList';
import { getFormulas } from '@/lib/calculator/data';

export default function HomePage() {
  const formulas = getFormulas();

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">医療計算機</h1>
      <CalculatorList formulas={formulas} />
    </main>
  );
}
```

```typescript
// src/components/calculator/CalculatorList.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CalculatorCard } from './CalculatorCard';
import type { FormulaMenu } from '@/types/formula';

export function CalculatorList({ formulas }: { formulas: FormulaMenu }) {
  const [filter, setFilter] = useState('');

  const filteredItems = Object.entries(formulas.menu).flatMap(([category, items]) =>
    Object.entries(items)
      .filter(([title, item]) =>
        title.toLowerCase().includes(filter.toLowerCase()) ||
        item.info.toLowerCase().includes(filter.toLowerCase()) ||
        category.toLowerCase().includes(filter.toLowerCase())
      )
      .map(([title, item]) => ({ category, title, ...item }))
  );

  return (
    <div>
      <Input
        type="search"
        placeholder="検索..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />

      {Object.entries(formulas.menu).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h2 className="text-lg font-semibold mb-2 px-4 py-2 bg-muted">
            {category}
          </h2>
          <div className="space-y-1">
            {Object.entries(items)
              .filter(([title]) =>
                filteredItems.some(item => item.title === title)
              )
              .map(([title, item]) => (
                <CalculatorCard
                  key={item.id}
                  title={title}
                  info={item.info}
                  id={item.id}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Calculator Pages

**Current:** `med.js` lines 43-191 (dynamic generation)

**Migration to:** `src/app/calculator/[id]/page.tsx`

```typescript
// src/app/calculator/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getFormulas, getFormulaById } from '@/lib/calculator/data';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { HtmlContent } from '@/components/calculator/HtmlContent';
import { ImageContent } from '@/components/calculator/ImageContent';

export async function generateStaticParams() {
  const formulas = getFormulas();
  return Object.keys(formulas.formula).map((id) => ({ id }));
}

export default function CalculatorPage({ params }: { params: { id: string } }) {
  const formula = getFormulaById(params.id);

  if (!formula) {
    notFound();
  }

  const title = getFormulaTitle(params.id);

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {formula.type === 'html' && <HtmlContent html={formula.html} />}
      {formula.type === 'image' && <ImageContent src={formula.src} />}
      {!formula.type && <CalculatorForm formula={formula} formulaId={params.id} />}

      {formula.ref && <ReferenceLinks references={formula.ref} />}
    </div>
  );
}
```

### 3. Calculator Form Component

**Current:** `med.js` lines 62-137 (input generation), 193-285 (calculation)

**Migration to:** `src/components/calculator/CalculatorForm.tsx`

```typescript
// src/components/calculator/CalculatorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { InputField } from './InputField';
import { OutputDisplay } from './OutputDisplay';
import { calculateFormula } from '@/lib/calculator/engine';
import { createValidationSchema } from '@/lib/calculator/validators';
import type { Formula } from '@/types/formula';

interface CalculatorFormProps {
  formula: Formula;
  formulaId: string;
}

export function CalculatorForm({ formula, formulaId }: CalculatorFormProps) {
  const [output, setOutput] = useState<Record<string, any>>({});
  const [showOutput, setShowOutput] = useState(false);

  const schema = createValidationSchema(formula.input);
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    try {
      const results = calculateFormula(formula, data);
      setOutput(results);
      setShowOutput(true);
    } catch (error) {
      console.error('Calculation error:', error);
      // Handle error
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {Object.entries(formula.input).map(([fieldName, fieldConfig]) => (
        <InputField
          key={fieldName}
          name={fieldName}
          config={fieldConfig}
          form={form}
          formulaId={formulaId}
        />
      ))}

      <Button type="submit" className="w-full">
        計算
      </Button>

      {showOutput && (
        <OutputDisplay
          output={output}
          outputConfig={formula.output}
        />
      )}
    </form>
  );
}
```

### 4. Input Field Component (Dynamic)

**Current:** `med.js` lines 62-132 (switch statement for different types)

**Migration to:** `src/components/calculator/InputField.tsx`

```typescript
// src/components/calculator/InputField.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { InputConfig } from '@/types/formula';
import type { UseFormReturn } from 'react-hook-form';

interface InputFieldProps {
  name: string;
  config: InputConfig;
  form: UseFormReturn<any>;
  formulaId: string;
}

export function InputField({ name, config, form, formulaId }: InputFieldProps) {
  const fieldId = `${formulaId}_${name}`;
  const { register, setValue, watch, formState: { errors } } = form;

  const renderInput = () => {
    switch (config.type) {
      case 'float':
      case 'text':
        return (
          <Input
            id={fieldId}
            type={config.type === 'float' ? 'number' : 'text'}
            placeholder={config.placeholder}
            {...register(name, { valueAsNumber: config.type === 'float' })}
            min={config.min}
            max={config.max}
            step={config.type === 'float' ? 'any' : undefined}
          />
        );

      case 'sex':
        return (
          <RadioGroup
            onValueChange={(value) => setValue(name, parseInt(value))}
            defaultValue="1"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id={`${fieldId}_m`} />
                <Label htmlFor={`${fieldId}_m`}>男</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id={`${fieldId}_f`} />
                <Label htmlFor={`${fieldId}_f`}>女</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case 'select':
        return (
          <Select onValueChange={(value) => setValue(name, value)}>
            <SelectTrigger>
              <SelectValue placeholder={`${config.name}を選択`} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(config.item).map(([label, value]) => (
                <SelectItem key={label} value={String(value)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'slider':
        const sliderValue = watch(name) || config.value || config.min || 0;
        return (
          <div className="space-y-2">
            <Slider
              min={config.min || 0}
              max={config.max || 100}
              step={1}
              value={[sliderValue]}
              onValueChange={(value) => setValue(name, value[0])}
            />
            <div className="text-sm text-muted-foreground text-center">
              {sliderValue}
            </div>
          </div>
        );

      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            {...register(name, {
              setValueAs: (value) => new Date(value).getTime()
            })}
          />
        );

      case 'onoff':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={fieldId}
              onCheckedChange={(checked) => setValue(name, checked ? 1 : 0)}
            />
            <Label htmlFor={fieldId}>
              {watch(name) ? (config.on || 'Yes') : (config.off || 'No')}
            </Label>
          </div>
        );

      case 'info':
        return (
          <div className="text-sm text-muted-foreground">
            {config.text}
          </div>
        );

      case 'html':
        return (
          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: config.html }}
          />
        );

      default:
        return <div>Unsupported type: {config.type}</div>;
    }
  };

  return (
    <div className="space-y-2">
      {!['info', 'html'].includes(config.type) && (
        <Label htmlFor={fieldId}>{config.name}</Label>
      )}
      {renderInput()}
      {errors[name] && (
        <p className="text-sm text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
```

### 5. Calculator Engine (Formula Evaluation)

**Current:** `med.js` lines 193-285 (uses `eval()`)

**Migration to:** `src/lib/calculator/engine.ts` (NO eval, use Function constructor with sandboxing)

```typescript
// src/lib/calculator/engine.ts
import * as helpers from './helpers';
import type { Formula, OutputConfig } from '@/types/formula';

/**
 * Safely evaluates mathematical formulas without using eval()
 * Uses Function constructor with controlled scope
 */
export function calculateFormula(
  formula: Formula,
  inputValues: Record<string, any>
): Record<string, any> {
  const results: Record<string, any> = {};

  // Create safe context with input values and helper functions
  const context = {
    ...inputValues,
    ...helpers,
    Math,
  };

  // Process outputs in order (some may depend on previous outputs)
  for (const [outputName, outputConfig] of Object.entries(formula.output)) {
    try {
      let value: any;

      if (outputConfig.text) {
        // Static text
        value = outputConfig.text;
      } else if (outputConfig.formula) {
        // Mathematical formula
        value = evaluateFormula(outputConfig.formula, context);
      } else if (outputConfig.code) {
        // JavaScript code block
        value = evaluateCode(outputConfig.code, context);
      }

      // Format number output
      if (typeof value === 'number') {
        const toFixed = outputConfig.toFixed !== undefined ? outputConfig.toFixed : 2;
        if (toFixed !== '') {
          value = Number(value.toFixed(toFixed));
        }
      }

      results[outputName] = value;

      // Add to context for subsequent calculations
      context[outputName] = value;

    } catch (error) {
      console.error(`Error calculating ${outputName}:`, error);
      throw new Error(`計算エラー: ${outputName}`);
    }
  }

  return results;
}

/**
 * Safely evaluate a formula expression
 * Example: "weight / (height / 100) / (height / 100)"
 */
function evaluateFormula(formula: string, context: Record<string, any>): any {
  // Create function with context variables as parameters
  const paramNames = Object.keys(context);
  const paramValues = Object.values(context);

  try {
    // Use Function constructor instead of eval (still needs sandboxing!)
    const func = new Function(...paramNames, `"use strict"; return (${formula});`);
    return func(...paramValues);
  } catch (error) {
    console.error('Formula evaluation error:', error);
    throw error;
  }
}

/**
 * Safely evaluate code block
 * Example: "if (x > 10) { return 'high'; } else { return 'low'; }"
 */
function evaluateCode(code: string, context: Record<string, any>): any {
  const paramNames = Object.keys(context);
  const paramValues = Object.values(context);

  try {
    const func = new Function(...paramNames, `"use strict"; ${code}`);
    return func(...paramValues);
  } catch (error) {
    console.error('Code evaluation error:', error);
    throw error;
  }
}
```

### 6. Helper Functions

**Current:** `med.js` lines 424-485

**Migration to:** `src/lib/calculator/helpers.ts`

```typescript
// src/lib/calculator/helpers.ts

export function GetZScore(value: number, average: number, sd: number): number {
  return (value - average) / sd;
}

export function GetZScoreStr(value: number, average: number, sd: number): string {
  const zscore = GetZScore(value, average, sd);
  const formatted = zscore.toFixed(2);

  if (zscore === 0) {
    return `${value} ( ±0.00 SD )`;
  } else if (zscore > 0) {
    return `${value} ( +${formatted} SD )`;
  } else {
    return `${value} ( ${formatted} SD )`;
  }
}

export function BSA_DuBois(height: number, weight: number): number {
  return 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);
}

export function erf(x: number): number {
  // Error function approximation
  // erf(x) = 2/sqrt(pi) * integrate(from=0, to=x, e^-(t^2) ) dt
  let m = 1.0;
  let s = 1.0;
  let sum = x * 1.0;

  for (let i = 1; i < 50; i++) {
    m *= i;
    s *= -1;
    sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0));
  }

  return (2 * sum) / Math.sqrt(Math.PI);
}

export function GetZScoreFromLMS(
  value: number,
  l: number,
  m: number,
  s: number
): number {
  if (l === 0) {
    return Math.log(value / m) / s;
  } else {
    return (Math.pow(value / m, l) - 1) / (l * s);
  }
}

export function GetPercentileFromZScore(sd: number): number {
  const area = erf(sd / Math.SQRT2) / 2;
  return 50 + area * 100;
}

export function GetValueFromZScore(
  zscore: number,
  l: number,
  m: number,
  s: number
): number {
  if (l === 0) {
    return Math.exp(zscore * s) * m;
  } else {
    return Math.pow(zscore * l * s + 1, 1.0 / l) * m;
  }
}
```

### 7. Settings Page

**Current:** `index.html` lines 56-88, `med.js` lines 287-336

**Migration to:** `src/app/settings/page.tsx`

```typescript
// src/app/settings/page.tsx
'use client';

import { useSettings } from '@/components/providers/SettingsProvider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleSave = () => {
    // Settings are auto-saved in context
    alert('設定しました。');
  };

  const handleClear = () => {
    if (confirm('設定をクリアしてもよろしいですか？')) {
      resetSettings();
      alert('設定をクリアしました。');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>画面遷移</Label>
          <Select
            value={settings.defaultPageTransition}
            onValueChange={(value) => updateSettings({ defaultPageTransition: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">遷移なし</SelectItem>
              <SelectItem value="fade">フェード</SelectItem>
              <SelectItem value="slide">スライド (標準)</SelectItem>
              <SelectItem value="slideup">下から上へ</SelectItem>
              <SelectItem value="slidedown">上から下へ</SelectItem>
              <SelectItem value="pop">広がる</SelectItem>
              <SelectItem value="flip">めくる</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            画面遷移は機器が対応していない場合は自動的にフェードスタイルとなります。
            また、機種によってはちらつきの原因となる場合があります。
          </p>
        </div>

        <div className="space-y-2">
          <Label>書籍の検索</Label>
          <Select
            value={settings.ISBNLink}
            onValueChange={(value) => updateSettings({ ISBNLink: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amazon">Amazon.co.jp (標準設定)</SelectItem>
              <SelectItem value="amazonaa">Amazon.co.jp アフェリエイトあり</SelectItem>
              <SelectItem value="googlebooks">Google Books</SelectItem>
              <SelectItem value="ndl-opac">国立国会図書館</SelectItem>
              <SelectItem value="calil">カーリル (全国図書館横断検索)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1">
            設定
          </Button>
          <Button onClick={handleClear} variant="destructive" className="flex-1">
            クリア
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          一部の項目は再起動まで有効になりません。
        </p>
      </div>
    </div>
  );
}
```

### 8. Settings Context Provider

**Current:** Global `settings` variable + localStorage

**Migration to:** `src/components/providers/SettingsProvider.tsx`

```typescript
// src/components/providers/SettingsProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Settings {
  defaultPageTransition: string;
  ISBNLink: string;
  firstVersion?: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  defaultPageTransition: 'slide',
  ISBNLink: 'amazon',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('settings');
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem('settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('settings');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
```

---

## Data Structure Migration

### TypeScript Type Definitions

**Create:** `src/types/formula.ts`

```typescript
// src/types/formula.ts

export type InputType =
  | 'float'
  | 'text'
  | 'sex'
  | 'select'
  | 'slider'
  | 'date'
  | 'onoff'
  | 'info'
  | 'html'
  | 'datetime';

export interface BaseInputConfig {
  name: string;
  type: InputType;
}

export interface FloatInputConfig extends BaseInputConfig {
  type: 'float';
  min: number;
  max: number;
  placeholder?: string;
}

export interface TextInputConfig extends BaseInputConfig {
  type: 'text';
  placeholder?: string;
}

export interface SexInputConfig extends BaseInputConfig {
  type: 'sex';
}

export interface SelectInputConfig extends BaseInputConfig {
  type: 'select';
  item: Record<string, string | number>;
}

export interface SliderInputConfig extends BaseInputConfig {
  type: 'slider';
  min?: number;
  max?: number;
  value?: number;
}

export interface DateInputConfig extends BaseInputConfig {
  type: 'date';
  default?: string;
}

export interface OnOffInputConfig extends BaseInputConfig {
  type: 'onoff';
  on?: string;
  off?: string;
}

export interface InfoInputConfig extends BaseInputConfig {
  type: 'info';
  text: string;
}

export interface HtmlInputConfig extends BaseInputConfig {
  type: 'html';
  html: string;
}

export type InputConfig =
  | FloatInputConfig
  | TextInputConfig
  | SexInputConfig
  | SelectInputConfig
  | SliderInputConfig
  | DateInputConfig
  | OnOffInputConfig
  | InfoInputConfig
  | HtmlInputConfig;

export interface OutputConfig {
  name: string;
  formula?: string;
  code?: string;
  text?: string;
  toFixed?: number | '';
}

export interface HtmlFormula {
  type: 'html';
  html: string;
  ref?: Record<string, string>;
}

export interface ImageFormula {
  type: 'image';
  src: string;
  ref?: Record<string, string>;
}

export interface CalculatorFormula {
  input: Record<string, InputConfig>;
  output: Record<string, OutputConfig>;
  ref?: Record<string, string>;
}

export type Formula = HtmlFormula | ImageFormula | CalculatorFormula;

export interface MenuItemConfig {
  info: string;
  id: string;
}

export interface FormulaData {
  menu: Record<string, Record<string, MenuItemConfig>>;
  formula: Record<string, Formula>;
}
```

### JSON Data Migration

**Current:** `formula.json`
**New:** `src/data/formulas.json` (identical structure, with validation)

**Add validation script:** `scripts/validate-formulas.ts`

```typescript
// scripts/validate-formulas.ts
import fs from 'fs';
import { z } from 'zod';

// Define Zod schema for validation
const inputConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('float'),
    name: z.string(),
    min: z.number(),
    max: z.number(),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal('sex'),
    name: z.string(),
  }),
  // ... other types
]);

const formulaSchema = z.union([
  z.object({
    type: z.literal('html'),
    html: z.string(),
    ref: z.record(z.string()).optional(),
  }),
  z.object({
    type: z.literal('image'),
    src: z.string(),
    ref: z.record(z.string()).optional(),
  }),
  z.object({
    input: z.record(inputConfigSchema),
    output: z.record(z.object({
      name: z.string(),
      formula: z.string().optional(),
      code: z.string().optional(),
      text: z.string().optional(),
      toFixed: z.union([z.number(), z.literal('')]).optional(),
    })),
    ref: z.record(z.string()).optional(),
  }),
]);

const formulaDataSchema = z.object({
  menu: z.record(z.record(z.object({
    info: z.string(),
    id: z.string(),
  }))),
  formula: z.record(formulaSchema),
});

// Validate
const data = JSON.parse(fs.readFileSync('./src/data/formulas.json', 'utf-8'));
const result = formulaDataSchema.safeParse(data);

if (!result.success) {
  console.error('Validation failed:');
  console.error(result.error.format());
  process.exit(1);
} else {
  console.log('✓ formulas.json is valid');
}
```

---

## Dependencies & Libraries

### package.json

```json
{
  "name": "medical-calculator",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "validate-formulas": "tsx scripts/validate-formulas.ts",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.7.0",
    "class-variance-authority": "^0.7.1",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-radio-group": "^1.2.2",
    "@radix-ui/react-switch": "^1.1.2",
    "lucide-react": "^0.468.0",
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.0",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "@typescript-eslint/parser": "^8.20.0",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "playwright": "^1.49.1",
    "tsx": "^4.19.2"
  }
}
```

### Dependency Mapping

| Current | Purpose | Next.js Replacement |
|---------|---------|-------------------|
| jQuery 2.1.4 | DOM manipulation | React (declarative UI) |
| jQuery Mobile 1.4.5 | Mobile UI framework | Tailwind CSS + shadcn/ui |
| None | Routing | Next.js App Router |
| None | State management | React Context + hooks |
| None | Forms | React Hook Form + Zod |
| None | Type safety | TypeScript |
| None | Build tool | Next.js (Turbopack) |
| PhoneGap/Cordova | Native wrapper | Capacitor (optional) |
| None | PWA | next-pwa |
| None | Testing | Vitest + Playwright |

### Additional Tools

- **shadcn/ui**: Pre-built accessible components (Radix UI + Tailwind)
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: Schema validation for forms and data
- **React Hook Form**: Performant form library
- **Lucide React**: Icon library (modern replacement for icon fonts)
- **next-pwa**: Service worker and PWA manifest generation

---

## Security Considerations

### Critical Security Issues in Current Code

#### 1. ⚠️ Use of `eval()` (med.js:255, 258)

**Risk:** Arbitrary code execution, XSS vulnerabilities

**Current Code:**
```javascript
code = "(function(){" + valdim + " return (" + item.formula + ");})()";
value = eval(code);  // DANGEROUS!
```

**Issue:**
- If `formula.json` is compromised, malicious code can execute
- No sandboxing or input sanitization
- Full access to global scope

**Mitigation in Next.js:**

```typescript
// Use Function constructor with controlled scope (safer than eval)
function evaluateFormula(formula: string, context: Record<string, any>): any {
  const paramNames = Object.keys(context);
  const paramValues = Object.values(context);

  // Whitelist allowed Math functions
  const allowedMath = {
    pow: Math.pow,
    sqrt: Math.sqrt,
    log: Math.log,
    exp: Math.exp,
    floor: Math.floor,
    // ... only what's needed
  };

  // Create safe context
  const safeContext = {
    ...context,
    Math: allowedMath,
  };

  try {
    // Still uses Function constructor but with restricted scope
    const func = new Function(
      ...Object.keys(safeContext),
      `"use strict"; return (${formula});`
    );
    return func(...Object.values(safeContext));
  } catch (error) {
    throw new Error('Invalid formula');
  }
}
```

**Better Alternative:** Use a proper expression parser like `mathjs` or `expr-eval`:

```typescript
import { parse } from 'expr-eval';

function evaluateFormula(formula: string, context: Record<string, any>): any {
  const parser = new Parser();
  const expr = parser.parse(formula);
  return expr.evaluate(context);
}
```

#### 2. ⚠️ No Input Sanitization

**Risk:** XSS through HTML injection in references, info fields

**Current Code:**
```javascript
$(formula.html).appendTo(contentdom);  // Direct HTML injection
```

**Mitigation:**
- Use React's built-in XSS protection (automatic escaping)
- Only use `dangerouslySetInnerHTML` for trusted content
- Sanitize HTML with DOMPurify for user-generated content

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function HtmlContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h3', 'ul', 'li', 'p', 'a', 'br'],
    ALLOWED_ATTR: ['href'],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

#### 3. ⚠️ External Links Without Validation

**Current Code:**
```javascript
if(id.match(/^http:/) || id.match(/^https:/)){
  formuladom = $('<li><a href="' + id + '" rel="external">...');
}
```

**Mitigation:**
- Validate URLs before rendering
- Use Next.js Link component with security headers
- Add `rel="noopener noreferrer"` for external links

```typescript
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  if (!isValidUrl(href)) {
    return <span>{children}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
}
```

### Security Headers (next.config.js)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### Content Security Policy

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('x-nonce', nonce);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Test calculator engine:**

```typescript
// tests/unit/calculator-engine.test.ts
import { describe, it, expect } from 'vitest';
import { calculateFormula } from '@/lib/calculator/engine';

describe('Calculator Engine', () => {
  it('should calculate BMI correctly', () => {
    const formula = {
      input: {
        height: { name: '身長', type: 'float', min: 0, max: 300 },
        weight: { name: '体重', type: 'float', min: 0, max: 300 },
      },
      output: {
        BMI: {
          name: 'BMI',
          formula: 'weight/(height/100)/(height/100)',
          toFixed: 2,
        },
      },
    };

    const result = calculateFormula(formula, { height: 170, weight: 70 });

    expect(result.BMI).toBeCloseTo(24.22, 2);
  });

  it('should handle formulas with dependencies', () => {
    const formula = {
      input: {
        x: { name: 'X', type: 'float', min: 0, max: 100 },
      },
      output: {
        squared: { name: 'X²', formula: 'x * x' },
        cubed: { name: 'X³', formula: 'squared * x' },
      },
    };

    const result = calculateFormula(formula, { x: 5 });

    expect(result.squared).toBe(25);
    expect(result.cubed).toBe(125);
  });
});
```

**Test helper functions:**

```typescript
// tests/unit/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { GetZScore, BSA_DuBois, erf } from '@/lib/calculator/helpers';

describe('Helper Functions', () => {
  it('GetZScore should calculate correctly', () => {
    expect(GetZScore(110, 100, 10)).toBe(1);
    expect(GetZScore(90, 100, 10)).toBe(-1);
  });

  it('BSA_DuBois should calculate body surface area', () => {
    const bsa = BSA_DuBois(170, 70);
    expect(bsa).toBeCloseTo(1.8, 1);
  });

  it('erf should approximate error function', () => {
    expect(erf(0)).toBeCloseTo(0, 5);
    expect(erf(1)).toBeCloseTo(0.8427, 3);
  });
});
```

### Component Tests (React Testing Library)

```typescript
// tests/unit/CalculatorForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';

describe('CalculatorForm', () => {
  const bmiFormula = {
    input: {
      height: { name: '身長[cm]', type: 'float', min: 30, max: 300 },
      weight: { name: '体重[kg]', type: 'float', min: 3, max: 300 },
    },
    output: {
      BMI: { name: 'BMI', formula: 'weight/(height/100)/(height/100)' },
    },
  };

  it('should render input fields', () => {
    render(<CalculatorForm formula={bmiFormula} formulaId="bmi" />);

    expect(screen.getByLabelText('身長[cm]')).toBeInTheDocument();
    expect(screen.getByLabelText('体重[kg]')).toBeInTheDocument();
  });

  it('should calculate and display results', async () => {
    render(<CalculatorForm formula={bmiFormula} formulaId="bmi" />);

    fireEvent.change(screen.getByLabelText('身長[cm]'), { target: { value: '170' } });
    fireEvent.change(screen.getByLabelText('体重[kg]'), { target: { value: '70' } });
    fireEvent.click(screen.getByText('計算'));

    await waitFor(() => {
      expect(screen.getByText(/BMI/)).toBeInTheDocument();
      expect(screen.getByText(/24\.22/)).toBeInTheDocument();
    });
  });

  it('should validate input ranges', async () => {
    render(<CalculatorForm formula={bmiFormula} formulaId="bmi" />);

    fireEvent.change(screen.getByLabelText('身長[cm]'), { target: { value: '500' } });
    fireEvent.click(screen.getByText('計算'));

    await waitFor(() => {
      expect(screen.getByText(/エラー/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/calculator.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Medical Calculator E2E', () => {
  test('should navigate to calculator and perform calculation', async ({ page }) => {
    await page.goto('/');

    // Search for BMI calculator
    await page.fill('input[type="search"]', 'BMI');

    // Click on adult BMI calculator
    await page.click('text=体格指数(成人)');

    // Wait for navigation
    await expect(page).toHaveURL(/\/calculator\/bmi_adult/);

    // Fill in inputs
    await page.fill('input[type="number"][name*="height"]', '170');
    await page.fill('input[type="number"][name*="weight"]', '70');

    // Click calculate
    await page.click('button:has-text("計算")');

    // Verify result
    await expect(page.locator('text=/BMI.*24\\.22/')).toBeVisible();
  });

  test('should save settings', async ({ page }) => {
    await page.goto('/settings');

    // Change transition setting
    await page.click('text=画面遷移');
    await page.click('text=フェード');

    // Save
    await page.click('button:has-text("設定")');

    // Verify alert
    await expect(page.locator('text=設定しました')).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(page.locator('text=フェード')).toBeVisible();
  });

  test('should work offline (PWA)', async ({ page, context }) => {
    // Visit site to cache assets
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go offline
    await context.setOffline(true);

    // Navigate to calculator
    await page.click('text=体格指数(成人)');

    // Should still work
    await expect(page).toHaveURL(/\/calculator\/bmi_adult/);
  });
});
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage for calculator engine, helpers, validators
- **Component Tests:** 70%+ coverage for all React components
- **E2E Tests:** Cover critical user journeys (5-10 key flows)
- **Accessibility Tests:** Run axe-core on all pages

---

## Deployment Strategy

### Build Configuration

**next.config.js:**

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  sw: 'service-worker.js',
  scope: '/',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for hosting on simple servers
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security headers (see Security section)
  async headers() {
    return [/* ... */];
  },
};

module.exports = withPWA(nextConfig);
```

### PWA Configuration

**public/manifest.json:**

```json
{
  "name": "医療計算機",
  "short_name": "医療計算機",
  "description": "医学的な計算を行うアプリケーションです。",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-256.png",
      "sizes": "256x256",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["medical", "health", "utilities"],
  "lang": "ja"
}
```

### Deployment Options

#### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)

**Recommended:** Vercel (seamless Next.js integration)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Benefits:**
- Automatic HTTPS
- Global CDN
- Preview deployments
- Zero configuration
- Free tier available

#### Option 2: Self-Hosted (Current: app.kcrt.net)

```bash
# Build static site
npm run build

# Output directory: out/
# Upload contents to server

# Example: rsync to server
rsync -avz --delete out/ user@app.kcrt.net:/var/www/med/
```

**nginx configuration:**

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name app.kcrt.net;

    root /var/www/med;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PWA files
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
}
```

#### Option 3: Mobile Apps (Capacitor)

**For native app store distribution:**

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Initialize
npx cap init

# Build web assets
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Copy web assets
npx cap copy

# Open in native IDE
npx cap open android
npx cap open ios
```

**capacitor.config.ts:**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.kcrt.med',
  appName: '医療計算機',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
```

### CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Validate formulas
        run: pnpm validate-formulas

      - name: Unit tests
        run: pnpm test

      - name: E2E tests
        run: pnpm test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: out/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v4
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/med/
```

---

## Migration Timeline & Phases

### Phase 1: Foundation (Weeks 1-2)

**Goals:** Set up Next.js project, migrate core infrastructure

**Tasks:**
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Install and configure dependencies (Tailwind, shadcn/ui)
- [ ] Set up ESLint, Prettier, Git hooks
- [ ] Create directory structure
- [ ] Define TypeScript types for formulas
- [ ] Migrate `formula.json` to `src/data/`
- [ ] Create validation script for formula data
- [ ] Set up testing infrastructure (Vitest, Playwright)
- [ ] Create root layout with header/footer
- [ ] Implement Settings context provider

**Deliverables:**
- Working Next.js dev server
- Type-safe formula data loading
- Basic layout and navigation

### Phase 2: Core Components (Weeks 3-4)

**Goals:** Build reusable UI components, calculator engine

**Tasks:**
- [ ] Build InputField component (all 9 input types)
- [ ] Build OutputDisplay component
- [ ] Build ReferenceLinks component
- [ ] Implement calculator engine (formula evaluation)
- [ ] Migrate helper functions (GetZScore, BSA_DuBois, etc.)
- [ ] Create input validation with Zod schemas
- [ ] Build CalculatorForm component
- [ ] Build HtmlContent and ImageContent components
- [ ] Write unit tests for calculator engine
- [ ] Write unit tests for helper functions
- [ ] Write component tests

**Deliverables:**
- Complete calculator form system
- Safe formula evaluation engine
- Test coverage >70%

### Phase 3: Pages & Features (Weeks 5-6)

**Goals:** Migrate all pages and features

**Tasks:**
- [ ] Implement home page with calculator list
- [ ] Implement calculator detail pages (dynamic routes)
- [ ] Implement settings page
- [ ] Implement about page
- [ ] Add search/filter functionality
- [ ] Migrate all 60+ calculators (verify accuracy)
- [ ] Implement page transitions (settings-based)
- [ ] Add deep linking support
- [ ] Implement localStorage persistence
- [ ] Test each calculator manually
- [ ] Write E2E tests for critical flows

**Deliverables:**
- Feature parity with original app
- All calculators working and tested
- E2E test suite

### Phase 4: PWA & Mobile (Week 7)

**Goals:** Add offline support, mobile optimization

**Tasks:**
- [ ] Configure next-pwa
- [ ] Create service worker
- [ ] Add manifest.json
- [ ] Test offline functionality
- [ ] Optimize for mobile devices
- [ ] Test on various screen sizes
- [ ] Add touch-friendly interactions
- [ ] Implement app install prompt
- [ ] Test iOS Web Clip functionality
- [ ] (Optional) Set up Capacitor for native apps

**Deliverables:**
- Full PWA support
- Offline-capable app
- Mobile-optimized UI

### Phase 5: Polish & Optimization (Week 8)

**Goals:** Performance optimization, accessibility, final testing

**Tasks:**
- [ ] Run Lighthouse audits (target 90+ scores)
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add loading states and skeletons
- [ ] Run accessibility audit (axe-core)
- [ ] Fix any accessibility issues
- [ ] Add error boundaries
- [ ] Implement error tracking (optional: Sentry)
- [ ] Add analytics (optional: privacy-respecting)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance testing on slow devices
- [ ] Final user acceptance testing

**Deliverables:**
- Production-ready application
- Lighthouse scores 90+
- WCAG 2.1 AA compliance

### Phase 6: Deployment & Migration (Week 9)

**Goals:** Deploy to production, migrate traffic

**Tasks:**
- [ ] Set up production hosting (Vercel or self-hosted)
- [ ] Configure domain and SSL
- [ ] Set up CI/CD pipeline
- [ ] Deploy beta version to staging URL
- [ ] Beta testing with real users
- [ ] Fix critical bugs from beta
- [ ] Create deployment runbook
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Gradual traffic migration (if applicable)
- [ ] Update links and documentation
- [ ] Archive old jQuery version

**Deliverables:**
- Live production deployment
- Zero downtime migration
- Monitoring and alerting

### Phase 7: Post-Launch (Week 10+)

**Goals:** Monitor, gather feedback, iterate

**Tasks:**
- [ ] Monitor error rates and performance
- [ ] Gather user feedback
- [ ] Fix bugs reported by users
- [ ] Measure key metrics (load time, engagement, etc.)
- [ ] Plan future enhancements
- [ ] Update documentation
- [ ] Write migration retrospective

---

## Risk Assessment & Mitigation

### High-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Formula calculation errors** | High | Medium | Extensive testing, side-by-side comparison, medical professional review |
| **Data loss during migration** | High | Low | Keep formula.json identical, validate with schema, staged rollout |
| **Security vulnerabilities (eval)** | High | High | Use safer alternatives (expr-eval), sandbox execution, CSP headers |
| **Performance degradation** | Medium | Low | Lighthouse audits, bundle analysis, optimize early |
| **Browser compatibility issues** | Medium | Medium | Cross-browser testing, polyfills, progressive enhancement |
| **Offline functionality breaks** | Medium | Low | Thorough PWA testing, service worker validation |
| **Mobile app store rejection** | Low | Low | (Only if publishing apps) Follow platform guidelines |

### Technical Challenges

#### Challenge 1: Eval Replacement

**Problem:** 60+ calculators rely on `eval()` for formula execution

**Solutions:**
1. **expr-eval library** (Recommended)
   - Pros: Safe, supports math expressions, no eval
   - Cons: May not support complex code blocks

2. **Function constructor with sandboxing**
   - Pros: More flexible than eval, can run code blocks
   - Cons: Still has some security risks

3. **Manual rewrite of formulas**
   - Pros: Most secure, fully controlled
   - Cons: Time-consuming, error-prone

**Chosen Approach:** Hybrid
- Use `expr-eval` for simple `formula` fields
- Use sandboxed Function constructor for complex `code` blocks
- Manual rewrite for any problematic formulas

#### Challenge 2: jQuery Mobile UI Patterns

**Problem:** jQuery Mobile patterns (page transitions, themes) need React equivalents

**Solution:**
- Use Framer Motion for page transitions
- Replicate jQuery Mobile theme with Tailwind custom colors
- Use shadcn/ui components styled to match

#### Challenge 3: Maintaining Japanese Language Support

**Problem:** All text is in Japanese, need to preserve encoding and display

**Solution:**
- UTF-8 everywhere (Next.js default)
- Test with Japanese input/output
- Use proper lang tags: `<html lang="ja">`
- Consider i18n setup for future English version

### Testing Strategy for Risk Mitigation

1. **Calculation Accuracy**
   - Create reference test suite with known inputs/outputs
   - Run all calculators through both old and new systems
   - Medical professional review of critical calculators

2. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on iOS Safari, Android Chrome
   - Use BrowserStack for additional devices

3. **Progressive Enhancement**
   - Ensure basic functionality without JavaScript
   - Test on slow 3G connections
   - Test on low-end devices

---

## Additional Recommendations

### 1. Add Internationalization (Future Enhancement)

While the current app is Japanese-only, Next.js makes i18n easy:

```typescript
// next.config.js
module.exports = {
  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
  },
};
```

### 2. Add User Accounts (Optional)

Allow users to save favorite calculators, history:

- Implement with NextAuth.js
- Store preferences in database (Supabase, PlanetScale)
- Sync across devices

### 3. Add Calculator Builder (Advanced)

Allow medical professionals to create custom calculators:

- Visual formula builder
- JSON export/import
- Community-contributed calculators

### 4. Analytics & Monitoring

Track usage without compromising privacy:

- Self-hosted Plausible Analytics
- Error tracking with Sentry
- Performance monitoring with Vercel Analytics

### 5. Continuous Improvement

- Regular security audits
- Dependency updates (Dependabot)
- User feedback system
- A/B testing for UX improvements

---

## Conclusion

This migration from jQuery Mobile to Next.js will modernize the 医療計算機 application while maintaining 100% feature parity and improving security, performance, and maintainability.

**Key Success Factors:**

1. **Accurate Calculations** - Most critical; extensive testing required
2. **Security** - Eliminate eval(), implement CSP, sanitize inputs
3. **Performance** - Target Lighthouse 90+, optimize for mobile
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Offline Support** - PWA with service workers
6. **Testing** - Comprehensive unit, component, and E2E tests
7. **Staged Rollout** - Beta testing before full production

**Estimated Timeline:** 9-10 weeks (1 developer, full-time)

**Estimated Effort:** ~250-300 hours

**Recommended Team:**
- 1 Frontend Developer (Next.js, React, TypeScript)
- 1 Medical Professional (validation, testing)
- 1 QA Tester (part-time)

This migration will set up the application for long-term success with modern tools, better security, and improved user experience while preserving all existing functionality.

---

## Appendix A: Quick Reference Commands

```bash
# Create Next.js project
npx create-next-app@latest medical-calculator --typescript --tailwind --app --eslint

# Install dependencies
cd medical-calculator
pnpm add react-hook-form @hookform/resolvers zod
pnpm add -D @testing-library/react @testing-library/jest-dom vitest
pnpm add -D playwright

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label select slider radio-group switch textarea

# Run development server
pnpm dev

# Run tests
pnpm test
pnpm test:e2e

# Build for production
pnpm build

# Start production server
pnpm start
```

## Appendix B: File Checklist

### Files to Create

- [ ] `src/app/layout.tsx`
- [ ] `src/app/page.tsx`
- [ ] `src/app/calculator/[id]/page.tsx`
- [ ] `src/app/settings/page.tsx`
- [ ] `src/app/about/page.tsx`
- [ ] `src/components/calculator/CalculatorList.tsx`
- [ ] `src/components/calculator/CalculatorCard.tsx`
- [ ] `src/components/calculator/CalculatorForm.tsx`
- [ ] `src/components/calculator/InputField.tsx`
- [ ] `src/components/calculator/OutputDisplay.tsx`
- [ ] `src/components/calculator/ReferenceLinks.tsx`
- [ ] `src/components/calculator/HtmlContent.tsx`
- [ ] `src/components/calculator/ImageContent.tsx`
- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/Footer.tsx`
- [ ] `src/components/providers/SettingsProvider.tsx`
- [ ] `src/lib/calculator/engine.ts`
- [ ] `src/lib/calculator/helpers.ts`
- [ ] `src/lib/calculator/validators.ts`
- [ ] `src/lib/calculator/data.ts`
- [ ] `src/types/formula.ts`
- [ ] `src/types/calculator.ts`
- [ ] `src/types/settings.ts`
- [ ] `src/data/formulas.json`
- [ ] `scripts/validate-formulas.ts`
- [ ] `tests/unit/calculator-engine.test.ts`
- [ ] `tests/unit/helpers.test.ts`
- [ ] `tests/e2e/calculator.spec.ts`
- [ ] `next.config.js`
- [ ] `tailwind.config.ts`
- [ ] `package.json`
- [ ] `public/manifest.json`

### Files to Migrate/Copy

- [ ] `formula.json` → `src/data/formulas.json`
- [ ] `favicon32.png` → `public/icons/icon-32.png`
- [ ] `favicon256.png` → `public/icons/icon-256.png`
- [ ] `startup_*.png` → `public/splash/`
- [ ] `image/epidrug.png` → `public/images/`
- [ ] `README.md` → Update for Next.js

---

**End of Migration Guide**
