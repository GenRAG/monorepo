"use client"

import { toast as sonnerToast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/src/components/ui/Button"
import { useBreakpointValue } from "@/src/hooks/useBreakpointValues"

export enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

interface ToastOptions {
  title: string
  description?: string
  status?: ToastType
  duration?: number
  isClosable?: boolean
  CtaProperties?: {
    label: string
    onClick: () => void
  }
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

const useStyledToast = (status: ToastType) => {
  return {
    ...(status === ToastType.Success && { borderLeft: "4px solid #22c55e" }),
    ...(status === ToastType.Error && { borderLeft: "4px solid #ef4444" }),
    ...(status === ToastType.Warning && { borderLeft: "4px solid #facc15" }),
    ...(status === ToastType.Info && { borderLeft: "4px solid #3b82f6" }),
  }
}

export const useThemedToast = () => {
  const toast = (options: ToastOptions) => {
    sonnerToast.custom((t) => <ThemedToastComponent {...options} t={t} />, {
      duration: options.duration ? options.duration : 5000,
      position: options.position ? options.position : "top-right",
    })
  }

  return { toast }
}

const ThemedToastComponent = ({
  title,
  description,
  status = ToastType.Info,
  CtaProperties,
  isClosable,
  t
}: ToastOptions & { t: string | number }) => {
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const styles = useStyledToast(status)

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-md p-4 shadow-lg w-full bg-background text-foreground border ${isDesktop ? "min-w-[500px]" : ""}`}
      style={styles}
    >
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        {description && <p className="text-sm opacity-80 mt-2">{description}</p>}
      </div>

      <div className="flex flex-col items-end gap-2">
        {isClosable && (
          <button
            onClick={() => sonnerToast.dismiss(t)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {CtaProperties && (
          <Button
            onClick={CtaProperties.onClick}
            className="text-sm"
            variant={"default"}
            size={"sm"}
          >
            {CtaProperties.label}
          </Button>
        )}
      </div>
    </div>
  )
}
