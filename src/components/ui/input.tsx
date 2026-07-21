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
            <span className="absolute left-3 text-pink-400/70 pointer-events-none transition-colors group-focus-within:text-pink-400">
              {icon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border border-pink-500/20 bg-background/60 px-3 py-2 text-sm ring-offset-background transition-all duration-200',
              'placeholder:text-muted-foreground/60',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:border-pink-500 hover:border-pink-500/40',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'backdrop-filter backdrop-blur-md shadow-inner',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-pink-400/70">
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
          'flex h-11 w-full rounded-xl border border-pink-500/20 bg-background/60 px-3 py-2 text-sm ring-offset-background transition-all duration-200',
          'placeholder:text-muted-foreground/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 focus-visible:border-pink-500 hover:border-pink-500/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'backdrop-filter backdrop-blur-md shadow-inner',
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
