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
    /** Total wages for the return (both spouses on a joint return) */
    grossIncome: number;
    /** Joint returns: the part of grossIncome your spouse earns (each worker has their own Social Security wage base) */
    spouseWages: number;
    isAge50Plus: boolean;
    isAge65Plus: boolean;
    isSpouseAge50Plus: boolean;
    isSpouseAge65Plus: boolean;
    /** Qualifying children under 17 (Child Tax Credit) */
    numChildren: number;
    /** Other dependents (Credit for Other Dependents) */
    numOtherDependents: number;
    retirementContributions: number;
    /** Spouse's 401(k)/403(b); joint returns only */
    spouseRetirementContributions: number;
    iraContributions: number;
    spouseIraContributions: number;
    /** User marked their Traditional IRA contribution as non-deductible (e.g. backdoor Roth) */
    isNonDeductibleIRA: boolean;
    isSpouseNonDeductibleIRA: boolean;
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
    /** Traditional IRA deduction actually taken (you + spouse) */
    iraDeduction: number;
    iraDeductionInfo: IRADeductionInfo;
    spouseIraDeductionInfo: IRADeductionInfo | null;
    studentLoanDeduction: number;
    standardDeduction: number;
    seniorDeduction: number;
    taxableIncome: number;
    taxBeforeCredits: number;
    /** Non-refundable Child Tax Credit + Credit for Other Dependents actually used */
    dependentCredit: number;
    /** Income tax after non-refundable credits (never below zero) */
    taxObligation: number;
    /** Refundable part of the Child Tax Credit (Additional Child Tax Credit) */
    refundableChildCredit: number;
    /** taxObligation minus refundable credits; negative means a refund */
    netIncomeTax: number;
    marginalRate: number;
    bracket: ReturnType<typeof findTaxBracket>;
}

export interface TaxCalculationResult extends Omit<TaxCore, 'bracket'> {
    grossIncome: number;
    retirementContributions: number;
    spouseRetirementContributions: number;
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
    /** Income tax rate after all credits, as % of gross income */
    effectiveRate: number;
    /** Wages subject to payroll tax: gross minus cafeteria-plan items (HSA, premiums, FSA); 401(k) is still taxed */
    payrollWages: number;
    socialSecurityTax: number;
    /** Medicare including the 0.9% Additional Medicare Tax */
    medicareTax: number;
    payrollTax: number;
    /** Gross income − net income tax − payroll tax − money set aside (retirement, IRA, HSA, premiums, FSA) */
    takeHomePay: number;
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

export interface PayrollTax {
    payrollWages: number;
    socialSecurityTax: number;
    medicareTax: number;
    payrollTax: number;
}

/**
 * Employee share of Social Security and Medicare on wages. Cafeteria-plan items
 * (HSA through payroll, health premiums, health FSA) are exempt; 401(k)
 * deferrals are not. On a joint return the Social Security wage base applies to
 * each spouse's wages, and Additional Medicare Tax to their combined wages.
 */
export function calculatePayrollTax(inputs: TaxInputs): PayrollTax {
    const p = getTaxYearData(inputs.year).payroll;
    const isJoint = inputs.filingStatus === 'marriedJointly';
    const exempt = inputs.hsaContributions + inputs.healthInsurancePremiums + inputs.fsaContributions;
    const payrollWages = Math.max(0, inputs.grossIncome - exempt);
    const spouseWages = isJoint ? Math.min(Math.max(0, inputs.spouseWages), payrollWages) : 0;
    const yourWages = payrollWages - spouseWages;

    const socialSecurityTax =
        p.socialSecurityRate * (Math.min(yourWages, p.socialSecurityWageBase) + Math.min(spouseWages, p.socialSecurityWageBase));
    const threshold = p.additionalMedicareThreshold[inputs.filingStatus];
    const medicareTax =
        p.medicareRate * payrollWages + p.additionalMedicareRate * Math.max(0, payrollWages - threshold);

    return { payrollWages, socialSecurityTax, medicareTax, payrollTax: socialSecurityTax + medicareTax };
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
    const spouseRetirement = isJoint ? inputs.spouseRetirementContributions : 0;

    // MAGI for IRA deductibility / Roth: before IRA and student loan deductions
    const magi = calculateMAGI(
        inputs.grossIncome,
        inputs.retirementContributions + spouseRetirement,
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
    // A contribution the user marked non-deductible is never deducted, whatever the limits allow
    const yourIraDeduction = inputs.isNonDeductibleIRA ? 0 : iraDeductionInfo.deductibleAmount;
    const spouseIraDeduction = inputs.isSpouseNonDeductibleIRA ? 0 : (spouseIraDeductionInfo?.deductibleAmount ?? 0);
    const iraDeduction = yourIraDeduction + spouseIraDeduction;

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

    // Refundable part (Schedule 8812): the unused credit, capped per child and at
    // 15% of earned income over $2,500. Earned income is taxable wages (pay after
    // 401(k) and cafeteria-plan deductions). The 3+ children alternative needs the
    // Earned Income Credit, which isn't modeled, so only the 15% method is used.
    const refundable = yearData.refundableChildCredit;
    const earnedIncome = magi + inputs.educatorExpenses;
    const refundableChildCredit = Math.max(0, Math.min(
        allowedCredit - dependentCredit,
        Math.max(0, inputs.numChildren) * refundable.maxPerChild,
        refundable.rate * Math.max(0, earnedIncome - refundable.earnedIncomeThreshold)
    ));
    const taxObligation = taxBeforeCredits - dependentCredit;

    return {
        magi,
        agi,
        iraDeduction,
        iraDeductionInfo,
        spouseIraDeductionInfo,
        studentLoanDeduction,
        standardDeduction,
        seniorDeduction,
        taxableIncome,
        taxBeforeCredits,
        dependentCredit,
        taxObligation,
        refundableChildCredit,
        netIncomeTax: taxObligation - refundableChildCredit,
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
        taxSavings: Math.max(0, base.netIncomeTax - changed.netIncomeTax),
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
    const spouseRetirementContributions = isJoint ? inputs.spouseRetirementContributions : 0;

    const totalDeductions =
        inputs.retirementContributions +
        spouseRetirementContributions +
        core.iraDeduction +
        inputs.hsaContributions +
        inputs.healthInsurancePremiums +
        inputs.fsaContributions +
        core.studentLoanDeduction +
        inputs.educatorExpenses;

    const totalContributions =
        inputs.retirementContributions +
        spouseRetirementContributions +
        inputs.iraContributions +
        spouseIraContributions +
        inputs.hsaContributions +
        inputs.healthInsurancePremiums +
        inputs.fsaContributions;

    const catchUp = isCatchUpEligible(inputs);
    const retirementLimit = catchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard;
    const iraLimit = catchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    const spouseIraLimit = isSpouseCatchUpEligible(inputs) ? yearData.iraLimit.max : yearData.iraLimit.standard;

    const payroll = calculatePayrollTax(inputs);

    const maxAdditional401k = Math.max(0, retirementLimit - inputs.retirementContributions);
    const maxAdditionalIRA = Math.max(0, iraLimit - inputs.iraContributions);
    const maxAdditionalSpouseIRA = isJoint ? Math.max(0, spouseIraLimit - spouseIraContributions) : 0;

    return {
        ...core,
        grossIncome: inputs.grossIncome,
        retirementContributions: inputs.retirementContributions,
        spouseRetirementContributions,
        iraContributions: inputs.iraContributions,
        spouseIraContributions,
        hsaContributions: inputs.hsaContributions,
        healthInsurancePremiums: inputs.healthInsurancePremiums,
        fsaContributions: inputs.fsaContributions,
        studentLoanInterest: inputs.studentLoanInterest,
        educatorExpenses: inputs.educatorExpenses,
        totalDeductions,
        totalContributions,
        effectiveRate: inputs.grossIncome > 0 ? (core.netIncomeTax / inputs.grossIncome) * 100 : 0,
        ...payroll,
        takeHomePay: inputs.grossIncome - core.netIncomeTax - payroll.payrollTax - totalContributions,
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
