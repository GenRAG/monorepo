import { ToastType } from "@/src/hooks/useThemedToast"
import { ToastOptions } from "@/src/hooks/useThemedToast"
import { useBreakpointValue } from "@/src/hooks/useBreakpointValues"
import { useStyledToast } from "@/src/hooks/useThemedToast"
import { toast as sonnerToast } from "sonner"
import { X } from "lucide-react"
import { Button } from "@/src/components/ui/Button"

const ThemedToast = ({
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

export { ThemedToast }