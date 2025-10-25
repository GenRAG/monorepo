"use client"

import { toast as sonnerToast } from "sonner"
import { ThemedToast } from "@/src/components/ui/Toast"

export enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

export interface ToastOptions {
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

export const useStyledToast = (status: ToastType) => {
  return {
    ...(status === ToastType.Success && { borderLeft: "4px solid #22c55e" }),
    ...(status === ToastType.Error && { borderLeft: "4px solid #ef4444" }),
    ...(status === ToastType.Warning && { borderLeft: "4px solid #facc15" }),
    ...(status === ToastType.Info && { borderLeft: "4px solid #3b82f6" }),
  }
}

export const useThemedToast = () => {
  const toast = (options: ToastOptions) => {
    sonnerToast.custom((t) => <ThemedToast {...options} t={t} />, {
      duration: options.duration ? options.duration : 5000,
      position: options.position ? options.position : "top-right",
    })
  }

  return { toast }
}