// Runs fixtures/tax-cases.json against the TypeScript engine.
// The Swift TaxEngine tests (ios/TaxEngine) read the same file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { calculateTax, type TaxInputs } from '../lib/tax-calculations';
import { calculateTaxBracketBreakdown } from '../lib/utils';
import { checkRothIRAEligibility } from '../lib/ira-calculations';
import { TAX_YEAR_DATA, type FilingStatus, type TaxYear } from '../lib/data';

interface FixtureCase {
    name: string;
    inputs: Partial<TaxInputs>;
    expected: Record<string, number>;
}

const defaults: TaxInputs = {
    year: 2026,
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
interface RothCase {
    name: string;
    magi: number;
    filingStatus: FilingStatus;
    year: TaxYear;
    isEligibleForCatchUp: boolean;
    expectedAllowed: number;
    expectedEligible: boolean;
}

const { cases, rothCases } = JSON.parse(readFileSync(fixturePath, 'utf8')) as {
    cases: FixtureCase[];
    rothCases: RothCase[];
};

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

for (const c of rothCases) {
    test(`Roth: ${c.name}`, () => {
        const r = checkRothIRAEligibility(c.magi, c.filingStatus, c.year, c.isEligibleForCatchUp);
        const allowed = r.isEligible ? (r.allowedContribution ?? r.maxContribution) : 0;
        assert.equal(r.isEligible, c.expectedEligible);
        assert.ok(Math.abs(allowed - c.expectedAllowed) < 0.005, `allowed: expected ${c.expectedAllowed}, got ${allowed}`);
    });
}

// Each bracket's base must equal the tax on all lower brackets, and each
// formula must agree with base + rate × (income above the previous bracket).
test('bracket tables are internally consistent', () => {
    for (const [year, data] of Object.entries(TAX_YEAR_DATA)) {
        for (const [status, brackets] of Object.entries(data.brackets)) {
            let previousMax = 0;
            let taxBelow = 0;
            brackets.forEach((b, i) => {
                const where = `${year} ${status} bracket ${i}`;
                assert.ok(Math.abs(b.base - taxBelow) < 0.001, `${where}: base ${b.base}, expected ${taxBelow}`);
                if (i > 0) assert.equal(b.min, previousMax + 1, `${where}: min`);
                const x = b.max === Infinity ? previousMax + 1000 : (previousMax + b.max) / 2;
                assert.ok(Math.abs(b.formula(x) - (taxBelow + (x - previousMax) * b.rate)) < 0.001, `${where}: formula`);
                if (b.max !== Infinity) taxBelow += (b.max - previousMax) * b.rate;
                previousMax = b.max;
            });
        }
    }
});
