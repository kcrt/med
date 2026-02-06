# Publishing the Medicalculator Package to NPM

This document explains how to publish the `med` package to npm after the changes in this PR.

## Pre-Publishing Checklist

1. ✅ Package structure is configured correctly
2. ✅ Build script (`build:lib`) works
3. ✅ Tests pass
4. ✅ Documentation is complete
5. ✅ No security vulnerabilities in added code

## Publishing Steps

### 1. Verify the Build

```bash
npm run build:lib
```

This should create the `dist` directory with:
- `dist/lib/index.js` - Main entry point
- `dist/lib/index.d.ts` - TypeScript definitions
- `dist/src/` - Compiled source files
- `dist/src/formulas/` - Formula JSON data

### 2. Test Locally

You can test the package locally before publishing:

```bash
# In another project
npm install /path/to/med
```

Or using npm link:

```bash
# In the med directory
npm link

# In your test project
npm link med
```

### 3. Update Version

Update the version in `package.json` following semantic versioning:

```bash
# For a patch release (0.1.0 -> 0.1.1)
npm version patch

# For a minor release (0.1.0 -> 0.2.0)
npm version minor

# For a major release (0.1.0 -> 1.0.0)
npm version major
```

### 4. Login to NPM

```bash
npm login
```

### 5. Publish

```bash
npm publish
```

The `prepublishOnly` script will automatically run `npm run build:lib` before publishing.

## What Gets Published

The `files` field in `package.json` specifies what gets included:

- `dist/` - Compiled library code
- `src/formulas/` - Formula JSON data

Everything else (source TypeScript files, tests, docs, etc.) is excluded from the published package.

## Usage After Publishing

Users can install the package with:

```bash
npm install med
```

And use it like:

```typescript
import { getFormula, evaluateFormulaOutputs } from 'med';

const formula = getFormula('bmi_adult');
const results = evaluateFormulaOutputs(formula, {
  height: 170,
  weight: 70
});
console.log(results); // { BMI: 24.2, ... }
```

## Important Notes

- The package name `med` might already be taken on npm. You may need to use a scoped package name like `@kcrt/med` instead.
- Make sure to remove the `"private": true` flag from `package.json` before publishing (already done in this PR).
- The package includes both the calculation library AND all the Next.js/React dependencies. Consider splitting into two packages if you want a smaller library-only package.

## Troubleshooting

### Package Name Already Taken

If `med` is taken, use a scoped package:

```json
{
  "name": "@kcrt/med"
}
```

### Build Fails

Check that:
- `tsc-alias` is installed as a devDependency
- All source files compile without errors
- The `tsconfig.lib.json` configuration is correct

### Import Errors

If users report import errors:
- Verify the `main` and `types` fields in package.json
- Check that tsc-alias properly resolved path mappings
- Ensure all dependencies are correctly listed
