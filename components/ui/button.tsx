import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500":
              variant === "default",
            "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500":
              variant === "secondary",
            "border-2 border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500":
              variant === "outline",
            "hover:bg-gray-100 focus:ring-gray-500": variant === "ghost",
          },
          {
            "h-10 px-6 py-2": size === "default",
            "h-8 px-4 text-sm": size === "sm",
            "h-12 px-8 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
