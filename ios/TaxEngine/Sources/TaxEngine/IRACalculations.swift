// Port of lib/ira-calculations.ts
import Foundation

public struct IRADeductionInfo: Codable, Sendable, Equatable {
    public let deductibleAmount: Double
    public let isFullyDeductible: Bool
    public let isPartiallyDeductible: Bool
    public let isNonDeductible: Bool
    public let maxContribution: Double

    static func full(_ amount: Double, max: Double) -> IRADeductionInfo {
        IRADeductionInfo(deductibleAmount: amount, isFullyDeductible: true, isPartiallyDeductible: false,
                         isNonDeductible: false, maxContribution: max)
    }

    static func none(max: Double) -> IRADeductionInfo {
        IRADeductionInfo(deductibleAmount: 0, isFullyDeductible: false, isPartiallyDeductible: false,
                         isNonDeductible: true, maxContribution: max)
    }
}

public struct RothEligibility: Codable, Sendable, Equatable {
    public let isEligible: Bool
    public let maxContribution: Double
    public let phaseOutPercentage: Double
    public let allowedContribution: Double?
}

public struct IRAContributionRecommendations: Codable, Sendable, Equatable {
    public let recommendedTrad: Double
    public let recommendedRoth: Double
    public let remainingSpace: Double
    public let globalLimit: Double
    public let tradDeductibleLimit: Double
    public let rothEligible: Bool
    public let rothPhaseOutPercentage: Double
}

/// Traditional IRA deductible amount based on MAGI and workplace-plan coverage.
public func calculateTraditionalIRADeductible(
    magi: Double,
    filingStatus: FilingStatus,
    isCoveredByEmployerPlan: Bool,
    isSpouseCoveredByEmployerPlan: Bool,
    iraContribution: Double,
    year: TaxYear,
    isEligibleForCatchUp: Bool = false
) -> IRADeductionInfo {
    let data = getTaxYearData(year)
    let maxContribution = isEligibleForCatchUp ? data.iraLimit.max : data.iraLimit.standard
    let limits = data.traditionalIraDeductionLimits
    let fullAmount = Swift.min(iraContribution, maxContribution)

    let limitSet: IRALimitSet
    var useFull = true
    switch (filingStatus, isCoveredByEmployerPlan, isSpouseCoveredByEmployerPlan) {
    case (.marriedJointly, true, _):
        limitSet = limits.marriedBothCovered
    case (.marriedJointly, false, true):
        limitSet = limits.marriedOneCovered
    case (.single, true, _):
        limitSet = limits.singleCovered
    case (.headOfHousehold, true, _):
        limitSet = limits.headOfHouseholdCovered
    case (.marriedSeparately, true, _):
        limitSet = limits.marriedSeparateCovered
        useFull = false
    default:
        // Nobody on the return is covered by a workplace plan
        return .full(fullAmount, max: maxContribution)
    }

    // `full || phaseOutStart` in TS: 0 or nil falls back to phaseOutStart
    let lowerLimit: Double
    if useFull, let full = limitSet.full, full != 0 {
        lowerLimit = full
    } else {
        lowerLimit = limitSet.phaseOutStart
    }
    let upperLimit = limitSet.phaseOutEnd
    let phaseOutRange = upperLimit - lowerLimit

    if magi <= lowerLimit { return .full(fullAmount, max: maxContribution) }
    if magi >= upperLimit { return .none(max: maxContribution) }

    let ratio = (upperLimit - magi) / phaseOutRange
    var amount = ratio * maxContribution

    // IRS rounding rule: round up to the nearest $10
    if amount.truncatingRemainder(dividingBy: 10) != 0 {
        amount = (amount / 10).rounded(.up) * 10
    }
    // IRS minimum: $200 if above zero
    if amount > 0 && amount < 200 { amount = 200 }

    amount = Swift.max(0, Swift.min(amount, iraContribution, maxContribution))

    return IRADeductionInfo(deductibleAmount: amount, isFullyDeductible: false, isPartiallyDeductible: true,
                            isNonDeductible: false, maxContribution: maxContribution)
}

public func checkRothIRAEligibility(
    magi: Double,
    filingStatus: FilingStatus,
    year: TaxYear,
    isEligibleForCatchUp: Bool = false
) -> RothEligibility {
    let data = getTaxYearData(year)
    let maxContribution = isEligibleForCatchUp ? data.iraLimit.max : data.iraLimit.standard
    let limitSet = data.rothIraLimits[filingStatus]

    if magi < limitSet.phaseOutStart {
        return RothEligibility(isEligible: true, maxContribution: maxContribution, phaseOutPercentage: 100, allowedContribution: nil)
    }
    if magi >= limitSet.phaseOutEnd {
        return RothEligibility(isEligible: false, maxContribution: maxContribution, phaseOutPercentage: 0, allowedContribution: nil)
    }

    let range = limitSet.phaseOutEnd - limitSet.phaseOutStart
    let over = magi - limitSet.phaseOutStart
    let percentage = Swift.max(0, 100 - (over / range * 100))
    // IRS worksheet (Pub 590-A): round the reduced limit up to the next $10,
    // and allow at least $200 while any contribution is allowed
    var allowed = Swift.max(0, maxContribution * (percentage / 100))
    if allowed.truncatingRemainder(dividingBy: 10) != 0 { allowed = (allowed / 10).rounded(.up) * 10 }
    if allowed > 0 && allowed < 200 { allowed = 200 }
    allowed = Swift.min(allowed, maxContribution)
    return RothEligibility(isEligible: true, maxContribution: maxContribution, phaseOutPercentage: percentage, allowedContribution: allowed)
}

/// Traditional vs Roth split for this year's IRA space.
public func calculateIRAContributionRecommendations(
    magi: Double,
    filingStatus: FilingStatus,
    isCoveredByEmployerPlan: Bool,
    isSpouseCoveredByEmployerPlan: Bool,
    year: TaxYear,
    isEligibleForCatchUp: Bool,
    iraContribution: Double = 0
) -> IRAContributionRecommendations {
    let data = getTaxYearData(year)
    let globalLimit = isEligibleForCatchUp ? data.iraLimit.max : data.iraLimit.standard

    let trad = calculateTraditionalIRADeductible(
        magi: magi,
        filingStatus: filingStatus,
        isCoveredByEmployerPlan: isCoveredByEmployerPlan,
        isSpouseCoveredByEmployerPlan: isSpouseCoveredByEmployerPlan,
        iraContribution: globalLimit,
        year: year,
        isEligibleForCatchUp: isEligibleForCatchUp
    )

    let tradDeductibleLimit = trad.deductibleAmount
    let recommendedTrad = Swift.min(tradDeductibleLimit, globalLimit)
    let remainingSpace = Swift.max(0, globalLimit - recommendedTrad)

    let roth = checkRothIRAEligibility(magi: magi, filingStatus: filingStatus, year: year, isEligibleForCatchUp: isEligibleForCatchUp)
    let rothLimits = data.rothIraLimits[filingStatus]

    let recommendedRoth: Double
    if magi < rothLimits.phaseOutStart {
        recommendedRoth = Swift.min(remainingSpace, roth.maxContribution)
    } else if magi >= rothLimits.phaseOutEnd {
        recommendedRoth = 0
    } else {
        recommendedRoth = Swift.min(remainingSpace, roth.allowedContribution ?? 0)
    }

    return IRAContributionRecommendations(
        recommendedTrad: recommendedTrad,
        recommendedRoth: recommendedRoth,
        remainingSpace: remainingSpace,
        globalLimit: globalLimit,
        tradDeductibleLimit: tradDeductibleLimit,
        rothEligible: roth.isEligible,
        rothPhaseOutPercentage: roth.phaseOutPercentage
    )
}
