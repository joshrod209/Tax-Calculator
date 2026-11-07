'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'

interface ValidatedInputProps {
  value: number | string
  onChange: (value: number) => void
  onFocus?: () => void
  placeholder?: string
  min?: number
  max?: number
  label?: string
  helpText?: string
  errorMessage?: string
  showValidation?: boolean
  formatOnBlur?: boolean
  className?: string
}

export default function ValidatedInput({
  value,
  onChange,
  onFocus,
  placeholder = '0',
  min = 0,
  max,
  label,
  helpText,
  errorMessage,
  showValidation = true,
  formatOnBlur = true,
  className = ''
}: ValidatedInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(value?.toString() || '')
  const [isFocused, setIsFocused] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value?.toString() || '')
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '')
    setDisplayValue(inputValue)
    
    const numValue = parseFloat(inputValue) || 0
    onChange(numValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (formatOnBlur && displayValue) {
      const numValue = parseFloat(displayValue.replace(/,/g, '')) || 0
      setDisplayValue(numValue.toLocaleString())
    }
  }

  const isValid = max === undefined || (typeof value === 'number' && value <= max)
  const hasError = max !== undefined && typeof value === 'number' && value > max
  const isEmpty = !value || value === 0

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-semibold text-slate-600">{label}</label>
          {helpText && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label="Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {showHelp && (
                <div className="absolute z-10 left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
                  {helpText}
                  <div className="absolute -top-1 left-2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full bg-slate-50 border ${
            hasError ? 'border-red-300 focus:ring-red-500' : 
            isValid && !isEmpty && showValidation ? 'border-green-300 focus:ring-green-500' : 
            'border-slate-200 focus:ring-indigo-500'
          } text-slate-900 font-medium rounded-xl pl-8 pr-10 py-3 focus:outline-none focus:ring-2 transition-all ${className}`}
        />
        {showValidation && !isFocused && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isValid && !isEmpty ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      {hasError && errorMessage && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errorMessage}
        </p>
      )}
      {max && !hasError && (
        <p className="text-xs text-slate-500">
          Maximum: {max.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
        </p>
      )}
    </div>
  )
}

