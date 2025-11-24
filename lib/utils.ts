import { TAX_YEAR_DATA, type TaxYear, type FilingStatus } from './data';

/**
 * Get available tax years
 */
export function getAvailableYears(): number[] {
    return Object.keys(TAX_YEAR_DATA).map(Number).sort((a, b) => b - a);
}

/**
 * Get tax year data for a specific year
 */
export function getTaxYearData(year: TaxYear) {
    return TAX_YEAR_DATA[year];
}

/**
 * Get current/default tax year (most recent available)
 */
export function getCurrentTaxYear(): TaxYear {
    const years = getAvailableYears();
    return (years[0] || 2025) as TaxYear;
}

/**
 * Calculate standard deduction based on filing status, age, and year
 */
export function calculateStandardDeduction(filingStatus: FilingStatus, isAge65Plus: boolean, year: TaxYear): number {
    const yearData = getTaxYearData(year);
    let deduction = yearData.standardDeductions[filingStatus];
    
    if (isAge65Plus) {
        deduction += yearData.age65PlusDeductions[filingStatus];
    }
    
    return deduction;
}

/**
 * Calculate MAGI (Modified Adjusted Gross Income) for Traditional IRA eligibility
 */
export function calculateMAGI(
    grossIncome: number,
    retirementContributions: number,
    hsaContributions: number,
    healthInsurancePremiums: number,
    fsaContributions: number,
    studentLoanInterest: number,
    educatorExpenses: number
): number {
    let magi = grossIncome;
    magi = Math.max(0, magi - retirementContributions);
    magi = Math.max(0, magi - hsaContributions);
    magi = Math.max(0, magi - healthInsurancePremiums);
    magi = Math.max(0, magi - fsaContributions);
    magi = Math.max(0, magi - studentLoanInterest);
    magi = Math.max(0, magi - educatorExpenses);
    return magi;
}

/**
 * Find the applicable tax bracket for given taxable income
 */
export function findTaxBracket(taxableIncome: number, filingStatus: FilingStatus, year: TaxYear) {
    const yearData = getTaxYearData(year);
    const brackets = yearData.brackets[filingStatus];
    
    for (const bracket of brackets) {
        if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
            return bracket;
        }
    }
    
    return brackets[brackets.length - 1];
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format currency (no decimals)
 */
export function formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(rate: number): string {
    return `${rate.toFixed(1)}%`;
}

/**
 * Get bracket information including name/description
 */
export function getBracketInfo(bracket: { rate: number }) {
    const ratePercent = Math.round(bracket.rate * 100);
    const rateNames: Record<number, string> = {
        10: '10%',
        12: '12%',
        22: '22%',
        24: '24%',
        32: '32%',
        35: '35%',
        37: '37%'
    };
    return {
        rate: bracket.rate,
        ratePercent: ratePercent,
        rateName: rateNames[ratePercent] || `${ratePercent}%`,
    };
}

