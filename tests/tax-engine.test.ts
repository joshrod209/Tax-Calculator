// Runs fixtures/tax-cases.json against the TypeScript engine.
// The Swift TaxEngine tests (ios/TaxEngine) read the same file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { calculateTax, type TaxInputs } from '../lib/tax-calculations';
import { calculateTaxBracketBreakdown } from '../lib/utils';

interface FixtureCase {
    name: string;
    inputs: Partial<TaxInputs>;
    expected: Record<string, number>;
}

const defaults: TaxInputs = {
    year: 2025,
    filingStatus: 'single',
    grossIncome: 0,
    isAge50Plus: false,
    isAge65Plus: false,
    isSpouseAge50Plus: false,
    isSpouseAge65Plus: false,
    numChildren: 0,
    numOtherDependents: 0,
    retirementContributions: 0,
    spouseRetirementContributions: 0,
    iraContributions: 0,
    spouseIraContributions: 0,
    isNonDeductibleIRA: false,
    isSpouseNonDeductibleIRA: false,
    hsaCoverageType: 'none',
    hsaContributions: 0,
    healthInsurancePremiums: 0,
    fsaContributions: 0,
    studentLoanInterest: 0,
    educatorExpenses: 0,
    isCoveredByEmployerPlan: false,
    isSpouseCoveredByEmployerPlan: false
};

// Compiled output runs from .test-build/tests, so resolve from the repo root
const fixturePath = join(process.cwd(), 'fixtures', 'tax-cases.json');
const { cases } = JSON.parse(readFileSync(fixturePath, 'utf8')) as { cases: FixtureCase[] };

for (const c of cases) {
    test(c.name, () => {
        const inputs = { ...defaults, ...c.inputs };
        const result = calculateTax(inputs) as unknown as Record<string, number>;

        for (const [key, expected] of Object.entries(c.expected)) {
            const actual = result[key];
            assert.ok(
                Math.abs(actual - expected) < 0.005,
                `${key}: expected ${expected}, got ${actual}`
            );
        }

        const breakdown = calculateTaxBracketBreakdown(result.taxableIncome, inputs.filingStatus, inputs.year);
        const sum = breakdown.reduce((s, b) => s + b.taxInBracket, 0);
        assert.ok(
            Math.abs(sum - result.taxBeforeCredits) < 0.01,
            `bracket breakdown sums to ${sum}, taxBeforeCredits is ${result.taxBeforeCredits}`
        );
    });
}
