import { type TaxYear, type FilingStatus } from './data';
import {
    getTaxYearData,
    calculateStandardDeduction,
    calculateMAGI,
    findTaxBracket,
    getBracketInfo
} from './utils';
import { calculateTraditionalIRADeductible, type IRADeductionInfo } from './ira-calculations';

export interface TaxInputs {
    year: TaxYear;
    filingStatus: FilingStatus;
    grossIncome: number;
    isAge50Plus: boolean;
    isAge65Plus: boolean;
    isSpouseAge50Plus: boolean;
    isSpouseAge65Plus: boolean;
    /** Qualifying children under 17 (Child Tax Credit) */
    numChildren: number;
    /** Other dependents (Credit for Other Dependents) */
    numOtherDependents: number;
    retirementContributions: number;
    iraContributions: number;
    spouseIraContributions: number;
    hsaCoverageType: 'none' | 'selfOnly' | 'family';
    hsaContributions: number;
    healthInsurancePremiums: number;
    fsaContributions: number;
    studentLoanInterest: number;
    educatorExpenses: number;
    isCoveredByEmployerPlan: boolean;
    isSpouseCoveredByEmployerPlan: boolean;
}

export interface PotentialSavings {
    additional401k: number;
    additionalIRA: number;
    totalAdditional: number;
    taxSavings: number;
    marginalRate: number;
    newMarginalRate: number;
    currentTaxableIncome: number;
    newTaxableIncome: number;
}

interface TaxCore {
    magi: number;
    agi: number;
    iraDeductionInfo: IRADeductionInfo;
    spouseIraDeductionInfo: IRADeductionInfo | null;
    studentLoanDeduction: number;
    standardDeduction: number;
    seniorDeduction: number;
    taxableIncome: number;
    taxBeforeCredits: number;
    dependentCredit: number;
    taxObligation: number;
    marginalRate: number;
    bracket: ReturnType<typeof findTaxBracket>;
}

export interface TaxCalculationResult extends Omit<TaxCore, 'bracket'> {
    grossIncome: number;
    retirementContributions: number;
    iraContributions: number;
    spouseIraContributions: number;
    hsaContributions: number;
    healthInsurancePremiums: number;
    fsaContributions: number;
    studentLoanInterest: number;
    educatorExpenses: number;
    /** Above-the-line deductions actually allowed (deductible IRA amounts, phased student loan interest) */
    totalDeductions: number;
    /** Cash set aside from pay: retirement, IRA, HSA, premiums, FSA */
    totalContributions: number;
    effectiveRate: number;
    bracketInfo: ReturnType<typeof getBracketInfo>;
    year: TaxYear;
    potentialSavings401k: PotentialSavings | null;
    potentialSavingsIRA: PotentialSavings | null;
    potentialSavingsMax401k: PotentialSavings | null;
    potentialSavingsMaxIRA: PotentialSavings | null;
    maxAdditional401k: number;
    maxAdditionalIRA: number;
    maxAdditionalSpouseIRA: number;
    retirementLimit: number;
    iraLimit: number;
}

const isCatchUpEligible = (inputs: TaxInputs) => inputs.isAge50Plus || inputs.isAge65Plus;
const isSpouseCatchUpEligible = (inputs: TaxInputs) => inputs.isSpouseAge50Plus || inputs.isSpouseAge65Plus;

/** Linear phase-out: 1 below start, 0 at or above end */
function phaseOutFraction(income: number, start: number, end: number): number {
    if (income <= start) return 1;
    if (income >= end) return 0;
    return (end - income) / (end - start);
}

/**
 * Compute the full federal income tax picture for a set of inputs.
 */
function computeTax(inputs: TaxInputs): TaxCore {
    const { filingStatus, year } = inputs;
    const yearData = getTaxYearData(year);
    const isJoint = filingStatus === 'marriedJointly';

    // MAGI for IRA deductibility / Roth: before IRA and student loan deductions
    const magi = calculateMAGI(
        inputs.grossIncome,
        inputs.retirementContributions,
        inputs.hsaContributions,
        inputs.healthInsurancePremiums,
        inputs.fsaContributions,
        inputs.educatorExpenses
    );

    const iraDeductionInfo = calculateTraditionalIRADeductible(
        magi,
        filingStatus,
        inputs.isCoveredByEmployerPlan,
        inputs.isSpouseCoveredByEmployerPlan,
        inputs.iraContributions,
        year,
        isCatchUpEligible(inputs)
    );

    let spouseIraDeductionInfo: IRADeductionInfo | null = null;
    if (isJoint && inputs.spouseIraContributions > 0) {
        spouseIraDeductionInfo = calculateTraditionalIRADeductible(
            magi,
            filingStatus,
            inputs.isSpouseCoveredByEmployerPlan,
            inputs.isCoveredByEmployerPlan,
            inputs.spouseIraContributions,
            year,
            isSpouseCatchUpEligible(inputs)
        );
    }
    const iraDeduction = iraDeductionInfo.deductibleAmount + (spouseIraDeductionInfo?.deductibleAmount ?? 0);

    // Student loan interest: capped, phased out on MAGI after the IRA deduction,
    // and not allowed for married filing separately
    let studentLoanDeduction = 0;
    if (filingStatus !== 'marriedSeparately' && inputs.studentLoanInterest > 0) {
        const range = isJoint ? yearData.studentLoanPhaseOut.joint : yearData.studentLoanPhaseOut.other;
        const capped = Math.min(inputs.studentLoanInterest, yearData.studentLoanInterestLimit);
        const fraction = phaseOutFraction(magi - iraDeduction, range.phaseOutStart, range.phaseOutEnd);
        studentLoanDeduction = Math.round(capped * fraction * 100) / 100;
    }

    const agi = Math.max(0, magi - iraDeduction - studentLoanDeduction);

    const standardDeduction = calculateStandardDeduction(
        filingStatus,
        inputs.isAge65Plus,
        year,
        inputs.isSpouseAge65Plus
    );

    // Senior deduction: $6,000 per qualifying person, each reduced by 6% of MAGI
    // over the threshold. Married couples must file jointly to claim it.
    let seniorDeduction = 0;
    if (filingStatus !== 'marriedSeparately') {
        const qualifying = (inputs.isAge65Plus ? 1 : 0) + (isJoint && inputs.isSpouseAge65Plus ? 1 : 0);
        const senior = yearData.seniorDeduction;
        const threshold = isJoint ? senior.joint : senior.other;
        const perPerson = Math.max(0, senior.amount - senior.phaseOutRate * Math.max(0, agi - threshold));
        seniorDeduction = qualifying * perPerson;
    }

    const taxableIncome = Math.max(0, agi - standardDeduction - seniorDeduction);
    const bracket = findTaxBracket(taxableIncome, filingStatus, year);
    const taxBeforeCredits = Math.max(0, bracket.formula(taxableIncome));

    // Child Tax Credit + Credit for Other Dependents, reduced by $50 per $1,000
    // (or fraction) of MAGI over the threshold. Only the non-refundable portion
    // is modeled, so the credit can't take tax below zero.
    const creditThreshold = isJoint ? yearData.childCreditPhaseOut.joint : yearData.childCreditPhaseOut.other;
    const grossCredit =
        Math.max(0, inputs.numChildren) * yearData.childTaxCredit +
        Math.max(0, inputs.numOtherDependents) * yearData.otherDependentCredit;
    const creditReduction = 50 * Math.ceil(Math.max(0, agi - creditThreshold) / 1000);
    const allowedCredit = Math.max(0, grossCredit - creditReduction);
    const dependentCredit = Math.min(allowedCredit, taxBeforeCredits);

    return {
        magi,
        agi,
        iraDeductionInfo,
        spouseIraDeductionInfo,
        studentLoanDeduction,
        standardDeduction,
        seniorDeduction,
        taxableIncome,
        taxBeforeCredits,
        dependentCredit,
        taxObligation: taxBeforeCredits - dependentCredit,
        marginalRate: bracket.rate * 100,
        bracket
    };
}

/**
 * Tax saved by adding pre-tax contributions, found by recomputing the whole
 * return, so IRA deductibility, phase-outs and credits are all reflected.
 */
export function estimateTaxSavings(
    inputs: TaxInputs,
    additional401k: number,
    additionalIRA: number,
    additionalSpouseIRA = 0
): PotentialSavings {
    const base = computeTax(inputs);
    const changed = computeTax({
        ...inputs,
        retirementContributions: inputs.retirementContributions + additional401k,
        iraContributions: inputs.iraContributions + additionalIRA,
        spouseIraContributions: inputs.spouseIraContributions + additionalSpouseIRA
    });

    return {
        additional401k,
        additionalIRA: additionalIRA + additionalSpouseIRA,
        totalAdditional: additional401k + additionalIRA + additionalSpouseIRA,
        taxSavings: Math.max(0, base.taxObligation - changed.taxObligation),
        marginalRate: base.marginalRate,
        newMarginalRate: changed.marginalRate,
        currentTaxableIncome: base.taxableIncome,
        newTaxableIncome: changed.taxableIncome
    };
}

/**
 * Calculate federal tax obligation
 */
export function calculateTax(inputs: TaxInputs): TaxCalculationResult {
    const { filingStatus, year } = inputs;
    const yearData = getTaxYearData(year);
    const isJoint = filingStatus === 'marriedJointly';
    const { bracket, ...core } = computeTax(inputs);

    const spouseIraContributions = isJoint ? inputs.spouseIraContributions : 0;

    const totalDeductions =
        inputs.retirementContributions +
        core.iraDeductionInfo.deductibleAmount +
        (core.spouseIraDeductionInfo?.deductibleAmount ?? 0) +
        inputs.hsaContributions +
        inputs.healthInsurancePremiums +
        inputs.fsaContributions +
        core.studentLoanDeduction +
        inputs.educatorExpenses;

    const totalContributions =
        inputs.retirementContributions +
        inputs.iraContributions +
        spouseIraContributions +
        inputs.hsaContributions +
        inputs.healthInsurancePremiums +
        inputs.fsaContributions;

    const catchUp = isCatchUpEligible(inputs);
    const retirementLimit = catchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard;
    const iraLimit = catchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    const spouseIraLimit = isSpouseCatchUpEligible(inputs) ? yearData.iraLimit.max : yearData.iraLimit.standard;

    const maxAdditional401k = Math.max(0, retirementLimit - inputs.retirementContributions);
    const maxAdditionalIRA = Math.max(0, iraLimit - inputs.iraContributions);
    const maxAdditionalSpouseIRA = isJoint ? Math.max(0, spouseIraLimit - spouseIraContributions) : 0;

    return {
        ...core,
        grossIncome: inputs.grossIncome,
        retirementContributions: inputs.retirementContributions,
        iraContributions: inputs.iraContributions,
        spouseIraContributions,
        hsaContributions: inputs.hsaContributions,
        healthInsurancePremiums: inputs.healthInsurancePremiums,
        fsaContributions: inputs.fsaContributions,
        studentLoanInterest: inputs.studentLoanInterest,
        educatorExpenses: inputs.educatorExpenses,
        totalDeductions,
        totalContributions,
        effectiveRate: inputs.grossIncome > 0 ? (core.taxObligation / inputs.grossIncome) * 100 : 0,
        bracketInfo: getBracketInfo(bracket),
        year,
        potentialSavings401k: maxAdditional401k > 0
            ? estimateTaxSavings(inputs, Math.min(1000, maxAdditional401k), 0)
            : null,
        potentialSavingsIRA: maxAdditionalIRA > 0
            ? estimateTaxSavings(inputs, 0, Math.min(1000, maxAdditionalIRA))
            : null,
        potentialSavingsMax401k: maxAdditional401k > 0
            ? estimateTaxSavings(inputs, maxAdditional401k, 0)
            : null,
        potentialSavingsMaxIRA: maxAdditionalIRA > 0
            ? estimateTaxSavings(inputs, 0, maxAdditionalIRA)
            : null,
        maxAdditional401k,
        maxAdditionalIRA,
        maxAdditionalSpouseIRA,
        retirementLimit,
        iraLimit
    };
}
