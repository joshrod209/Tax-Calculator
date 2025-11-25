'use client'

import { Wallet, TrendingDown, GraduationCap, BookOpen } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { useTaxCalculator } from '@/hooks/useTaxCalculator'
import { getTaxYearData } from '@/lib/utils'
import { formatMoney } from '@/lib/utils'

interface InputSectionProps {
  calculator: ReturnType<typeof useTaxCalculator>
}

export default function InputSection({ calculator }: InputSectionProps) {
  const { inputs, updateInput, availableYears } = calculator
  const yearData = getTaxYearData(inputs.year)
  const isEligibleForCatchUp = inputs.isAge50Plus || inputs.isAge65Plus
  
  const retirementLimit = isEligibleForCatchUp ? yearData.retirementLimit.max : yearData.retirementLimit.standard
  const iraLimit = isEligibleForCatchUp ? yearData.iraLimit.max : yearData.iraLimit.standard

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
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Gross Annual Income</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.grossIncome || ''}
                onChange={(e) => updateInput('grossIncome', parseFloat(e.target.value) || 0)}
                placeholder="0" 
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
        <div className="flex items-center gap-2 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
          <TrendingDown className="w-4 h-4" /> Pre-Tax Contributions
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between mb-2 ml-1">
              <label className="block text-sm font-semibold text-slate-600">401(k) / 403(b)</label>
              <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                Max {formatMoney(retirementLimit)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.retirementContributions || ''}
                onChange={(e) => updateInput('retirementContributions', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">
              {inputs.year} IRS limit: {formatMoney(yearData.retirementLimit.standard)} standard; {formatMoney(yearData.retirementLimit.max)} with catch-up (age 50+)
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-2 ml-1">
              <label className="block text-sm font-semibold text-slate-600">Traditional IRA (Your)</label>
              <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                Max {formatMoney(iraLimit)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.iraContributions || ''}
                onChange={(e) => updateInput('iraContributions', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">
              {inputs.year} IRS limit: {formatMoney(yearData.iraLimit.standard)} standard; {formatMoney(yearData.iraLimit.max)} with catch-up (age 50+). Deduction eligibility depends on income and employer plan coverage.
            </p>
            {inputs.iraContributions > 0 && (
              <div className="mt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={inputs.isNonDeductibleIRA}
                    onChange={(e) => updateInput('isNonDeductibleIRA', e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-600">This is a non-deductible Traditional IRA contribution</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 ml-1">
                  Check this if your income exceeds deduction limits but you still want to contribute (useful for Backdoor Roth strategy)
                </p>
              </div>
            )}
          </div>

          {inputs.filingStatus === 'marriedJointly' && (
            <div>
              <div className="flex justify-between mb-2 ml-1">
                <label className="block text-sm font-semibold text-slate-600">Traditional IRA (Spouse)</label>
                <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                  Max {formatMoney(iraLimit)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input 
                  type="number" 
                  value={inputs.spouseIraContributions || ''}
                  onChange={(e) => updateInput('spouseIraContributions', parseFloat(e.target.value) || 0)}
                  placeholder="0" 
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-1">
                Each spouse can contribute up to {formatMoney(yearData.iraLimit.standard)} ({formatMoney(yearData.iraLimit.max)} with catch-up). Deduction eligibility depends on income and employer plan coverage.
              </p>
              {inputs.spouseIraContributions > 0 && (
                <div className="mt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={inputs.isSpouseNonDeductibleIRA}
                      onChange={(e) => updateInput('isSpouseNonDeductibleIRA', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-slate-600">This is a non-deductible Traditional IRA contribution (Spouse)</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-1">
                    Check this if spouse's income exceeds deduction limits but you still want to contribute (useful for Backdoor Roth strategy)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="col-span-1 md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <input 
                type="checkbox" 
                checked={inputs.isCoveredByEmployerPlan}
                onChange={(e) => updateInput('isCoveredByEmployerPlan', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-600">Covered by employer retirement plan</span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-1">Affects Traditional IRA deduction eligibility</p>
          </div>

          {inputs.filingStatus === 'marriedJointly' && (
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={inputs.isSpouseCoveredByEmployerPlan}
                  onChange={(e) => updateInput('isSpouseCoveredByEmployerPlan', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-600">Spouse covered by employer retirement plan</span>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-1">Only applies if married filing jointly</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">HSA Coverage Type</label>
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
              <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">HSA Contributions</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input 
                  type="number" 
                  value={inputs.hsaContributions || ''}
                  onChange={(e) => updateInput('hsaContributions', parseFloat(e.target.value) || 0)}
                  placeholder="0" 
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-1">
                {inputs.year} IRS limit: {inputs.hsaCoverageType === 'selfOnly' 
                  ? `Self-only ${formatMoney(yearData.hsaLimit.selfOnly)}` 
                  : `Family ${formatMoney(yearData.hsaLimit.family)}`}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">FSA Contributions</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.fsaContributions || ''}
                onChange={(e) => updateInput('fsaContributions', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">{inputs.year} IRS limit: {formatMoney(yearData.fsaLimit)}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Health Insurance Premiums</label>
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
            <p className="text-xs text-slate-500 mt-1 ml-1">Pre-tax health insurance premiums</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Student Loan Interest</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.studentLoanInterest || ''}
                onChange={(e) => updateInput('studentLoanInterest', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                max={yearData.studentLoanInterestLimit}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">{inputs.year} IRS limit: {formatMoney(yearData.studentLoanInterestLimit)}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2 ml-1">Educator Expenses</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
              <input 
                type="number" 
                value={inputs.educatorExpenses || ''}
                onChange={(e) => updateInput('educatorExpenses', parseFloat(e.target.value) || 0)}
                placeholder="0" 
                min="0"
                max={yearData.educatorExpensesLimit}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-1">{inputs.year} IRS limit: {formatMoney(yearData.educatorExpensesLimit)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
