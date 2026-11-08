// Port of lib/data.ts. Keep the figures here in step with that file;
// fixtures/tax-cases.json is run against both engines to catch drift.

public enum TaxYear: Int, CaseIterable, Codable, Sendable, Identifiable {
    case y2025 = 2025
    case y2026 = 2026

    public var id: Int { rawValue }
}

public enum FilingStatus: String, CaseIterable, Codable, Sendable, Identifiable {
    case single
    case headOfHousehold
    case marriedJointly
    case marriedSeparately

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .single: return "Single"
        case .headOfHousehold: return "Head of Household"
        case .marriedJointly: return "Married Filing Jointly"
        case .marriedSeparately: return "Married Filing Separately"
        }
    }
}

public enum HSACoverageType: String, CaseIterable, Codable, Sendable, Identifiable {
    case none
    case selfOnly
    case family

    public var id: String { rawValue }
}

public struct TaxBracket: Sendable, Equatable {
    public let rate: Double
    /// Display lower bound (whole dollars, $1 above the previous bracket's max)
    public let min: Double
    public let max: Double
    /// Tax on all income below this bracket
    public let base: Double
    /// Income the bracket formula subtracts before applying `rate` (the previous bracket's max)
    public let floor: Double

    /// Same arithmetic, in the same order, as the `formula` closures in lib/data.ts
    public func tax(on amount: Double) -> Double {
        if floor == 0 { return amount * rate }
        return ((amount - floor) * rate) + base
    }
}

public struct FilingStatusValues<T: Sendable>: Sendable {
    public let single: T
    public let headOfHousehold: T
    public let marriedJointly: T
    public let marriedSeparately: T

    public subscript(_ status: FilingStatus) -> T {
        switch status {
        case .single: return single
        case .headOfHousehold: return headOfHousehold
        case .marriedJointly: return marriedJointly
        case .marriedSeparately: return marriedSeparately
        }
    }
}

public struct PhaseOutRange: Sendable {
    public let phaseOutStart: Double
    public let phaseOutEnd: Double
}

public struct IRALimitSet: Sendable {
    public let full: Double?
    public let phaseOutStart: Double
    public let phaseOutEnd: Double
}

public struct ContributionLimit: Sendable {
    public let standard: Double
    public let catchUp: Double
    public let max: Double
}

public struct TaxYearData: Sendable {
    public struct SeniorDeduction: Sendable {
        public let amount: Double
        public let phaseOutRate: Double
        public let joint: Double
        public let other: Double
    }
    public struct JointOther<T: Sendable>: Sendable {
        public let joint: T
        public let other: T
    }
    public struct HSALimit: Sendable {
        public let selfOnly: Double
        public let family: Double
        public let catchUp: Double
    }
    /// Refundable part of the Child Tax Credit (Schedule 8812)
    public struct RefundableChildCredit: Sendable {
        public let maxPerChild: Double
        public let earnedIncomeThreshold: Double
        public let rate: Double
    }
    /// Employee payroll taxes (FICA)
    public struct Payroll: Sendable {
        public let socialSecurityRate: Double
        /// Per worker
        public let socialSecurityWageBase: Double
        public let medicareRate: Double
        public let additionalMedicareRate: Double
        public let additionalMedicareThreshold: FilingStatusValues<Double>
    }
    public struct TraditionalIRALimits: Sendable {
        public let singleCovered: IRALimitSet
        public let headOfHouseholdCovered: IRALimitSet
        public let marriedBothCovered: IRALimitSet
        public let marriedOneCovered: IRALimitSet
        public let marriedSeparateCovered: IRALimitSet
    }

    public let brackets: FilingStatusValues<[TaxBracket]>
    public let standardDeductions: FilingStatusValues<Double>
    public let age65PlusDeductions: FilingStatusValues<Double>
    public let childTaxCredit: Double
    public let otherDependentCredit: Double
    public let childCreditPhaseOut: JointOther<Double>
    public let refundableChildCredit: RefundableChildCredit
    public let payroll: Payroll
    public let seniorDeduction: SeniorDeduction
    public let retirementLimit: ContributionLimit
    public let iraLimit: ContributionLimit
    public let hsaLimit: HSALimit
    public let fsaLimit: Double
    public let studentLoanInterestLimit: Double
    public let studentLoanPhaseOut: JointOther<PhaseOutRange>
    public let educatorExpensesLimit: Double
    public let traditionalIraDeductionLimits: TraditionalIRALimits
    public let rothIraLimits: FilingStatusValues<PhaseOutRange>
}

/// Builds a bracket table from (rate, upper bound, base) rows.
private func makeBrackets(_ rows: [(Double, Double, Double)]) -> [TaxBracket] {
    var result: [TaxBracket] = []
    var previousMax = 0.0
    for (rate, max, base) in rows {
        result.append(TaxBracket(
            rate: rate,
            min: previousMax == 0 ? 0 : previousMax + 1,
            max: max,
            base: base,
            floor: previousMax
        ))
        previousMax = max
    }
    return result
}

private let inf = Double.infinity

public let taxYearData: [TaxYear: TaxYearData] = [
    .y2025: TaxYearData(
        brackets: FilingStatusValues(
            single: makeBrackets([
                (0.10, 11925, 0), (0.12, 48475, 1192.50), (0.22, 103350, 5578.50),
                (0.24, 197300, 17651), (0.32, 250525, 40199), (0.35, 626350, 57231),
                (0.37, inf, 188769.75)
            ]),
            headOfHousehold: makeBrackets([
                (0.10, 17000, 0), (0.12, 64850, 1700), (0.22, 103350, 7442),
                (0.24, 197300, 15912), (0.32, 250500, 38460), (0.35, 626350, 55484),
                (0.37, inf, 187031.50)
            ]),
            marriedJointly: makeBrackets([
                (0.10, 23850, 0), (0.12, 96950, 2385), (0.22, 206700, 11157),
                (0.24, 394600, 35302), (0.32, 501050, 80398), (0.35, 751600, 114462),
                (0.37, inf, 202154.50)
            ]),
            marriedSeparately: makeBrackets([
                (0.10, 11925, 0), (0.12, 48475, 1192.50), (0.22, 103350, 5578.50),
                (0.24, 197300, 17651), (0.32, 250525, 40199), (0.35, 375800, 57231),
                (0.37, inf, 101077.25)
            ])
        ),
        standardDeductions: FilingStatusValues(single: 15750, headOfHousehold: 23625, marriedJointly: 31500, marriedSeparately: 15750),
        age65PlusDeductions: FilingStatusValues(single: 2000, headOfHousehold: 2000, marriedJointly: 1600, marriedSeparately: 1600),
        childTaxCredit: 2200,
        otherDependentCredit: 500,
        childCreditPhaseOut: .init(joint: 400000, other: 200000),
        refundableChildCredit: .init(maxPerChild: 1700, earnedIncomeThreshold: 2500, rate: 0.15),
        payroll: .init(
            socialSecurityRate: 0.062,
            socialSecurityWageBase: 176100,
            medicareRate: 0.0145,
            additionalMedicareRate: 0.009,
            additionalMedicareThreshold: FilingStatusValues(single: 200000, headOfHousehold: 200000, marriedJointly: 250000, marriedSeparately: 125000)
        ),
        seniorDeduction: .init(amount: 6000, phaseOutRate: 0.06, joint: 150000, other: 75000),
        retirementLimit: .init(standard: 23500, catchUp: 7500, max: 31000),
        iraLimit: .init(standard: 7000, catchUp: 1000, max: 8000),
        hsaLimit: .init(selfOnly: 4300, family: 8550, catchUp: 1000),
        fsaLimit: 3300,
        studentLoanInterestLimit: 2500,
        studentLoanPhaseOut: .init(
            joint: PhaseOutRange(phaseOutStart: 170000, phaseOutEnd: 200000),
            other: PhaseOutRange(phaseOutStart: 85000, phaseOutEnd: 100000)
        ),
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: .init(
            singleCovered: IRALimitSet(full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000),
            headOfHouseholdCovered: IRALimitSet(full: 79000, phaseOutStart: 79000, phaseOutEnd: 89000),
            marriedBothCovered: IRALimitSet(full: 126000, phaseOutStart: 126000, phaseOutEnd: 146000),
            marriedOneCovered: IRALimitSet(full: 236000, phaseOutStart: 236000, phaseOutEnd: 246000),
            marriedSeparateCovered: IRALimitSet(full: nil, phaseOutStart: 0, phaseOutEnd: 10000)
        ),
        rothIraLimits: FilingStatusValues(
            single: PhaseOutRange(phaseOutStart: 150000, phaseOutEnd: 165000),
            headOfHousehold: PhaseOutRange(phaseOutStart: 150000, phaseOutEnd: 165000),
            marriedJointly: PhaseOutRange(phaseOutStart: 236000, phaseOutEnd: 246000),
            marriedSeparately: PhaseOutRange(phaseOutStart: 0, phaseOutEnd: 10000)
        )
    ),
    .y2026: TaxYearData(
        brackets: FilingStatusValues(
            single: makeBrackets([
                (0.10, 12400, 0), (0.12, 50400, 1240), (0.22, 105700, 5800),
                (0.24, 201775, 17966), (0.32, 256225, 41024), (0.35, 640600, 58448),
                (0.37, inf, 192979.25)
            ]),
            headOfHousehold: makeBrackets([
                (0.10, 17700, 0), (0.12, 67450, 1770), (0.22, 105700, 7740),
                (0.24, 201750, 16155), (0.32, 256200, 39207), (0.35, 640600, 56631),
                (0.37, inf, 191171)
            ]),
            marriedJointly: makeBrackets([
                (0.10, 24800, 0), (0.12, 100800, 2480), (0.22, 211400, 11600),
                (0.24, 403550, 35932), (0.32, 512450, 82048), (0.35, 768700, 116896),
                (0.37, inf, 206583.50)
            ]),
            marriedSeparately: makeBrackets([
                (0.10, 12400, 0), (0.12, 50400, 1240), (0.22, 105700, 5800),
                (0.24, 201775, 17966), (0.32, 256225, 41024), (0.35, 384350, 58448),
                (0.37, inf, 103291.75)
            ])
        ),
        standardDeductions: FilingStatusValues(single: 16100, headOfHousehold: 24150, marriedJointly: 32200, marriedSeparately: 16100),
        age65PlusDeductions: FilingStatusValues(single: 2050, headOfHousehold: 2050, marriedJointly: 1650, marriedSeparately: 1650),
        childTaxCredit: 2200,
        otherDependentCredit: 500,
        childCreditPhaseOut: .init(joint: 400000, other: 200000),
        refundableChildCredit: .init(maxPerChild: 1700, earnedIncomeThreshold: 2500, rate: 0.15),
        payroll: .init(
            socialSecurityRate: 0.062,
            socialSecurityWageBase: 184500,
            medicareRate: 0.0145,
            additionalMedicareRate: 0.009,
            additionalMedicareThreshold: FilingStatusValues(single: 200000, headOfHousehold: 200000, marriedJointly: 250000, marriedSeparately: 125000)
        ),
        seniorDeduction: .init(amount: 6000, phaseOutRate: 0.06, joint: 150000, other: 75000),
        retirementLimit: .init(standard: 24500, catchUp: 8000, max: 32500),
        iraLimit: .init(standard: 7500, catchUp: 1100, max: 8600),
        hsaLimit: .init(selfOnly: 4400, family: 8750, catchUp: 1000),
        fsaLimit: 3400,
        studentLoanInterestLimit: 2500,
        studentLoanPhaseOut: .init(
            joint: PhaseOutRange(phaseOutStart: 175000, phaseOutEnd: 205000),
            other: PhaseOutRange(phaseOutStart: 85000, phaseOutEnd: 100000)
        ),
        educatorExpensesLimit: 300,
        traditionalIraDeductionLimits: .init(
            singleCovered: IRALimitSet(full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000),
            headOfHouseholdCovered: IRALimitSet(full: 81000, phaseOutStart: 81000, phaseOutEnd: 91000),
            marriedBothCovered: IRALimitSet(full: 129000, phaseOutStart: 129000, phaseOutEnd: 149000),
            marriedOneCovered: IRALimitSet(full: 242000, phaseOutStart: 242000, phaseOutEnd: 252000),
            marriedSeparateCovered: IRALimitSet(full: nil, phaseOutStart: 0, phaseOutEnd: 10000)
        ),
        rothIraLimits: FilingStatusValues(
            single: PhaseOutRange(phaseOutStart: 153000, phaseOutEnd: 168000),
            headOfHousehold: PhaseOutRange(phaseOutStart: 153000, phaseOutEnd: 168000),
            marriedJointly: PhaseOutRange(phaseOutStart: 242000, phaseOutEnd: 252000),
            marriedSeparately: PhaseOutRange(phaseOutStart: 0, phaseOutEnd: 10000)
        )
    )
]
