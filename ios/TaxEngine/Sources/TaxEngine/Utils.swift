// Port of lib/utils.ts
import Foundation

public func getAvailableYears() -> [TaxYear] {
    TaxYear.allCases.sorted { $0.rawValue > $1.rawValue }
}

public func getTaxYearData(_ year: TaxYear) -> TaxYearData {
    taxYearData[year]!
}

public func getCurrentTaxYear() -> TaxYear { .y2025 }

/// Standard deduction. The additional 65+ amount applies per qualifying person;
/// a spouse counts only on a joint return.
public func calculateStandardDeduction(
    filingStatus: FilingStatus,
    isAge65Plus: Bool,
    year: TaxYear,
    isSpouseAge65Plus: Bool = false
) -> Double {
    let data = getTaxYearData(year)
    var deduction = data.standardDeductions[filingStatus]
    let extra = data.age65PlusDeductions[filingStatus]
    if isAge65Plus { deduction += extra }
    if filingStatus == .marriedJointly && isSpouseAge65Plus { deduction += extra }
    return deduction
}

/// Income after payroll pre-tax items and educator expenses, before the IRA and
/// student loan interest deductions (the MAGI for IRA deductibility and Roth eligibility).
public func calculateMAGI(
    grossIncome: Double,
    retirementContributions: Double,
    hsaContributions: Double,
    healthInsurancePremiums: Double,
    fsaContributions: Double,
    educatorExpenses: Double
) -> Double {
    // Same left-to-right subtraction order as the TS version
    Swift.max(0, grossIncome - retirementContributions - hsaContributions -
        healthInsurancePremiums - fsaContributions - educatorExpenses)
}

/// Matches on the upper bound only, so fractional incomes (e.g. 11,925.50) land in a bracket.
public func findTaxBracket(taxableIncome: Double, filingStatus: FilingStatus, year: TaxYear) -> TaxBracket {
    let brackets = getTaxYearData(year).brackets[filingStatus]
    for bracket in brackets where taxableIncome <= bracket.max {
        return bracket
    }
    return brackets[brackets.count - 1]
}

public struct BracketInfo: Codable, Sendable, Equatable {
    public let rate: Double
    public let ratePercent: Int
    public let rateName: String
}

public func getBracketInfo(_ bracket: TaxBracket) -> BracketInfo {
    let percent = Int((bracket.rate * 100).rounded())
    return BracketInfo(rate: bracket.rate, ratePercent: percent, rateName: "\(percent)%")
}

public struct TaxBracketBreakdown: Codable, Sendable, Equatable, Identifiable {
    public let rate: Double
    public let ratePercent: Int
    public let min: Double
    /// 999,999,999 for the open-ended top bracket, as in the web app
    public let max: Double
    public let incomeInBracket: Double
    public let taxInBracket: Double
    public let isActive: Bool

    public var id: Double { rate }
    public var isTopBracket: Bool { max == 999_999_999 }
}

/// How much taxable income falls in each bracket. Each bracket starts where the
/// previous one ends (bracket.min is $1 higher and is for display only).
public func calculateTaxBracketBreakdown(
    taxableIncome: Double,
    filingStatus: FilingStatus,
    year: TaxYear
) -> [TaxBracketBreakdown] {
    let brackets = getTaxYearData(year).brackets[filingStatus]
    var breakdown: [TaxBracketBreakdown] = []
    var lower = 0.0

    for bracket in brackets {
        if taxableIncome <= lower && !breakdown.isEmpty { break }

        let isActive = taxableIncome <= bracket.max
        let incomeInBracket = Swift.max(0, Swift.min(taxableIncome, bracket.max) - lower)

        breakdown.append(TaxBracketBreakdown(
            rate: bracket.rate,
            ratePercent: Int((bracket.rate * 100).rounded()),
            min: bracket.min,
            max: bracket.max == .infinity ? 999_999_999 : bracket.max,
            incomeInBracket: incomeInBracket,
            taxInBracket: incomeInBracket * bracket.rate,
            isActive: isActive
        ))

        if isActive { break }
        lower = bracket.max
    }
    return breakdown
}

// MARK: - Formatting (matches Intl.NumberFormat en-US output)

private func currencyFormatter(fractionDigits: Int) -> NumberFormatter {
    let f = NumberFormatter()
    f.locale = Locale(identifier: "en_US")
    f.numberStyle = .currency
    f.currencyCode = "USD"
    f.minimumFractionDigits = fractionDigits
    f.maximumFractionDigits = fractionDigits
    f.roundingMode = .halfUp // Intl uses half-expand; NumberFormatter defaults to half-even
    return f
}

private let centsFormatter = currencyFormatter(fractionDigits: 2)
private let dollarsFormatter = currencyFormatter(fractionDigits: 0)

/// "$1,234.56"
public func formatCurrency(_ amount: Double) -> String {
    centsFormatter.string(from: NSNumber(value: amount)) ?? "$0.00"
}

/// "$1,235"
public func formatMoney(_ amount: Double) -> String {
    dollarsFormatter.string(from: NSNumber(value: amount)) ?? "$0"
}

/// "12.3%"
public func formatPercentage(_ rate: Double) -> String {
    String(format: "%.1f%%", rate)
}
