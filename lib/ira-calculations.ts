import { TAX_YEAR_DATA, type TaxYear, type FilingStatus, type IRALimitSet } from './data';
import { getTaxYearData, calculateMAGI } from './utils';

export interface IRADeductionInfo {
    deductibleAmount: number;
    isFullyDeductible: boolean;
    isPartiallyDeductible: boolean;
    isNonDeductible: boolean;
    maxContribution: number;
}

export interface RothEligibility {
    isEligible: boolean;
    maxContribution: number;
    phaseOutPercentage: number;
    allowedContribution?: number;
}

export interface IRAContributionRecommendations {
    recommendedTrad: number;
    recommendedRoth: number;
    remainingSpace: number;
    globalLimit: number;
    tradDeductibleLimit: number;
    rothEligible: boolean;
    rothPhaseOutPercentage: number;
}

/**
 * Calculate Traditional IRA deductible amount based on MAGI and coverage status
 */
export function calculateTraditionalIRADeductible(
    magi: number,
    filingStatus: FilingStatus,
    isCoveredByEmployerPlan: boolean,
    isSpouseCoveredByEmployerPlan: boolean,
    iraContribution: number,
    year: TaxYear,
    isEligibleForCatchUp = false
): IRADeductionInfo {
    const yearData = getTaxYearData(year);
    const maxContribution = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    let lowerLimit: number | null = null;
    let upperLimit: number | null = null;
    let phaseOutRange: number | null = null;
    
    // Determine limits based on filing status and coverage
    if (filingStatus === 'marriedJointly' && isCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedBothCovered as IRALimitSet;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit;
    } else if (filingStatus === 'marriedJointly' && !isCoveredByEmployerPlan && isSpouseCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedOneCovered as IRALimitSet;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit;
    } else if ((filingStatus === 'single' || filingStatus === 'headOfHousehold') && !isCoveredByEmployerPlan) {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    } else if (filingStatus === 'marriedJointly' && !isCoveredByEmployerPlan && !isSpouseCoveredByEmployerPlan) {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    } else if (filingStatus === 'marriedSeparately' && !isCoveredByEmployerPlan) {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    } else if ((filingStatus === 'single' || filingStatus === 'headOfHousehold') && isCoveredByEmployerPlan) {
        const limits = (filingStatus === 'single' 
            ? yearData.traditionalIraDeductionLimits.singleCovered 
            : yearData.traditionalIraDeductionLimits.headOfHouseholdCovered) as IRALimitSet;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit;
    } else if (filingStatus === 'marriedSeparately' && isCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedSeparateCovered as IRALimitSet;
        lowerLimit = limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit;
    } else {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    
    // Full deduction
    if (lowerLimit !== null && magi <= lowerLimit) {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    
    // No deduction
    if (upperLimit !== null && magi >= upperLimit) {
        return {
            deductibleAmount: 0,
            isFullyDeductible: false,
            isPartiallyDeductible: false,
            isNonDeductible: true,
            maxContribution: maxContribution
        };
    }
    
    // Partial deduction - calculate with IRS rules
    if (phaseOutRange === null) {
        return {
            deductibleAmount: 0,
            isFullyDeductible: false,
            isPartiallyDeductible: false,
            isNonDeductible: true,
            maxContribution: maxContribution
        };
    }
    
    const difference = upperLimit - magi;
    const ratio = difference / phaseOutRange;
    const rawAmount = ratio * maxContribution;
    
    // IRS Rounding Rule: round up to nearest $10
    let roundedAmount = rawAmount;
    if (roundedAmount % 10 !== 0) {
        roundedAmount = Math.ceil(roundedAmount / 10) * 10;
    }
    
    // IRS Minimum Floor Rule: minimum $200 if > 0
    let finalAmount = roundedAmount;
    if (finalAmount > 0 && finalAmount < 200) {
        finalAmount = 200;
    }
    
    finalAmount = Math.min(finalAmount, iraContribution, maxContribution);
    finalAmount = Math.max(0, finalAmount);
    
    return {
        deductibleAmount: finalAmount,
        isFullyDeductible: false,
        isPartiallyDeductible: true,
        isNonDeductible: false,
        maxContribution: maxContribution
    };
}

/**
 * Check Roth IRA eligibility
 */
export function checkRothIRAEligibility(
    magi: number,
    filingStatus: FilingStatus,
    year: TaxYear,
    isEligibleForCatchUp = false
): RothEligibility {
    const yearData = getTaxYearData(year);
    const limits = yearData.rothIraLimits;
    const maxContribution = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    let limitSet;
    if (filingStatus === 'single' || filingStatus === 'headOfHousehold') {
        limitSet = filingStatus === 'single' ? limits.single : limits.headOfHousehold;
    } else if (filingStatus === 'marriedJointly') {
        limitSet = limits.marriedJointly;
    } else if (filingStatus === 'marriedSeparately') {
        limitSet = limits.marriedSeparately;
    } else {
        return { isEligible: false, maxContribution: maxContribution, phaseOutPercentage: 0 };
    }
    
    if (magi < limitSet.phaseOutStart) {
        return { isEligible: true, maxContribution: maxContribution, phaseOutPercentage: 100 };
    }
    
    if (magi >= limitSet.phaseOutEnd) {
        return { isEligible: false, maxContribution: maxContribution, phaseOutPercentage: 0 };
    }
    
    // Partial eligibility
    const phaseOutRange = limitSet.phaseOutEnd - limitSet.phaseOutStart;
    const amountOverStart = magi - limitSet.phaseOutStart;
    const phaseOutPercentage = Math.max(0, 100 - (amountOverStart / phaseOutRange * 100));
    const allowedContribution = Math.max(0, maxContribution * (phaseOutPercentage / 100));
    
    return { 
        isEligible: true, 
        maxContribution: maxContribution, 
        phaseOutPercentage: phaseOutPercentage,
        allowedContribution: allowedContribution
    };
}

/**
 * Calculate IRA contribution recommendations (Traditional vs Roth split)
 */
export function calculateIRAContributionRecommendations(
    magi: number,
    filingStatus: FilingStatus,
    isCoveredByEmployerPlan: boolean,
    isSpouseCoveredByEmployerPlan: boolean,
    year: TaxYear,
    isEligibleForCatchUp: boolean,
    iraContribution = 0
): IRAContributionRecommendations {
    const yearData = getTaxYearData(year);
    const globalLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    const tradDeductionInfo = calculateTraditionalIRADeductible(
        magi,
        filingStatus,
        isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan,
        globalLimit,
        year,
        isEligibleForCatchUp
    );
    
    const tradDeductibleLimit = tradDeductionInfo.deductibleAmount;
    const recommendedTrad = Math.min(tradDeductibleLimit, globalLimit);
    const remainingSpace = Math.max(0, globalLimit - recommendedTrad);
    
    const rothEligibility = checkRothIRAEligibility(magi, filingStatus, year, isEligibleForCatchUp);
    
    let recommendedRoth = 0;
    const rothLimits = yearData.rothIraLimits;
    let rothLimitSet;
    
    if (filingStatus === 'single' || filingStatus === 'headOfHousehold') {
        rothLimitSet = filingStatus === 'single' ? rothLimits.single : rothLimits.headOfHousehold;
    } else if (filingStatus === 'marriedJointly') {
        rothLimitSet = rothLimits.marriedJointly;
    } else if (filingStatus === 'marriedSeparately') {
        rothLimitSet = rothLimits.marriedSeparately;
    } else {
        rothLimitSet = null;
    }
    
    if (rothLimitSet) {
        if (magi < rothLimitSet.phaseOutStart) {
            recommendedRoth = Math.min(remainingSpace, rothEligibility.maxContribution);
        } else if (magi >= rothLimitSet.phaseOutEnd) {
            recommendedRoth = 0;
        } else {
            const reducedRothLimit = rothEligibility.allowedContribution || 0;
            recommendedRoth = Math.min(remainingSpace, reducedRothLimit);
        }
    } else {
        if (rothEligibility.isEligible) {
            const reducedRothLimit = rothEligibility.allowedContribution || rothEligibility.maxContribution;
            recommendedRoth = Math.min(remainingSpace, reducedRothLimit);
        } else {
            recommendedRoth = 0;
        }
    }
    
    return {
        recommendedTrad: recommendedTrad,
        recommendedRoth: recommendedRoth,
        remainingSpace: remainingSpace,
        globalLimit: globalLimit,
        tradDeductibleLimit: tradDeductibleLimit,
        rothEligible: rothEligibility.isEligible,
        rothPhaseOutPercentage: rothEligibility.phaseOutPercentage
    };
}

