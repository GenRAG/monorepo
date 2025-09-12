import { useEffect, useState } from "react"

const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
}

type BreakpointKey = keyof typeof breakpoints | "base"

export function useCurrentBreakpoint(): BreakpointKey {
  const [breakpoint, setBreakpoint] = useState<BreakpointKey>("base")

  useEffect(() => {
    const getCurrentBreakpoint = (): BreakpointKey => {
      const entries = Object.entries(breakpoints).reverse()

      for (const [key, query] of entries) {
        if (window.matchMedia(query).matches) return key as BreakpointKey
      }

      return "base"
    }

    const updateBreakpoint = () => {
      const bp = getCurrentBreakpoint()
      setBreakpoint(bp)
    }

    const mqls = Object.values(breakpoints).map((query) =>
      window.matchMedia(query)
    )

    mqls.forEach((mql) => mql.addEventListener("change", updateBreakpoint))

    updateBreakpoint()

    return () => {
      mqls.forEach((mql) =>
        mql.removeEventListener("change", updateBreakpoint)
      )
    }
  }, [])

  return breakpoint
}
