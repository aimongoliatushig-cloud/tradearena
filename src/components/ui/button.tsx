"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border text-sm font-semibold tracking-[-0.01em] whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[#2593ff]/60 bg-[#0781fe] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.32),0_16px_30px_rgba(7,129,254,0.24)] hover:border-[#3daafe]/70 hover:bg-[#025ee4] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_18px_34px_rgba(7,129,254,0.3)]",
        outline:
          "border-white/12 bg-white/[0.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.08]",
        secondary:
          "border-white/12 bg-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.08]",
        ghost:
          "border-transparent bg-transparent text-white/72 hover:bg-white/6 hover:text-white",
        destructive:
          "border-red-500/50 bg-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-red-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-8 rounded-xl px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 rounded-xl px-4 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 rounded-2xl px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-8",
        "icon-xs":
          "size-7 rounded-xl [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-xl",
        "icon-lg": "size-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const resolvedNativeButton = nativeButton ?? (render ? false : true)

  return (
    <ButtonPrimitive
      data-slot="button"
      render={render}
      nativeButton={resolvedNativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
