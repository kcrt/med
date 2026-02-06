Medicalculator (医療計算機)
======================

Now we are rebuilding the Medicalculator using modern web technologies.
Current code does not work well!
Please try `https://github.com/kcrt/med/tree/6a592ee2360f8d80ecf4460efc3b7bd36d6cb957` that works properly.

![Medicalculator](http://app.kcrt.net/med/startup_1024x748.png)

The old version (jQuery + jQuery Mobile) is available at `https://github.com/kcrt/med/tree/6a592ee2360f8d80ecf4460efc3b7bd36d6cb957`.

The Medicalculator is an application for performing various medical calculations.
While every effort has been made to ensure accuracy, please always refer to the original literature and verify calculations when using this application in clinical practice.

Tech Stack
----------------------

- **Next.js 16** with App Router
- **React 19** with React Compiler
- **TypeScript 5**
- **Mantine 8** for UI components
- **Tailwind CSS v4** for styling
- **next-intl** for internationalization (English/Japanese/Chinese)
- **Vitest** for testing
- **Zod** for runtime type validation
- **qrcode.react** for QR code generation
- **marked** for markdown rendering

Locale Configuration
--------------------

The application supports English, Japanese, Simplified Chinese, and Traditional Chinese with automatic browser detection. See [docs/LOCALE.md](docs/LOCALE.md) for detailed configuration, translation system, and adding new languages.

Usage
----------------------

### Web Browser

A stable version of the [Medicalculator](http://app.kcrt.net/med/) is hosted at app.kcrt.net.
Access it via your web browser, or on iOS, add it as a Web Clip for convenient access.

### As an NPM Package

The calculation features are also available as an npm package that can be installed and used in other JavaScript/TypeScript applications:

```bash
npm install med
```

For detailed usage instructions and API documentation, see [LIB_README.md](LIB_README.md).

Quick example:

```typescript
import { getFormula, evaluateFormulaOutputs } from 'med';

const formula = getFormula('bmi_adult');
if (formula) {
  const results = evaluateFormulaOutputs(formula, {
    height: 170,  // cm
    weight: 70    // kg
  });
  console.log(results); // { BMI: 24.2, ... }
}
```

### Local Development

```bash
# Install dependencies
npm install

# Run development server (includes hot reload)
npm run dev
```

Bug Reports & Feature Requests
----------------------

For bug reports and feature requests, please contact via [email](mailto:kcrt@kcrt.net?subject=[Medical%20Calculator]%20Report) or [Twitter](http://twitter.com/kcrt). I read all emails but may not be able to respond to every message.

For requests to add new calculations, it would be helpful if you could provide references to the original literature when possible.

License
----------------------

Copyright &copy; 2012-2025 TAKAHASHI, Kyohei

This project includes open-source software redistributed under their respective licenses:

- Mantine UI - [MIT License](https://opensource.org/licenses/MIT)
- Tabler Icons - [MIT License](https://opensource.org/licenses/MIT)
- expr-eval - [MIT License](https://opensource.org/licenses/MIT)

npm Scripts
----------------------

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests with Vitest
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

Documentation
-------------

- **[API Reference](docs/API.md)** - Hooks, components, utilities, and type definitions
- **[Locale Configuration](docs/LOCALE.md)** - Internationalization setup and translation system

formula.json Syntax
----------------------

The Medicalculator reads formula.json to display items and perform calculations.
