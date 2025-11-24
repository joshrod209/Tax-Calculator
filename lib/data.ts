// Tax Year Data - Organized by year for easy maintenance and updates
export const TAX_YEAR_DATA = {
    2025: {
        brackets: {
            single: [
                { rate: 0.10, min: 0, max: 11925, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 11926, max: 48475, base: 1192.50, formula: (amount: number) => ((amount - 11925) * 0.12) + 1192.50 },
                { rate: 0.22, min: 48476, max: 103350, base: 5578.50, formula: (amount: number) => ((amount - 48475) * 0.22) + 5578.50 },
                { rate: 0.24, min: 103351, max: 197300, base: 17651, formula: (amount: number) => ((amount - 103350) * 0.24) + 17651 },
                { rate: 0.32, min: 197301, max: 250525, base: 40199, formula: (amount: number) => ((amount - 197300) * 0.32) + 40199 },
                { rate: 0.35, min: 250526, max: 626350, base: 57231, formula: (amount: number) => ((amount - 250525) * 0.35) + 57231 },
                { rate: 0.37, min: 626351, max: Infinity, base: 188769.75, formula: (amount: number) => ((amount - 626350) * 0.37) + 188769.75 }
            ],
            headOfHousehold: [
                { rate: 0.10, min: 0, max: 17000, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 17001, max: 64850, base: 1700, formula: (amount: number) => ((amount - 17000) * 0.12) + 1700 },
                { rate: 0.22, min: 64851, max: 103350, base: 7442, formula: (amount: number) => ((amount - 64850) * 0.22) + 7442 },
                { rate: 0.24, min: 103351, max: 197300, base: 15912, formula: (amount: number) => ((amount - 103350) * 0.24) + 15912 },
                { rate: 0.32, min: 197301, max: 250500, base: 38460, formula: (amount: number) => ((amount - 197300) * 0.32) + 38460 },
                { rate: 0.35, min: 250501, max: 626350, base: 55484, formula: (amount: number) => ((amount - 250500) * 0.35) + 55484 },
                { rate: 0.37, min: 626351, max: Infinity, base: 187031.50, formula: (amount: number) => ((amount - 626350) * 0.37) + 187031.50 }
            ],
            marriedJointly: [
                { rate: 0.10, min: 0, max: 23850, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 23851, max: 96950, base: 2385, formula: (amount: number) => ((amount - 23850) * 0.12) + 2385 },
                { rate: 0.22, min: 96951, max: 206700, base: 11157, formula: (amount: number) => ((amount - 96950) * 0.22) + 11157 },
                { rate: 0.24, min: 206701, max: 394600, base: 35302, formula: (amount: number) => ((amount - 206700) * 0.24) + 35302 },
                { rate: 0.32, min: 394601, max: 501050, base: 80398, formula: (amount: number) => ((amount - 394600) * 0.32) + 80398 },
                { rate: 0.35, min: 501051, max: 751600, base: 114462, formula: (amount: number) => ((amount - 501050) * 0.35) + 114462 },
                { rate: 0.37, min: 751601, max: Infinity, base: 202154.50, formula: (amount: number) => ((amount - 751600) * 0.37) + 202154.50 }
            ],
            marriedSeparately: [
                { rate: 0.10, min: 0, max: 11925, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 11926, max: 48475, base: 1192.50, formula: (amount: number) => ((amount - 11925) * 0.12) + 1192.50 },
                { rate: 0.22, min: 48476, max: 103350, base: 5578.50, formula: (amount: number) => ((amount - 48475) * 0.22) + 5578.50 },
                { rate: 0.24, min: 103351, max: 197300, base: 17651, formula: (amount: number) => ((amount - 103350) * 0.24) + 17651 },
                { rate: 0.32, min: 197301, max: 250525, base: 40199, formula: (amount: number) => ((amount - 197300) * 0.32) + 40199 },
                { rate: 0.35, min: 250526, max: 375800, base: 57231, formula: (amount: number) => ((amount - 250525) * 0.35) + 57231 },
                { rate: 0.37, min: 375801, max: Infinity, base: 101077.25, formula: (amount: number) => ((amount - 375800) * 0.37) + 101077.25 }
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
            marriedJointly: 1600,
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
            catchUp: 1000
        },
        fsaLimit: 3200,
        studentLoanInterestLimit: 2500,
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: {
            singleCovered: { full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000 },
            headOfHouseholdCovered: { full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000 },
            marriedBothCovered: { full: 126000, phaseOutStart: 126000, phaseOutEnd: 146000 },
            marriedOneCovered: { full: 236000, phaseOutStart: 236000, phaseOutEnd: 246000 },
            marriedSeparateCovered: { phaseOutStart: 0, phaseOutEnd: 10000 }
        },
        rothIraLimits: {
            single: { phaseOutStart: 146000, phaseOutEnd: 161000 },
            headOfHousehold: { phaseOutStart: 146000, phaseOutEnd: 161000 },
            marriedJointly: { phaseOutStart: 230000, phaseOutEnd: 240000 },
            marriedSeparately: { phaseOutStart: 0, phaseOutEnd: 10000 }
        }
    },
    2026: {
        brackets: {
            single: [
                { rate: 0.10, min: 0, max: 12400, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 12401, max: 50400, base: 1240, formula: (amount: number) => ((amount - 12400) * 0.12) + 1240 },
                { rate: 0.22, min: 50401, max: 105700, base: 5800, formula: (amount: number) => ((amount - 50400) * 0.22) + 5800 },
                { rate: 0.24, min: 105701, max: 201775, base: 17966, formula: (amount: number) => ((amount - 105700) * 0.24) + 17966 },
                { rate: 0.32, min: 201776, max: 256225, base: 41024, formula: (amount: number) => ((amount - 201775) * 0.32) + 41024 },
                { rate: 0.35, min: 256226, max: 640600, base: 58448, formula: (amount: number) => ((amount - 256225) * 0.35) + 58448 },
                { rate: 0.37, min: 640601, max: Infinity, base: 192979.25, formula: (amount: number) => ((amount - 640600) * 0.37) + 192979.25 }
            ],
            headOfHousehold: [
                { rate: 0.10, min: 0, max: 17700, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 17701, max: 67450, base: 1770, formula: (amount: number) => ((amount - 17700) * 0.12) + 1770 },
                { rate: 0.22, min: 67451, max: 105700, base: 7740, formula: (amount: number) => ((amount - 67450) * 0.22) + 7740 },
                { rate: 0.24, min: 105701, max: 201750, base: 16155, formula: (amount: number) => ((amount - 105700) * 0.24) + 16155 },
                { rate: 0.32, min: 201751, max: 256200, base: 39207, formula: (amount: number) => ((amount - 201750) * 0.32) + 39207 },
                { rate: 0.35, min: 256201, max: 640600, base: 56631, formula: (amount: number) => ((amount - 256200) * 0.35) + 56631 },
                { rate: 0.37, min: 640601, max: Infinity, base: 191171, formula: (amount: number) => ((amount - 640600) * 0.37) + 191171 }
            ],
            marriedJointly: [
                { rate: 0.10, min: 0, max: 24800, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 24801, max: 100800, base: 2480, formula: (amount: number) => ((amount - 24800) * 0.12) + 2480 },
                { rate: 0.22, min: 100801, max: 211400, base: 11600, formula: (amount: number) => ((amount - 100800) * 0.22) + 11600 },
                { rate: 0.24, min: 211401, max: 403550, base: 35932, formula: (amount: number) => ((amount - 211400) * 0.24) + 35932 },
                { rate: 0.32, min: 403551, max: 512450, base: 82048, formula: (amount: number) => ((amount - 403550) * 0.32) + 82048 },
                { rate: 0.35, min: 512451, max: 768700, base: 116896, formula: (amount: number) => ((amount - 512450) * 0.35) + 116896 },
                { rate: 0.37, min: 768701, max: Infinity, base: 206583.50, formula: (amount: number) => ((amount - 768700) * 0.37) + 206583.50 }
            ],
            marriedSeparately: [
                { rate: 0.10, min: 0, max: 12400, base: 0, formula: (amount: number) => amount * 0.10 },
                { rate: 0.12, min: 12401, max: 50400, base: 1240, formula: (amount: number) => ((amount - 12400) * 0.12) + 1240 },
                { rate: 0.22, min: 50401, max: 105700, base: 5800, formula: (amount: number) => ((amount - 50400) * 0.22) + 5800 },
                { rate: 0.24, min: 105701, max: 201775, base: 17966, formula: (amount: number) => ((amount - 105700) * 0.24) + 17966 },
                { rate: 0.32, min: 201776, max: 256225, base: 41024, formula: (amount: number) => ((amount - 201775) * 0.32) + 41024 },
                { rate: 0.35, min: 256226, max: 384350, base: 58448, formula: (amount: number) => ((amount - 256225) * 0.35) + 58448 },
                { rate: 0.37, min: 384351, max: Infinity, base: 103291.75, formula: (amount: number) => ((amount - 384350) * 0.37) + 103291.75 }
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
            marriedJointly: 1650,
            marriedSeparately: 1650
        },
        dependentCredit: 2000,
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
            catchUp: 1000
        },
        fsaLimit: 3250,
        studentLoanInterestLimit: 2500,
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: {
            singleCovered: { full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000 },
            headOfHouseholdCovered: { full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000 },
            marriedBothCovered: { full: 129000, phaseOutStart: 129000, phaseOutEnd: 149000 },
            marriedOneCovered: { full: 241000, phaseOutStart: 241000, phaseOutEnd: 251000 },
            marriedSeparateCovered: { phaseOutStart: 0, phaseOutEnd: 10000 }
        },
        rothIraLimits: {
            single: { phaseOutStart: 149000, phaseOutEnd: 164000 },
            headOfHousehold: { phaseOutStart: 149000, phaseOutEnd: 164000 },
            marriedJointly: { phaseOutStart: 235000, phaseOutEnd: 245000 },
            marriedSeparately: { phaseOutStart: 0, phaseOutEnd: 10000 }
        }
    }
} as const;

export type TaxYear = keyof typeof TAX_YEAR_DATA;
export type FilingStatus = 'single' | 'headOfHousehold' | 'marriedJointly' | 'marriedSeparately';

