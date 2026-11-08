import SwiftUI
import TaxEngine

struct InputFormView: View {
    @Environment(CalculatorModel.self) private var model

    var body: some View {
        @Bindable var model = model
        let year = model.inputs.year
        let data = model.yearData

        Form {
            Section("Basics") {
                Picker("Tax Year", selection: $model.inputs.year) {
                    ForEach(getAvailableYears()) { Text(String($0.rawValue)).tag($0) }
                }
                .pickerStyle(.segmented)
                .accessibilityIdentifier("taxYear")

                Picker("Filing Status", selection: $model.inputs.filingStatus) {
                    ForEach(FilingStatus.allCases) { Text($0.displayName).tag($0) }
                }
                .accessibilityIdentifier("filingStatus")

                Picker("State", selection: $model.inputs.state) {
                    ForEach(StateCode.allCases) { Text($0.displayName).tag($0) }
                }
                .accessibilityIdentifier("state")
                if model.inputs.state == .CA {
                    Toggle("I rent my home (renter's credit)", isOn: $model.inputs.isRenter)
                }

                CurrencyField(title: "Gross Annual Income", value: $model.inputs.grossIncome, accessibilityID: "grossIncome")

                Toggle("Age 50 or older", isOn: $model.inputs.isAge50Plus)
                Toggle("Age 65 or older", isOn: $model.inputs.isAge65Plus)
            }

            if model.isJoint {
                Section {
                    CurrencyField(
                        title: "Spouse's share of income",
                        value: $model.inputs.spouseWages,
                        caption: "Part of the gross income your spouse earns",
                        accessibilityID: "spouseWages"
                    )
                    Toggle("Spouse is 50 or older", isOn: $model.inputs.isSpouseAge50Plus)
                    Toggle("Spouse is 65 or older", isOn: $model.inputs.isSpouseAge65Plus)
                } header: {
                    Text("Spouse")
                } footer: {
                    Text("Only affects Social Security tax, which stops at a yearly wage cap for each worker. Leave at $0 if one of you earns it all.")
                }
            }

            Section {
                Stepper(value: $model.inputs.numChildren, in: 0...20) {
                    LabeledContent("Children under 17", value: "\(model.inputs.numChildren)")
                }
                .accessibilityIdentifier("numChildren")
                Stepper(value: $model.inputs.numOtherDependents, in: 0...20) {
                    LabeledContent("Other dependents", value: "\(model.inputs.numOtherDependents)")
                }
                .accessibilityIdentifier("numOtherDependents")
            } header: {
                Text("Dependents")
            } footer: {
                Text("\(formatMoney(data.childTaxCredit)) per child, \(formatMoney(data.otherDependentCredit)) per other dependent.")
            }

            Section {
                Toggle("You're covered by a workplace plan", isOn: $model.inputs.isCoveredByEmployerPlan)
                if model.isJoint {
                    Toggle("Spouse is covered by a workplace plan", isOn: $model.inputs.isSpouseCoveredByEmployerPlan)
                }
                CurrencyField(
                    title: "401(k) / 403(b)",
                    value: $model.inputs.retirementContributions,
                    caption: "\(String(year.rawValue)) limit \(formatMoney(model.retirementLimit))",
                    accessibilityID: "retirementContributions"
                )
                if model.isJoint && model.inputs.isSpouseCoveredByEmployerPlan {
                    CurrencyField(
                        title: "Spouse 401(k) / 403(b)",
                        value: $model.inputs.spouseRetirementContributions,
                        caption: "Limit \(formatMoney(model.spouseRetirementLimit))",
                        accessibilityID: "spouseRetirementContributions"
                    )
                }
            } header: {
                Text("Workplace Retirement")
            } footer: {
                Text("Workplace plan coverage affects whether Traditional IRA contributions are deductible.")
            }

            Section {
                CurrencyField(
                    title: "Your Traditional IRA",
                    value: $model.inputs.iraContributions,
                    caption: "Limit \(formatMoney(model.iraLimit))",
                    accessibilityID: "iraContributions"
                )
                if model.inputs.iraContributions > 0 {
                    Toggle("Non-deductible (e.g. backdoor Roth)", isOn: $model.inputs.isNonDeductibleIRA)
                }
                if model.isJoint {
                    CurrencyField(
                        title: "Spouse Traditional IRA",
                        value: $model.inputs.spouseIraContributions,
                        caption: "Limit \(formatMoney(model.spouseIRALimit))",
                        accessibilityID: "spouseIraContributions"
                    )
                    if model.inputs.spouseIraContributions > 0 {
                        Toggle("Spouse's is non-deductible", isOn: $model.inputs.isSpouseNonDeductibleIRA)
                    }
                }
            } header: {
                Text("IRA")
            } footer: {
                if let info = model.result?.iraDeductionInfo, model.inputs.iraContributions > 0,
                   !model.inputs.isNonDeductibleIRA, info.isNonDeductible {
                    Text("At your income, this contribution isn't deductible. Consider marking it non-deductible or using a Roth IRA.")
                        .foregroundStyle(.orange)
                }
            }

            Section("Health & Other Deductions") {
                Picker("HSA Coverage", selection: $model.inputs.hsaCoverageType) {
                    Text("No HSA").tag(HSACoverageType.none)
                    Text("Self-Only").tag(HSACoverageType.selfOnly)
                    Text("Family").tag(HSACoverageType.family)
                }
                if model.inputs.hsaCoverageType != .none {
                    CurrencyField(
                        title: "HSA Contributions",
                        value: $model.inputs.hsaContributions,
                        caption: "Limit \(formatMoney(model.hsaLimit))",
                        accessibilityID: "hsaContributions"
                    )
                }
                CurrencyField(
                    title: "FSA Contributions",
                    value: $model.inputs.fsaContributions,
                    caption: "Limit \(formatMoney(data.fsaLimit))",
                    accessibilityID: "fsaContributions"
                )
                CurrencyField(
                    title: "Health Insurance Premiums",
                    value: $model.inputs.healthInsurancePremiums,
                    caption: "Pre-tax premiums paid through your employer",
                    accessibilityID: "healthInsurancePremiums"
                )
                if model.inputs.filingStatus != .marriedSeparately {
                    CurrencyField(
                        title: "Student Loan Interest",
                        value: $model.inputs.studentLoanInterest,
                        caption: "Deduction up to \(formatMoney(data.studentLoanInterestLimit)), phased out at higher incomes",
                        accessibilityID: "studentLoanInterest"
                    )
                }
                CurrencyField(
                    title: "Educator Expenses",
                    value: $model.inputs.educatorExpenses,
                    caption: "Up to \(formatMoney(data.educatorExpensesLimit)) for K–12 teachers",
                    accessibilityID: "educatorExpenses"
                )
            }

            Section {
                let separate = model.inputs.filingStatus == .marriedSeparately
                CurrencyField(
                    title: "Tips",
                    value: $model.inputs.qualifiedTips,
                    caption: separate ? "Not deductible when married filing separately" : "From a tipped job, included in income above. Up to $25,000",
                    accessibilityID: "qualifiedTips"
                )
                CurrencyField(
                    title: "Overtime premium",
                    value: $model.inputs.qualifiedOvertime,
                    caption: separate ? "Not deductible when married filing separately"
                        : "Just the extra half of time-and-a-half. Up to \(formatMoney(model.isJoint ? data.overtimeDeduction.max.joint : data.overtimeDeduction.max.other))",
                    accessibilityID: "qualifiedOvertime"
                )
                CurrencyField(
                    title: "Car loan interest",
                    value: $model.inputs.carLoanInterest,
                    caption: "New, US-assembled vehicle, loan after 2024. Up to $10,000",
                    accessibilityID: "carLoanInterest"
                )
                CurrencyField(
                    title: "Cash donations to charity",
                    value: $model.inputs.charitableDonations,
                    caption: data.charitableDeduction.other > 0
                        ? "Up to \(formatMoney(model.isJoint ? data.charitableDeduction.joint : data.charitableDeduction.other)) without itemizing"
                        : "Starts in 2026",
                    accessibilityID: "charitableDonations"
                )
            } header: {
                Text("Tips, Overtime & Car Loan")
            } footer: {
                Text("Federal deductions for 2025–2028 that phase out at higher incomes\(model.inputs.state == .CA ? ". California doesn't allow them." : ".")")
            }

            Section {
                Button("Reset All Fields", role: .destructive) { model.reset() }
            } footer: {
                Text("Estimates federal\(model.inputs.state == .CA ? " and California" : "") income tax and payroll tax, using IRS\(model.inputs.state == .CA ? " and FTB" : "") figures for \(String(year.rawValue)). Not tax advice.")
            }
        }
        .scrollDismissesKeyboard(.interactively)
    }
}
