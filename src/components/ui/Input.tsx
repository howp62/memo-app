import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 rounded-lg border text-sm
            bg-white dark:bg-zinc-800
            border-stone-200 dark:border-zinc-600
            text-stone-900 dark:text-zinc-100
            placeholder:text-stone-400 dark:placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent
            transition-colors
            ${error ? 'border-red-400 focus:ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
