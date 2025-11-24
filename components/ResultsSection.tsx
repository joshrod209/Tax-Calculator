'use client'

import { PieChart, TrendingUp, Info } from 'lucide-react'
import { useTaxCalculator } from '@/hooks/useTaxCalculator'
import { formatMoney, formatPercentage } from '@/lib/utils'
import { calculateIRAContributionRecommendations } from '@/lib/ira-calculations'

interface ResultsSectionProps {
  calculator: ReturnType<typeof useTaxCalculator>
}

export default function ResultsSection({ calculator }: ResultsSectionProps) {
  const { inputs, results, iraRecommendations, spouseIraRecommendations } = calculator

  if (!results || !inputs.filingStatus) {
    return (
      <div className="sticky top-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-center">Enter your information to see tax calculations</p>
        </div>
      </div>
    )
  }

  const takeHome = results.grossIncome - results.taxObligation - results.totalDeductions

  return (
    <div className="sticky top-8 space-y-6">
      {/* Main Result Card */}
      <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <p className="text-indigo-200 font-medium mb-1">Estimated Take Home Pay</p>
          <h2 className="text-5xl font-bold tracking-tighter mb-6 font-mono">{formatMoney(takeHome)}</h2>

          <div className="grid grid-cols-2 gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div>
              <p className="text-indigo-200 text-xs mb-1">Effective Tax Rate</p>
              <p className="text-xl font-bold text-white">{formatPercentage(results.effectiveRate)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs mb-1">Total Tax Owed</p>
              <p className="text-xl font-bold text-white">{formatMoney(results.taxObligation)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <PieChart className="w-4 h-4" /> Calculation Breakdown
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Gross Income</span>
            <span className="text-slate-900 font-bold">{formatMoney(results.grossIncome)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Standard Deduction</span>
            <span className="text-slate-900 font-bold">-{formatMoney(results.standardDeduction)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-600 font-medium">Pre-Tax Deductions</span>
            <span className="text-slate-900 font-bold">-{formatMoney(results.totalDeductions)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-700 font-semibold">Taxable Income</span>
            <span className="text-slate-900 font-bold text-lg">{formatMoney(results.taxableIncome)}</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600 text-sm">Marginal Tax Bracket</span>
              <span className="text-indigo-600 font-bold">{results.bracketInfo.rateName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Federal Tax</span>
              <span className="text-slate-900 font-bold">{formatMoney(results.taxObligation)}</span>
            </div>
            {results.dependentCredit > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                <span className="text-slate-600 text-sm">Dependent Credit ({inputs.numDependents})</span>
                <span className="text-green-600 font-bold">-{formatMoney(results.dependentCredit)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IRA Eligibility Card */}
      {iraRecommendations && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <Info className="w-4 h-4" /> Traditional IRA Eligibility
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Your Deductible Amount</p>
              <p className="text-lg font-bold text-indigo-600">
                {formatMoney(results.iraDeductionInfo.deductibleAmount)}
              </p>
              {results.iraDeductionInfo.isFullyDeductible && (
                <p className="text-xs text-green-600 mt-1">✓ Fully deductible</p>
              )}
              {results.iraDeductionInfo.isPartiallyDeductible && (
                <p className="text-xs text-yellow-600 mt-1">⚠ Partially deductible</p>
              )}
              {results.iraDeductionInfo.isNonDeductible && (
                <p className="text-xs text-red-600 mt-1">✗ Not deductible</p>
              )}
            </div>

            {iraRecommendations.recommendedTrad > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 mt-4">
                <p className="text-xs font-semibold text-indigo-700 mb-2">Recommended Contribution Strategy</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Put</span>
                    <span className="text-sm font-bold text-indigo-700">{formatMoney(iraRecommendations.recommendedTrad)}</span>
                    <span className="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                  </div>
                  {iraRecommendations.recommendedRoth > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Put</span>
                      <span className="text-sm font-bold text-indigo-700">{formatMoney(iraRecommendations.recommendedRoth)}</span>
                      <span className="text-xs font-semibold text-slate-700">in Roth IRA</span>
                    </div>
                  )}
                </div>
                {results.marginalRate > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs text-slate-600">
                      <strong>Tax Savings:</strong> Contributing <strong className="text-indigo-700">{formatMoney(iraRecommendations.recommendedTrad)}</strong> to Traditional IRA at your current tax rate of <strong className="text-indigo-700">{formatPercentage(results.marginalRate)}</strong> will reduce your tax liability by approximately <strong className="text-indigo-700">{formatMoney(iraRecommendations.recommendedTrad * (results.marginalRate / 100))}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spouse IRA Recommendations */}
      {inputs.filingStatus === 'marriedJointly' && spouseIraRecommendations && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <Info className="w-4 h-4" /> Spouse IRA Recommendations
          </div>
          
          <div className="space-y-3">
            {spouseIraRecommendations.recommendedTrad > 0 && (
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-700 mb-2">Recommended Contribution Strategy</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Put</span>
                    <span className="text-sm font-bold text-purple-700">{formatMoney(spouseIraRecommendations.recommendedTrad)}</span>
                    <span className="text-xs font-semibold text-slate-700">in Traditional IRA</span>
                  </div>
                  {spouseIraRecommendations.recommendedRoth > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Put</span>
                      <span className="text-sm font-bold text-purple-700">{formatMoney(spouseIraRecommendations.recommendedRoth)}</span>
                      <span className="text-xs font-semibold text-slate-700">in Roth IRA</span>
                    </div>
                  )}
                </div>
                {results.marginalRate > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-slate-600">
                      <strong>Tax Savings:</strong> Contributing <strong className="text-purple-700">{formatMoney(spouseIraRecommendations.recommendedTrad)}</strong> to Traditional IRA at your current tax rate of <strong className="text-purple-700">{formatPercentage(results.marginalRate)}</strong> will reduce your tax liability by approximately <strong className="text-purple-700">{formatMoney(spouseIraRecommendations.recommendedTrad * (results.marginalRate / 100))}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Savings Tips */}
      {(results.potentialSavings401k || results.potentialSavingsIRA) && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
            <TrendingUp className="w-4 h-4" /> Tax Bracket & Savings Tips
          </div>
          
          <div className="space-y-3">
            {results.potentialSavings401k && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 mb-1">Increase 401(k) by $1,000</p>
                <p className="text-xs text-slate-600">Save approximately {formatMoney(results.potentialSavings401k.taxSavings)} in taxes</p>
              </div>
            )}
            {results.potentialSavingsIRA && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 mb-1">Increase IRA by $1,000</p>
                <p className="text-xs text-slate-600">Save approximately {formatMoney(results.potentialSavingsIRA.taxSavings)} in taxes</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
