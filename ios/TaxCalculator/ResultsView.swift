import SwiftUI
import TaxEngine

struct ResultsView: View {
    @Environment(CalculatorModel.self) private var model

    var body: some View {
        ScrollView {
            if let result = model.result {
                VStack(spacing: 16) {
                    SummaryCard(result: result)
                    BreakdownCard(result: result, breakdown: model.bracketBreakdown)
                    if let rec = model.iraRecommendation {
                        IRACard(
                            title: "Traditional IRA Eligibility",
                            contribution: model.inputs.iraContributions,
                            info: result.iraDeductionInfo,
                            markedNonDeductible: model.inputs.isNonDeductibleIRA,
                            recommendation: rec,
                            isSpouse: false
                        )
                    }
                    if model.isJoint, let rec = model.spouseIRARecommendation, let info = result.spouseIraDeductionInfo {
                        IRACard(
                            title: "Spouse IRA",
                            contribution: model.inputs.spouseIraContributions,
                            info: info,
                            markedNonDeductible: model.inputs.isSpouseNonDeductibleIRA,
                            recommendation: rec,
                            isSpouse: true
                        )
                    }
                    SavingsTipsCard(result: result, iraMarkedNonDeductible: model.inputs.isNonDeductibleIRA)
                }
                .padding()
            } else {
                ContentUnavailableView(
                    "Ready to Calculate",
                    systemImage: "chart.pie",
                    description: Text("Enter your filing status and income to see your tax estimate.")
                )
                .padding(.top, 80)
            }
        }
        .background(Color(.systemGroupedBackground))
    }
}

struct SummaryCard: View {
    let result: TaxCalculationResult

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Estimated Take-Home Pay")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white.opacity(0.75))
                Text(formatMoney(result.takeHomePay))
                    .font(.system(size: 44, weight: .bold, design: .rounded))
                    .monospacedDigit()
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                    .contentTransition(.numericText())
                    .accessibilityIdentifier("takeHomePay")
            }
            HStack(spacing: 12) {
                stat("Effective Tax Rate", formatPercentage(result.effectiveRate), id: "effectiveRate")
                stat(result.netIncomeTax < 0 ? "Income Tax Refund" : "Income Tax Owed",
                     formatMoney(abs(result.netIncomeTax)), id: "totalTax")
            }
        }
        .foregroundStyle(.white)
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(colors: [.brand, Color(red: 0.29, green: 0.20, blue: 0.62)], startPoint: .topLeading, endPoint: .bottomTrailing),
            in: RoundedRectangle(cornerRadius: 24, style: .continuous)
        )
        .animation(.snappy, value: result.takeHomePay)
    }

    private func stat(_ label: String, _ value: String, id: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.caption).foregroundStyle(.white.opacity(0.75))
            Text(value).font(.title3.bold()).monospacedDigit().accessibilityIdentifier(id)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct BreakdownCard: View {
    let result: TaxCalculationResult
    let breakdown: [TaxBracketBreakdown]
    @State private var showBrackets = false

    var body: some View {
        Card(title: "Calculation Breakdown", systemImage: "list.bullet.rectangle") {
            VStack(spacing: 10) {
                AmountRow(label: "Gross Income", value: formatMoney(result.grossIncome))
                AmountRow(label: "Pre-Tax Deductions", value: "−" + formatMoney(result.totalDeductions))
                AmountRow(label: "Standard Deduction", value: "−" + formatMoney(result.standardDeduction))
                if result.seniorDeduction > 0 {
                    AmountRow(label: "Senior Deduction (65+)", value: "−" + formatMoney(result.seniorDeduction))
                }
                Divider()
                AmountRow(label: "Taxable Income", value: formatMoney(result.taxableIncome), emphasized: true)
            }

            VStack(spacing: 10) {
                AmountRow(label: "Marginal Tax Bracket", value: result.bracketInfo.rateName, valueColor: .indigo)
                AmountRow(label: "Federal Tax", value: formatMoney(result.taxBeforeCredits))
                if result.dependentCredit > 0 {
                    AmountRow(label: "Child & Dependent Credits", value: "−" + formatMoney(result.dependentCredit), valueColor: .green)
                        .accessibilityIdentifier("dependentCredit")
                }
                if result.refundableChildCredit > 0 {
                    AmountRow(label: "Refundable Child Credit", value: "−" + formatMoney(result.refundableChildCredit), valueColor: .green)
                        .accessibilityIdentifier("refundableChildCredit")
                }
                Divider()
                AmountRow(
                    label: result.netIncomeTax < 0 ? "Income Tax Refund" : "Income Tax Owed",
                    value: formatMoney(abs(result.netIncomeTax)),
                    emphasized: true,
                    valueColor: result.netIncomeTax < 0 ? .green : .primary
                )
            }
            .padding(14)
            .background(Color(.tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            VStack(spacing: 10) {
                AmountRow(label: "Social Security (6.2%)", value: formatMoney(result.socialSecurityTax))
                AmountRow(
                    label: result.medicareTax > result.payrollWages * 0.0145 + 0.005 ? "Medicare (1.45% + 0.9%)" : "Medicare (1.45%)",
                    value: formatMoney(result.medicareTax)
                )
                Divider()
                AmountRow(label: "Payroll Tax", value: formatMoney(result.payrollTax), emphasized: true)
                    .accessibilityIdentifier("payrollTax")
            }
            .padding(14)
            .background(Color(.tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            if !breakdown.isEmpty {
                DisclosureGroup("Tax Bracket Breakdown", isExpanded: $showBrackets) {
                    VStack(spacing: 8) {
                        ForEach(breakdown) { b in
                            HStack(alignment: .firstTextBaseline) {
                                Text("\(b.ratePercent)%")
                                    .fontWeight(.semibold)
                                    .foregroundStyle(b.isActive ? .indigo : .primary)
                                    .frame(width: 44, alignment: .leading)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(formatMoney(b.incomeInBracket)).monospacedDigit()
                                    Text("\(formatMoney(b.min)) – \(b.isTopBracket ? "∞" : formatMoney(b.max))")
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(formatMoney(b.taxInBracket)).fontWeight(.semibold).monospacedDigit()
                            }
                            .font(.subheadline)
                            .padding(.vertical, 4)
                        }
                        Divider()
                        AmountRow(
                            label: "Total (before credits)",
                            value: formatMoney(breakdown.reduce(0) { $0 + $1.taxInBracket }),
                            emphasized: true
                        )
                    }
                    .padding(.top, 8)
                }
                .font(.subheadline.weight(.semibold))
                .tint(.primary)
            }
        }
    }
}

struct IRACard: View {
    let title: String
    let contribution: Double
    let info: IRADeductionInfo
    let markedNonDeductible: Bool
    let recommendation: IRARecommendation
    let isSpouse: Bool

    private var rec: IRAContributionRecommendations { recommendation.recommendations }
    private var tint: Color { isSpouse ? .purple : .indigo }

    var body: some View {
        Card(title: title, systemImage: "info.circle") {
            if !isSpouse || contribution > 0 {
                VStack(alignment: .leading, spacing: 4) {
                    Text(isSpouse ? "Spouse Deductible Amount" : "Your Deductible Amount")
                        .font(.subheadline.weight(.semibold))
                    Text(formatMoney(markedNonDeductible ? 0 : info.deductibleAmount))
                        .font(.title3.bold())
                        .foregroundStyle(tint)
                    status
                        .font(.caption)
                }
            }

            if rec.recommendedTrad > 0 {
                Callout(tint: tint) {
                    Text("Recommended Contribution Strategy").font(.caption.weight(.semibold)).foregroundStyle(tint)
                    Text("Put **\(formatMoney(rec.recommendedTrad))** in a Traditional IRA")
                    if rec.recommendedRoth > 0 {
                        Text("Put **\(formatMoney(rec.recommendedRoth))** in a Roth IRA")
                    }
                    if recommendation.estimatedTaxSavings > 0 && !markedNonDeductible {
                        Divider()
                        Text("Contributing \(formatMoney(rec.recommendedTrad)) to a Traditional IRA lowers your tax by about **\(formatMoney(recommendation.estimatedTaxSavings))**.")
                            .font(.caption)
                    }
                }
            }

            if info.isNonDeductible && !rec.rothEligible && rec.globalLimit > 0 {
                Callout(tint: .blue) {
                    Text("Consider a Backdoor Roth IRA").font(.caption.weight(.semibold)).foregroundStyle(.blue)
                    Text("Traditional IRA contributions aren't deductible and direct Roth contributions aren't allowed at this income.")
                        .font(.caption)
                    Text("1. Contribute \(formatMoney(rec.globalLimit)) to a non-deductible Traditional IRA\n2. Convert it to a Roth IRA right away\n3. Future growth is tax-free")
                        .font(.caption)
                    Text("Works best with no existing Traditional IRA balances (pro-rata rule).")
                        .font(.caption2).italic().foregroundStyle(.secondary)
                }
            }
        }
    }

    @ViewBuilder private var status: some View {
        if markedNonDeductible {
            Text("Non-deductible contribution (marked by you)").foregroundStyle(.blue)
        } else if info.isFullyDeductible {
            Label("Fully deductible", systemImage: "checkmark").foregroundStyle(.green)
        } else if info.isPartiallyDeductible {
            Label("Partially deductible", systemImage: "exclamationmark.triangle").foregroundStyle(.orange)
        } else if info.isNonDeductible {
            Label("Not deductible", systemImage: "xmark").foregroundStyle(.red)
        }
    }
}

struct SavingsTipsCard: View {
    let result: TaxCalculationResult
    let iraMarkedNonDeductible: Bool

    private func has(_ s: PotentialSavings?) -> Bool { (s?.taxSavings ?? 0) > 0 }

    var body: some View {
        let showIRA = has(result.potentialSavingsIRA) && !iraMarkedNonDeductible
        if has(result.potentialSavings401k) || has(result.potentialSavingsMax401k) || showIRA {
            Card(title: "Tax Bracket & Savings Tips", systemImage: "chart.line.uptrend.xyaxis") {
                if let s = result.potentialSavings401k, has(s) {
                    Callout(tint: .green) {
                        Text("Increase 401(k) by \(formatMoney(s.additional401k))").fontWeight(.semibold).foregroundStyle(.green)
                        Text("Save about \(formatMoney(s.taxSavings)) in taxes").font(.caption)
                    }
                }
                if let s = result.potentialSavingsMax401k, has(s) {
                    Callout(tint: .mint) {
                        Text("Maximize Your 401(k)").fontWeight(.semibold).foregroundStyle(.teal)
                        Text("**Remaining space:** \(formatMoney(result.maxAdditional401k)) of \(formatMoney(result.retirementLimit))").font(.caption)
                        Text("**Current contribution:** \(formatMoney(result.retirementContributions))").font(.caption)
                        Text("Contributing the remaining \(formatMoney(result.maxAdditional401k)) could save about **\(formatMoney(s.taxSavings))** this year.").font(.caption)
                    }
                }
                if showIRA, let s = result.potentialSavingsIRA {
                    Callout(tint: .green) {
                        Text("Increase IRA by \(formatMoney(s.additionalIRA))").fontWeight(.semibold).foregroundStyle(.green)
                        Text("Save about \(formatMoney(s.taxSavings)) in taxes").font(.caption)
                    }
                }
            }
        }
    }
}
