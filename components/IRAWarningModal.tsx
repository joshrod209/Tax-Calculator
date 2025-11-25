'use client'

import { AlertCircle, X } from 'lucide-react'
import { formatMoney } from '@/lib/utils'

interface IRAWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onClearInput: () => void
  isSpouse: boolean
  magi: number
  rothEligible: boolean
}

export default function IRAWarningModal({
  isOpen,
  onClose,
  onClearInput,
  isSpouse,
  magi,
  rothEligible
}: IRAWarningModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Traditional IRA Not Deductible
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <p className="text-sm text-slate-700 mb-2">
              Based on your income (MAGI: <strong className="text-slate-900">{formatMoney(magi)}</strong>), 
              {isSpouse ? " your spouse's " : " your "}Traditional IRA contributions would <strong className="text-red-700">not be tax-deductible</strong>.
            </p>
            <p className="text-sm font-semibold text-red-700 mb-2">
              ⚠️ Important: Non-deductible Traditional IRA contributions will NOT reduce your tax obligation.
            </p>
            <p className="text-sm text-slate-600">
              These contributions are made with after-tax dollars and provide no immediate tax benefit. Your tax liability will remain the same regardless of the contribution amount.
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-2">
              Consider Backdoor Roth IRA Strategy
            </h3>
            <p className="text-xs text-slate-700 mb-3">
              If you still want to contribute, a <strong>Backdoor Roth IRA</strong> strategy may be beneficial:
            </p>
            <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
              <li>Contribute to a non-deductible Traditional IRA (you can still do this)</li>
              <li>Immediately convert it to a Roth IRA</li>
              <li>No tax on conversion since it's already after-tax money</li>
              <li>Future growth will be tax-free in the Roth IRA</li>
            </ol>
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-blue-200 italic">
              Note: This strategy works best if you don't have existing Traditional IRA balances to avoid pro-rata rules.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0">
          <div className="flex gap-3">
            <button
              onClick={onClearInput}
              className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Clear Input
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white border-2 border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Enter Non-Deductible Contribution
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

