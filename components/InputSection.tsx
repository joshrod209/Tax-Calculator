'use client'

import { useState, useMemo } from 'react'
import { Wallet, TrendingDown, GraduationCap, BookOpen, Heart, GraduationCap as GradCap } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { useTaxCalculator } from '@/hooks/useTaxCalculator'
import { getTaxYearData, calculateMAGI, formatMoney } from '@/lib/utils'
import { calculateTraditionalIRADeductible, checkRothIRAEligibility } from '@/lib/ira-calculations'
import IRAWarningModal from './IRAWarningModal'
import CollapsibleSection from './CollapsibleSection'
import HelpTooltip from './HelpTooltip'

interface InputSectionProps {
  calculator: ReturnType<typeof useTaxCalculator>
}

export default function InputSection({ calculator }: InputSectionProps) {
  const { inputs, updateInput, availableYears } = calculator
  const yearData = getTaxYearData(inputs.year)
  const isEligibleForCatchUp = inputs.isAge50Plus || inputs.isAge65Plus
  const isSpouseEligibleForCatchUp = inputs.isSpouseAge50Plus || inputs.isSpouseAge65Plus
  
  const retirementLimit = isEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard
  const iraLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard
  const spouseRetirementLimit = isSpouseEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard
  const spouseIraLimit = isSpouseEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard

  // Modal state
  const [showPrimaryIRAWarning, setShowPrimaryIRAWarning] = useState(false)
  const [showSpouseIRAWarning, setShowSpouseIRAWarning] = useState(false)

  // Calculate current MAGI for eligibility checks
  const currentMAGI = useMemo(() => {
    return calculateMAGI(
      inputs.grossIncome,
      inputs.retirementContributions,
      inputs.spouseRetirementContributions,
      inputs.hsaContributions,
      inputs.healthInsurancePremiums,
      inputs.fsaContributions,
      inputs.studentLoanInterest,
      inputs.educatorExpenses
    )
  }, [
    inputs.grossIncome,
    inputs.retirementContributions,
    inputs.spouseRetirementContributions,
    inputs.hsaContributions,
    inputs.healthInsurancePremiums,
    inputs.fsaContributions,
    inputs.studentLoanInterest,
    inputs.educatorExpenses
  ])

  // Check primary IRA eligibility
  const primaryIRAEligibility = useMemo(() => {
    if (!inputs.filingStatus) return null
    
    const deductionInfo = calculateTraditionalIRADeductible(
      currentMAGI,
      inputs.filingStatus,
      inputs.isCoveredByEmployerPlan,
      inputs.isSpouseCoveredByEmployerPlan,
      0, // Check with $0 contribution
      inputs.year,
      isEligibleForCatchUp
    )
    
    const rothEligibility = checkRothIRAEligibility(
      currentMAGI,
      inputs.filingStatus,
      inputs.year,
      isEligibleForCatchUp
    )

    return {
      deductionInfo,
      rothEligible: rothEligibility.isEligible
    }
  }, [currentMAGI, inputs.filingStatus, inputs.isCoveredByEmployerPlan, inputs.isSpouseCoveredByEmployerPlan, inputs.year, isEligibleForCatchUp])

  // Check spouse IRA eligibility (for married filing jointly)
  // IRS rules: Each spouse has individual limits based on their own coverage
  // - If spouse is covered: uses $126k-$146k range (marriedBothCovered)
  // - If spouse is NOT covered but primary IS: uses $236k-$246k range (marriedOneCovered)
  // - If neither is covered: fully deductible (no limits)
  const spouseIRAEligibility = useMemo(() => {
    if (inputs.filingStatus !== 'marriedJointly') return null
    
    // To check spouse eligibility, we need to swap the perspective:
    // Pass spouse coverage as the "primary" coverage to get spouse's limits
    // If spouse is covered: pass isCoveredByEmployerPlan=true → uses marriedBothCovered
    // If spouse is NOT covered but primary IS: pass isCoveredByEmployerPlan=false, isSpouseCoveredByEmployerPlan=true → uses marriedOneCovered
    // If neither covered: both false → fully deductible
    
    const deductionInfo = calculateTraditionalIRADeductible(
      currentMAGI,
      inputs.filingStatus,
      inputs.isSpouseCoveredByEmployerPlan, // Treat spouse as "primary" for this check
      inputs.isCoveredByEmployerPlan, // Treat primary as "spouse" for this check
      0, // Check with $0 contribution
      inputs.year,
      isSpouseEligibleForCatchUp
    )
    
    const rothEligibility = checkRothIRAEligibility(
      currentMAGI,
      inputs.filingStatus,
      inputs.year,
      isSpouseEligibleForCatchUp
    )

    return {
      deductionInfo,
      rothEligible: rothEligibility.isEligible
    }
  }, [currentMAGI, inputs.filingStatus, inputs.isCoveredByEmployerPlan, inputs.isSpouseCoveredByEmployerPlan, inputs.year, isSpouseEligibleForCatchUp, inputs.isSpouseAge50Plus, inputs.isSpouseAge65Plus])

  // Handle primary IRA input focus
  const handlePrimaryIRAFocus = () => {
    // Don't show if:
    // 1. Non-deductible checkbox is already checked (user already knows)
    // 2. Not fully non-deductible (partial phase-out - show different message)
    // 3. No filing status selected
    // 4. No eligibility calculated
    if (
      inputs.isNonDeductibleIRA ||
      !primaryIRAEligibility ||
      !inputs.filingStatus ||
      primaryIRAEligibility.deductionInfo.isPartiallyDeductible ||
      !primaryIRAEligibility.deductionInfo.isNonDeductible
    ) {
      return
    }
    
    setShowPrimaryIRAWarning(true)
  }

  // Handle spouse IRA input focus
  const handleSpouseIRAFocus = () => {
    // Don't show if:
    // 1. Non-deductible checkbox is already checked (user already knows)
    // 2. Not fully non-deductible (partial phase-out - show different message)
    // 3. Not married filing jointly
    // 4. No spouse eligibility calculated
    if (
      inputs.isSpouseNonDeductibleIRA ||
      !spouseIRAEligibility ||
      inputs.filingStatus !== 'marriedJointly' ||
      spouseIRAEligibility.deductionInfo.isPartiallyDeductible ||
      !spouseIRAEligibility.deductionInfo.isNonDeductible
    ) {
      return
    }
    
    setShowSpouseIRAWarning(true)
  }

  // Handle modal actions
  const handleClearPrimaryInput = () => {
    updateInput('iraContributions', 0)
    setShowPrimaryIRAWarning(false)
  }

  const handleClearSpouseInput = () => {
    updateInput('spouseIraContributions', 0)
    setShowSpouseIRAWarning(false)
  }

  // Handle "Continue Anyway" - mark as non-deductible and close
  const handleContinuePrimary = () => {
    // When user clicks "Enter Non-Deductible Contribution", 
    // automatically check the non-deductible checkbox
    updateInput('isNonDeductibleIRA', true)
    setShowPrimaryIRAWarning(false)
  }

  const handleContinueSpouse = () => {
    // When user clicks "Enter Non-Deductible Contribution", 
    // automatically check the non-deductible checkbox
    updateInput('isSpouseNonDeductibleIRA', true)
    setShowSpouseIRAWarning(false)
  }

  return (
    <div className="space-y-6">
      {/* Income & Status Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <Wallet className="w-4 h-4" /> Income & Status
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Tax Year</label>
            <div className="relative">
              <select 
                value={inputs.year}
                onChange={(e) => updateInput('year', parseInt(e.target.value) as any)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-lg font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Filing Status</label>
            <div className="relative">
              <select 
                value={inputs.filingStatus}
                onChange={(e) => updateInput('filingStatus', e.target.value as any)}
                aria-label="Filing Status"
                aria-required="true"
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-lg font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="">Select filing status</option>
                <option value="single">Single</option>
                <option value="headOfHousehold">Head of Household</option>
                <option value="marriedJointly">Married Filing Jointly</option>
                <option value="marriedSeparately">Married Filing Separately</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <label className="block text-sm font-semibold text-slate-600">Gross Annual Income</label>
              <HelpTooltip content="Your total annual income before any deductions. This is your starting point for tax calculations." />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.grossIncome || ''}
                onChange={(e) => updateInput('grossIncome', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                aria-label="Gross Annual Income"
                aria-required="true"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xl font-bold rounded-xl pl-8 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={inputs.isAge50Plus}
                onChange={(e) => updateInput('isAge50Plus', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-600">Age 50 or older (catch-up contributions eligible)</span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-1">Enables higher 401(k) and IRA contribution limits</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={inputs.isAge65Plus}
                onChange={(e) => updateInput('isAge65Plus', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-600">Age 65 or older</span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-1">Additional standard deduction</p>
          </div>

          {/* Spouse Age Checkboxes - Show for any filing status that includes a spouse */}
          {(inputs.filingStatus === 'marriedJointly' || inputs.filingStatus === 'marriedSeparately') && (
            <>
              <div className="col-span-1 md:col-span-2 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Spouse Information</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={inputs.isSpouseAge50Plus}
                    onChange={(e) => updateInput('isSpouseAge50Plus', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-600">Spouse age 50 or older (catch-up contributions eligible)</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-1">Enables higher 401(k) and IRA contribution limits for spouse</p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={inputs.isSpouseAge65Plus}
                    onChange={(e) => updateInput('isSpouseAge65Plus', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-600">Spouse age 65 or older</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-1">Additional standard deduction for spouse</p>
              </div>
            </>
          )}

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Number of Dependents</label>
            <input 
              type="number" 
              value={inputs.numDependents || ''}
              onChange={(e) => updateInput('numDependents', parseInt(e.target.value) || 0)}
              placeholder="0" 
              min="0"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1 ml-1">Each dependent reduces tax by $2,000 (2025)</p>
          </div>
        </div>
      </section>

      {/* Pre-Tax Contributions Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <TrendingDown className="w-4 h-4" /> Pre-Tax Contributions
        </div>

        <div className="space-y-6">
          {/* Employer Plan Coverage - Important context for IRA eligibility */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3">Employer Retirement Plan Coverage</p>
            <p className="text-xs text-slate-500 mb-3">This affects Traditional IRA deduction eligibility</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={inputs.isCoveredByEmployerPlan}
                  onChange={(e) => updateInput('isCoveredByEmployerPlan', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">You are covered by an employer retirement plan</span>
              </label>
              {inputs.filingStatus === 'marriedJointly' && (
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={inputs.isSpouseCoveredByEmployerPlan}
                    onChange={(e) => updateInput('isSpouseCoveredByEmployerPlan', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Spouse is covered by an employer retirement plan</span>
                </label>
              )}
            </div>
          </div>

          {/* 401(k) / 403(b) Section */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-slate-700">401(k) / 403(b) Contributions</label>
                  <HelpTooltip content="Pre-tax contributions to employer-sponsored retirement plans. These reduce your taxable income dollar-for-dollar." />
                </div>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                  Max {formatMoney(retirementLimit)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input 
                  type="number" 
                  value={inputs.retirementContributions || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    updateInput('retirementContributions', Math.min(value, retirementLimit))
                  }}
                  placeholder="0" 
                  min="0"
                  max={retirementLimit}
                  className={`w-full bg-slate-50 border ${
                    inputs.retirementContributions > retirementLimit ? 'border-red-300' : 
                    inputs.retirementContributions > 0 && inputs.retirementContributions <= retirementLimit ? 'border-green-300' : 
                    'border-slate-200'
                  } text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                />
              </div>
              {inputs.retirementContributions > retirementLimit && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠</span> Exceeds maximum limit of {formatMoney(retirementLimit)}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                {inputs.year} limit: {formatMoney(yearData.retirementLimit.standard)} standard • {formatMoney(yearData.retirementLimit.max)} with catch-up (age 50+)
              </p>
            </div>

            {/* Spouse 401(k) / 403(b) - Only show when spouse is covered by employer plan */}
            {inputs.filingStatus === 'marriedJointly' && inputs.isSpouseCoveredByEmployerPlan && (
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-700">Spouse 401(k) / 403(b) Contributions</label>
                    <HelpTooltip content="Spouse's pre-tax contributions to employer-sponsored retirement plans. Each spouse has individual contribution limits." />
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-full">
                    Max {formatMoney(spouseRetirementLimit)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.spouseRetirementContributions || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('spouseRetirementContributions', Math.min(value, spouseRetirementLimit))
                    }}
                    placeholder="0" 
                    min="0"
                    max={spouseRetirementLimit}
                    className={`w-full bg-slate-50 border ${
                      inputs.spouseRetirementContributions > spouseRetirementLimit ? 'border-red-300' : 
                      inputs.spouseRetirementContributions > 0 && inputs.spouseRetirementContributions <= spouseRetirementLimit ? 'border-green-300' : 
                      'border-slate-200'
                    } text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                  />
                </div>
                {inputs.spouseRetirementContributions > spouseRetirementLimit && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <span>⚠</span> Exceeds maximum limit of {formatMoney(spouseRetirementLimit)}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  {inputs.year} limit: {formatMoney(yearData.retirementLimit.standard)} standard • {formatMoney(yearData.retirementLimit.max)} with catch-up (spouse age 50+)
                </p>
              </div>
            )}
          </div>

          {/* Traditional IRA Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Traditional IRA Contributions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Your IRA */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-600">Your IRA</label>
                    <HelpTooltip content="Traditional IRA contributions. Deductibility depends on your income (MAGI) and whether you're covered by an employer retirement plan." />
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    Max {formatMoney(iraLimit)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.iraContributions || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('iraContributions', Math.min(value, iraLimit))
                    }}
                    onFocus={handlePrimaryIRAFocus}
                    placeholder="0" 
                    min="0"
                    max={iraLimit}
                    className={`w-full bg-slate-50 border ${
                      inputs.iraContributions > iraLimit ? 'border-red-300' : 
                      inputs.iraContributions > 0 && inputs.iraContributions <= iraLimit ? 'border-green-300' : 
                      'border-slate-200'
                    } text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                  />
                </div>
                {inputs.iraContributions > iraLimit && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> Exceeds maximum limit of {formatMoney(iraLimit)}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {inputs.year} limit: {formatMoney(yearData.iraLimit.standard)} standard • {formatMoney(yearData.iraLimit.max)} catch-up
                </p>
                {inputs.iraContributions > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={inputs.isNonDeductibleIRA}
                        onChange={(e) => updateInput('isNonDeductibleIRA', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">Non-deductible contribution</span>
                        <p className="text-xs text-slate-500 mt-0.5">Useful for Backdoor Roth strategy</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Spouse IRA */}
              {inputs.filingStatus === 'marriedJointly' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-slate-600">Spouse IRA</label>
                      <HelpTooltip content="Spouse's Traditional IRA contributions. Each spouse has individual contribution limits and deduction eligibility." />
                    </div>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                      Max {formatMoney(spouseIraLimit)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input 
                      type="number" 
                      value={inputs.spouseIraContributions || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('spouseIraContributions', Math.min(value, spouseIraLimit))
                    }}
                    onFocus={handleSpouseIRAFocus}
                    placeholder="0" 
                    min="0"
                    max={spouseIraLimit}
                    className={`w-full bg-slate-50 border ${
                      inputs.spouseIraContributions > spouseIraLimit ? 'border-red-300' : 
                      inputs.spouseIraContributions > 0 && inputs.spouseIraContributions <= spouseIraLimit ? 'border-green-300' : 
                      'border-slate-200'
                    } text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                  />
                </div>
                {inputs.spouseIraContributions > spouseIraLimit && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span>⚠</span> Exceeds maximum limit of {formatMoney(spouseIraLimit)}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {inputs.year} limit: {formatMoney(yearData.iraLimit.standard)} standard • {formatMoney(yearData.iraLimit.max)} catch-up (spouse age 50+)
                </p>
                  {inputs.spouseIraContributions > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <label className="flex items-start gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={inputs.isSpouseNonDeductibleIRA}
                          onChange={(e) => updateInput('isSpouseNonDeductibleIRA', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">Non-deductible contribution</span>
                          <p className="text-xs text-slate-500 mt-0.5">Useful for Backdoor Roth strategy</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Deductions - Collapsible */}
          <CollapsibleSection
            title="Additional Deductions"
            icon={<TrendingDown className="w-4 h-4 text-slate-500" />}
            defaultOpen={inputs.hsaCoverageType !== 'none' || inputs.fsaContributions > 0 || inputs.healthInsurancePremiums > 0 || inputs.studentLoanInterest > 0 || inputs.educatorExpenses > 0}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-slate-600">HSA Coverage Type</label>
                  <HelpTooltip content="Health Savings Account coverage type. Self-only covers one person, Family covers you and dependents." />
                </div>
                <div className="relative">
                  <select 
                    value={inputs.hsaCoverageType}
                    onChange={(e) => updateInput('hsaCoverageType', e.target.value as any)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="none">No HSA</option>
                    <option value="selfOnly">Self-Only</option>
                    <option value="family">Family</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {inputs.hsaCoverageType !== 'none' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-slate-600">HSA Contributions</label>
                    <HelpTooltip content={`Maximum HSA contribution for ${inputs.year}: ${inputs.hsaCoverageType === 'selfOnly' ? formatMoney(yearData.hsaLimit.selfOnly) : formatMoney(yearData.hsaLimit.family)}`} />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                    <input 
                      type="number" 
                      value={inputs.hsaContributions || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        const max = inputs.hsaCoverageType === 'selfOnly' ? yearData.hsaLimit.selfOnly : yearData.hsaLimit.family
                        updateInput('hsaContributions', Math.min(value, max))
                      }}
                      placeholder="0" 
                      min="0"
                      max={inputs.hsaCoverageType === 'selfOnly' ? yearData.hsaLimit.selfOnly : yearData.hsaLimit.family}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {inputs.year} limit: {inputs.hsaCoverageType === 'selfOnly' 
                      ? formatMoney(yearData.hsaLimit.selfOnly) 
                      : formatMoney(yearData.hsaLimit.family)}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-slate-600">FSA Contributions</label>
                  <HelpTooltip content="Flexible Spending Account contributions are pre-tax deductions that reduce your taxable income." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.fsaContributions || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('fsaContributions', Math.min(value, yearData.fsaLimit))
                    }}
                    placeholder="0" 
                    min="0"
                    max={yearData.fsaLimit}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{inputs.year} limit: {formatMoney(yearData.fsaLimit)}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-slate-600">Health Insurance Premiums</label>
                  <HelpTooltip content="Pre-tax health insurance premiums paid through your employer that reduce your taxable income." />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.healthInsurancePremiums || ''}
                    onChange={(e) => updateInput('healthInsurancePremiums', parseFloat(e.target.value) || 0)}
                    placeholder="0" 
                    min="0"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Pre-tax health insurance premiums</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-slate-600">Student Loan Interest</label>
                  <HelpTooltip content={`Maximum deductible student loan interest for ${inputs.year}: ${formatMoney(yearData.studentLoanInterestLimit)}`} />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.studentLoanInterest || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('studentLoanInterest', Math.min(value, yearData.studentLoanInterestLimit))
                    }}
                    placeholder="0" 
                    min="0"
                    max={yearData.studentLoanInterestLimit}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{inputs.year} limit: {formatMoney(yearData.studentLoanInterestLimit)}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-semibold text-slate-600">Educator Expenses</label>
                  <HelpTooltip content={`Maximum educator expense deduction for ${inputs.year}: ${formatMoney(yearData.educatorExpensesLimit)}. Available to K-12 educators for classroom supplies.`} />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    value={inputs.educatorExpenses || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      updateInput('educatorExpenses', Math.min(value, yearData.educatorExpensesLimit))
                    }}
                    placeholder="0" 
                    min="0"
                    max={yearData.educatorExpensesLimit}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{inputs.year} limit: {formatMoney(yearData.educatorExpensesLimit)}</p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </section>

      {/* IRA Warning Modals */}
      {primaryIRAEligibility && (
        <IRAWarningModal
          isOpen={showPrimaryIRAWarning}
          onClose={handleContinuePrimary}
          onClearInput={handleClearPrimaryInput}
          isSpouse={false}
          magi={currentMAGI}
          rothEligible={primaryIRAEligibility.rothEligible}
        />
      )}

      {spouseIRAEligibility && inputs.filingStatus === 'marriedJointly' && (
        <IRAWarningModal
          isOpen={showSpouseIRAWarning}
          onClose={handleContinueSpouse}
          onClearInput={handleClearSpouseInput}
          isSpouse={true}
          magi={currentMAGI}
          rothEligible={spouseIRAEligibility.rothEligible}
        />
      )}
    </div>
  )
}
