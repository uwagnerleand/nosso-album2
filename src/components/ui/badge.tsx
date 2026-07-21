import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm',
        secondary: 'border-transparent bg-purple-500/15 text-purple-300 border border-purple-500/20',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border-pink-500/30 text-foreground hover:border-pink-500/50',
        glass: 'glass text-foreground border-pink-500/20 backdrop-blur-md',
        pink: 'bg-pink-500/15 text-pink-400 border border-pink-500/30 shadow-sm shadow-pink-500/10',
        rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10',
        purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10',
        magenta: 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30 shadow-sm shadow-fuchsia-500/10',
        glow: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/40 glow-pink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
