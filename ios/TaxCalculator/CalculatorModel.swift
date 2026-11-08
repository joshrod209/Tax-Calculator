import Foundation
import Observation
import TaxEngine

/// Holds the form inputs and recomputes the estimate whenever they change.
/// Mirrors hooks/useTaxCalculator.ts in the web app.
@Observable
final class CalculatorModel {
    var inputs = TaxInputs() {
        didSet {
            guard inputs != oldValue else { return }
            let normalized = normalized(inputs)
            // Assigning again re-enters didSet, which then recalculates
            if normalized != inputs { inputs = normalized } else { recalculate() }
        }
    }

    private(set) var result: TaxCalculationResult?
    private(set) var iraRecommendation: IRARecommendation?
    private(set) var spouseIRARecommendation: IRARecommendation?

    var yearData: TaxYearData { getTaxYearData(inputs.year) }
    var isJoint: Bool { inputs.filingStatus == .marriedJointly }

    var retirementLimit: Double {
        inputs.isAge50Plus || inputs.isAge65Plus ? yearData.retirementLimit.max : yearData.retirementLimit.standard
    }
    var spouseRetirementLimit: Double {
        inputs.isSpouseAge50Plus || inputs.isSpouseAge65Plus ? yearData.retirementLimit.max : yearData.retirementLimit.standard
    }
    var iraLimit: Double {
        inputs.isAge50Plus || inputs.isAge65Plus ? yearData.iraLimit.max : yearData.iraLimit.standard
    }
    var spouseIRALimit: Double {
        inputs.isSpouseAge50Plus || inputs.isSpouseAge65Plus ? yearData.iraLimit.max : yearData.iraLimit.standard
    }
    var hsaLimit: Double {
        switch inputs.hsaCoverageType {
        case .none: return 0
        case .selfOnly: return yearData.hsaLimit.selfOnly
        case .family: return yearData.hsaLimit.family
        }
    }

    var bracketBreakdown: [TaxBracketBreakdown] {
        guard let result else { return [] }
        return calculateTaxBracketBreakdown(
            taxableIncome: result.taxableIncome,
            filingStatus: inputs.filingStatus,
            year: inputs.year
        )
    }

    init() {
        #if DEBUG
        // For reproducible screenshots: launch with `-prefillInputs '{"year":2026,...}'`
        // (same JSON shape as fixtures/tax-cases.json inputs)
        // (Read raw arguments: UserDefaults would parse a "{...}" value as a plist dictionary.)
        let args = ProcessInfo.processInfo.arguments
        if let flag = args.firstIndex(of: "-prefillInputs"), flag + 1 < args.count,
           let decoded = try? JSONDecoder().decode(TaxInputs.self, from: Data(args[flag + 1].utf8)) {
            inputs = normalized(decoded)
        }
        #endif
        recalculate()
    }

    func reset() { inputs = TaxInputs() }

    /// Keep values inside the limits the form shows, as the web form does,
    /// and clear spouse-only fields when they no longer apply.
    private func normalized(_ original: TaxInputs) -> TaxInputs {
        var i = original
        if i.filingStatus != .marriedJointly {
            i.spouseWages = 0
            i.isSpouseAge50Plus = false
            i.isSpouseAge65Plus = false
            i.spouseRetirementContributions = 0
            i.spouseIraContributions = 0
            i.isSpouseNonDeductibleIRA = false
            i.isSpouseCoveredByEmployerPlan = false
        }
        if !i.isSpouseCoveredByEmployerPlan { i.spouseRetirementContributions = 0 }
        if i.hsaCoverageType == .none { i.hsaContributions = 0 }
        i.retirementContributions = min(i.retirementContributions, retirementLimit)
        i.spouseRetirementContributions = min(i.spouseRetirementContributions, spouseRetirementLimit)
        i.iraContributions = min(i.iraContributions, iraLimit)
        i.spouseIraContributions = min(i.spouseIraContributions, spouseIRALimit)
        i.hsaContributions = min(i.hsaContributions, hsaLimit)
        i.fsaContributions = min(i.fsaContributions, yearData.fsaLimit)
        i.educatorExpenses = min(i.educatorExpenses, yearData.educatorExpensesLimit)
        i.studentLoanInterest = max(0, i.studentLoanInterest)
        i.spouseWages = min(max(0, i.spouseWages), i.grossIncome)
        // Tips and overtime are part of wages, so together they can't exceed them
        i.qualifiedTips = min(max(0, i.qualifiedTips), i.grossIncome)
        i.qualifiedOvertime = min(max(0, i.qualifiedOvertime), i.grossIncome - i.qualifiedTips)
        if i.state == .none { i.isRenter = false }
        return i
    }

    private func recalculate() {
        guard inputs.grossIncome > 0 else {
            result = nil
            iraRecommendation = nil
            spouseIRARecommendation = nil
            return
        }
        let r = calculateTax(inputs)
        result = r
        iraRecommendation = calculateIRARecommendation(inputs: inputs, result: r)
        spouseIRARecommendation = calculateIRARecommendation(inputs: inputs, result: r, forSpouse: true)
    }
}
