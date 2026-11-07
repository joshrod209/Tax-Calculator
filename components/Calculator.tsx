'use client'

import Header from './Header'
import InputSection from './InputSection'
import ResultsSection from './ResultsSection'
import ScrollToTop from './ScrollToTop'
import { useTaxCalculator } from '@/hooks/useTaxCalculator'

export default function Calculator() {
  const calculator = useTaxCalculator()

  return (
    <>
      <Header year={calculator.inputs.year} />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <InputSection calculator={calculator} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <ResultsSection calculator={calculator} />
        </div>
      </div>
      <ScrollToTop />
    </>
  )
}

