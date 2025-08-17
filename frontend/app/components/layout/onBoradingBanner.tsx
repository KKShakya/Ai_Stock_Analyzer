// components/OnboardingBanner.tsx
"use client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("onboardingDismissed")
    if (!dismissed) setVisible(true)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("onboardingDismissed", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 p-4 rounded-lg mb-4 flex justify-between items-center shadow">
      <span>👋 Welcome! Here’s your market sentiment dashboard. Explore OI/PCR, news & quick stats.</span>
      <button onClick={handleDismiss} className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded">
        <X size={16} />
      </button>
    </div>
  )
}
