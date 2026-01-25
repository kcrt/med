Medical Calculator (医療計算機)
======================

![Medical Calculator](http://app.kcrt.net/med/startup_1024x748.png)

The old version (jQuery + jQuery Mobile) is available at `https://github.com/kcrt/med/tree/6a592ee2360f8d80ecf4460efc3b7bd36d6cb957`.

The Medical Calculator is an application for performing various medical calculations.
While every effort has been made to ensure accuracy, please always refer to the original literature and verify calculations when using this application in clinical practice.

Tech Stack
----------------------

- **Next.js 16** with App Router
- **React 19** with React Compiler
- **TypeScript 5**
- **Mantine 8** for UI components
- **Tailwind CSS v4** for styling
- **next-intl** for internationalization (English/Japanese)

Usage
----------------------

Web Browser
----------------------

A stable version of the [Medical Calculator](http://app.kcrt.net/med/) is hosted at app.kcrt.net.
Access it via your web browser, or on iOS, add it as a Web Clip for convenient access.

Local Development
----------------------

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
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

formula.json Syntax
----------------------

The Medical Calculator reads formula.json to display items and perform calculations.
