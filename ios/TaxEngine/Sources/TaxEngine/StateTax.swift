// Port of lib/state-tax.ts. California only for now.

public enum StateCode: String, CaseIterable, Codable, Sendable, Identifiable {
    case none
    case CA

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .none: return "No state tax / not listed"
        case .CA: return "California"
        }
    }
}

struct StateBracket: Sendable {
    let rate: Double
    /// Taxable income where this bracket starts
    let over: Double
    /// Tax on income below `over`, as FTB publishes it (each bracket's tax rounded to the cent)
    let base: Double
}

struct CaliforniaYearData: Sendable {
    struct RentersCredit: Sendable {
        let amount: Double
        let agiLimit: Double
    }
    let single: [StateBracket]
    let marriedJointly: [StateBracket]
    let headOfHousehold: [StateBracket]
    let standardDeductionSingle: Double
    let standardDeductionJoint: Double
    let personalExemptionCredit: Double
    let dependentExemptionCredit: Double
    /// Exemption credits shrink by $6 per credit for each $2,500 ($1,250 MFS), or part, of federal AGI over these
    let exemptionPhaseOut: FilingStatusValues<Double>
    let rentersSingle: RentersCredit
    let rentersJoint: RentersCredit
    let sdiRate: Double
}

private func caBrackets(_ starts: [Double]) -> [StateBracket] {
    let rates = [0.01, 0.02, 0.04, 0.06, 0.08, 0.093, 0.103, 0.113, 0.123]
    var base = 0.0
    return starts.enumerated().map { i, over in
        if i > 0 { base += ((over - starts[i - 1]) * rates[i - 1] * 100).rounded() / 100 }
        return StateBracket(rate: rates[i], over: over, base: base)
    }
}

/// California figures from FTB Tax News (October 2025 and October 2026 indexing announcements),
/// the 2025 Form 540 booklet, and EDD for SDI.
func californiaData(_ year: TaxYear) -> CaliforniaYearData {
    switch year {
    case .y2025:
        return CaliforniaYearData(
            single: caBrackets([0, 11079, 26264, 41452, 57542, 72724, 371479, 445771, 742953]),
            marriedJointly: caBrackets([0, 22158, 52528, 82904, 115084, 145448, 742958, 891542, 1485906]),
            headOfHousehold: caBrackets([0, 22173, 52530, 67716, 83805, 98990, 505208, 606251, 1010417]),
            standardDeductionSingle: 5706,
            standardDeductionJoint: 11412,
            personalExemptionCredit: 153,
            dependentExemptionCredit: 475,
            exemptionPhaseOut: FilingStatusValues(single: 252203, headOfHousehold: 378310, marriedJointly: 504411, marriedSeparately: 252203),
            rentersSingle: .init(amount: 60, agiLimit: 53994),
            rentersJoint: .init(amount: 120, agiLimit: 107988),
            sdiRate: 0.012
        )
    case .y2026:
        return CaliforniaYearData(
            single: caBrackets([0, 11456, 27157, 42861, 59498, 75197, 384109, 460927, 768213]),
            marriedJointly: caBrackets([0, 22912, 54314, 85722, 118996, 150394, 768218, 921854, 1536426]),
            headOfHousehold: caBrackets([0, 22927, 54316, 70018, 86654, 102356, 522385, 626864, 1044771]),
            standardDeductionSingle: 5900,
            standardDeductionJoint: 11800,
            personalExemptionCredit: 158,
            dependentExemptionCredit: 491,
            // FTB publishes these in late December; until then, the 2025 amounts indexed by the
            // 3.4% California CPI, rounded, which is how FTB derives them.
            exemptionPhaseOut: FilingStatusValues(single: 260778, headOfHousehold: 391173, marriedJointly: 521561, marriedSeparately: 260778),
            rentersSingle: .init(amount: 60, agiLimit: 55830),
            rentersJoint: .init(amount: 120, agiLimit: 111660),
            sdiRate: 0.013
        )
    }
}

/// Behavioral Health Services Tax: 1% of taxable income over $1 million, any filing status
private let caBehavioralHealthRate = 0.01
private let caBehavioralHealthThreshold = 1_000_000.0

/// Schedule X/Y/Z: the bracket's published base plus its rate on the income above where it starts
private func bracketTax(_ taxable: Double, _ brackets: [StateBracket]) -> (tax: Double, rate: Double) {
    var b = brackets[0]
    for candidate in brackets where taxable > candidate.over { b = candidate }
    return (b.base + max(0, taxable - b.over) * b.rate, b.rate)
}

/// California's tax table (Form 540, taxable income up to $100,000) has $100 rows: $1–$50,
/// $51–$150, …, $99,951–$100,000. Each row's tax is the rate-schedule tax on the row's midpoint
/// rounded down to a whole dollar, rounded to whole dollars. This reproduces every entry of
/// FTB's published 2025 table.
private let caTaxTableLimit = 100_000.0
private func caTaxTableIncome(_ taxable: Double) -> Double {
    let x = taxable.rounded() // the return uses whole dollars
    if x <= 0 { return 0 }
    if x <= 50 { return 25 }
    let lo = ((x - 51) / 100).rounded(.down) * 100 + 51
    let hi = min(lo + 99, caTaxTableLimit)
    return ((lo + hi) / 2).rounded(.down)
}

/// California rate-schedule tax (Schedules X, Y, Z) on a taxable income, before credits
public func californiaScheduleTax(year: TaxYear, filingStatus: FilingStatus, taxable: Double) -> Double {
    let ca = californiaData(year)
    switch filingStatus {
    case .marriedJointly: return bracketTax(taxable, ca.marriedJointly).tax
    case .headOfHousehold: return bracketTax(taxable, ca.headOfHousehold).tax
    case .single, .marriedSeparately: return bracketTax(taxable, ca.single).tax
    }
}

public struct StateTaxResult: Codable, Sendable, Equatable {
    public let state: StateCode
    /// State AGI: federal AGI plus items the state doesn't allow
    public let stateAgi: Double
    public let standardDeduction: Double
    public let taxableIncome: Double
    public let taxBeforeCredits: Double
    public let exemptionCredits: Double
    public let rentersCredit: Double
    /// California Behavioral Health Services Tax (1% over $1M)
    public let surtax: Double
    /// State income tax after credits
    public let incomeTax: Double
    /// Employee disability insurance (California SDI) on wages
    public let disabilityInsurance: Double
    public let marginalRate: Double
}

/// California resident income tax (Form 540) on wages, using the standard deduction. Starts from
/// federal AGI and adds back what California doesn't allow (HSA contributions, educator expenses).
/// California has no tips, overtime, car loan, or senior deduction. CalEITC and the Young Child Tax
/// Credit aren't modeled. Up to $100,000 of taxable income the tax comes from FTB's tax table (whole
/// dollars); above that, from the rate schedule.
public func calculateStateTax(_ inputs: TaxInputs, federalAgi: Double, payrollWages: Double) -> StateTaxResult? {
    guard inputs.state == .CA else { return nil }

    let ca = californiaData(inputs.year)
    let status = inputs.filingStatus
    let isJoint = status == .marriedJointly
    let usesJointAmounts = isJoint || status == .headOfHousehold

    let stateAgi = federalAgi + inputs.hsaContributions + inputs.educatorExpenses
    let standardDeduction = usesJointAmounts ? ca.standardDeductionJoint : ca.standardDeductionSingle
    let taxableIncome = max(0, stateAgi - standardDeduction)

    let brackets: [StateBracket]
    switch status {
    case .marriedJointly: brackets = ca.marriedJointly
    case .headOfHousehold: brackets = ca.headOfHousehold
    case .single, .marriedSeparately: brackets = ca.single
    }
    let rate = bracketTax(taxableIncome, brackets).rate
    let taxBeforeCredits = taxableIncome.rounded() <= caTaxTableLimit
        ? bracketTax(caTaxTableIncome(taxableIncome), brackets).tax.rounded()
        : bracketTax(taxableIncome, brackets).tax

    // Form 540 lines 7–10: one personal credit each (two on a joint return), one more per
    // person 65+, and one per dependent. The AGI Limitation Worksheet uses federal AGI.
    let personalCount = Double((isJoint ? 2 : 1) + (inputs.isAge65Plus ? 1 : 0) + (isJoint && inputs.isSpouseAge65Plus ? 1 : 0))
    let dependentCount = Double(max(0, inputs.numChildren) + max(0, inputs.numOtherDependents))
    let step: Double = status == .marriedSeparately ? 1250 : 2500
    let over = max(0, federalAgi - ca.exemptionPhaseOut[status])
    let reductionPerCredit = 6 * (over / step).rounded(.up)
    let personalCredits = max(0, personalCount * (ca.personalExemptionCredit - reductionPerCredit))
    let dependentCredits = max(0, dependentCount * (ca.dependentExemptionCredit - reductionPerCredit))
    let exemptionCredits = min(taxBeforeCredits, personalCredits + dependentCredits)

    // Nonrenter's credit: renters of their California home, under the AGI limit
    let renters = usesJointAmounts ? ca.rentersJoint : ca.rentersSingle
    let rentersCredit = inputs.isRenter && stateAgi <= renters.agiLimit
        ? min(renters.amount, taxBeforeCredits - exemptionCredits)
        : 0

    let surtax = caBehavioralHealthRate * max(0, taxableIncome - caBehavioralHealthThreshold)
    let incomeTax = taxBeforeCredits - exemptionCredits - rentersCredit + surtax

    return StateTaxResult(
        state: .CA,
        stateAgi: stateAgi,
        standardDeduction: standardDeduction,
        taxableIncome: taxableIncome,
        taxBeforeCredits: taxBeforeCredits,
        exemptionCredits: exemptionCredits,
        rentersCredit: rentersCredit,
        surtax: surtax,
        incomeTax: incomeTax,
        // SDI covers the same wages as Social Security (401(k) included, cafeteria plan excluded), with no cap
        disabilityInsurance: ca.sdiRate * payrollWages,
        marginalRate: (rate + (taxableIncome > caBehavioralHealthThreshold ? caBehavioralHealthRate : 0)) * 100
    )
}
