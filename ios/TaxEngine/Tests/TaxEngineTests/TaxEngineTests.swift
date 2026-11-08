import XCTest
@testable import TaxEngine

/// Cases shared with the TypeScript engine: fixtures/tax-cases.json at the repo root
/// (run there with `npm test`).
private struct Fixture: Decodable {
    struct Case: Decodable {
        let name: String
        let inputs: TaxInputs
        let expected: [String: Double]
    }
    struct RothCase: Decodable {
        let name: String
        let magi: Double
        let filingStatus: FilingStatus
        let year: TaxYear
        let isEligibleForCatchUp: Bool
        let expectedAllowed: Double
        let expectedEligible: Bool
    }
    let cases: [Case]
    let rothCases: [RothCase]
}

final class SharedFixtureTests: XCTestCase {
    private func loadFixture() throws -> Fixture {
        // ios/TaxEngine/Tests/TaxEngineTests/<this file> → repo root
        let repoRoot = URL(fileURLWithPath: #filePath)
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent().deletingLastPathComponent()
            .deletingLastPathComponent()
        let url = repoRoot.appendingPathComponent("fixtures/tax-cases.json")
        return try JSONDecoder().decode(Fixture.self, from: Data(contentsOf: url))
    }

    func testSharedFixtureCases() throws {
        let fixture = try loadFixture()
        XCTAssertGreaterThanOrEqual(fixture.cases.count, 10)

        for c in fixture.cases {
            let result = calculateTax(c.inputs)
            let encoded = try JSONSerialization.jsonObject(with: JSONEncoder().encode(result)) as! [String: Any]

            for (key, expected) in c.expected {
                guard let actual = (encoded[key] as? NSNumber)?.doubleValue else {
                    XCTFail("\(c.name): result has no numeric field \(key)")
                    continue
                }
                XCTAssertEqual(actual, expected, accuracy: 0.005, "\(c.name): \(key)")
            }

            let breakdown = calculateTaxBracketBreakdown(
                taxableIncome: result.taxableIncome,
                filingStatus: c.inputs.filingStatus,
                year: c.inputs.year
            )
            let sum = breakdown.reduce(0) { $0 + $1.taxInBracket }
            XCTAssertEqual(sum, result.taxBeforeCredits, accuracy: 0.01, "\(c.name): bracket breakdown sum")
        }
    }

    func testSharedRothCases() throws {
        let fixture = try loadFixture()
        XCTAssertFalse(fixture.rothCases.isEmpty)
        for c in fixture.rothCases {
            let r = checkRothIRAEligibility(magi: c.magi, filingStatus: c.filingStatus, year: c.year, isEligibleForCatchUp: c.isEligibleForCatchUp)
            let allowed = r.isEligible ? (r.allowedContribution ?? r.maxContribution) : 0
            XCTAssertEqual(r.isEligible, c.expectedEligible, c.name)
            XCTAssertEqual(allowed, c.expectedAllowed, accuracy: 0.005, c.name)
        }
    }
}

final class TaxEngineTests: XCTestCase {
    private func inputs(_ configure: (inout TaxInputs) -> Void) -> TaxInputs {
        var i = TaxInputs()
        i.year = .y2025 // these unit tests use the 2025 figures; configure may override
        configure(&i)
        return i
    }

    func testSingle100k2025() {
        let r = calculateTax(inputs { $0.grossIncome = 100_000 })
        XCTAssertEqual(r.taxObligation, 13_449, accuracy: 0.005)
        XCTAssertEqual(r.bracketInfo.rateName, "22%")
        XCTAssertEqual(r.payrollTax, 7_650, accuracy: 0.005)
        XCTAssertEqual(r.takeHomePay, 78_901, accuracy: 0.005) // 100,000 − 13,449 − 7,650
    }

    func testFractionalTaxableIncome() {
        let bracket = findTaxBracket(taxableIncome: 11_925.50, filingStatus: .single, year: .y2025)
        XCTAssertEqual(bracket.rate, 0.12)
        XCTAssertEqual(bracket.tax(on: 11_925.50), 1_192.56, accuracy: 0.005)
    }

    func testMarriedJoint2026TwoChildren() {
        let i = inputs {
            $0.year = .y2026
            $0.filingStatus = .marriedJointly
            $0.grossIncome = 150_000
            $0.numChildren = 2
        }
        XCTAssertEqual(calculateTax(i).taxObligation, 10_940, accuracy: 0.005)
    }

    func testChildCreditPhaseOut() {
        let r = calculateTax(inputs { $0.grossIncome = 215_750; $0.numChildren = 1 })
        XCTAssertEqual(r.dependentCredit, 1_400, accuracy: 0.005)
    }

    func testSenior65Plus() {
        XCTAssertEqual(calculateTax(inputs { $0.grossIncome = 85_000; $0.isAge65Plus = true }).taxObligation, 8_521, accuracy: 0.005)
        let joint = inputs {
            $0.year = .y2026
            $0.filingStatus = .marriedJointly
            $0.grossIncome = 100_000
            $0.isAge65Plus = true
            $0.isSpouseAge65Plus = true
        }
        XCTAssertEqual(calculateTax(joint).taxObligation, 5_804, accuracy: 0.005)
    }

    func testStudentLoanPhaseOut() {
        let r = calculateTax(inputs { $0.grossIncome = 92_500; $0.studentLoanInterest = 3_000 })
        XCTAssertEqual(r.taxObligation, 11_524, accuracy: 0.005)
        XCTAssertEqual(r.studentLoanDeduction, 1_250, accuracy: 0.005)
    }

    func testSpouse401k() {
        let r = calculateTax(inputs {
            $0.filingStatus = .marriedJointly
            $0.grossIncome = 150_000
            $0.spouseRetirementContributions = 10_000
        })
        XCTAssertEqual(r.taxObligation, 13_698, accuracy: 0.005)
    }

    func testIRADeductibility() {
        let nonDeductible = calculateTax(inputs { $0.grossIncome = 100_000; $0.iraContributions = 7_000; $0.isNonDeductibleIRA = true })
        XCTAssertEqual(nonDeductible.taxObligation, 13_449, accuracy: 0.005)
        let deductible = calculateTax(inputs { $0.grossIncome = 100_000; $0.iraContributions = 7_000 })
        XCTAssertEqual(deductible.taxObligation, 11_909, accuracy: 0.005)
    }

    func testIRAPartialDeductionRoundsUpToTen() {
        // Covered single filer halfway through the 2025 $79k–$89k phase-out: 7,000 × 0.5 = 3,500
        let info = calculateTraditionalIRADeductible(
            magi: 84_000, filingStatus: .single, isCoveredByEmployerPlan: true,
            isSpouseCoveredByEmployerPlan: false, iraContribution: 7_000, year: .y2025
        )
        XCTAssertTrue(info.isPartiallyDeductible)
        XCTAssertEqual(info.deductibleAmount, 3_500)

        let rounded = calculateTraditionalIRADeductible(
            magi: 84_001, filingStatus: .single, isCoveredByEmployerPlan: true,
            isSpouseCoveredByEmployerPlan: false, iraContribution: 7_000, year: .y2025
        )
        XCTAssertEqual(rounded.deductibleAmount, 3_500) // 3,499.30 → 3,500
    }

    func testIRARecommendationsSplitTradAndRoth() {
        let rec = calculateIRAContributionRecommendations(
            magi: 84_000, filingStatus: .single, isCoveredByEmployerPlan: true,
            isSpouseCoveredByEmployerPlan: false, year: .y2025, isEligibleForCatchUp: false
        )
        XCTAssertEqual(rec.recommendedTrad, 3_500)
        XCTAssertEqual(rec.recommendedRoth, 3_500)
        XCTAssertTrue(rec.rothEligible)
    }

    func testBracketBreakdownSumsToTotalTax() {
        for year in TaxYear.allCases {
            for status in FilingStatus.allCases {
                for income in stride(from: 0.0, through: 1_000_000, by: 12_345.67) {
                    let r = calculateTax(inputs { $0.year = year; $0.filingStatus = status; $0.grossIncome = income })
                    let sum = calculateTaxBracketBreakdown(taxableIncome: r.taxableIncome, filingStatus: status, year: year)
                        .reduce(0) { $0 + $1.taxInBracket }
                    XCTAssertEqual(sum, r.taxBeforeCredits, accuracy: 0.01, "\(year) \(status) \(income)")
                }
            }
        }
    }

    func testSavingsTipsRecomputeTheReturn() {
        let r = calculateTax(inputs { $0.grossIncome = 100_000 })
        XCTAssertEqual(r.potentialSavings401k?.taxSavings ?? 0, 220, accuracy: 0.005)
        XCTAssertEqual(r.maxAdditional401k, 23_500)
    }

    func testRefundableChildCreditReducesNetTax() {
        let r = calculateTax(inputs {
            $0.year = .y2026
            $0.filingStatus = .headOfHousehold
            $0.grossIncome = 30_000
            $0.numChildren = 2
        })
        XCTAssertEqual(r.taxObligation, 0, accuracy: 0.005)
        XCTAssertEqual(r.refundableChildCredit, 3_400, accuracy: 0.005)
        XCTAssertEqual(r.netIncomeTax, -3_400, accuracy: 0.005)
        XCTAssertLessThan(r.effectiveRate, 0)
    }

    func testPayrollTaxOnlyForJointSpouseWages() {
        // spouseWages is ignored unless filing jointly
        let single = calculatePayrollTax(inputs { $0.year = .y2026; $0.grossIncome = 300_000; $0.spouseWages = 150_000 })
        XCTAssertEqual(single.socialSecurityTax, 11_439, accuracy: 0.005)
    }

    func testDefaultsTo2026() {
        XCTAssertEqual(TaxInputs().year, .y2026)
        XCTAssertEqual(getCurrentTaxYear(), .y2026)
    }

    func testBracketTablesAreConsistent() {
        for year in TaxYear.allCases {
            for status in FilingStatus.allCases {
                var taxBelow = 0.0
                var previousMax = 0.0
                for (i, b) in getTaxYearData(year).brackets[status].enumerated() {
                    XCTAssertEqual(b.base, taxBelow, accuracy: 0.001, "\(year) \(status) bracket \(i)")
                    if b.max.isFinite { taxBelow += (b.max - previousMax) * b.rate }
                    previousMax = b.max
                }
            }
        }
    }

    func testFormatting() {
        XCTAssertEqual(formatMoney(13_449.4), "$13,449")
        XCTAssertEqual(formatMoney(2.5), "$3")
        XCTAssertEqual(formatCurrency(1_192.56), "$1,192.56")
        XCTAssertEqual(formatPercentage(13.449), "13.4%")
    }
}
