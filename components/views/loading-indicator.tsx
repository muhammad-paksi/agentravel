'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function LoadingIndicator() {
  const pathname = usePathname()
  const previousPath = useRef<string>('')

  useEffect(() => {
    if (previousPath.current !== pathname) {
      NProgress.start()
      previousPath.current = pathname

      // Simulasi delay untuk transisi loading (karena App Router handle async page)
      const timeout = setTimeout(() => {
        NProgress.done()
      }, 400) // tweak sesuai durasi loading kamu

      return () => clearTimeout(timeout)
    }
  }, [pathname])

  return null
}
