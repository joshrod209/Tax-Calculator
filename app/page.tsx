'use client'

import { useEffect } from 'react'
import Calculator from '@/components/Calculator'

export default function Home() {
  useEffect(() => {
    // Initialize Lucide icons after component mounts
    if (typeof window !== 'undefined') {
      import('lucide-react').then((lucide) => {
        // Icons will be handled by React components
      })
    }
  }, [])

  return (
    <main className="text-slate-900 font-sans p-4 md:p-8 min-h-screen">
      <Calculator />
    </main>
  )
}

