import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconRight, ...props }, ref) => {
    if (icon || iconRight) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-muted-foreground pointer-events-none">
              {icon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'backdrop-filter backdrop-blur-sm',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-muted-foreground">
              {iconRight}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background transition-all',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'backdrop-filter backdrop-blur-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
