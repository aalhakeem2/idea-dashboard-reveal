import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card text-sm font-medium font-inter transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-subtle hover:shadow-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border border-gray-300 bg-background text-gray-700 hover:bg-gray-100 hover:text-gray-800 hover:-translate-y-0.5",
        secondary:
          "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800 hover:-translate-y-0.5",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        accent: "bg-yellow-400 text-gray-800 hover:bg-yellow-400/90 hover:-translate-y-0.5 shadow-medium",
        teal: "bg-teal-500 text-white hover:bg-teal-500/90 hover:-translate-y-0.5 shadow-medium",
      },
      size: {
        default: "h-10 px-comfortable py-grid",
        sm: "h-9 rounded-input px-3 text-sm",
        lg: "h-11 rounded-card px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
