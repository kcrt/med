import { describe, it, expect } from 'vitest';
import { formulaData, evaluateFormulaOutputs, getLocalizedFormulaData, getFormula, shouldDisplayForLocale, getMenuItems } from '@/lib/formula';

describe('formula.json tests', () => {
  // Iterate through all categories
  for (const [categoryKey, categoryData] of Object.entries(formulaData)) {
    // Skip metadata
    if (categoryKey === '_meta') continue;

    describe(`Category: ${categoryKey}`, () => {
      // Iterate through all formulas in the category
      for (const [formulaKey, formula] of Object.entries(categoryData)) {
        const formulaId = `${categoryKey}/${formulaKey}`;

        describe(`Formula: ${formulaId}`, () => {
          // Run embedded tests if they exist
          if (formula.test && formula.test.length > 0) {
            for (let i = 0; i < formula.test.length; i++) {
              const testCase = formula.test[i]!;

              it(`test case ${i + 1}: ${JSON.stringify(testCase.input)}`, () => {
                const actualOutputs = evaluateFormulaOutputs(formula, testCase.input);

                // Compare with expected outputs
                for (const [key, expectedValue] of Object.entries(testCase.output)) {
                  const actualValue = actualOutputs[key];
                  expect(actualValue).toEqual(expectedValue);
                }
              });
            }
          } else {
            it.skip('no test cases defined');
          }
        });
      }
    });
  }
});

describe('Locale-aware formula tests', () => {
  describe('getLocalizedFormulaData', () => {
    it('returns base data for English locale', () => {
      const data = getLocalizedFormulaData('en');
      expect(data).toBeDefined();
      const bmiFormula = data['体格指数']['bmi_adult'];
      expect(bmiFormula?.input['height']?.label).toBe('Height [cm]');
    });

    it('returns merged data for Japanese locale', () => {
      const data = getLocalizedFormulaData('ja');
      expect(data).toBeDefined();
      const bmiFormula = data['体格指数']['bmi_adult'];
      expect(bmiFormula?.input['height']?.label).toBe('身長[cm]');
    });

    it('caches locale-specific data', () => {
      const data1 = getLocalizedFormulaData('en');
      const data2 = getLocalizedFormulaData('en');
      expect(data1).toBe(data2); // Same reference
    });
  });

  describe('getFormula with locale support', () => {
    it('returns English formula by default', () => {
      const formula = getFormula('bmi_adult');
      expect(formula).toBeDefined();
      expect(formula?.input['height']?.label).toBe('Height [cm]');
    });

    it('returns English formula when en locale specified', () => {
      const formula = getFormula('bmi_adult', 'en');
      expect(formula).toBeDefined();
      expect(formula?.input['height']?.label).toBe('Height [cm]');
    });

    it('returns Japanese formula when ja locale specified', () => {
      const formula = getFormula('bmi_adult', 'ja');
      expect(formula).toBeDefined();
      expect(formula?.input['height']?.label).toBe('身長[cm]');
    });
  });

  describe('shouldDisplayForLocale', () => {
    it('returns true for outputs without locale restrictions', () => {
      const output = { label: 'Test', text: 'No restrictions' };
      expect(shouldDisplayForLocale(output, 'en')).toBe(true);
      expect(shouldDisplayForLocale(output, 'ja')).toBe(true);
    });

    it('respects locales_in filter', () => {
      const output = {
        label: 'Test',
        text: 'Japanese only',
        locales_in: ['ja']
      };
      expect(shouldDisplayForLocale(output, 'ja')).toBe(true);
      expect(shouldDisplayForLocale(output, 'en')).toBe(false);
    });

    it('respects locales_not_in filter', () => {
      const output = {
        label: 'Test',
        text: 'Not for Japanese',
        locales_not_in: ['ja']
      };
      expect(shouldDisplayForLocale(output, 'en')).toBe(true);
      expect(shouldDisplayForLocale(output, 'ja')).toBe(false);
    });
  });

  describe('getMenuItems with locale support', () => {
    it('returns English menu items by default', () => {
      const items = getMenuItems();
      expect(items).toBeDefined();
      const bodyIndices = items.find(i => i.label === '体格指数');
      expect(bodyIndices).toBeDefined();
      const bmiItem = bodyIndices?.items.find(i => i.path === '/formula/bmi_adult');
      expect(bmiItem?.label).toBe('BMI (Adult)');
    });

    it('returns Japanese menu items when ja locale specified', () => {
      const items = getMenuItems('ja');
      expect(items).toBeDefined();
      const bodyIndices = items.find(i => i.label === '体格指数');
      expect(bodyIndices).toBeDefined();
      const bmiItem = bodyIndices?.items.find(i => i.path === '/formula/bmi_adult');
      expect(bmiItem?.label).toBe('BMI (成人)');
    });
  });
});
