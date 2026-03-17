import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white transition-colors outline-none placeholder:text-white/35 focus-visible:border-[#3daafe] focus-visible:ring-3 focus-visible:ring-[#0781fe]/25 disabled:cursor-not-allowed disabled:bg-white/[0.02] disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
