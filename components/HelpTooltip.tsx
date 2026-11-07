'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  content: string
  className?: string
}

export default function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`text-slate-400 hover:text-indigo-600 transition-colors ${className}`}
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none">
          {content}
          <div className="absolute -top-1 left-2 w-2 h-2 bg-slate-900 rotate-45"></div>
        </div>
      )}
    </div>
  )
}

