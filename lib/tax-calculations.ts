import { type TaxYear, type FilingStatus } from './data';
import { 
    getTaxYearData, 
    calculateStandardDeduction, 
    calculateMAGI, 
    findTaxBracket, 
    getBracketInfo 
} from './utils';
import { calculateTraditionalIRADeductible, type IRADeductionInfo } from './ira-calculations';

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

export interface TaxCalculationResult {
    grossIncome: number;
    retirementContributions: number;
    iraContributions: number;
    hsaContributions: number;
    healthInsurancePremiums: number;
    fsaContributions: number;
    studentLoanInterest: number;
    educatorExpenses: number;
    totalDeductions: number;
    standardDeduction: number;
    taxableIncome: number;
    taxObligation: number;
    effectiveRate: number;
    marginalRate: number;
    bracketInfo: ReturnType<typeof getBracketInfo>;
    dependentCredit: number;
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
    magi: number;
    iraDeductionInfo: IRADeductionInfo;
    spouseIraContributions: number;
    spouseIraDeductionInfo: IRADeductionInfo | null;
}

/**
 * Calculate potential tax savings from increasing pre-tax contributions
 */
export function calculatePotentialSavings(
    currentTaxableIncome: number,
    filingStatus: FilingStatus,
    year: TaxYear,
    additional401k: number,
    additionalIRA: number
): PotentialSavings {
    const yearData = getTaxYearData(year);
    const currentBracket = findTaxBracket(currentTaxableIncome, filingStatus, year);
    const marginalRate = currentBracket.rate;
    
    const totalAdditional = (additional401k || 0) + (additionalIRA || 0);
    
    if (totalAdditional <= 0) {
        return {
            additional401k: 0,
            additionalIRA: 0,
            totalAdditional: 0,
            taxSavings: 0,
            marginalRate: marginalRate * 100,
            newMarginalRate: marginalRate * 100,
            currentTaxableIncome: currentTaxableIncome,
            newTaxableIncome: currentTaxableIncome
        };
    }
    
    const newTaxableIncome = Math.max(0, currentTaxableIncome - totalAdditional);
    const newBracket = findTaxBracket(newTaxableIncome, filingStatus, year);
    
    const currentTax = currentBracket.formula(currentTaxableIncome);
    const newTax = newBracket.formula(newTaxableIncome);
    const taxSavings = currentTax - newTax;
    
    return {
        additional401k: additional401k || 0,
        additionalIRA: additionalIRA || 0,
        totalAdditional: totalAdditional,
        taxSavings: taxSavings,
        marginalRate: marginalRate * 100,
        newMarginalRate: newBracket.rate * 100,
        currentTaxableIncome: currentTaxableIncome,
        newTaxableIncome: newTaxableIncome
    };
}

/**
 * Calculate federal tax obligation
 */
export function calculateTax(
    grossIncome: number,
    filingStatus: FilingStatus,
    isAge65Plus: boolean,
    numDependents: number,
    retirementContributions: number,
    iraContributions: number,
    hsaCoverageType: 'none' | 'selfOnly' | 'family',
    hsaContributions: number,
    healthInsurancePremiums: number,
    fsaContributions: number,
    studentLoanInterest: number,
    educatorExpenses: number,
    year: TaxYear,
    isAge50Plus = false,
    isCoveredByEmployerPlan = false,
    isSpouseCoveredByEmployerPlan = false,
    spouseIraContributions = 0,
    isSpouseAge50Plus = false,
    isNonDeductibleIRA = false,
    isSpouseNonDeductibleIRA = false
): TaxCalculationResult {
    const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
    const isSpouseEligibleForCatchUp = isSpouseAge50Plus || isAge65Plus;
    const yearData = getTaxYearData(year);
    
    const magi = calculateMAGI(
        grossIncome,
        retirementContributions,
        hsaContributions,
        healthInsurancePremiums,
        fsaContributions,
        studentLoanInterest,
        educatorExpenses
    );
    
    const iraDeductionInfo = calculateTraditionalIRADeductible(
        magi,
        filingStatus,
        isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan,
        iraContributions,
        year,
        isEligibleForCatchUp
    );
    // If user explicitly marked as non-deductible, override the calculated amount
    const deductibleIraAmount = isNonDeductibleIRA ? 0 : iraDeductionInfo.deductibleAmount;
    
    let spouseIraDeductionInfo: IRADeductionInfo | null = null;
    let deductibleSpouseIraAmount = 0;
    if (filingStatus === 'marriedJointly' && spouseIraContributions > 0) {
        spouseIraDeductionInfo = calculateTraditionalIRADeductible(
            magi,
            filingStatus,
            isSpouseCoveredByEmployerPlan,
            isCoveredByEmployerPlan,
            spouseIraContributions,
            year,
            isSpouseEligibleForCatchUp
        );
        // If spouse explicitly marked as non-deductible, override the calculated amount
        deductibleSpouseIraAmount = isSpouseNonDeductibleIRA ? 0 : spouseIraDeductionInfo.deductibleAmount;
    }
    
    const standardDeduction = calculateStandardDeduction(filingStatus, isAge65Plus, year);
    
    let adjustedIncome = Math.max(0, grossIncome - standardDeduction);
    adjustedIncome = Math.max(0, adjustedIncome - retirementContributions);
    adjustedIncome = Math.max(0, adjustedIncome - deductibleIraAmount - deductibleSpouseIraAmount);
    adjustedIncome = Math.max(0, adjustedIncome - hsaContributions);
    adjustedIncome = Math.max(0, adjustedIncome - healthInsurancePremiums);
    adjustedIncome = Math.max(0, adjustedIncome - fsaContributions);
    adjustedIncome = Math.max(0, adjustedIncome - studentLoanInterest);
    const taxableIncome = Math.max(0, adjustedIncome - educatorExpenses);
    
    const bracket = findTaxBracket(taxableIncome, filingStatus, year);
    const bracketInfo = getBracketInfo(bracket);
    
    let taxObligation = bracket.formula(taxableIncome);
    
    const dependentCredit = numDependents * yearData.dependentCredit;
    taxObligation = Math.max(0, taxObligation - dependentCredit);
    
    const effectiveRate = grossIncome > 0 ? (taxObligation / grossIncome) * 100 : 0;
    
    // Total deductions should only include deductible amounts
    // Non-deductible IRA contributions are NOT pre-tax deductions
    const totalDeductions = retirementContributions + 
        deductibleIraAmount + 
        deductibleSpouseIraAmount + 
        hsaContributions + 
        healthInsurancePremiums + 
        fsaContributions + 
        studentLoanInterest + 
        educatorExpenses;
    
    const retirementLimit = isEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard;
    const iraLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    const maxAdditional401k = Math.max(0, retirementLimit - retirementContributions);
    const maxAdditionalIRA = Math.max(0, iraLimit - iraContributions);
    const maxAdditionalSpouseIRA = (filingStatus === 'marriedJointly') ? Math.max(0, iraLimit - spouseIraContributions) : 0;
    
    const potentialSavings401k = maxAdditional401k > 0 
        ? calculatePotentialSavings(taxableIncome, filingStatus, year, Math.min(1000, maxAdditional401k), 0) 
        : null;
    const potentialSavingsIRA = maxAdditionalIRA > 0 
        ? calculatePotentialSavings(taxableIncome, filingStatus, year, 0, Math.min(1000, maxAdditionalIRA)) 
        : null;
    const potentialSavingsMax401k = maxAdditional401k > 0 
        ? calculatePotentialSavings(taxableIncome, filingStatus, year, maxAdditional401k, 0) 
        : null;
    const potentialSavingsMaxIRA = maxAdditionalIRA > 0 
        ? calculatePotentialSavings(taxableIncome, filingStatus, year, 0, maxAdditionalIRA) 
        : null;
    
    return {
        grossIncome,
        retirementContributions,
        iraContributions,
        hsaContributions,
        healthInsurancePremiums,
        fsaContributions,
        studentLoanInterest,
        educatorExpenses,
        totalDeductions,
        standardDeduction,
        taxableIncome,
        taxObligation,
        effectiveRate,
        marginalRate: bracket.rate * 100,
        bracketInfo: bracketInfo,
        dependentCredit,
        year,
        potentialSavings401k,
        potentialSavingsIRA,
        potentialSavingsMax401k,
        potentialSavingsMaxIRA,
        maxAdditional401k,
        maxAdditionalIRA,
        maxAdditionalSpouseIRA,
        retirementLimit,
        iraLimit,
        magi,
        iraDeductionInfo,
        spouseIraContributions: filingStatus === 'marriedJointly' ? spouseIraContributions : 0,
        spouseIraDeductionInfo
    };
}

