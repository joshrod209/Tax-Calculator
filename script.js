// Tax Year Data - Organized by year for easy maintenance and updates
const TAX_YEAR_DATA = {
    2025: {
        brackets: {
            single: [
                { rate: 0.10, min: 0, max: 11925, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 11926, max: 48475, base: 1192.50, formula: (amount) => ((amount - 11925) * 0.12) + 1192.50 },
                { rate: 0.22, min: 48476, max: 103350, base: 5578.50, formula: (amount) => ((amount - 48475) * 0.22) + 5578.50 },
                { rate: 0.24, min: 103351, max: 197300, base: 17651, formula: (amount) => ((amount - 103350) * 0.24) + 17651 },
                { rate: 0.32, min: 197301, max: 250525, base: 40199, formula: (amount) => ((amount - 197300) * 0.32) + 40199 },
                { rate: 0.35, min: 250526, max: 626350, base: 57231, formula: (amount) => ((amount - 250525) * 0.35) + 57231 },
                { rate: 0.37, min: 626351, max: Infinity, base: 188769.75, formula: (amount) => ((amount - 626350) * 0.37) + 188769.75 }
            ],
            headOfHousehold: [
                { rate: 0.10, min: 0, max: 17000, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 17001, max: 64850, base: 1700, formula: (amount) => ((amount - 17000) * 0.12) + 1700 },
                { rate: 0.22, min: 64851, max: 103350, base: 7442, formula: (amount) => ((amount - 64850) * 0.22) + 7442 },
                { rate: 0.24, min: 103351, max: 197300, base: 15912, formula: (amount) => ((amount - 103350) * 0.24) + 15912 },
                { rate: 0.32, min: 197301, max: 250500, base: 38460, formula: (amount) => ((amount - 197300) * 0.32) + 38460 },
                { rate: 0.35, min: 250501, max: 626350, base: 55484, formula: (amount) => ((amount - 250500) * 0.35) + 55484 },
                { rate: 0.37, min: 626351, max: Infinity, base: 187031.50, formula: (amount) => ((amount - 626350) * 0.37) + 187031.50 }
            ],
            marriedJointly: [
                { rate: 0.10, min: 0, max: 23850, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 23851, max: 96950, base: 2385, formula: (amount) => ((amount - 23850) * 0.12) + 2385 },
                { rate: 0.22, min: 96951, max: 206700, base: 11157, formula: (amount) => ((amount - 96950) * 0.22) + 11157 },
                { rate: 0.24, min: 206701, max: 394600, base: 35302, formula: (amount) => ((amount - 206700) * 0.24) + 35302 },
                { rate: 0.32, min: 394601, max: 501050, base: 80398, formula: (amount) => ((amount - 394600) * 0.32) + 80398 },
                { rate: 0.35, min: 501051, max: 751600, base: 114462, formula: (amount) => ((amount - 501050) * 0.35) + 114462 },
                { rate: 0.37, min: 751601, max: Infinity, base: 202154.50, formula: (amount) => ((amount - 751600) * 0.37) + 202154.50 }
            ],
            marriedSeparately: [
                { rate: 0.10, min: 0, max: 11925, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 11926, max: 48475, base: 1192.50, formula: (amount) => ((amount - 11925) * 0.12) + 1192.50 },
                { rate: 0.22, min: 48476, max: 103350, base: 5578.50, formula: (amount) => ((amount - 48475) * 0.22) + 5578.50 },
                { rate: 0.24, min: 103351, max: 197300, base: 17651, formula: (amount) => ((amount - 103350) * 0.24) + 17651 },
                { rate: 0.32, min: 197301, max: 250525, base: 40199, formula: (amount) => ((amount - 197300) * 0.32) + 40199 },
                { rate: 0.35, min: 250526, max: 375800, base: 57231, formula: (amount) => ((amount - 250525) * 0.35) + 57231 },
                { rate: 0.37, min: 375801, max: Infinity, base: 101077.25, formula: (amount) => ((amount - 375800) * 0.37) + 101077.25 }
            ]
        },
        standardDeductions: {
            single: 15000,
            headOfHousehold: 22500,
            marriedJointly: 30000,
            marriedSeparately: 15000
        },
        age65PlusDeductions: {
            single: 2000,
            headOfHousehold: 2000,
            marriedJointly: 1600, // per spouse (assuming one spouse is 65+)
            marriedSeparately: 1600
        },
        dependentCredit: 2000,
        retirementLimit: {
            standard: 23500,
            catchUp: 7500,
            max: 31000
        },
        iraLimit: {
            standard: 7000,
            catchUp: 1000,
            max: 8000
        },
        hsaLimit: {
            selfOnly: 4150,
            family: 8300,
            catchUp: 1000 // Age 55+
        },
        fsaLimit: 3200,
        studentLoanInterestLimit: 2500,
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: {
            // Single/Head of Household - Covered by employer plan
            singleCovered: { full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000 },
            headOfHouseholdCovered: { full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000 },
            // Married Filing Jointly - Both covered
            marriedBothCovered: { full: 126000, phaseOutStart: 126000, phaseOutEnd: 146000 },
            // Married Filing Jointly - One spouse covered
            marriedOneCovered: { full: 236000, phaseOutStart: 236000, phaseOutEnd: 246000 },
            // Married Filing Separately - Covered
            marriedSeparateCovered: { phaseOutStart: 0, phaseOutEnd: 10000 }
        },
        rothIraLimits: {
            // Single/Head of Household
            single: { phaseOutStart: 146000, phaseOutEnd: 161000 },
            headOfHousehold: { phaseOutStart: 146000, phaseOutEnd: 161000 },
            // Married Filing Jointly
            marriedJointly: { phaseOutStart: 230000, phaseOutEnd: 240000 },
            // Married Filing Separately
            marriedSeparately: { phaseOutStart: 0, phaseOutEnd: 10000 }
        }
    },
    2026: {
        brackets: {
            single: [
                { rate: 0.10, min: 0, max: 12400, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 12401, max: 50400, base: 1240, formula: (amount) => ((amount - 12400) * 0.12) + 1240 },
                { rate: 0.22, min: 50401, max: 105700, base: 5800, formula: (amount) => ((amount - 50400) * 0.22) + 5800 },
                { rate: 0.24, min: 105701, max: 201775, base: 17966, formula: (amount) => ((amount - 105700) * 0.24) + 17966 },
                { rate: 0.32, min: 201776, max: 256225, base: 41024, formula: (amount) => ((amount - 201775) * 0.32) + 41024 },
                { rate: 0.35, min: 256226, max: 640600, base: 58448, formula: (amount) => ((amount - 256225) * 0.35) + 58448 },
                { rate: 0.37, min: 640601, max: Infinity, base: 192979.25, formula: (amount) => ((amount - 640600) * 0.37) + 192979.25 }
            ],
            headOfHousehold: [
                { rate: 0.10, min: 0, max: 17700, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 17701, max: 67450, base: 1770, formula: (amount) => ((amount - 17700) * 0.12) + 1770 },
                { rate: 0.22, min: 67451, max: 105700, base: 7740, formula: (amount) => ((amount - 67450) * 0.22) + 7740 },
                { rate: 0.24, min: 105701, max: 201750, base: 16155, formula: (amount) => ((amount - 105700) * 0.24) + 16155 },
                { rate: 0.32, min: 201751, max: 256200, base: 39207, formula: (amount) => ((amount - 201750) * 0.32) + 39207 },
                { rate: 0.35, min: 256201, max: 640600, base: 56631, formula: (amount) => ((amount - 256200) * 0.35) + 56631 },
                { rate: 0.37, min: 640601, max: Infinity, base: 191171, formula: (amount) => ((amount - 640600) * 0.37) + 191171 }
            ],
            marriedJointly: [
                { rate: 0.10, min: 0, max: 24800, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 24801, max: 100800, base: 2480, formula: (amount) => ((amount - 24800) * 0.12) + 2480 },
                { rate: 0.22, min: 100801, max: 211400, base: 11600, formula: (amount) => ((amount - 100800) * 0.22) + 11600 },
                { rate: 0.24, min: 211401, max: 403550, base: 35932, formula: (amount) => ((amount - 211400) * 0.24) + 35932 },
                { rate: 0.32, min: 403551, max: 512450, base: 82048, formula: (amount) => ((amount - 403550) * 0.32) + 82048 },
                { rate: 0.35, min: 512451, max: 768700, base: 116896, formula: (amount) => ((amount - 512450) * 0.35) + 116896 },
                { rate: 0.37, min: 768701, max: Infinity, base: 206583.50, formula: (amount) => ((amount - 768700) * 0.37) + 206583.50 }
            ],
            marriedSeparately: [
                { rate: 0.10, min: 0, max: 12400, base: 0, formula: (amount) => amount * 0.10 },
                { rate: 0.12, min: 12401, max: 50400, base: 1240, formula: (amount) => ((amount - 12400) * 0.12) + 1240 },
                { rate: 0.22, min: 50401, max: 105700, base: 5800, formula: (amount) => ((amount - 50400) * 0.22) + 5800 },
                { rate: 0.24, min: 105701, max: 201775, base: 17966, formula: (amount) => ((amount - 105700) * 0.24) + 17966 },
                { rate: 0.32, min: 201776, max: 256225, base: 41024, formula: (amount) => ((amount - 201775) * 0.32) + 41024 },
                { rate: 0.35, min: 256226, max: 384350, base: 58448, formula: (amount) => ((amount - 256225) * 0.35) + 58448 },
                { rate: 0.37, min: 384351, max: Infinity, base: 103291.75, formula: (amount) => ((amount - 384350) * 0.37) + 103291.75 }
            ]
        },
        standardDeductions: {
            single: 16100,
            headOfHousehold: 24150,
            marriedJointly: 32200,
            marriedSeparately: 16100
        },
        age65PlusDeductions: {
            single: 2050,
            headOfHousehold: 2050,
            marriedJointly: 1650, // per spouse (assuming one spouse is 65+)
            marriedSeparately: 1650
        },
        dependentCredit: 2000, // Assuming same as 2025
        retirementLimit: {
            standard: 24500,
            catchUp: 8000,
            max: 32500
        },
        iraLimit: {
            standard: 7500,
            catchUp: 1100,
            max: 8600
        },
        hsaLimit: {
            selfOnly: 4300,
            family: 8650,
            catchUp: 1000 // Age 55+
        },
        fsaLimit: 3250,
        studentLoanInterestLimit: 2500,
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: {
            // Single/Head of Household - Covered by employer plan
            singleCovered: { full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000 },
            headOfHouseholdCovered: { full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000 },
            // Married Filing Jointly - Both covered
            marriedBothCovered: { full: 129000, phaseOutStart: 129000, phaseOutEnd: 149000 },
            // Married Filing Jointly - One spouse covered
            marriedOneCovered: { full: 241000, phaseOutStart: 241000, phaseOutEnd: 251000 },
            // Married Filing Separately - Covered
            marriedSeparateCovered: { phaseOutStart: 0, phaseOutEnd: 10000 }
        },
        rothIraLimits: {
            // Single/Head of Household
            single: { phaseOutStart: 149000, phaseOutEnd: 164000 },
            headOfHousehold: { phaseOutStart: 149000, phaseOutEnd: 164000 },
            // Married Filing Jointly
            marriedJointly: { phaseOutStart: 235000, phaseOutEnd: 245000 },
            // Married Filing Separately
            marriedSeparately: { phaseOutStart: 0, phaseOutEnd: 10000 }
        }
    }
};

/**
 * Get available tax years
 */
function getAvailableYears() {
    return Object.keys(TAX_YEAR_DATA).map(Number).sort((a, b) => b - a);
}

/**
 * Get tax year data for a specific year
 */
function getTaxYearData(year) {
    return TAX_YEAR_DATA[year];
}

/**
 * Get current/default tax year (most recent available)
 */
function getCurrentTaxYear() {
    const years = getAvailableYears();
    return years[0] || 2025;
}

/**
 * Calculate standard deduction based on filing status, age, and year
 */
function calculateStandardDeduction(filingStatus, isAge65Plus, year) {
    const yearData = getTaxYearData(year);
    let deduction = yearData.standardDeductions[filingStatus];
    
    if (isAge65Plus) {
        deduction += yearData.age65PlusDeductions[filingStatus];
    }
    
    return deduction;
}

/**
 * Calculate MAGI (Modified Adjusted Gross Income) for Traditional IRA eligibility
 * MAGI = Gross Income - (401k + HSA + health premiums + FSA + student loan interest + educator expenses)
 * Note: Traditional IRA contributions are NOT deducted when calculating MAGI for eligibility
 */
function calculateMAGI(grossIncome, retirementContributions, hsaContributions, healthInsurancePremiums, fsaContributions, studentLoanInterest, educatorExpenses) {
    // Start with gross income
    let magi = grossIncome;
    
    // Subtract pre-tax deductions (but NOT Traditional IRA contributions)
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
function findTaxBracket(taxableIncome, filingStatus, year) {
    const yearData = getTaxYearData(year);
    const brackets = yearData.brackets[filingStatus];
    
    for (let bracket of brackets) {
        if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
            return bracket;
        }
    }
    
    // Fallback to highest bracket
    return brackets[brackets.length - 1];
}

/**
 * Get Traditional IRA phase-out limits text for display
 */
function getTraditionalIRAPhaseOutText(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year) {
    const yearData = getTaxYearData(year);
    const limits = yearData.traditionalIraDeductionLimits;
    
    let limitSet;
    let statusText = '';
    
    if (filingStatus === 'single') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.singleCovered;
            statusText = 'Single (covered by employer plan)';
        } else {
            return 'Full deduction regardless of income (not covered by employer plan)';
        }
    } else if (filingStatus === 'headOfHousehold') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.headOfHouseholdCovered;
            statusText = 'Head of Household (covered by employer plan)';
        } else {
            return 'Full deduction regardless of income (not covered by employer plan)';
        }
    } else if (filingStatus === 'marriedJointly') {
        if (isCoveredByEmployerPlan && isSpouseCoveredByEmployerPlan) {
            limitSet = limits.marriedBothCovered;
            statusText = 'Married Filing Jointly (both covered)';
        } else if (isCoveredByEmployerPlan || isSpouseCoveredByEmployerPlan) {
            limitSet = limits.marriedOneCovered;
            statusText = 'Married Filing Jointly (one spouse covered)';
        } else {
            return 'Full deduction regardless of income (neither spouse covered)';
        }
    } else if (filingStatus === 'marriedSeparately') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.marriedSeparateCovered;
            statusText = 'Married Filing Separately (covered by employer plan)';
        } else {
            return 'Full deduction regardless of income (not covered by employer plan)';
        }
    } else {
        return '';
    }
    
    if (!limitSet) {
        return '';
    }
    
    // Format phase-out text
    if (limitSet.full !== undefined) {
        // Has full deduction threshold
        return `${statusText}: Full deduction up to $${limitSet.full.toLocaleString()}, phases out $${limitSet.phaseOutStart.toLocaleString()} - $${limitSet.phaseOutEnd.toLocaleString()}`;
    } else {
        // Married filing separately - always partial if covered
        return `${statusText}: Partial deduction if MAGI < $${limitSet.phaseOutEnd.toLocaleString()}, no deduction at $${limitSet.phaseOutEnd.toLocaleString()}+`;
    }
}

/**
 * Get Traditional IRA income thresholds as structured data
 * Returns: { fullThreshold, phaseOutStart, phaseOutEnd, statusText, hasFullThreshold, hasNoLimit }
 */
function getTraditionalIRAThresholds(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year) {
    const yearData = getTaxYearData(year);
    const limits = yearData.traditionalIraDeductionLimits;
    
    let limitSet;
    let statusText = '';
    
    if (filingStatus === 'single') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.singleCovered;
            statusText = 'Single (covered by employer plan)';
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: 'Single (not covered by employer plan)',
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    } else if (filingStatus === 'headOfHousehold') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.headOfHouseholdCovered;
            statusText = 'Head of Household (covered by employer plan)';
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: 'Head of Household (not covered by employer plan)',
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    } else if (filingStatus === 'marriedJointly') {
        if (isCoveredByEmployerPlan && isSpouseCoveredByEmployerPlan) {
            limitSet = limits.marriedBothCovered;
            statusText = 'Married Filing Jointly (both covered)';
        } else if (isCoveredByEmployerPlan || isSpouseCoveredByEmployerPlan) {
            limitSet = limits.marriedOneCovered;
            statusText = 'Married Filing Jointly (one spouse covered)';
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: 'Married Filing Jointly (neither spouse covered)',
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    } else if (filingStatus === 'marriedSeparately') {
        if (isCoveredByEmployerPlan) {
            limitSet = limits.marriedSeparateCovered;
            statusText = 'Married Filing Separately (covered by employer plan)';
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: 'Married Filing Separately (not covered by employer plan)',
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    } else {
        return {
            fullThreshold: null,
            phaseOutStart: null,
            phaseOutEnd: null,
            statusText: '',
            hasFullThreshold: false,
            hasNoLimit: false
        };
    }
    
    if (!limitSet) {
        return {
            fullThreshold: null,
            phaseOutStart: null,
            phaseOutEnd: null,
            statusText: '',
            hasFullThreshold: false,
            hasNoLimit: false
        };
    }
    
    return {
        fullThreshold: limitSet.full !== undefined ? limitSet.full : null,
        phaseOutStart: limitSet.phaseOutStart,
        phaseOutEnd: limitSet.phaseOutEnd,
        statusText: statusText,
        hasFullThreshold: limitSet.full !== undefined,
        hasNoLimit: false
    };
}

/**
 * Calculate IRA contribution recommendations (Traditional vs Roth split)
 * Implements the logic: Calculate Trad deductible limit, then fill remaining space with Roth
 * Returns: { recommendedTrad, recommendedRoth, remainingSpace, globalLimit, tradDeductibleLimit }
 */
function calculateIRAContributionRecommendations(magi, filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year, isEligibleForCatchUp, iraContribution = 0) {
    const yearData = getTaxYearData(year);
    
    // Step 1: Define Global_Limit ($7,000 or $8,000 based on age)
    const globalLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    // Step 2: Calculate Trad_Deductible_Limit based on MAGI & Active_Participant_Status
    const tradDeductionInfo = calculateTraditionalIRADeductible(
        magi,
        filingStatus,
        isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan,
        globalLimit, // Use full limit to calculate maximum deductible amount
        year,
        isEligibleForCatchUp
    );
    
    const tradDeductibleLimit = tradDeductionInfo.deductibleAmount;
    
    // Step 3: Set Recommended_Trad_Contribution = Trad_Deductible_Limit
    const recommendedTrad = Math.min(tradDeductibleLimit, globalLimit);
    
    // Step 4: Calculate Remaining_Space = Global_Limit - Recommended_Trad_Contribution
    const remainingSpace = Math.max(0, globalLimit - recommendedTrad);
    
    // Step 5: Check Roth Eligibility
    const rothEligibility = checkRothIRAEligibility(magi, filingStatus, year, isEligibleForCatchUp);
    
    let recommendedRoth = 0;
    
    // Get Roth phase-out limits to check MAGI against phase-out start/end
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
            // MAGI < Roth_Phase_Out_Start: Fully eligible
            recommendedRoth = Math.min(remainingSpace, rothEligibility.maxContribution);
        } else if (magi >= rothLimitSet.phaseOutEnd) {
            // MAGI >= Roth_Phase_Out_End: Not eligible
            recommendedRoth = 0;
        } else {
            // MAGI is in phase-out range: Use Reduced_Roth_Limit
            const reducedRothLimit = rothEligibility.allowedContribution || 0;
            recommendedRoth = Math.min(remainingSpace, reducedRothLimit);
        }
    } else {
        // Fallback: use rothEligibility result
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

/**
 * Calculate phase-out insights for maximizing IRA deductions
 * Returns: { magiReductionNeeded, additionalDeductibleAmount, magiReductionPer1000, phaseOutPosition }
 */
function calculatePhaseOutInsights(magi, lowerLimit, upperLimit, maxContribution, currentDeductibleAmount) {
    const phaseOutRange = upperLimit - lowerLimit;
    const magiOverLowerLimit = Math.max(0, magi - lowerLimit);
    const phaseOutPosition = magiOverLowerLimit / phaseOutRange; // 0 = start, 1 = end
    
    // Calculate how much MAGI needs to be reduced to get full deduction
    const magiReductionNeeded = Math.max(0, magi - lowerLimit);
    
    // Calculate what the deductible amount would be if MAGI were reduced to lower limit
    const fullDeductibleAmount = maxContribution;
    const additionalDeductibleAmount = fullDeductibleAmount - currentDeductibleAmount;
    
    // Calculate how much each $1,000 reduction in MAGI increases deductible amount
    // This is approximate since the relationship is linear
    const magiReductionPer1000 = phaseOutRange > 0 ? (maxContribution / phaseOutRange) * 1000 : 0;
    
    return {
        magiReductionNeeded,
        additionalDeductibleAmount,
        magiReductionPer1000,
        phaseOutPosition: Math.min(1, Math.max(0, phaseOutPosition))
    };
}

/**
 * Get individual IRA thresholds for a specific spouse
 * This is important because each spouse has their own phase-out limits
 */
function getIndividualIRAThresholds(filingStatus, isThisSpouseCovered, isOtherSpouseCovered, year) {
    const yearData = getTaxYearData(year);
    const limits = yearData.traditionalIraDeductionLimits;
    
    // Single or Head of Household - individual limits
    if (filingStatus === 'single' || filingStatus === 'headOfHousehold') {
        if (isThisSpouseCovered) {
            const limitSet = filingStatus === 'single' ? limits.singleCovered : limits.headOfHouseholdCovered;
            return {
                fullThreshold: limitSet.full || limitSet.phaseOutStart,
                phaseOutStart: limitSet.phaseOutStart,
                phaseOutEnd: limitSet.phaseOutEnd,
                statusText: `${filingStatus === 'single' ? 'Single' : 'Head of Household'} (covered by employer plan)`,
                hasFullThreshold: true,
                hasNoLimit: false
            };
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: `${filingStatus === 'single' ? 'Single' : 'Head of Household'} (not covered by employer plan)`,
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    }
    
    // Married Filing Jointly - individual limits per spouse
    if (filingStatus === 'marriedJointly') {
        if (isThisSpouseCovered) {
            // This spouse is covered - uses $126,000-$146,000 range
            const limitSet = limits.marriedBothCovered;
            return {
                fullThreshold: limitSet.full || limitSet.phaseOutStart,
                phaseOutStart: limitSet.phaseOutStart,
                phaseOutEnd: limitSet.phaseOutEnd,
                statusText: 'Your IRA (covered by employer plan)',
                hasFullThreshold: true,
                hasNoLimit: false
            };
        } else {
            // This spouse is NOT covered
            if (isOtherSpouseCovered) {
                // Other spouse is covered - this spouse uses $236,000-$246,000 range
                const limitSet = limits.marriedOneCovered;
                return {
                    fullThreshold: limitSet.full || limitSet.phaseOutStart,
                    phaseOutStart: limitSet.phaseOutStart,
                    phaseOutEnd: limitSet.phaseOutEnd,
                    statusText: 'Your IRA (not covered, spouse is covered)',
                    hasFullThreshold: true,
                    hasNoLimit: false
                };
            } else {
                // Neither spouse covered - no limits
                return {
                    fullThreshold: null,
                    phaseOutStart: null,
                    phaseOutEnd: null,
                    statusText: 'Your IRA (not covered by employer plan)',
                    hasFullThreshold: false,
                    hasNoLimit: true
                };
            }
        }
    }
    
    // Married Filing Separately
    if (filingStatus === 'marriedSeparately') {
        if (isThisSpouseCovered) {
            const limitSet = limits.marriedSeparateCovered;
            return {
                fullThreshold: null,
                phaseOutStart: limitSet.phaseOutStart,
                phaseOutEnd: limitSet.phaseOutEnd,
                statusText: 'Married Filing Separately (covered by employer plan)',
                hasFullThreshold: false,
                hasNoLimit: false
            };
        } else {
            return {
                fullThreshold: null,
                phaseOutStart: null,
                phaseOutEnd: null,
                statusText: 'Married Filing Separately (not covered by employer plan)',
                hasFullThreshold: false,
                hasNoLimit: true
            };
        }
    }
    
    // Default fallback
    return {
        fullThreshold: null,
        phaseOutStart: null,
        phaseOutEnd: null,
        statusText: '',
        hasFullThreshold: false,
        hasNoLimit: false
    };
}

/**
 * Generate HTML content for Traditional IRA Eligibility Card
 * Shows individual limits for the primary taxpayer's IRA
 * Also shows spouse recommendations if married filing jointly
 */
function generateIRAEligibilityCard(magi, filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, iraDeductionInfo, year, isEligibleForCatchUp, isSpouseEligibleForCatchUp = false, retirementContributions = 0, retirementLimit = 0, taxableIncome = 0, marginalRate = 0) {
    const formatMoney = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };
    
    // Get individual thresholds for THIS spouse (primary taxpayer)
    const thresholds = getIndividualIRAThresholds(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
    
    // Handle edge cases
    if (!filingStatus || magi === 0) {
        return `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p class="text-xs text-slate-500 text-center">
                    Enter your income and filing status to see Traditional IRA eligibility.
                </p>
            </div>
        `;
    }
    
    // Determine eligibility status and room before phase-out
    let statusColor, statusText, adviceText, roomBeforePhaseOut, cardBgColor, cardBorderColor;
    
    if (thresholds.hasNoLimit) {
        // Not covered by employer plan - full deduction regardless of income
        statusColor = 'text-emerald-600';
        statusText = 'Fully Eligible';
        cardBgColor = 'bg-emerald-50';
        cardBorderColor = 'border-emerald-200';
        adviceText = `You can contribute up to ${formatMoney(iraDeductionInfo.maxContribution)} with full deduction regardless of income (not covered by employer retirement plan).`;
        roomBeforePhaseOut = null;
    } else if (iraDeductionInfo.isFullyDeductible) {
        statusColor = 'text-emerald-600';
        statusText = 'Fully Eligible';
        cardBgColor = 'bg-emerald-50';
        cardBorderColor = 'border-emerald-200';
        if (thresholds.hasFullThreshold) {
            roomBeforePhaseOut = thresholds.phaseOutStart - magi;
            adviceText = `You can contribute up to ${formatMoney(iraDeductionInfo.maxContribution)} with full deduction.`;
        } else {
            adviceText = `You can contribute up to ${formatMoney(iraDeductionInfo.maxContribution)} with full deduction.`;
        }
    } else if (iraDeductionInfo.isPartiallyDeductible) {
        statusColor = 'text-amber-600';
        statusText = 'Partially Eligible';
        cardBgColor = 'bg-amber-50';
        cardBorderColor = 'border-amber-200';
        roomBeforePhaseOut = thresholds.phaseOutEnd - magi;
        const deductiblePercentage = iraDeductionInfo.deductibleAmount > 0 && iraDeductionInfo.maxContribution > 0 
            ? Math.round((iraDeductionInfo.deductibleAmount / iraDeductionInfo.maxContribution) * 100)
            : 0;
        adviceText = `You're in the phase-out range. ${iraDeductionInfo.deductibleAmount > 0 ? `Current contributions are approximately ${deductiblePercentage}% deductible.` : 'Additional contributions may still provide tax savings.'}`;
    } else {
        statusColor = 'text-red-600';
        statusText = 'Not Eligible';
        cardBgColor = 'bg-red-50';
        cardBorderColor = 'border-red-200';
        roomBeforePhaseOut = 0;
        adviceText = `Your MAGI exceeds the limit for Traditional IRA deductions. Consider Roth IRA or Backdoor Roth IRA strategies.`;
    }
    
    // Build HTML
    let html = `
        <div class="p-4 ${cardBgColor} rounded-xl border ${cardBorderColor}">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h4 class="text-sm font-bold text-slate-900 mb-1">Your Traditional IRA Eligibility</h4>
                    <p class="text-xs text-slate-600">${thresholds.statusText}</p>
                    ${filingStatus === 'marriedJointly' ? `
                        <p class="text-xs text-slate-500 mt-1 italic">Individual limits apply to each spouse separately</p>
                    ` : ''}
                </div>
                <span class="text-sm font-bold ${statusColor}">${statusText}</span>
            </div>
            
            <div class="space-y-2 mb-3">
                <div class="flex justify-between items-center text-sm">
                    <span class="text-slate-600">Current MAGI:</span>
                    <span class="font-bold text-slate-900">${formatMoney(magi)}</span>
                </div>
    `;
    
    // Show thresholds if applicable
    if (!thresholds.hasNoLimit) {
        if (thresholds.hasFullThreshold) {
            html += `
                <div class="flex justify-between items-center text-xs text-slate-500">
                    <span>Your full deduction limit:</span>
                    <span class="font-medium">${formatMoney(thresholds.fullThreshold)}</span>
                </div>
            `;
        }
        html += `
            <div class="flex justify-between items-center text-xs text-slate-500">
                <span>Your phase-out range:</span>
                <span class="font-medium">${formatMoney(thresholds.phaseOutStart)} - ${formatMoney(thresholds.phaseOutEnd)}</span>
            </div>
        `;
        
        // Show room before phase-out if applicable
        if (roomBeforePhaseOut !== null && roomBeforePhaseOut > 0) {
            html += `
                <div class="flex justify-between items-center text-xs text-emerald-600 font-medium">
                    <span>Room before phase-out:</span>
                    <span>${formatMoney(roomBeforePhaseOut)}</span>
                </div>
            `;
        } else if (roomBeforePhaseOut !== null && roomBeforePhaseOut <= 0 && iraDeductionInfo.isPartiallyDeductible) {
            html += `
                <div class="flex justify-between items-center text-xs text-amber-600 font-medium">
                    <span>Currently in phase-out:</span>
                    <span>${formatMoney(Math.abs(roomBeforePhaseOut))} over start</span>
                </div>
            `;
        }
        
        // Show current deductible amount if partially eligible
        if (iraDeductionInfo.isPartiallyDeductible) {
            const deductiblePercentage = iraDeductionInfo.deductibleAmount > 0 && iraDeductionInfo.maxContribution > 0 
                ? Math.round((iraDeductionInfo.deductibleAmount / iraDeductionInfo.maxContribution) * 100)
                : 0;
            html += `
                <div class="flex justify-between items-center text-sm mt-2 pt-2 border-t ${cardBorderColor}">
                    <span class="text-slate-600">Current deductible amount:</span>
                    <span class="font-bold text-amber-700">${formatMoney(iraDeductionInfo.deductibleAmount)} (${deductiblePercentage}%)</span>
                </div>
                <div class="flex justify-between items-center text-xs text-slate-500">
                    <span>Max contribution:</span>
                    <span>${formatMoney(iraDeductionInfo.maxContribution)}</span>
                </div>
            `;
        }
    }
    
    html += `
            </div>
            
            <div class="pt-2 border-t ${cardBorderColor}">
                <p class="text-xs text-slate-600 leading-relaxed mb-3">${adviceText}</p>
    `;
    
    // Add detailed phase-out insights for partially eligible cases
    if (iraDeductionInfo.isPartiallyDeductible && thresholds.hasFullThreshold) {
        const insights = calculatePhaseOutInsights(
            magi,
            thresholds.fullThreshold,
            thresholds.phaseOutEnd,
            iraDeductionInfo.maxContribution,
            iraDeductionInfo.deductibleAmount
        );
        
        const phaseOutPercent = Math.round(insights.phaseOutPosition * 100);
        const magiReductionToFull = insights.magiReductionNeeded;
        
        html += `
                <div class="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                    <h5 class="text-xs font-bold text-slate-900 mb-2">Maximize Your Deduction</h5>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600">Phase-out position:</span>
                            <span class="font-semibold text-amber-700">${phaseOutPercent}% through range</span>
                        </div>
                        ${magiReductionToFull > 0 ? `
                            <div class="flex justify-between items-center">
                                <span class="text-slate-600">MAGI reduction needed for full deduction:</span>
                                <span class="font-semibold text-emerald-700">${formatMoney(magiReductionToFull)}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-slate-600">Additional deductible if MAGI reduced:</span>
                                <span class="font-semibold text-emerald-700">${formatMoney(insights.additionalDeductibleAmount)}</span>
                            </div>
                            <div class="pt-2 mt-2 border-t border-amber-200">
                                <p class="text-slate-600 font-medium mb-1">💡 Strategy:</p>
                                <ul class="text-slate-600 space-y-1 ml-3 list-disc">
                                    ${retirementContributions < retirementLimit ? `
                                        <li>Increase 401(k) contributions to reduce MAGI</li>
                                    ` : ''}
                                    <li>Each $1,000 reduction in MAGI ≈ ${formatMoney(Math.round(insights.magiReductionPer1000))} more deductible</li>
                                    <li>Reduce MAGI by ${formatMoney(Math.ceil(magiReductionToFull / 1000) * 1000)} to maximize deduction</li>
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
        `;
    }
    
    // Add IRA Contribution Recommendations section
    const recommendations = calculateIRAContributionRecommendations(
        magi,
        filingStatus,
        isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan,
        year,
        isEligibleForCatchUp
    );
    
    html += `
            </div>
            
            <div class="mt-4 pt-4 border-t ${cardBorderColor}">
                <h5 class="text-xs font-bold text-slate-900 mb-2">Recommended Contribution Strategy</h5>
                <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
    `;
    
    // Handle edge cases
    if (recommendations.tradDeductibleLimit === 0 && !recommendations.rothEligible) {
        // Trad not deductible and Roth not eligible - suggest Backdoor Roth
        html += `
                    <p class="text-xs text-slate-600 mb-2">
                        <strong>Traditional IRA:</strong> Not deductible at your income level.
                    </p>
                    <p class="text-xs text-slate-600 mb-2">
                        <strong>Roth IRA:</strong> Not eligible due to income limits.
                    </p>
                    <p class="text-xs text-indigo-700 font-medium mt-2">
                        💡 Consider Backdoor Roth IRA strategy: Contribute ${formatMoney(recommendations.globalLimit)} to Traditional IRA (non-deductible), then convert to Roth IRA.
                    </p>
        `;
    } else if (recommendations.remainingSpace === 0) {
        // Full limit used for Traditional
        html += `
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-slate-700">Put</span>
                        <span class="text-sm font-bold text-indigo-700">${formatMoney(recommendations.recommendedTrad)}</span>
                        <span class="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                    </div>
                    <p class="text-xs text-slate-600">
                        All ${formatMoney(recommendations.globalLimit)} contribution limit is used for Traditional IRA (fully deductible).
                    </p>
        `;
    } else {
        // Show both Traditional and Roth recommendations
        html += `
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-slate-700">Put</span>
                            <span class="text-sm font-bold text-indigo-700">${formatMoney(recommendations.recommendedTrad)}</span>
                            <span class="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                        </div>
                        ${recommendations.recommendedRoth > 0 ? `
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-slate-700">Put</span>
                                <span class="text-sm font-bold text-indigo-700">${formatMoney(recommendations.recommendedRoth)}</span>
                                <span class="text-xs font-semibold text-slate-700">in Roth IRA</span>
                            </div>
                        ` : ''}
                        <div class="pt-2 mt-2 border-t border-indigo-200">
                            <p class="text-xs text-slate-600">
                                <strong>Breakdown:</strong> Traditional: ${formatMoney(recommendations.recommendedTrad)} ${recommendations.recommendedTrad > 0 ? '(deductible)' : ''} ${recommendations.recommendedRoth > 0 ? `+ Roth: ${formatMoney(recommendations.recommendedRoth)}` : ''} = ${formatMoney(recommendations.recommendedTrad + recommendations.recommendedRoth)} total
                            </p>
                        </div>
                    </div>
        `;
    }
    
    html += `
                </div>
            </div>
    `;
    
    // Add tax savings note for recommended Traditional IRA contribution
    if (recommendations.recommendedTrad > 0 && marginalRate > 0) {
        const taxSavings = recommendations.recommendedTrad * (marginalRate / 100);
        html += `
            <div class="mt-3 pt-3 border-t ${cardBorderColor}">
                <p class="text-xs text-slate-600">
                    <strong>Tax Savings:</strong> Contributing <strong class="text-indigo-700">${formatMoney(recommendations.recommendedTrad)}</strong> to Traditional IRA at your current tax rate of <strong class="text-indigo-700">${marginalRate.toFixed(1)}%</strong> will reduce your tax liability by approximately <strong class="text-indigo-700">${formatMoney(taxSavings)}</strong>.
                </p>
            </div>
        `;
    }
    
    // Add Spouse Recommendations for Married Filing Jointly
    if (filingStatus === 'marriedJointly') {
        // Calculate spouse's individual Traditional IRA deductible limit
        const spouseIraDeductionInfo = calculateTraditionalIRADeductible(
            magi,
            filingStatus,
            isSpouseCoveredByEmployerPlan, // Spouse's coverage status
            isCoveredByEmployerPlan, // Primary taxpayer's coverage status (for spouse calculation)
            isEligibleForCatchUp ? getTaxYearData(year).iraLimit.max : getTaxYearData(year).iraLimit.standard,
            year,
            isSpouseEligibleForCatchUp
        );
        
        // Calculate spouse recommendations
        const spouseRecommendations = calculateIRAContributionRecommendations(
            magi,
            filingStatus,
            isSpouseCoveredByEmployerPlan, // Spouse's coverage status
            isCoveredByEmployerPlan, // Primary taxpayer's coverage status
            year,
            isSpouseEligibleForCatchUp
        );
        
        html += `
            <div class="mt-4 pt-4 border-t ${cardBorderColor}">
                <h5 class="text-xs font-bold text-slate-900 mb-2">Spouse IRA Recommendations</h5>
                <div class="p-3 bg-purple-50 rounded-lg border border-purple-200">
        `;
        
        // Handle edge cases for spouse
        if (spouseRecommendations.tradDeductibleLimit === 0 && !spouseRecommendations.rothEligible) {
            html += `
                    <p class="text-xs text-slate-600 mb-2">
                        <strong>Traditional IRA:</strong> Not deductible at your income level.
                    </p>
                    <p class="text-xs text-slate-600 mb-2">
                        <strong>Roth IRA:</strong> Not eligible due to income limits.
                    </p>
                    <p class="text-xs text-purple-700 font-medium mt-2">
                        💡 Consider Backdoor Roth IRA strategy: Contribute ${formatMoney(spouseRecommendations.globalLimit)} to Traditional IRA (non-deductible), then convert to Roth IRA.
                    </p>
            `;
        } else if (spouseRecommendations.remainingSpace === 0) {
            html += `
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-slate-700">Put</span>
                        <span class="text-sm font-bold text-purple-700">${formatMoney(spouseRecommendations.recommendedTrad)}</span>
                        <span class="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                    </div>
                    <p class="text-xs text-slate-600">
                        All ${formatMoney(spouseRecommendations.globalLimit)} contribution limit is used for Traditional IRA (fully deductible).
                    </p>
            `;
        } else {
            html += `
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-slate-700">Put</span>
                            <span class="text-sm font-bold text-purple-700">${formatMoney(spouseRecommendations.recommendedTrad)}</span>
                            <span class="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                        </div>
                        ${spouseRecommendations.recommendedRoth > 0 ? `
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-slate-700">Put</span>
                                <span class="text-sm font-bold text-purple-700">${formatMoney(spouseRecommendations.recommendedRoth)}</span>
                                <span class="text-xs font-semibold text-slate-700">in Roth IRA</span>
                            </div>
                        ` : ''}
                        <div class="pt-2 mt-2 border-t border-purple-200">
                            <p class="text-xs text-slate-600">
                                <strong>Breakdown:</strong> Traditional: ${formatMoney(spouseRecommendations.recommendedTrad)} ${spouseRecommendations.recommendedTrad > 0 ? '(deductible)' : ''} ${spouseRecommendations.recommendedRoth > 0 ? `+ Roth: ${formatMoney(spouseRecommendations.recommendedRoth)}` : ''} = ${formatMoney(spouseRecommendations.recommendedTrad + spouseRecommendations.recommendedRoth)} total
                            </p>
                        </div>
                    </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // Add tax savings note for spouse recommended Traditional IRA contribution
        if (spouseRecommendations.recommendedTrad > 0 && marginalRate > 0) {
            const spouseTaxSavings = spouseRecommendations.recommendedTrad * (marginalRate / 100);
            html += `
                <div class="mt-3 pt-3 border-t ${cardBorderColor}">
                    <p class="text-xs text-slate-600">
                        <strong>Tax Savings:</strong> Contributing <strong class="text-purple-700">${formatMoney(spouseRecommendations.recommendedTrad)}</strong> to Traditional IRA at your current tax rate of <strong class="text-purple-700">${marginalRate.toFixed(1)}%</strong> will reduce your tax liability by approximately <strong class="text-purple-700">${formatMoney(spouseTaxSavings)}</strong>.
                    </p>
                </div>
            `;
        }
    }
    
    html += `
        </div>
    `;
    
    return html;
}

/**
 * Calculate Traditional IRA deductible amount based on MAGI, filing status, and employer plan coverage
 * Implements the exact IRS logic flow with proper rounding and floor rules
 * Returns: { deductibleAmount, isFullyDeductible, isPartiallyDeductible, isNonDeductible, maxContribution }
 */
function calculateTraditionalIRADeductible(magi, filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, iraContribution, year, isEligibleForCatchUp = false) {
    const yearData = getTaxYearData(year);
    
    // Step 2: Determine Max Contribution
    // IF User Age < 50: Max Contribution = $7,000
    // IF User Age ≥ 50: Max Contribution = $8,000
    const maxContribution = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    // Step 1: Define the User's Status and set Upper/Lower Limits
    let lowerLimit = null;
    let upperLimit = null;
    let phaseOutRange = null;
    
    // IF User is "Covered by Workplace Plan" AND Filing Status is "Married Filing Jointly"
    if (filingStatus === 'marriedJointly' && isCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedBothCovered;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit; // $20,000 for Married Filing Jointly
    }
    // ELSE IF User is "NOT Covered" AND Spouse is "Covered" AND Filing Status is "Married Filing Jointly"
    else if (filingStatus === 'marriedJointly' && !isCoveredByEmployerPlan && isSpouseCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedOneCovered;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit; // $10,000 for this case
    }
    // ELSE IF Neither is Covered
    else if ((filingStatus === 'single' || filingStatus === 'headOfHousehold') && !isCoveredByEmployerPlan) {
        // No Income Limit (Full Deduction)
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    else if (filingStatus === 'marriedJointly' && !isCoveredByEmployerPlan && !isSpouseCoveredByEmployerPlan) {
        // No Income Limit (Full Deduction)
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    else if (filingStatus === 'marriedSeparately' && !isCoveredByEmployerPlan) {
        // No Income Limit (Full Deduction)
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    // ELSE IF Single/HOH (Covered)
    else if ((filingStatus === 'single' || filingStatus === 'headOfHousehold') && isCoveredByEmployerPlan) {
        const limits = filingStatus === 'single' 
            ? yearData.traditionalIraDeductionLimits.singleCovered 
            : yearData.traditionalIraDeductionLimits.headOfHouseholdCovered;
        lowerLimit = limits.full || limits.phaseOutStart;
        upperLimit = limits.phaseOutEnd;
        phaseOutRange = upperLimit - lowerLimit; // $10,000 for Single/HOH
    }
    // Married Filing Separately - Covered
    else if (filingStatus === 'marriedSeparately' && isCoveredByEmployerPlan) {
        const limits = yearData.traditionalIraDeductionLimits.marriedSeparateCovered;
        lowerLimit = limits.phaseOutStart; // $0
        upperLimit = limits.phaseOutEnd; // $10,000
        phaseOutRange = upperLimit - lowerLimit; // $10,000
    }
    else {
        // Unknown case, assume full deduction
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    
    // Step 3: Compare MAGI to Limits
    // Logic A (Full Deduction): IF MAGI is less than or equal to Lower Limit
    if (lowerLimit !== null && magi <= lowerLimit) {
        return {
            deductibleAmount: Math.min(iraContribution, maxContribution),
            isFullyDeductible: true,
            isPartiallyDeductible: false,
            isNonDeductible: false,
            maxContribution: maxContribution
        };
    }
    
    // Logic B (No Deduction): IF MAGI is greater than or equal to Upper Limit
    if (upperLimit !== null && magi >= upperLimit) {
        return {
            deductibleAmount: 0,
            isFullyDeductible: false,
            isPartiallyDeductible: false,
            isNonDeductible: true,
            maxContribution: maxContribution
        };
    }
    
    // Logic C (Partial Deduction): IF MAGI is between Lower Limit and Upper Limit
    // Step 4: Calculation Engine (The "Partial" Math)
    
    // Step 4.1: Find the Difference
    // Subtract User's MAGI from the Upper Limit
    const difference = upperLimit - magi;
    
    // Step 4.2: Calculate the Ratio
    // Divide the result of Step 1 by the Phase-Out Range
    const ratio = difference / phaseOutRange;
    
    // Step 4.3: Apply to Contribution
    // Multiply the result of Step 2 by the Max Contribution
    const rawAmount = ratio * maxContribution;
    
    // Step 4.4: IRS Rounding Rule (Crucial)
    // If it is not a multiple of 10, round it UP to the next highest $10
    // Example: If calculation is $4,052, round up to $4,060
    let roundedAmount = rawAmount;
    if (roundedAmount % 10 !== 0) {
        roundedAmount = Math.ceil(roundedAmount / 10) * 10;
    }
    
    // Step 4.5: IRS Minimum Floor Rule
    // If the result is greater than $0 but less than $200, set the deduction to $200
    let finalAmount = roundedAmount;
    if (finalAmount > 0 && finalAmount < 200) {
        finalAmount = 200;
    }
    
    // Ensure the final amount doesn't exceed the actual contribution or max contribution
    finalAmount = Math.min(finalAmount, iraContribution, maxContribution);
    
    // Ensure the final amount is not negative
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
 * Get bracket information including name/description
 */
function getBracketInfo(bracket) {
    const ratePercent = Math.round(bracket.rate * 100);
    const rateNames = {
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
        min: bracket.min,
        max: bracket.max
    };
}

/**
 * Check Roth IRA eligibility based on MAGI and filing status
 * Returns: { isEligible, maxContribution, phaseOutPercentage }
 */
function checkRothIRAEligibility(magi, filingStatus, year, isEligibleForCatchUp = false) {
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
    
    // If MAGI is below phase-out start, fully eligible
    if (magi < limitSet.phaseOutStart) {
        return { isEligible: true, maxContribution: maxContribution, phaseOutPercentage: 100 };
    }
    
    // If MAGI is at or above phase-out end, not eligible
    if (magi >= limitSet.phaseOutEnd) {
        return { isEligible: false, maxContribution: maxContribution, phaseOutPercentage: 0 };
    }
    
    // Partial eligibility - calculate percentage
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
 * Calculate potential tax savings from increasing pre-tax contributions
 */
function calculatePotentialSavings(currentTaxableIncome, filingStatus, year, additional401k, additionalIRA) {
    const yearData = getTaxYearData(year);
    const currentBracket = findTaxBracket(currentTaxableIncome, filingStatus, year);
    const marginalRate = currentBracket.rate;
    
    // Calculate total additional contribution
    const totalAdditional = (additional401k || 0) + (additionalIRA || 0);
    
    if (totalAdditional <= 0) {
        return {
            additional401k: 0,
            additionalIRA: 0,
            totalAdditional: 0,
            taxSavings: 0,
            marginalRate: marginalRate * 100
        };
    }
    
    // Calculate new taxable income after additional contributions
    const newTaxableIncome = Math.max(0, currentTaxableIncome - totalAdditional);
    
    // Find new bracket (might be lower)
    const newBracket = findTaxBracket(newTaxableIncome, filingStatus, year);
    
    // Calculate tax savings: the difference in tax obligation
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
function calculateTax(grossIncome, filingStatus, isAge65Plus, numDependents, retirementContributions, iraContributions, hsaCoverageType, hsaContributions, healthInsurancePremiums, fsaContributions, studentLoanInterest, educatorExpenses, year, isAge50Plus = false, isCoveredByEmployerPlan = false, isSpouseCoveredByEmployerPlan = false, spouseIraContributions = 0, isSpouseAge50Plus = false) {
    // Age 65+ also qualifies for catch-up contributions (same as 50+)
    const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
    const isSpouseEligibleForCatchUp = isSpouseAge50Plus || isAge65Plus; // Assuming if user is 65+, spouse might also be
    const yearData = getTaxYearData(year);
    
    // Calculate MAGI for Traditional IRA eligibility (before Traditional IRA deduction)
    // For married filing jointly, MAGI is the same for both spouses
    const magi = calculateMAGI(grossIncome, retirementContributions, hsaContributions, healthInsurancePremiums, fsaContributions, studentLoanInterest, educatorExpenses);
    
    // Calculate deductible Traditional IRA amount for primary taxpayer based on MAGI
    const iraDeductionInfo = calculateTraditionalIRADeductible(magi, filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, iraContributions, year, isEligibleForCatchUp);
    const deductibleIraAmount = iraDeductionInfo.deductibleAmount;
    
    // For married filing jointly, calculate spouse's deductible amount separately
    let spouseIraDeductionInfo = null;
    let deductibleSpouseIraAmount = 0;
    if (filingStatus === 'marriedJointly' && spouseIraContributions > 0) {
        // Spouse's deduction eligibility is based on combined MAGI but their own employer plan coverage
        // For married filing jointly, spouse's eligibility uses the same MAGI but checks if spouse is covered
        spouseIraDeductionInfo = calculateTraditionalIRADeductible(magi, filingStatus, isSpouseCoveredByEmployerPlan, isCoveredByEmployerPlan, spouseIraContributions, year, isSpouseEligibleForCatchUp);
        deductibleSpouseIraAmount = spouseIraDeductionInfo.deductibleAmount;
    }
    
    // Calculate standard deduction (dependents don't affect this)
    const standardDeduction = calculateStandardDeduction(filingStatus, isAge65Plus, year);
    
    // Step 1: Reduce income by standard deduction
    let adjustedIncome = Math.max(0, grossIncome - standardDeduction);
    
    // Step 2: Reduce by 401k/retirement contributions
    adjustedIncome = Math.max(0, adjustedIncome - retirementContributions);
    
    // Step 3: Reduce by deductible traditional IRA contributions (both taxpayer and spouse if married filing jointly)
    adjustedIncome = Math.max(0, adjustedIncome - deductibleIraAmount - deductibleSpouseIraAmount);
    
    // Step 4: Reduce by HSA contributions
    adjustedIncome = Math.max(0, adjustedIncome - hsaContributions);
    
    // Step 5: Reduce by pre-tax health insurance premiums
    adjustedIncome = Math.max(0, adjustedIncome - healthInsurancePremiums);
    
    // Step 6: Reduce by FSA contributions
    adjustedIncome = Math.max(0, adjustedIncome - fsaContributions);
    
    // Step 7: Reduce by student loan interest
    adjustedIncome = Math.max(0, adjustedIncome - studentLoanInterest);
    
    // Step 8: Reduce by educator expenses
    const taxableIncome = Math.max(0, adjustedIncome - educatorExpenses);
    
    // Find applicable tax bracket
    const bracket = findTaxBracket(taxableIncome, filingStatus, year);
    const bracketInfo = getBracketInfo(bracket);
    
    // Calculate tax using the bracket's formula
    let taxObligation = bracket.formula(taxableIncome);
    
    // Apply dependent tax credit (reduces tax directly)
    const dependentCredit = numDependents * yearData.dependentCredit;
    taxObligation = Math.max(0, taxObligation - dependentCredit);
    
    // Calculate effective tax rate
    const effectiveRate = grossIncome > 0 ? (taxObligation / grossIncome) * 100 : 0;
    
    // Calculate total deductions (include spouse IRA contributions for married filing jointly)
    const totalDeductions = retirementContributions + iraContributions + (filingStatus === 'marriedJointly' ? spouseIraContributions : 0) + hsaContributions + healthInsurancePremiums + fsaContributions + studentLoanInterest + educatorExpenses;
    
    // Calculate potential savings from increasing contributions
    // Get the contribution limits for the selected tax year
    // Use max (with catch-up) if 50+ OR 65+, otherwise use standard limit
    const retirementLimit = isEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard;
    const iraLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    // Calculate remaining contribution room: limit for selected year minus user's current contributions
    const maxAdditional401k = Math.max(0, retirementLimit - retirementContributions);
    // For married filing jointly, each spouse has their own IRA limit
    const maxAdditionalIRA = Math.max(0, iraLimit - iraContributions);
    const maxAdditionalSpouseIRA = (filingStatus === 'marriedJointly') ? Math.max(0, iraLimit - spouseIraContributions) : 0;
    
    // Calculate savings for increasing contributions:
    // - By $1,000 (or remaining amount if less than $1,000)
    // - To the maximum allowed (if there's room)
    const potentialSavings401k = maxAdditional401k > 0 ? calculatePotentialSavings(taxableIncome, filingStatus, year, Math.min(1000, maxAdditional401k), 0) : null;
    const potentialSavingsIRA = maxAdditionalIRA > 0 ? calculatePotentialSavings(taxableIncome, filingStatus, year, 0, Math.min(1000, maxAdditionalIRA)) : null;
    const potentialSavingsMax401k = maxAdditional401k > 0 ? calculatePotentialSavings(taxableIncome, filingStatus, year, maxAdditional401k, 0) : null;
    const potentialSavingsMaxIRA = maxAdditionalIRA > 0 ? calculatePotentialSavings(taxableIncome, filingStatus, year, 0, maxAdditionalIRA) : null;
    
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
        maxAdditionalSpouseIRA: (filingStatus === 'marriedJointly') ? Math.max(0, iraLimit - spouseIraContributions) : 0,
        retirementLimit, // The max limit for the selected year
        iraLimit, // The max limit for the selected year
        magi, // Modified Adjusted Gross Income
        iraDeductionInfo, // Traditional IRA deduction eligibility info
        spouseIraContributions: filingStatus === 'marriedJointly' ? spouseIraContributions : 0,
        spouseIraDeductionInfo // Spouse Traditional IRA deduction eligibility info (if married filing jointly)
    };
}

/**
 * Update contribution limit badges based on age and year
 */
function updateContributionBadges(year, isAge50Plus = false, isAge65Plus = false) {
    const yearData = getTaxYearData(year);
    
    // Determine limits based on age - if 50+ OR 65+, use catch-up limits
    const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
    const retirementLimit = isEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard;
    const iraLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard;
    
    // Update retirement contributions badge
    const retirementLimitBadge = document.getElementById('retirementLimitBadge');
    if (retirementLimitBadge) {
        retirementLimitBadge.textContent = `Max $${retirementLimit.toLocaleString()}`;
    }
    
    // Update IRA contributions badge
    const iraLimitBadge = document.getElementById('iraLimitBadge');
    if (iraLimitBadge) {
        iraLimitBadge.textContent = `Max $${iraLimit.toLocaleString()}`;
    }
    
    // Update spouse IRA badge (if visible)
    const spouseIraLimitBadge = document.getElementById('spouseIraLimitBadge');
    if (spouseIraLimitBadge) {
        spouseIraLimitBadge.textContent = `Max $${iraLimit.toLocaleString()}`;
    }
}

/**
 * Update form fields based on selected year
 */
function updateFormForYear(year) {
    const yearData = getTaxYearData(year);
    
    // Get current age 50+ and 65+ status
    const age50PlusEl = document.getElementById('age50Plus');
    const isAge50Plus = age50PlusEl ? age50PlusEl.checked : false;
    const age65PlusEl = document.getElementById('age65Plus');
    const isAge65Plus = age65PlusEl ? age65PlusEl.checked : false;
    
    // Update retirement contributions max and help text
    const retirementInput = document.getElementById('retirementContributions');
    const retirementHelpText = document.getElementById('retirementHelpText');
    if (retirementInput) {
        retirementInput.max = yearData.retirementLimit.max;
    }
    if (retirementHelpText) {
        retirementHelpText.textContent = `${year} IRS limit: $${yearData.retirementLimit.standard.toLocaleString()} standard; $${yearData.retirementLimit.max.toLocaleString()} with catch-up (age 50+)`;
    }
    
    // Update IRA contributions max and help text
    const iraInput = document.getElementById('iraContributions');
    const iraHelpText = document.getElementById('iraHelpText');
    if (iraInput) {
        iraInput.max = yearData.iraLimit.max;
    }
    
    // Update spouse IRA input max and help text
    const spouseIraInput = document.getElementById('spouseIraContributions');
    const spouseIraHelpText = document.getElementById('spouseIraHelpText');
    if (spouseIraInput) {
        spouseIraInput.max = yearData.iraLimit.max;
    }
    
    if (iraHelpText) {
        // Get employer plan coverage status for phase-out display
        const coveredByEmployerPlanEl = document.getElementById('coveredByEmployerPlan');
        const isCoveredByEmployerPlan = coveredByEmployerPlanEl ? coveredByEmployerPlanEl.checked : false;
        const spouseCoveredByEmployerPlanEl = document.getElementById('spouseCoveredByEmployerPlan');
        const isSpouseCoveredByEmployerPlan = spouseCoveredByEmployerPlanEl ? spouseCoveredByEmployerPlanEl.checked : false;
        const filingStatusEl = document.getElementById('filingStatus');
        const filingStatus = filingStatusEl ? filingStatusEl.value : '';
        
        let phaseOutText = '';
        if (filingStatus) {
            phaseOutText = getTraditionalIRAPhaseOutText(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
        }
        
        if (phaseOutText) {
            iraHelpText.textContent = `${year} IRS limit: $${yearData.iraLimit.standard.toLocaleString()} standard; $${yearData.iraLimit.max.toLocaleString()} with catch-up (age 50+). ${phaseOutText}`;
        } else {
            iraHelpText.textContent = `${year} IRS limit: $${yearData.iraLimit.standard.toLocaleString()} standard; $${yearData.iraLimit.max.toLocaleString()} with catch-up (age 50+). Deduction eligibility depends on income (MAGI) and employer plan coverage.`;
        }
    }
    
    if (spouseIraHelpText) {
        spouseIraHelpText.textContent = `Each spouse can contribute up to $${yearData.iraLimit.standard.toLocaleString()} ($${yearData.iraLimit.max.toLocaleString()} with catch-up). Deduction eligibility depends on income and employer plan coverage.`;
    }
    
    // Update badges based on age
    updateContributionBadges(year, isAge50Plus, isAge65Plus);
    
    // Update FSA contributions max and help text
    const fsaInput = document.getElementById('fsaContributions');
    const fsaHelpText = document.getElementById('fsaHelpText');
    if (fsaInput) {
        fsaInput.max = yearData.fsaLimit;
    }
    if (fsaHelpText) {
        fsaHelpText.textContent = `${year} IRS limit: $${yearData.fsaLimit.toLocaleString()}`;
    }
    
    // Update HSA help text (limit depends on coverage type, handled separately)
    const hsaHelpText = document.getElementById('hsaHelpText');
    if (hsaHelpText) {
        hsaHelpText.textContent = `${year} IRS limit: Self-only $${yearData.hsaLimit.selfOnly.toLocaleString()}; Family $${yearData.hsaLimit.family.toLocaleString()}`;
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = `${year} Modern Tax Calculator`;
    }
    
    // Update header title
    const headerTitle = document.getElementById('headerTitle');
    if (headerTitle) {
        headerTitle.textContent = `${year} Tax Forecaster`;
    }
    
    // Update header subtitle
    const headerSubtitle = document.getElementById('headerSubtitle');
    if (headerSubtitle) {
        headerSubtitle.textContent = `Real-time estimates based on ${year} IRS brackets`;
    }
    
    // Update info text
    const infoText = document.getElementById('infoText');
    if (infoText) {
        infoText.textContent = `This is a projection based on ${year} brackets. Actual tax obligation may vary based on state taxes, credits, and final IRS adjustments.`;
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format percentage
 */
function formatPercentage(rate) {
    return `${rate.toFixed(2)}%`;
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Populate year selector
    const yearSelect = document.getElementById('taxYear');
    const availableYears = getAvailableYears();
    const currentYear = getCurrentTaxYear();
    
    availableYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    });
    
    // Set initial form values for default year
    updateFormForYear(currentYear);
    
    // Handle year change
    yearSelect.addEventListener('change', function() {
        const selectedYear = parseInt(this.value);
        updateFormForYear(selectedYear);
        updateHSAField();
    });
    
    // Handle HSA coverage type change
    const hsaCoverageTypeSelect = document.getElementById('hsaCoverageType');
    const hsaContributionsGroup = document.getElementById('hsaContributionsGroup');
    const hsaContributionsInput = document.getElementById('hsaContributions');
    
    function updateHSAField() {
        if (!hsaCoverageTypeSelect || !hsaContributionsGroup || !hsaContributionsInput) return;
        
        const taxYearEl = document.getElementById('taxYear');
        if (!taxYearEl) return;
        
        const year = parseInt(taxYearEl.value);
        const yearData = getTaxYearData(year);
        const coverageType = hsaCoverageTypeSelect.value;
        
        if (coverageType === 'none') {
            hsaContributionsGroup.style.display = 'none';
            hsaContributionsInput.value = 0;
            hsaContributionsInput.required = false;
        } else {
            hsaContributionsGroup.style.display = 'block';
            hsaContributionsInput.required = true;
            const maxLimit = coverageType === 'family' ? yearData.hsaLimit.family : yearData.hsaLimit.selfOnly;
            hsaContributionsInput.max = maxLimit;
        }
        performCalculation();
    }
    
    if (hsaCoverageTypeSelect) {
        hsaCoverageTypeSelect.addEventListener('change', updateHSAField);
    }
    
    // Initialize HSA field
    updateHSAField();
}

/**
 * Real-time calculation function
 */
function performCalculation() {
    // Get form values with null checks
    const taxYearEl = document.getElementById('taxYear');
    const incomeEl = document.getElementById('income');
    const filingStatusEl = document.getElementById('filingStatus');
    
    if (!taxYearEl || !incomeEl || !filingStatusEl) {
        console.error('Required form elements not found');
        return;
    }
    
    const year = parseInt(taxYearEl.value) || getCurrentTaxYear();
    const yearData = getTaxYearData(year);
    const grossIncome = parseFloat(incomeEl.value) || 0;
    const filingStatus = filingStatusEl.value || 'single'; // Default to 'single' if not selected, but prefer empty
    
    // Don't calculate if required fields are missing
    if (!filingStatusEl.value || grossIncome === 0) {
        // Reset results to zero/empty state
        const resTakeHome = document.getElementById('res-takeHome');
        const resEffectiveRate = document.getElementById('res-effectiveRate');
        const resTaxOwed = document.getElementById('res-taxOwed');
        const resGrossIncome = document.getElementById('res-grossIncome');
        const resStdDeduction = document.getElementById('res-stdDeduction');
        const resOtherDeductions = document.getElementById('res-otherDeductions');
        const resTaxableIncome = document.getElementById('res-taxableIncome');
        const resFedTax = document.getElementById('res-fedTax');
        const resTaxBracket = document.getElementById('res-taxBracket');
        const savingsAdviceEl = document.getElementById('savingsAdvice');
        
        const formatMoney = (val) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(val);
        };
        
        if (resTakeHome) resTakeHome.textContent = formatMoney(0);
        if (resEffectiveRate) resEffectiveRate.textContent = '0%';
        if (resTaxOwed) resTaxOwed.textContent = formatMoney(0);
        const resMagi = document.getElementById('res-magi');
        if (resGrossIncome) resGrossIncome.textContent = formatMoney(0);
        if (resMagi) resMagi.textContent = formatMoney(0);
        if (resStdDeduction) resStdDeduction.textContent = '-' + formatMoney(0);
        if (resOtherDeductions) resOtherDeductions.textContent = '-' + formatMoney(0);
        if (resTaxableIncome) resTaxableIncome.textContent = formatMoney(0);
        if (resFedTax) resFedTax.textContent = '-' + formatMoney(0);
        if (resTaxBracket) resTaxBracket.textContent = '0%';
        const iraEligibilityCard = document.getElementById('iraEligibilityCard');
        if (iraEligibilityCard) {
            iraEligibilityCard.innerHTML = `
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p class="text-xs text-slate-500 text-center">
                        Enter your income and filing status to see Traditional IRA eligibility.
                    </p>
                </div>
            `;
        }
        if (savingsAdviceEl) {
            savingsAdviceEl.innerHTML = `
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p class="text-xs text-slate-500 text-center">
                        Enter your income and filing status to see tax savings recommendations.
                    </p>
                </div>
            `;
        }
        return;
    }
    
    const retirementContributions = parseFloat(document.getElementById('retirementContributions')?.value || 0) || 0;
    const iraContributions = parseFloat(document.getElementById('iraContributions')?.value || 0) || 0;
    const spouseIraContributionsEl = document.getElementById('spouseIraContributions');
    const spouseIraContributions = (filingStatus === 'marriedJointly' && spouseIraContributionsEl) ? (parseFloat(spouseIraContributionsEl.value || 0) || 0) : 0;
    const hsaCoverageTypeEl = document.getElementById('hsaCoverageType');
    const hsaCoverageType = hsaCoverageTypeEl ? hsaCoverageTypeEl.value : 'none';
    const hsaContributionsEl = document.getElementById('hsaContributions');
    const hsaContributions = hsaCoverageType === 'none' ? 0 : (parseFloat(hsaContributionsEl?.value || 0) || 0);
    const healthInsurancePremiums = parseFloat(document.getElementById('healthInsurancePremiums')?.value || 0) || 0;
    const fsaContributions = parseFloat(document.getElementById('fsaContributions')?.value || 0) || 0;
    const studentLoanInterest = parseFloat(document.getElementById('studentLoanInterest')?.value || 0) || 0;
    const educatorExpenses = parseFloat(document.getElementById('educatorExpenses')?.value || 0) || 0;
    const numDependents = parseInt(document.getElementById('dependents')?.value || 0) || 0;
    const age65PlusEl = document.getElementById('age65Plus');
    const isAge65Plus = age65PlusEl ? age65PlusEl.checked : false;
    const age50PlusEl = document.getElementById('age50Plus');
    const isAge50Plus = age50PlusEl ? age50PlusEl.checked : false;
    const coveredByEmployerPlanEl = document.getElementById('coveredByEmployerPlan');
    const isCoveredByEmployerPlan = coveredByEmployerPlanEl ? coveredByEmployerPlanEl.checked : false;
    const spouseCoveredByEmployerPlanEl = document.getElementById('spouseCoveredByEmployerPlan');
    const isSpouseCoveredByEmployerPlan = spouseCoveredByEmployerPlanEl ? spouseCoveredByEmployerPlanEl.checked : false;
    
    // Update contribution badges based on age (50+ OR 65+ enables catch-up)
    updateContributionBadges(year, isAge50Plus, isAge65Plus);
    
    // Update IRA help text with phase-out limits based on current filing status and employer plan coverage
    const iraHelpText = document.getElementById('iraHelpText');
    if (iraHelpText && filingStatus) {
        const yearData = getTaxYearData(year);
        const phaseOutText = getTraditionalIRAPhaseOutText(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
        if (phaseOutText) {
            iraHelpText.textContent = `${year} IRS limit: $${yearData.iraLimit.standard.toLocaleString()} standard; $${yearData.iraLimit.max.toLocaleString()} with catch-up (age 50+). ${phaseOutText}`;
        } else {
            iraHelpText.textContent = `${year} IRS limit: $${yearData.iraLimit.standard.toLocaleString()} standard; $${yearData.iraLimit.max.toLocaleString()} with catch-up (age 50+). Deduction eligibility depends on income (MAGI) and employer plan coverage.`;
        }
    }
    
    // Show/hide spouse fields based on filing status
    const spouseCoveredGroup = document.getElementById('spouseCoveredGroup');
    const spouseIraGroup = document.getElementById('spouseIraGroup');
    
    if (filingStatus === 'marriedJointly') {
        if (spouseCoveredGroup) spouseCoveredGroup.style.display = 'block';
        if (spouseIraGroup) spouseIraGroup.style.display = 'block';
    } else {
        if (spouseCoveredGroup) {
            spouseCoveredGroup.style.display = 'none';
            // Uncheck spouse checkbox if not married filing jointly
            if (spouseCoveredByEmployerPlanEl) {
                spouseCoveredByEmployerPlanEl.checked = false;
            }
        }
        if (spouseIraGroup) {
            spouseIraGroup.style.display = 'none';
            // Clear spouse IRA contributions if not married filing jointly
            if (spouseIraContributionsEl) {
                spouseIraContributionsEl.value = '';
            }
        }
    }
    
    // Get spouse age 50+ status (for now, assume same as primary taxpayer if not specified)
    // In a full implementation, you might want a separate checkbox for spouse age
    const isSpouseAge50Plus = isAge50Plus; // Could add separate checkbox later
    
    // Calculate tax
    const results = calculateTax(grossIncome, filingStatus, isAge65Plus, numDependents, retirementContributions, iraContributions, hsaCoverageType, hsaContributions, healthInsurancePremiums, fsaContributions, studentLoanInterest, educatorExpenses, year, isAge50Plus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, spouseIraContributions, isSpouseAge50Plus);
    
    // Calculate take home pay
    const takeHome = grossIncome - results.taxObligation - results.totalDeductions;
    
    // Format helpers for display
    const formatMoney = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };
    
    const formatPercent = (val) => `${val.toFixed(1)}%`;
    
    // Update main results
    const resTakeHome = document.getElementById('res-takeHome');
    const resEffectiveRate = document.getElementById('res-effectiveRate');
    const resTaxOwed = document.getElementById('res-taxOwed');
    
    if (resTakeHome) resTakeHome.textContent = formatMoney(takeHome);
    if (resEffectiveRate) resEffectiveRate.textContent = formatPercent(results.effectiveRate);
    if (resTaxOwed) resTaxOwed.textContent = formatMoney(results.taxObligation);
    
    // Update breakdown
    const resGrossIncome = document.getElementById('res-grossIncome');
    const resMagi = document.getElementById('res-magi');
    const resStdDeduction = document.getElementById('res-stdDeduction');
    const resOtherDeductions = document.getElementById('res-otherDeductions');
    const resTaxableIncome = document.getElementById('res-taxableIncome');
    const resFedTax = document.getElementById('res-fedTax');
    
    if (resGrossIncome) resGrossIncome.textContent = formatMoney(results.grossIncome);
    if (resMagi) resMagi.textContent = formatMoney(results.magi);
    if (resStdDeduction) resStdDeduction.textContent = '-' + formatMoney(results.standardDeduction);
    if (resOtherDeductions) resOtherDeductions.textContent = '-' + formatMoney(results.totalDeductions);
    if (resTaxableIncome) resTaxableIncome.textContent = formatMoney(results.taxableIncome);
    if (resFedTax) resFedTax.textContent = '-' + formatMoney(results.taxObligation);
    
    // Update tax bracket display
    const resTaxBracket = document.getElementById('res-taxBracket');
    if (resTaxBracket && results.bracketInfo) {
        resTaxBracket.textContent = results.bracketInfo.rateName;
    }
    
    // Update Traditional IRA eligibility card
    const iraEligibilityCard = document.getElementById('iraEligibilityCard');
    if (iraEligibilityCard) {
        const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
        const isSpouseEligibleForCatchUp = isSpouseAge50Plus || isAge65Plus; // Assuming if user is 65+, spouse might also be
        const eligibilityHTML = generateIRAEligibilityCard(
            results.magi,
            filingStatus,
            isCoveredByEmployerPlan,
            isSpouseCoveredByEmployerPlan,
            results.iraDeductionInfo,
            year,
            isEligibleForCatchUp,
            isSpouseEligibleForCatchUp,
            results.retirementContributions,
            results.retirementLimit,
            results.taxableIncome,
            results.marginalRate
        );
        iraEligibilityCard.innerHTML = eligibilityHTML;
    }
    
    // Update savings advice
    const savingsAdviceEl = document.getElementById('savingsAdvice');
    if (savingsAdviceEl) {
        let adviceHTML = '';
        
        // Only show 401k advice if user hasn't maxed out their 401k contributions
        // Check both that there's room AND that there are actual savings
        // Also verify current contributions are less than the limit
        const is401kMaxedOut = results.retirementContributions >= results.retirementLimit;
        if (!is401kMaxedOut && results.maxAdditional401k > 0 && results.potentialSavings401k && results.potentialSavings401k.taxSavings > 0) {
            const savings1k = results.potentialSavings401k;
            const savingsMax = results.potentialSavingsMax401k;
            const additionalAmount = Math.min(1000, results.maxAdditional401k);
            const savingsRate = ((savings1k.taxSavings / additionalAmount) * 100).toFixed(1);
            const remainingCap = results.maxAdditional401k; // This is: year limit - current contributions
            
            adviceHTML += `
                <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div class="flex items-start gap-3">
                        <i data-lucide="trending-up" class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"></i>
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-slate-900 mb-1">Increase 401(k) Contributions</h4>
                            <p class="text-xs text-slate-500 mb-2">
                                Current: ${formatMoney(results.retirementContributions)} | ${results.year} Max: ${formatMoney(results.retirementLimit)} | Remaining: ${formatMoney(remainingCap)}
                            </p>
                            <p class="text-xs text-slate-600 mb-2">
                                Increasing your 401(k) by ${formatMoney(additionalAmount)} could save you approximately <strong class="text-emerald-700">${formatMoney(savings1k.taxSavings)}</strong> in taxes this year (${savingsRate}% savings rate).
                            </p>
                            ${savingsMax && savingsMax.totalAdditional > 1000 && savingsMax.taxSavings > 0 ? `
                                <p class="text-xs text-slate-600">
                                    Maximizing your 401(k) contributions (${formatMoney(results.maxAdditional401k)} more) could save you approximately <strong class="text-emerald-700">${formatMoney(savingsMax.taxSavings)}</strong> annually.
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Check Traditional IRA eligibility
        const iraDeductionInfo = results.iraDeductionInfo;
        const magi = results.magi;
        // Use individual thresholds for the primary taxpayer
        const thresholds = getIndividualIRAThresholds(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
        
        // Show phase-out optimization advice if partially deductible and in phase-out range
        if (iraDeductionInfo.isPartiallyDeductible && thresholds.hasFullThreshold && !thresholds.hasNoLimit) {
            const phaseOutInsights = calculatePhaseOutInsights(
                magi,
                thresholds.fullThreshold,
                thresholds.phaseOutEnd,
                iraDeductionInfo.maxContribution,
                iraDeductionInfo.deductibleAmount
            );
            
            // Calculate how much 401k contribution would help
            // Only show if user hasn't maxed out their 401(k) contributions
            const is401kMaxedOut = results.retirementContributions >= results.retirementLimit;
            const magiReductionNeeded = phaseOutInsights.magiReductionNeeded;
            const additional401kNeeded = Math.min(magiReductionNeeded, results.maxAdditional401k);
            
            if (!is401kMaxedOut && magiReductionNeeded > 0 && additional401kNeeded > 0) {
                // Calculate what the deductible amount would be with reduced MAGI
                const reducedMagi = magi - additional401kNeeded;
                const reducedIraDeductionInfo = calculateTraditionalIRADeductible(
                    reducedMagi,
                    filingStatus,
                    isCoveredByEmployerPlan,
                    isSpouseCoveredByEmployerPlan,
                    iraDeductionInfo.maxContribution,
                    year,
                    isAge50Plus || isAge65Plus
                );
                
                const additionalDeductibleFrom401k = reducedIraDeductionInfo.deductibleAmount - iraDeductionInfo.deductibleAmount;
                
                if (additionalDeductibleFrom401k > 0) {
                    // Estimate tax savings from the additional deductible amount
                    const currentBracket = findTaxBracket(results.taxableIncome, filingStatus, year);
                    const estimatedTaxSavings = additionalDeductibleFrom401k * currentBracket.rate;
                    
                    adviceHTML += `
                        <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                            <div class="flex items-start gap-3">
                                <i data-lucide="target" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"></i>
                                <div class="flex-1">
                                    <h4 class="text-sm font-bold text-slate-900 mb-1">Optimize IRA Deduction via 401(k)</h4>
                                    <p class="text-xs text-slate-600 mb-2">
                                        You're in the IRA phase-out range (${formatMoney(thresholds.fullThreshold)} - ${formatMoney(thresholds.phaseOutEnd)}). 
                                        Reducing MAGI through 401(k) contributions can increase your IRA deduction.
                                    </p>
                                    <div class="mt-2 p-2 bg-white rounded border border-indigo-200">
                                        <div class="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p class="text-slate-500">Current deductible:</p>
                                                <p class="font-bold text-slate-900">${formatMoney(iraDeductionInfo.deductibleAmount)}</p>
                                            </div>
                                            <div>
                                                <p class="text-slate-500">If MAGI reduced by ${formatMoney(Math.ceil(additional401kNeeded / 1000) * 1000)}:</p>
                                                <p class="font-bold text-indigo-700">${formatMoney(reducedIraDeductionInfo.deductibleAmount)}</p>
                                            </div>
                                        </div>
                                        <div class="mt-2 pt-2 border-t border-indigo-200">
                                            <p class="text-xs text-slate-600">
                                                Contributing ${formatMoney(Math.ceil(additional401kNeeded / 1000) * 1000)} more to 401(k) could:
                                            </p>
                                            <ul class="text-xs text-slate-600 mt-1 ml-3 list-disc">
                                                <li>Reduce MAGI by ${formatMoney(Math.ceil(additional401kNeeded / 1000) * 1000)}</li>
                                                <li>Increase IRA deduction by ${formatMoney(additionalDeductibleFrom401k)}</li>
                                                <li>Save approximately ${formatMoney(estimatedTaxSavings)} in taxes (from IRA deduction increase)</li>
                                            </ul>
                                        </div>
                                    </div>
                                    ${filingStatus === 'marriedJointly' && (isCoveredByEmployerPlan || isSpouseCoveredByEmployerPlan) ? `
                                        <p class="text-xs text-slate-500 mt-2 italic">
                                            <strong>Remember:</strong> IRA deduction limits are individual per spouse. Each spouse's deduction phases out based on combined MAGI.
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        // Only show Traditional IRA advice if:
        // 1. User hasn't maxed out their IRA contributions
        // 2. There are actual tax savings
        // 3. Traditional IRA contributions are at least partially deductible
        if (results.maxAdditionalIRA > 0 && results.potentialSavingsIRA && results.potentialSavingsIRA.taxSavings > 0) {
            // Check if additional contributions would be deductible
            const additionalAmount = Math.min(1000, results.maxAdditionalIRA);
            const testIraContribution = results.iraContributions + additionalAmount;
            const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
            const testIraDeductionInfo = calculateTraditionalIRADeductible(magi, filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, testIraContribution, year, isEligibleForCatchUp);
            
            // Only show if there's deductible amount available
            if (testIraDeductionInfo.deductibleAmount > iraDeductionInfo.deductibleAmount) {
                const savings1k = results.potentialSavingsIRA;
                const savingsMax = results.potentialSavingsMaxIRA;
                const savingsRate = ((savings1k.taxSavings / additionalAmount) * 100).toFixed(1);
                const remainingCap = results.maxAdditionalIRA;
                
                let deductionStatus = '';
                if (iraDeductionInfo.isFullyDeductible) {
                    deductionStatus = 'Fully deductible';
                } else if (iraDeductionInfo.isPartiallyDeductible) {
                    deductionStatus = `Partially deductible (${formatMoney(iraDeductionInfo.deductibleAmount)} of ${formatMoney(results.iraContributions)})`;
                } else {
                    deductionStatus = 'Not deductible';
                }
                
                const phaseOutText = getTraditionalIRAPhaseOutText(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
                // Use individual thresholds for the primary taxpayer
                const thresholds = getIndividualIRAThresholds(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
                
                // Calculate phase-out insights if partially deductible
                let phaseOutInsights = null;
                if (iraDeductionInfo.isPartiallyDeductible && thresholds.hasFullThreshold) {
                    phaseOutInsights = calculatePhaseOutInsights(
                        magi,
                        thresholds.fullThreshold,
                        thresholds.phaseOutEnd,
                        iraDeductionInfo.maxContribution,
                        iraDeductionInfo.deductibleAmount
                    );
                }
                
                adviceHTML += `
                    <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div class="flex items-start gap-3">
                            <i data-lucide="piggy-bank" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-slate-900 mb-1">Increase Traditional IRA Contributions</h4>
                                <p class="text-xs text-slate-500 mb-2">
                                    Current: ${formatMoney(results.iraContributions)} | ${results.year} Max: ${formatMoney(results.iraLimit)} | Remaining: ${formatMoney(remainingCap)}
                                </p>
                                <p class="text-xs text-slate-500 mb-2">
                                    MAGI: ${formatMoney(magi)} | Status: ${deductionStatus}
                                </p>
                                ${phaseOutText ? `
                                    <p class="text-xs text-slate-500 mb-2">
                                        <strong>Phase-out limits:</strong> ${phaseOutText}
                                    </p>
                                ` : ''}
                                ${phaseOutInsights && phaseOutInsights.magiReductionNeeded > 0 ? `
                                    <div class="mt-3 p-2 bg-white rounded border border-blue-200">
                                        <p class="text-xs font-semibold text-slate-700 mb-1">💡 Maximize Your Deduction:</p>
                                        <p class="text-xs text-slate-600 mb-1">
                                            Reduce MAGI by <strong class="text-blue-700">${formatMoney(Math.ceil(phaseOutInsights.magiReductionNeeded / 1000) * 1000)}</strong> to unlock full deduction.
                                        </p>
                                        <p class="text-xs text-slate-600">
                                            Each $1,000 reduction in MAGI ≈ <strong class="text-blue-700">${formatMoney(Math.round(phaseOutInsights.magiReductionPer1000))}</strong> more deductible.
                                        </p>
                                    </div>
                                ` : ''}
                                <p class="text-xs text-slate-600 mb-2 mt-2">
                                    Increasing your Traditional IRA by ${formatMoney(additionalAmount)} could save you approximately <strong class="text-blue-700">${formatMoney(savings1k.taxSavings)}</strong> in taxes this year (${savingsRate}% savings rate).
                                </p>
                                ${savingsMax && savingsMax.totalAdditional > 1000 && savingsMax.taxSavings > 0 ? `
                                    <p class="text-xs text-slate-600">
                                        Maximizing your Traditional IRA contributions (${formatMoney(results.maxAdditionalIRA)} more) could save you approximately <strong class="text-blue-700">${formatMoney(savingsMax.taxSavings)}</strong> annually.
                                    </p>
                                ` : ''}
                                ${iraDeductionInfo.isPartiallyDeductible && filingStatus === 'marriedJointly' ? `
                                    <p class="text-xs text-slate-500 mt-2 pt-2 border-t border-blue-200 italic">
                                        <strong>Note:</strong> Each spouse has individual IRA deduction limits. If both spouses are covered by employer plans, each spouse's deduction phases out based on combined MAGI.
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Spouse IRA suggestions (for married filing jointly)
        if (filingStatus === 'marriedJointly' && results.spouseIraDeductionInfo) {
            const spouseIraDeductionInfo = results.spouseIraDeductionInfo;
            const isSpouseEligibleForCatchUp = isSpouseAge50Plus || isAge65Plus;
            
            if (results.maxAdditionalSpouseIRA > 0) {
                // Check if additional spouse contributions would be deductible
                const additionalSpouseAmount = Math.min(1000, results.maxAdditionalSpouseIRA);
                const testSpouseIraContribution = results.spouseIraContributions + additionalSpouseAmount;
                const testSpouseIraDeductionInfo = calculateTraditionalIRADeductible(magi, filingStatus, isSpouseCoveredByEmployerPlan, isCoveredByEmployerPlan, testSpouseIraContribution, year, isSpouseEligibleForCatchUp);
                
                // Only show if there's deductible amount available
                if (testSpouseIraDeductionInfo.deductibleAmount > spouseIraDeductionInfo.deductibleAmount) {
                    // Calculate potential savings for spouse IRA
                    const spouseSavings1k = calculatePotentialSavings(results.taxableIncome, filingStatus, year, 0, additionalSpouseAmount);
                    const spouseSavingsMax = calculatePotentialSavings(results.taxableIncome, filingStatus, year, 0, results.maxAdditionalSpouseIRA);
                    const spouseSavingsRate = ((spouseSavings1k.taxSavings / additionalSpouseAmount) * 100).toFixed(1);
                    const spouseRemainingCap = results.maxAdditionalSpouseIRA;
                    
                    let spouseDeductionStatus = '';
                    if (spouseIraDeductionInfo.isFullyDeductible) {
                        spouseDeductionStatus = 'Fully deductible';
                    } else if (spouseIraDeductionInfo.isPartiallyDeductible) {
                        spouseDeductionStatus = `Partially deductible (${formatMoney(spouseIraDeductionInfo.deductibleAmount)} of ${formatMoney(results.spouseIraContributions)})`;
                    } else {
                        spouseDeductionStatus = 'Not deductible';
                    }
                    
                    adviceHTML += `
                        <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div class="flex items-start gap-3">
                                <i data-lucide="piggy-bank" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                                <div class="flex-1">
                                    <h4 class="text-sm font-bold text-slate-900 mb-1">Increase Spouse Traditional IRA Contributions</h4>
                                    <p class="text-xs text-slate-500 mb-2">
                                        Current: ${formatMoney(results.spouseIraContributions)} | ${results.year} Max: ${formatMoney(results.iraLimit)} | Remaining: ${formatMoney(spouseRemainingCap)}
                                    </p>
                                    <p class="text-xs text-slate-500 mb-2">
                                        MAGI: ${formatMoney(magi)} | Status: ${spouseDeductionStatus}
                                    </p>
                                    <div class="grid grid-cols-2 gap-3 mt-3">
                                        <div class="bg-white rounded-lg p-2 border border-blue-100">
                                            <p class="text-xs text-slate-500">+$1,000 contribution</p>
                                            <p class="text-sm font-bold text-blue-600">${formatMoney(spouseSavings1k.taxSavings)}</p>
                                            <p class="text-xs text-slate-400">${spouseSavingsRate}% savings rate</p>
                                        </div>
                                        <div class="bg-white rounded-lg p-2 border border-blue-100">
                                            <p class="text-xs text-slate-500">Max contribution</p>
                                            <p class="text-sm font-bold text-blue-600">${formatMoney(spouseSavingsMax.taxSavings)}</p>
                                            <p class="text-xs text-slate-400">${formatMoney(spouseRemainingCap)} remaining</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        // Show message when Traditional IRA is not deductible due to income limits
        if (iraDeductionInfo.isNonDeductible && results.iraContributions === 0) {
            const phaseOutText = getTraditionalIRAPhaseOutText(filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan, year);
            adviceHTML += `
                <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div class="flex items-start gap-3">
                        <i data-lucide="alert-circle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></i>
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-slate-900 mb-1">Traditional IRA Not Deductible</h4>
                            <p class="text-xs text-slate-500 mb-2">
                                MAGI: ${formatMoney(magi)} | Status: Not eligible for Traditional IRA deduction
                            </p>
                            <p class="text-xs text-slate-600 mb-2">
                                Your income exceeds the limit for Traditional IRA deductions. Traditional IRA contributions would not be tax-deductible at your income level.
                            </p>
                            ${phaseOutText ? `
                                <p class="text-xs text-slate-500 mt-2 pt-2 border-t border-amber-200">
                                    <strong>Phase-out limits:</strong> ${phaseOutText}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Check Roth IRA eligibility when Traditional IRA is not deductible or partially deductible
        const isEligibleForCatchUp = isAge50Plus || isAge65Plus;
        const rothEligibility = checkRothIRAEligibility(magi, filingStatus, year, isEligibleForCatchUp);
        
        if (rothEligibility.isEligible && (iraDeductionInfo.isNonDeductible || (iraDeductionInfo.isPartiallyDeductible && iraDeductionInfo.deductibleAmount < results.iraLimit * 0.5))) {
            const rothMaxContribution = rothEligibility.allowedContribution || rothEligibility.maxContribution;
            const currentRothContribution = 0; // We don't track Roth contributions, assume 0
            const remainingRothCap = Math.max(0, rothMaxContribution - currentRothContribution);
            
            if (remainingRothCap > 0) {
                adviceHTML += `
                    <div class="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div class="flex items-start gap-3">
                            <i data-lucide="trending-up" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"></i>
                            <div class="flex-1">
                                <h4 class="text-sm font-bold text-slate-900 mb-1">Consider Roth IRA Contributions</h4>
                                <p class="text-xs text-slate-500 mb-2">
                                    MAGI: ${formatMoney(magi)} | ${rothEligibility.phaseOutPercentage < 100 ? `Eligible: ${rothEligibility.phaseOutPercentage.toFixed(0)}%` : 'Fully eligible'} | Max: ${formatMoney(rothMaxContribution)}
                                </p>
                                <p class="text-xs text-slate-600 mb-2">
                                    Since Traditional IRA deductions are ${iraDeductionInfo.isNonDeductible ? 'not available' : 'limited'}, consider contributing to a Roth IRA. Contributions are made with after-tax dollars, but withdrawals in retirement are tax-free.
                                </p>
                                <p class="text-xs text-slate-600">
                                    You can contribute up to <strong class="text-purple-700">${formatMoney(remainingRothCap)}</strong> to a Roth IRA${rothEligibility.phaseOutPercentage < 100 ? ` (based on your income phase-out)` : ''}.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        // Suggest Backdoor Roth IRA when income is too high for both Traditional and Roth IRAs
        if (iraDeductionInfo.isNonDeductible && !rothEligibility.isEligible && results.maxAdditionalIRA > 0) {
            const yearDataForBackdoor = getTaxYearData(year);
            const backdoorLimit = isEligibleForCatchUp ? results.iraLimit : yearDataForBackdoor.iraLimit.standard;
            adviceHTML += `
                <div class="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div class="flex items-start gap-3">
                        <i data-lucide="arrow-right-circle" class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"></i>
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-slate-900 mb-1">Consider Backdoor Roth IRA Strategy</h4>
                            <p class="text-xs text-slate-500 mb-2">
                                MAGI: ${formatMoney(magi)} | Traditional IRA: Not deductible | Roth IRA: Not eligible
                            </p>
                            <p class="text-xs text-slate-600 mb-2">
                                Your income is too high for both Traditional IRA deductions and direct Roth IRA contributions. Consider a <strong>Backdoor Roth IRA</strong> strategy:
                            </p>
                            <ol class="text-xs text-slate-600 mb-2 list-decimal list-inside space-y-1 ml-2">
                                <li>Contribute up to <strong class="text-indigo-700">${formatMoney(backdoorLimit)}</strong> to a Traditional IRA (non-deductible)</li>
                                <li>Immediately convert it to a Roth IRA</li>
                                <li>Enjoy tax-free growth and withdrawals in retirement</li>
                            </ol>
                            <p class="text-xs text-slate-500 italic">
                                Note: This strategy works best if you don't have existing Traditional IRA balances. Consult a tax professional for guidance.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // If no advice available (either maxed out or no savings potential)
        if (!adviceHTML) {
            adviceHTML = `
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p class="text-xs text-slate-500 text-center">
                        You're already maximizing your pre-tax contributions, or your taxable income is too low to benefit from additional deductions.
                    </p>
                </div>
            `;
        }
        
        savingsAdviceEl.innerHTML = adviceHTML;
        
        // Re-initialize Lucide icons for the new content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

/**
 * Initialize event listeners for real-time calculation
 */
function setupEventListeners() {
    // Get all input and select elements
    const inputs = document.querySelectorAll('input[type="number"], select, input[type="checkbox"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', performCalculation);
        input.addEventListener('change', performCalculation);
    });
    
    // Handle filing status change to show/hide spouse fields and update help text
    const filingStatusEl = document.getElementById('filingStatus');
    if (filingStatusEl) {
        filingStatusEl.addEventListener('change', function() {
            const spouseCoveredGroup = document.getElementById('spouseCoveredGroup');
            const spouseIraGroup = document.getElementById('spouseIraGroup');
            
            if (this.value === 'marriedJointly') {
                if (spouseCoveredGroup) spouseCoveredGroup.style.display = 'block';
                if (spouseIraGroup) spouseIraGroup.style.display = 'block';
            } else {
                if (spouseCoveredGroup) {
                    spouseCoveredGroup.style.display = 'none';
                    const spouseCoveredByEmployerPlanEl = document.getElementById('spouseCoveredByEmployerPlan');
                    if (spouseCoveredByEmployerPlanEl) {
                        spouseCoveredByEmployerPlanEl.checked = false;
                    }
                }
                if (spouseIraGroup) {
                    spouseIraGroup.style.display = 'none';
                    const spouseIraContributionsEl = document.getElementById('spouseIraContributions');
                    if (spouseIraContributionsEl) {
                        spouseIraContributionsEl.value = '';
                    }
                }
            }
            // Update IRA help text with phase-out limits
            const taxYearEl = document.getElementById('taxYear');
            if (taxYearEl) {
                const year = parseInt(taxYearEl.value) || getCurrentTaxYear();
                updateFormForYear(year);
            }
        });
    }
}

/**
 * Handle DOM ready
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    
    // Run initial calculation
    performCalculation();
});
