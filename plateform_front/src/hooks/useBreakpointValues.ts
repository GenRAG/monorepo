import { useEffect, useState } from "react"

type Breakpoints<T> = {
  base?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  "2xl"?: T
}

const queries: Record<keyof Breakpoints<any>, string> = {
  base: "",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
}

export function useBreakpointValue<T>(values: Breakpoints<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === "undefined") return values.base
    return computeBreakpointValue(values)
  })

  useEffect(() => {
    const handler = () => {
      const newValue = computeBreakpointValue(values)
      setValue(newValue)
    }

    const mqls = Object.entries(queries)
      .filter(([key]) => key !== "base")
      .map(([key, query]) => ({
        key,
        mql: window.matchMedia(query),
      }))

    mqls.forEach(({ mql }) => mql.addEventListener("change", handler))
    handler()

    return () => {
      mqls.forEach(({ mql }) => mql.removeEventListener("change", handler))
    }
  }, [JSON.stringify(values)])

  return value
}

function computeBreakpointValue<T>(values: Breakpoints<T>): T | undefined {
  if (typeof window === "undefined") return values.base

  const sortedBreakpoints: (keyof Breakpoints<T>)[] = ["2xl", "xl", "lg", "md", "sm"]

  for (const bp of sortedBreakpoints) {
    const query = queries[bp]
    if (query && window.matchMedia(query).matches && values[bp] !== undefined) {
      return values[bp]
    }
  }

  return values.base
}
