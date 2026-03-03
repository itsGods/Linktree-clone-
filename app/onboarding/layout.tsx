"use client"

import { usePathname } from "next/navigation"
import { motion } from "motion/react"

const steps = [
  { path: "/onboarding/username", label: "Username" },
  { path: "/onboarding/theme", label: "Theme" },
  { path: "/onboarding/profile", label: "Profile" },
  { path: "/onboarding/complete", label: "Complete" },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentStepIndex = steps.findIndex((step) => step.path === pathname)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mb-8">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
