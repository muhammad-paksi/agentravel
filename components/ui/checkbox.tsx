// components/ui/Checkbox.tsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import "@/app/globals.css"    // ← adjust path as needed

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Show an indeterminate state
   */
  indeterminate?: boolean
  /**
   * Label text for the checkbox
   */
  children?: React.ReactNode
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ children, indeterminate = false, ...props }, forwardedRef) => {
  // local ref to the native input
  const inputRef = React.useRef<HTMLInputElement>(null)

  // apply indeterminate property on the input element
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className="checkbox-wrapper">
      <CheckboxPrimitive.Root
        asChild
        ref={forwardedRef}
        {...props}
      >
        <input ref={inputRef} type="checkbox" />
      </CheckboxPrimitive.Root>

      <div className="checkmark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M20 6L9 17L4 12"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {children && <span className="label">{children}</span>}
    </label>
  )
})

Checkbox.displayName = "Checkbox"
