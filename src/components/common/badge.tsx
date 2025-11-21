import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "border-transparent bg-blue-600 text-white": variant === "default",
            "border-transparent bg-green-600 text-white": variant === "success",
            "border-transparent bg-yellow-600 text-white": variant === "warning",
            "border-transparent bg-red-600 text-white": variant === "error",
            "border-transparent bg-sky-600 text-white": variant === "info",
            "border-transparent bg-gray-600 text-white": variant === "secondary",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
