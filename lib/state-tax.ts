// State income tax. California only for now; add a state by adding its data and a calculator here.
import type { FilingStatus, TaxYear } from './data';

export type StateCode = 'none' | 'CA';

export const STATES: { code: StateCode; name: string }[] = [
    { code: 'none', name: 'No state tax / not listed' },
    { code: 'CA', name: 'California' }
];

interface StateBracket {
    rate: number;
    /** Taxable income where this bracket starts */
    over: number;
}

/**
 * California figures from FTB Tax News (October 2025 and October 2026 indexing
 * announcements), the 2025 Form 540 booklet, and EDD for SDI.
 */
export const CALIFORNIA_DATA = {
    2025: {
        brackets: {
            single: caBrackets([0, 11079, 26264, 41452, 57542, 72724, 371479, 445771, 742953]),
            marriedJointly: caBrackets([0, 22158, 52528, 82904, 115084, 145448, 742958, 891542, 1485906]),
            headOfHousehold: caBrackets([0, 22173, 52530, 67716, 83805, 98990, 505208, 606251, 1010417])
        },
        standardDeduction: { single: 5706, joint: 11412 },
        personalExemptionCredit: 153,
        dependentExemptionCredit: 475,
        // Exemption credits shrink by $6 per credit for each $2,500 ($1,250 MFS), or part, of federal AGI over these
        exemptionPhaseOut: { single: 252203, marriedJointly: 504411, headOfHousehold: 378310, marriedSeparately: 252203 },
        rentersCredit: { single: { amount: 60, agiLimit: 53994 }, joint: { amount: 120, agiLimit: 107988 } },
        sdiRate: 0.012
    },
    2026: {
        brackets: {
            single: caBrackets([0, 11456, 27157, 42861, 59498, 75197, 384109, 460927, 768213]),
            marriedJointly: caBrackets([0, 22912, 54314, 85722, 118996, 150394, 768218, 921854, 1536426]),
            headOfHousehold: caBrackets([0, 22927, 54316, 70018, 86654, 102356, 522385, 626864, 1044771])
        },
        standardDeduction: { single: 5900, joint: 11800 },
        personalExemptionCredit: 158,
        dependentExemptionCredit: 491,
        // FTB publishes these in late December. Until then: the 2025 amounts indexed by the
        // 3.4% California CPI, rounded, which is how FTB derives them (the 2025 amounts are the
        // 2024 ones × 1.030, rounded).
        exemptionPhaseOut: { single: 260778, marriedJointly: 521561, headOfHousehold: 391173, marriedSeparately: 260778 },
        rentersCredit: { single: { amount: 60, agiLimit: 55830 }, joint: { amount: 120, agiLimit: 111660 } },
        sdiRate: 0.013
    }
} satisfies Record<TaxYear, unknown>;

/** Behavioral Health Services Tax: 1% of taxable income over $1 million, any filing status */
const CA_BEHAVIORAL_HEALTH = { rate: 0.01, threshold: 1000000 };

function caBrackets(starts: number[]): StateBracket[] {
    const rates = [0.01, 0.02, 0.04, 0.06, 0.08, 0.093, 0.103, 0.113, 0.123];
    return starts.map((over, i) => ({ over, rate: rates[i] }));
}

function bracketTax(taxable: number, brackets: StateBracket[]): { tax: number; rate: number } {
    let tax = 0;
    let rate = brackets[0].rate;
    brackets.forEach((b, i) => {
        const next = i + 1 < brackets.length ? brackets[i + 1].over : Infinity;
        if (taxable > b.over) {
            tax += (Math.min(taxable, next) - b.over) * b.rate;
            rate = b.rate;
        }
    });
    return { tax, rate };
}

export interface StateTaxInputs {
    state: StateCode;
    year: TaxYear;
    filingStatus: FilingStatus;
    isAge65Plus: boolean;
    isSpouseAge65Plus: boolean;
    numChildren: number;
    numOtherDependents: number;
    hsaContributions: number;
    educatorExpenses: number;
    isRenter: boolean;
}

export interface StateTaxResult {
    state: StateCode;
    /** State AGI: federal AGI plus items the state doesn't allow */
    stateAgi: number;
    standardDeduction: number;
    taxableIncome: number;
    taxBeforeCredits: number;
    exemptionCredits: number;
    rentersCredit: number;
    /** California Behavioral Health Services Tax (1% over $1M) */
    surtax: number;
    /** State income tax after credits */
    incomeTax: number;
    /** Employee disability insurance (California SDI) on wages */
    disabilityInsurance: number;
    marginalRate: number;
}

/**
 * California resident income tax (Form 540) on wages, using the standard deduction.
 * Starts from federal AGI and adds back what California doesn't allow (HSA
 * contributions, educator expenses). California has no tips, overtime, car loan,
 * or senior deduction. CalEITC and the Young Child Tax Credit aren't modeled.
 * California's tax table (income up to $100k) rounds to $50/$100 rows, so the
 * return can differ from this exact rate-schedule amount by a dollar or so.
 */
export function calculateStateTax(
    inputs: StateTaxInputs,
    federalAgi: number,
    payrollWages: number
): StateTaxResult | null {
    if (inputs.state !== 'CA') return null;

    const ca = CALIFORNIA_DATA[inputs.year];
    const status = inputs.filingStatus;
    const isJoint = status === 'marriedJointly';
    const usesJointAmounts = isJoint || status === 'headOfHousehold';

    const stateAgi = federalAgi + inputs.hsaContributions + inputs.educatorExpenses;
    const standardDeduction = usesJointAmounts ? ca.standardDeduction.joint : ca.standardDeduction.single;
    const taxableIncome = Math.max(0, stateAgi - standardDeduction);

    const brackets =
        status === 'marriedJointly' ? ca.brackets.marriedJointly
            : status === 'headOfHousehold' ? ca.brackets.headOfHousehold
                : ca.brackets.single;
    const { tax: taxBeforeCredits, rate } = bracketTax(taxableIncome, brackets);

    // Form 540 lines 7–10: one personal credit each (two on a joint return), one more per
    // person 65+, and one per dependent. The AGI Limitation Worksheet uses federal AGI.
    const personalCount =
        (isJoint ? 2 : 1) + (inputs.isAge65Plus ? 1 : 0) + (isJoint && inputs.isSpouseAge65Plus ? 1 : 0);
    const dependentCount = Math.max(0, inputs.numChildren) + Math.max(0, inputs.numOtherDependents);
    const step = status === 'marriedSeparately' ? 1250 : 2500;
    const over = Math.max(0, federalAgi - ca.exemptionPhaseOut[status]);
    const reductionPerCredit = 6 * Math.ceil(over / step);
    const personalCredits = Math.max(0, personalCount * (ca.personalExemptionCredit - reductionPerCredit));
    const dependentCredits = Math.max(0, dependentCount * (ca.dependentExemptionCredit - reductionPerCredit));
    const exemptionCredits = Math.min(taxBeforeCredits, personalCredits + dependentCredits);

    // Nonrenter's credit: renters of their California home, under the AGI limit
    const renters = usesJointAmounts ? ca.rentersCredit.joint : ca.rentersCredit.single;
    const rentersCredit = inputs.isRenter && stateAgi <= renters.agiLimit
        ? Math.min(renters.amount, taxBeforeCredits - exemptionCredits)
        : 0;

    const surtax = CA_BEHAVIORAL_HEALTH.rate * Math.max(0, taxableIncome - CA_BEHAVIORAL_HEALTH.threshold);
    const incomeTax = taxBeforeCredits - exemptionCredits - rentersCredit + surtax;

    return {
        state: 'CA',
        stateAgi,
        standardDeduction,
        taxableIncome,
        taxBeforeCredits,
        exemptionCredits,
        rentersCredit,
        surtax,
        incomeTax,
        // SDI covers the same wages as Social Security (401(k) included, cafeteria plan excluded), with no cap
        disabilityInsurance: ca.sdiRate * payrollWages,
        marginalRate: (rate + (taxableIncome > CA_BEHAVIORAL_HEALTH.threshold ? CA_BEHAVIORAL_HEALTH.rate : 0)) * 100
    };
}
