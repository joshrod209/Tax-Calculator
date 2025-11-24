'use client'

import { Calculator as CalculatorIcon } from 'lucide-react'

interface HeaderProps {
  year: number
}

export default function Header({ year }: HeaderProps) {
  return (
    <header className="max-w-6xl mx-auto mb-8 flex items-center gap-3">
      <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
        <CalculatorIcon className="text-white w-6 h-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{year} Tax Forecaster</h1>
        <p className="text-slate-500 text-sm">Real-time estimates based on projected {year} IRS brackets</p>
      </div>
    </header>
  )
}

