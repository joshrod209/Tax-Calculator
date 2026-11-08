// Port of lib/tax-calculations.ts (plus the IRA recommendation step from hooks/useTaxCalculator.ts)
import Foundation

public struct TaxInputs: Codable, Sendable, Equatable {
    public var year: TaxYear = .y2026
    public var filingStatus: FilingStatus = .single
    /// Total wages for the return (both spouses on a joint return)
    public var grossIncome: Double = 0
    /// Joint returns: the part of grossIncome your spouse earns (each worker has their own Social Security wage base)
    public var spouseWages: Double = 0
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
    /// Tips from a tipped occupation, already included in grossIncome
    public var qualifiedTips: Double = 0
    /// The extra "half" of time-and-a-half overtime pay, already included in grossIncome
    public var qualifiedOvertime: Double = 0
    /// Interest on a loan for a new, US-assembled personal vehicle taken out after 2024
    public var carLoanInterest: Double = 0
    /// Cash gifts to charity (deductible without itemizing from 2026)
    public var charitableDonations: Double = 0
    public var state: StateCode = .none
    /// Rents their home in the state (California renter's credit)
    public var isRenter = false

    public init() {}

    private enum CodingKeys: String, CodingKey {
        case year, filingStatus, grossIncome, spouseWages, isAge50Plus, isAge65Plus, isSpouseAge50Plus, isSpouseAge65Plus,
             numChildren, numOtherDependents, retirementContributions, spouseRetirementContributions,
             iraContributions, spouseIraContributions, isNonDeductibleIRA, isSpouseNonDeductibleIRA,
             hsaCoverageType, hsaContributions, healthInsurancePremiums, fsaContributions,
             studentLoanInterest, educatorExpenses, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan,
             qualifiedTips, qualifiedOvertime, carLoanInterest, charitableDonations, state, isRenter
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
        spouseWages = try v(.spouseWages, spouseWages)
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
        qualifiedTips = try v(.qualifiedTips, qualifiedTips)
        qualifiedOvertime = try v(.qualifiedOvertime, qualifiedOvertime)
        carLoanInterest = try v(.carLoanInterest, carLoanInterest)
        charitableDonations = try v(.charitableDonations, charitableDonations)
        state = try v(.state, state)
        isRenter = try v(.isRenter, isRenter)
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
    var tipsDeduction: Double
    var overtimeDeduction: Double
    var carLoanInterestDeduction: Double
    var charitableDeduction: Double
    var taxableIncome: Double
    var taxBeforeCredits: Double
    var dependentCredit: Double
    var taxObligation: Double
    var refundableChildCredit: Double
    var netIncomeTax: Double
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
    public let tipsDeduction: Double
    public let overtimeDeduction: Double
    public let carLoanInterestDeduction: Double
    public let charitableDeduction: Double
    public let taxableIncome: Double
    public let taxBeforeCredits: Double
    /// Non-refundable Child Tax Credit + Credit for Other Dependents actually used
    public let dependentCredit: Double
    /// Income tax after non-refundable credits (never below zero)
    public let taxObligation: Double
    /// Refundable part of the Child Tax Credit (Additional Child Tax Credit)
    public let refundableChildCredit: Double
    /// taxObligation minus refundable credits; negative means a refund
    public let netIncomeTax: Double
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
    /// Income tax rate after all credits, as % of gross income
    public let effectiveRate: Double
    /// Wages subject to payroll tax: gross minus cafeteria-plan items (HSA, premiums, FSA); 401(k) is still taxed
    public let payrollWages: Double
    public let socialSecurityTax: Double
    /// Medicare including the 0.9% Additional Medicare Tax
    public let medicareTax: Double
    public let payrollTax: Double
    /// State income tax details, or nil when no state is selected
    public let stateTax: StateTaxResult?
    public let stateIncomeTax: Double
    /// State payroll tax withheld from wages (California SDI)
    public let statePayrollTax: Double
    /// Gross income − federal and state income tax − payroll taxes − money set aside (retirement, IRA, HSA, premiums, FSA)
    public let takeHomePay: Double
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

    // Schedule 1-A deductions for tips, overtime and car loan interest; MAGI here is AGI
    func overBy(_ threshold: TaxYearData.JointOther<Double>) -> Double { max(0, agi - (isJoint ? threshold.joint : threshold.other)) / 1000 }
    func cap(_ amount: Double, _ d: TaxYearData.PhasedDeduction) -> Double {
        min(max(0, amount), isJoint ? d.max.joint : d.max.other)
    }
    var tipsDeduction = 0.0
    var overtimeDeduction = 0.0
    if status != .marriedSeparately {
        let tips = data.tipsDeduction
        tipsDeduction = max(0, cap(inputs.qualifiedTips, tips) - tips.reductionPer1000 * overBy(tips.threshold).rounded(.down))
        let ot = data.overtimeDeduction
        overtimeDeduction = max(0, cap(inputs.qualifiedOvertime, ot) - ot.reductionPer1000 * overBy(ot.threshold).rounded(.down))
    }
    let car = data.carLoanInterestDeduction
    let carLoanInterestDeduction = max(0, cap(inputs.carLoanInterest, car) - car.reductionPer1000 * overBy(car.threshold).rounded(.up))
    let charitableDeduction = min(
        max(0, inputs.charitableDonations),
        isJoint ? data.charitableDeduction.joint : data.charitableDeduction.other
    )

    let taxableIncome = max(0, agi - standardDeduction - seniorDeduction - tipsDeduction -
        overtimeDeduction - carLoanInterestDeduction - charitableDeduction)
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

    // Refundable part (Schedule 8812): the unused credit, capped per child and at 15% of
    // earned income over $2,500. Earned income is taxable wages (pay after 401(k) and
    // cafeteria-plan deductions). The 3+ children alternative needs the Earned Income
    // Credit, which isn't modeled, so only the 15% method is used.
    let refundable = data.refundableChildCredit
    let earnedIncome = magi + inputs.educatorExpenses
    let refundableChildCredit = max(0, min(
        allowedCredit - dependentCredit,
        Double(max(0, inputs.numChildren)) * refundable.maxPerChild,
        refundable.rate * max(0, earnedIncome - refundable.earnedIncomeThreshold)
    ))
    let taxObligation = taxBeforeCredits - dependentCredit

    return TaxCore(
        magi: magi,
        agi: agi,
        iraDeduction: iraDeduction,
        iraDeductionInfo: iraDeductionInfo,
        spouseIraDeductionInfo: spouseIraDeductionInfo,
        studentLoanDeduction: studentLoanDeduction,
        standardDeduction: standardDeduction,
        seniorDeduction: seniorDeduction,
        tipsDeduction: tipsDeduction,
        overtimeDeduction: overtimeDeduction,
        carLoanInterestDeduction: carLoanInterestDeduction,
        charitableDeduction: charitableDeduction,
        taxableIncome: taxableIncome,
        taxBeforeCredits: taxBeforeCredits,
        dependentCredit: dependentCredit,
        taxObligation: taxObligation,
        refundableChildCredit: refundableChildCredit,
        netIncomeTax: taxObligation - refundableChildCredit,
        marginalRate: bracket.rate * 100,
        bracket: bracket
    )
}

public struct PayrollTax: Codable, Sendable, Equatable {
    public let payrollWages: Double
    public let socialSecurityTax: Double
    public let medicareTax: Double
    public let payrollTax: Double
}

/// Employee share of Social Security and Medicare on wages. Cafeteria-plan items (HSA through
/// payroll, health premiums, health FSA) are exempt; 401(k) deferrals are not. On a joint return
/// the Social Security wage base applies to each spouse's wages, and Additional Medicare Tax to
/// their combined wages.
public func calculatePayrollTax(_ inputs: TaxInputs) -> PayrollTax {
    let p = getTaxYearData(inputs.year).payroll
    let isJoint = inputs.filingStatus == .marriedJointly
    let exempt = inputs.hsaContributions + inputs.healthInsurancePremiums + inputs.fsaContributions
    let payrollWages = max(0, inputs.grossIncome - exempt)
    let spouseWages = isJoint ? min(max(0, inputs.spouseWages), payrollWages) : 0
    let yourWages = payrollWages - spouseWages

    let socialSecurityTax =
        p.socialSecurityRate * (min(yourWages, p.socialSecurityWageBase) + min(spouseWages, p.socialSecurityWageBase))
    let threshold = p.additionalMedicareThreshold[inputs.filingStatus]
    let medicareTax =
        p.medicareRate * payrollWages + p.additionalMedicareRate * max(0, payrollWages - threshold)

    return PayrollTax(payrollWages: payrollWages, socialSecurityTax: socialSecurityTax,
                      medicareTax: medicareTax, payrollTax: socialSecurityTax + medicareTax)
}

/// Federal plus state income tax for a set of inputs
private func totalIncomeTax(_ inputs: TaxInputs, _ core: TaxCore) -> Double {
    let state = calculateStateTax(inputs, federalAgi: core.agi, payrollWages: calculatePayrollTax(inputs).payrollWages)
    return core.netIncomeTax + (state?.incomeTax ?? 0)
}

/// Tax saved by adding pre-tax contributions, found by recomputing the whole return
/// (federal and state) so IRA deductibility, phase-outs and credits are all reflected.
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
        taxSavings: max(0, totalIncomeTax(inputs, base) - totalIncomeTax(changedInputs, changed)),
        marginalRate: base.marginalRate,
        newMarginalRate: changed.marginalRate,
        currentTaxableIncome: base.taxableIncome,
        newTaxableIncome: changed.taxableIncome
    )
}

/// Federal (and, when a state is selected, state) tax estimate for a set of inputs.
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

    let payroll = calculatePayrollTax(inputs)
    let stateTax = calculateStateTax(inputs, federalAgi: core.agi, payrollWages: payroll.payrollWages)
    let stateIncomeTax = stateTax?.incomeTax ?? 0
    let statePayrollTax = stateTax?.disabilityInsurance ?? 0

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
        tipsDeduction: core.tipsDeduction,
        overtimeDeduction: core.overtimeDeduction,
        carLoanInterestDeduction: core.carLoanInterestDeduction,
        charitableDeduction: core.charitableDeduction,
        taxableIncome: core.taxableIncome,
        taxBeforeCredits: core.taxBeforeCredits,
        dependentCredit: core.dependentCredit,
        taxObligation: core.taxObligation,
        refundableChildCredit: core.refundableChildCredit,
        netIncomeTax: core.netIncomeTax,
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
        effectiveRate: inputs.grossIncome > 0 ? (core.netIncomeTax / inputs.grossIncome) * 100 : 0,
        payrollWages: payroll.payrollWages,
        socialSecurityTax: payroll.socialSecurityTax,
        medicareTax: payroll.medicareTax,
        payrollTax: payroll.payrollTax,
        stateTax: stateTax,
        stateIncomeTax: stateIncomeTax,
        statePayrollTax: statePayrollTax,
        takeHomePay: inputs.grossIncome - core.netIncomeTax - payroll.payrollTax - totalContributions -
            stateIncomeTax - statePayrollTax,
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
