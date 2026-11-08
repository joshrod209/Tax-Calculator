// Port of lib/tax-calculations.ts (plus the IRA recommendation step from hooks/useTaxCalculator.ts)
import Foundation

public struct TaxInputs: Codable, Sendable, Equatable {
    public var year: TaxYear = .y2026
    public var filingStatus: FilingStatus = .single
    public var grossIncome: Double = 0
    public var isAge50Plus = false
    public var isAge65Plus = false
    public var isSpouseAge50Plus = false
    public var isSpouseAge65Plus = false
    /// Qualifying children under 17 (Child Tax Credit)
    public var numChildren = 0
    /// Other dependents (Credit for Other Dependents)
    public var numOtherDependents = 0
    public var retirementContributions: Double = 0
    /// Spouse's 401(k)/403(b); joint returns only
    public var spouseRetirementContributions: Double = 0
    public var iraContributions: Double = 0
    public var spouseIraContributions: Double = 0
    /// Traditional IRA contribution marked non-deductible (e.g. backdoor Roth)
    public var isNonDeductibleIRA = false
    public var isSpouseNonDeductibleIRA = false
    public var hsaCoverageType: HSACoverageType = .none
    public var hsaContributions: Double = 0
    public var healthInsurancePremiums: Double = 0
    public var fsaContributions: Double = 0
    public var studentLoanInterest: Double = 0
    public var educatorExpenses: Double = 0
    public var isCoveredByEmployerPlan = false
    public var isSpouseCoveredByEmployerPlan = false

    public init() {}

    private enum CodingKeys: String, CodingKey {
        case year, filingStatus, grossIncome, isAge50Plus, isAge65Plus, isSpouseAge50Plus, isSpouseAge65Plus,
             numChildren, numOtherDependents, retirementContributions, spouseRetirementContributions,
             iraContributions, spouseIraContributions, isNonDeductibleIRA, isSpouseNonDeductibleIRA,
             hsaCoverageType, hsaContributions, healthInsurancePremiums, fsaContributions,
             studentLoanInterest, educatorExpenses, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan
    }

    /// Any field left out keeps its default ($0 / false / 2026 single), as the shared fixtures expect.
    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        func v<T: Decodable>(_ key: CodingKeys, _ current: T) throws -> T {
            try c.decodeIfPresent(T.self, forKey: key) ?? current
        }
        year = try v(.year, year)
        filingStatus = try v(.filingStatus, filingStatus)
        grossIncome = try v(.grossIncome, grossIncome)
        isAge50Plus = try v(.isAge50Plus, isAge50Plus)
        isAge65Plus = try v(.isAge65Plus, isAge65Plus)
        isSpouseAge50Plus = try v(.isSpouseAge50Plus, isSpouseAge50Plus)
        isSpouseAge65Plus = try v(.isSpouseAge65Plus, isSpouseAge65Plus)
        numChildren = try v(.numChildren, numChildren)
        numOtherDependents = try v(.numOtherDependents, numOtherDependents)
        retirementContributions = try v(.retirementContributions, retirementContributions)
        spouseRetirementContributions = try v(.spouseRetirementContributions, spouseRetirementContributions)
        iraContributions = try v(.iraContributions, iraContributions)
        spouseIraContributions = try v(.spouseIraContributions, spouseIraContributions)
        isNonDeductibleIRA = try v(.isNonDeductibleIRA, isNonDeductibleIRA)
        isSpouseNonDeductibleIRA = try v(.isSpouseNonDeductibleIRA, isSpouseNonDeductibleIRA)
        hsaCoverageType = try v(.hsaCoverageType, hsaCoverageType)
        hsaContributions = try v(.hsaContributions, hsaContributions)
        healthInsurancePremiums = try v(.healthInsurancePremiums, healthInsurancePremiums)
        fsaContributions = try v(.fsaContributions, fsaContributions)
        studentLoanInterest = try v(.studentLoanInterest, studentLoanInterest)
        educatorExpenses = try v(.educatorExpenses, educatorExpenses)
        isCoveredByEmployerPlan = try v(.isCoveredByEmployerPlan, isCoveredByEmployerPlan)
        isSpouseCoveredByEmployerPlan = try v(.isSpouseCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan)
    }

    var isCatchUpEligible: Bool { isAge50Plus || isAge65Plus }
    var isSpouseCatchUpEligible: Bool { isSpouseAge50Plus || isSpouseAge65Plus }
}

public struct PotentialSavings: Codable, Sendable, Equatable {
    public let additional401k: Double
    public let additionalIRA: Double
    public let totalAdditional: Double
    public let taxSavings: Double
    public let marginalRate: Double
    public let newMarginalRate: Double
    public let currentTaxableIncome: Double
    public let newTaxableIncome: Double
}

struct TaxCore {
    var magi: Double
    var agi: Double
    var iraDeduction: Double
    var iraDeductionInfo: IRADeductionInfo
    var spouseIraDeductionInfo: IRADeductionInfo?
    var studentLoanDeduction: Double
    var standardDeduction: Double
    var seniorDeduction: Double
    var taxableIncome: Double
    var taxBeforeCredits: Double
    var dependentCredit: Double
    var taxObligation: Double
    var marginalRate: Double
    var bracket: TaxBracket
}

public struct TaxCalculationResult: Codable, Sendable, Equatable {
    public let magi: Double
    public let agi: Double
    /// Traditional IRA deduction actually taken (you + spouse)
    public let iraDeduction: Double
    public let iraDeductionInfo: IRADeductionInfo
    public let spouseIraDeductionInfo: IRADeductionInfo?
    public let studentLoanDeduction: Double
    public let standardDeduction: Double
    public let seniorDeduction: Double
    public let taxableIncome: Double
    public let taxBeforeCredits: Double
    public let dependentCredit: Double
    public let taxObligation: Double
    public let marginalRate: Double

    public let grossIncome: Double
    public let retirementContributions: Double
    public let spouseRetirementContributions: Double
    public let iraContributions: Double
    public let spouseIraContributions: Double
    public let hsaContributions: Double
    public let healthInsurancePremiums: Double
    public let fsaContributions: Double
    public let studentLoanInterest: Double
    public let educatorExpenses: Double
    /// Above-the-line deductions actually allowed (deductible IRA amounts, phased student loan interest)
    public let totalDeductions: Double
    /// Cash set aside from pay: retirement, IRA, HSA, premiums, FSA
    public let totalContributions: Double
    public let effectiveRate: Double
    public let bracketInfo: BracketInfo
    public let year: TaxYear
    public let potentialSavings401k: PotentialSavings?
    public let potentialSavingsIRA: PotentialSavings?
    public let potentialSavingsMax401k: PotentialSavings?
    public let potentialSavingsMaxIRA: PotentialSavings?
    public let maxAdditional401k: Double
    public let maxAdditionalIRA: Double
    public let maxAdditionalSpouseIRA: Double
    public let retirementLimit: Double
    public let iraLimit: Double

    /// Gross income minus tax and everything set aside from pay (as shown in the web app)
    public var takeHomePay: Double { grossIncome - taxObligation - totalContributions }
}

/// Linear phase-out: 1 below start, 0 at or above end
private func phaseOutFraction(_ income: Double, _ start: Double, _ end: Double) -> Double {
    if income <= start { return 1 }
    if income >= end { return 0 }
    return (end - income) / (end - start)
}

func computeTax(_ inputs: TaxInputs) -> TaxCore {
    let status = inputs.filingStatus
    let year = inputs.year
    let data = getTaxYearData(year)
    let isJoint = status == .marriedJointly
    let spouseRetirement = isJoint ? inputs.spouseRetirementContributions : 0

    let magi = calculateMAGI(
        grossIncome: inputs.grossIncome,
        retirementContributions: inputs.retirementContributions + spouseRetirement,
        hsaContributions: inputs.hsaContributions,
        healthInsurancePremiums: inputs.healthInsurancePremiums,
        fsaContributions: inputs.fsaContributions,
        educatorExpenses: inputs.educatorExpenses
    )

    let iraDeductionInfo = calculateTraditionalIRADeductible(
        magi: magi,
        filingStatus: status,
        isCoveredByEmployerPlan: inputs.isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan: inputs.isSpouseCoveredByEmployerPlan,
        iraContribution: inputs.iraContributions,
        year: year,
        isEligibleForCatchUp: inputs.isCatchUpEligible
    )

    var spouseIraDeductionInfo: IRADeductionInfo?
    if isJoint && inputs.spouseIraContributions > 0 {
        spouseIraDeductionInfo = calculateTraditionalIRADeductible(
            magi: magi,
            filingStatus: status,
            isCoveredByEmployerPlan: inputs.isSpouseCoveredByEmployerPlan,
            isSpouseCoveredByEmployerPlan: inputs.isCoveredByEmployerPlan,
            iraContribution: inputs.spouseIraContributions,
            year: year,
            isEligibleForCatchUp: inputs.isSpouseCatchUpEligible
        )
    }
    // A contribution marked non-deductible is never deducted, whatever the limits allow
    let yourIraDeduction = inputs.isNonDeductibleIRA ? 0 : iraDeductionInfo.deductibleAmount
    let spouseIraDeduction = inputs.isSpouseNonDeductibleIRA ? 0 : (spouseIraDeductionInfo?.deductibleAmount ?? 0)
    let iraDeduction = yourIraDeduction + spouseIraDeduction

    // Student loan interest: capped, phased out on MAGI after the IRA deduction, not allowed for MFS
    var studentLoanDeduction = 0.0
    if status != .marriedSeparately && inputs.studentLoanInterest > 0 {
        let range = isJoint ? data.studentLoanPhaseOut.joint : data.studentLoanPhaseOut.other
        let capped = min(inputs.studentLoanInterest, data.studentLoanInterestLimit)
        let fraction = phaseOutFraction(magi - iraDeduction, range.phaseOutStart, range.phaseOutEnd)
        studentLoanDeduction = (capped * fraction * 100).rounded() / 100
    }

    let agi = max(0, magi - iraDeduction - studentLoanDeduction)

    let standardDeduction = calculateStandardDeduction(
        filingStatus: status,
        isAge65Plus: inputs.isAge65Plus,
        year: year,
        isSpouseAge65Plus: inputs.isSpouseAge65Plus
    )

    // Senior deduction: $6,000 per qualifying person, each reduced by 6% of MAGI over
    // the threshold. Married couples must file jointly to claim it.
    var seniorDeduction = 0.0
    if status != .marriedSeparately {
        let qualifying = (inputs.isAge65Plus ? 1.0 : 0) + (isJoint && inputs.isSpouseAge65Plus ? 1.0 : 0)
        let senior = data.seniorDeduction
        let threshold = isJoint ? senior.joint : senior.other
        let perPerson = max(0, senior.amount - senior.phaseOutRate * max(0, agi - threshold))
        seniorDeduction = qualifying * perPerson
    }

    let taxableIncome = max(0, agi - standardDeduction - seniorDeduction)
    let bracket = findTaxBracket(taxableIncome: taxableIncome, filingStatus: status, year: year)
    let taxBeforeCredits = max(0, bracket.tax(on: taxableIncome))

    // Child Tax Credit + Credit for Other Dependents, reduced by $50 per $1,000 (or fraction)
    // over the threshold. Only the non-refundable part is modeled.
    let creditThreshold = isJoint ? data.childCreditPhaseOut.joint : data.childCreditPhaseOut.other
    let grossCredit =
        Double(max(0, inputs.numChildren)) * data.childTaxCredit +
        Double(max(0, inputs.numOtherDependents)) * data.otherDependentCredit
    let creditReduction = 50 * (max(0, agi - creditThreshold) / 1000).rounded(.up)
    let allowedCredit = max(0, grossCredit - creditReduction)
    let dependentCredit = min(allowedCredit, taxBeforeCredits)

    return TaxCore(
        magi: magi,
        agi: agi,
        iraDeduction: iraDeduction,
        iraDeductionInfo: iraDeductionInfo,
        spouseIraDeductionInfo: spouseIraDeductionInfo,
        studentLoanDeduction: studentLoanDeduction,
        standardDeduction: standardDeduction,
        seniorDeduction: seniorDeduction,
        taxableIncome: taxableIncome,
        taxBeforeCredits: taxBeforeCredits,
        dependentCredit: dependentCredit,
        taxObligation: taxBeforeCredits - dependentCredit,
        marginalRate: bracket.rate * 100,
        bracket: bracket
    )
}

/// Tax saved by adding pre-tax contributions, found by recomputing the whole return
/// so IRA deductibility, phase-outs and credits are all reflected.
public func estimateTaxSavings(
    _ inputs: TaxInputs,
    additional401k: Double,
    additionalIRA: Double,
    additionalSpouseIRA: Double = 0
) -> PotentialSavings {
    let base = computeTax(inputs)
    var changedInputs = inputs
    changedInputs.retirementContributions += additional401k
    changedInputs.iraContributions += additionalIRA
    changedInputs.spouseIraContributions += additionalSpouseIRA
    let changed = computeTax(changedInputs)

    return PotentialSavings(
        additional401k: additional401k,
        additionalIRA: additionalIRA + additionalSpouseIRA,
        totalAdditional: additional401k + additionalIRA + additionalSpouseIRA,
        taxSavings: max(0, base.taxObligation - changed.taxObligation),
        marginalRate: base.marginalRate,
        newMarginalRate: changed.marginalRate,
        currentTaxableIncome: base.taxableIncome,
        newTaxableIncome: changed.taxableIncome
    )
}

/// Federal tax estimate for a set of inputs.
public func calculateTax(_ inputs: TaxInputs) -> TaxCalculationResult {
    let data = getTaxYearData(inputs.year)
    let isJoint = inputs.filingStatus == .marriedJointly
    let core = computeTax(inputs)

    let spouseIraContributions = isJoint ? inputs.spouseIraContributions : 0
    let spouseRetirementContributions = isJoint ? inputs.spouseRetirementContributions : 0

    // Summed in the same order as the TS version so the floats match exactly
    var totalDeductions = inputs.retirementContributions
    totalDeductions += spouseRetirementContributions
    totalDeductions += core.iraDeduction
    totalDeductions += inputs.hsaContributions
    totalDeductions += inputs.healthInsurancePremiums
    totalDeductions += inputs.fsaContributions
    totalDeductions += core.studentLoanDeduction
    totalDeductions += inputs.educatorExpenses

    var totalContributions = inputs.retirementContributions
    totalContributions += spouseRetirementContributions
    totalContributions += inputs.iraContributions
    totalContributions += spouseIraContributions
    totalContributions += inputs.hsaContributions
    totalContributions += inputs.healthInsurancePremiums
    totalContributions += inputs.fsaContributions

    let retirementLimit = inputs.isCatchUpEligible ? data.retirementLimit.max : data.retirementLimit.standard
    let iraLimit = inputs.isCatchUpEligible ? data.iraLimit.max : data.iraLimit.standard
    let spouseIraLimit = inputs.isSpouseCatchUpEligible ? data.iraLimit.max : data.iraLimit.standard

    let maxAdditional401k = max(0, retirementLimit - inputs.retirementContributions)
    let maxAdditionalIRA = max(0, iraLimit - inputs.iraContributions)
    let maxAdditionalSpouseIRA = isJoint ? max(0, spouseIraLimit - spouseIraContributions) : 0

    return TaxCalculationResult(
        magi: core.magi,
        agi: core.agi,
        iraDeduction: core.iraDeduction,
        iraDeductionInfo: core.iraDeductionInfo,
        spouseIraDeductionInfo: core.spouseIraDeductionInfo,
        studentLoanDeduction: core.studentLoanDeduction,
        standardDeduction: core.standardDeduction,
        seniorDeduction: core.seniorDeduction,
        taxableIncome: core.taxableIncome,
        taxBeforeCredits: core.taxBeforeCredits,
        dependentCredit: core.dependentCredit,
        taxObligation: core.taxObligation,
        marginalRate: core.marginalRate,
        grossIncome: inputs.grossIncome,
        retirementContributions: inputs.retirementContributions,
        spouseRetirementContributions: spouseRetirementContributions,
        iraContributions: inputs.iraContributions,
        spouseIraContributions: spouseIraContributions,
        hsaContributions: inputs.hsaContributions,
        healthInsurancePremiums: inputs.healthInsurancePremiums,
        fsaContributions: inputs.fsaContributions,
        studentLoanInterest: inputs.studentLoanInterest,
        educatorExpenses: inputs.educatorExpenses,
        totalDeductions: totalDeductions,
        totalContributions: totalContributions,
        effectiveRate: inputs.grossIncome > 0 ? (core.taxObligation / inputs.grossIncome) * 100 : 0,
        bracketInfo: getBracketInfo(core.bracket),
        year: inputs.year,
        potentialSavings401k: maxAdditional401k > 0
            ? estimateTaxSavings(inputs, additional401k: min(1000, maxAdditional401k), additionalIRA: 0) : nil,
        potentialSavingsIRA: maxAdditionalIRA > 0
            ? estimateTaxSavings(inputs, additional401k: 0, additionalIRA: min(1000, maxAdditionalIRA)) : nil,
        potentialSavingsMax401k: maxAdditional401k > 0
            ? estimateTaxSavings(inputs, additional401k: maxAdditional401k, additionalIRA: 0) : nil,
        potentialSavingsMaxIRA: maxAdditionalIRA > 0
            ? estimateTaxSavings(inputs, additional401k: 0, additionalIRA: maxAdditionalIRA) : nil,
        maxAdditional401k: maxAdditional401k,
        maxAdditionalIRA: maxAdditionalIRA,
        maxAdditionalSpouseIRA: maxAdditionalSpouseIRA,
        retirementLimit: retirementLimit,
        iraLimit: iraLimit
    )
}

// MARK: - IRA recommendation with savings (hooks/useTaxCalculator.ts)

public struct IRARecommendation: Sendable, Equatable {
    public let recommendations: IRAContributionRecommendations
    /// Tax saved by putting `recommendedTrad` in a Traditional IRA instead of nothing
    public let estimatedTaxSavings: Double
}

/// The web hook's Traditional/Roth recommendation, for you or (on a joint return) your spouse.
public func calculateIRARecommendation(
    inputs: TaxInputs,
    result: TaxCalculationResult,
    forSpouse: Bool = false
) -> IRARecommendation? {
    if forSpouse && inputs.filingStatus != .marriedJointly { return nil }

    let rec = calculateIRAContributionRecommendations(
        magi: result.magi,
        filingStatus: inputs.filingStatus,
        isCoveredByEmployerPlan: forSpouse ? inputs.isSpouseCoveredByEmployerPlan : inputs.isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan: forSpouse ? inputs.isCoveredByEmployerPlan : inputs.isSpouseCoveredByEmployerPlan,
        year: inputs.year,
        isEligibleForCatchUp: forSpouse ? inputs.isSpouseCatchUpEligible : inputs.isCatchUpEligible,
        iraContribution: forSpouse ? inputs.spouseIraContributions : inputs.iraContributions
    )

    var base = inputs
    let savings: PotentialSavings
    if forSpouse {
        base.spouseIraContributions = 0
        savings = estimateTaxSavings(base, additional401k: 0, additionalIRA: 0, additionalSpouseIRA: rec.recommendedTrad)
    } else {
        base.iraContributions = 0
        savings = estimateTaxSavings(base, additional401k: 0, additionalIRA: rec.recommendedTrad)
    }
    return IRARecommendation(recommendations: rec, estimatedTaxSavings: savings.taxSavings)
}
