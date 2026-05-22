import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-amber-400 hover:bg-amber-500 text-stone-900',
      ghost: 'hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-600 dark:text-zinc-300',
      danger: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500',
    }

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5',
      md: 'text-sm px-3.5 py-2',
      lg: 'text-base px-5 py-2.5',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
