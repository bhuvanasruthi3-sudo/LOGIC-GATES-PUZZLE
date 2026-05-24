import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface NeonButtonProps {
  children: ReactNode
  variant?: 'cyan' | 'magenta' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const variants = {
  cyan: 'border-[#00f5ff] text-[#00f5ff] hover:bg-[#00f5ff]/10 shadow-[0_0_15px_rgba(0,245,255,0.3)]',
  magenta:
    'border-[#ff00aa] text-[#ff00aa] hover:bg-[#ff00aa]/10 shadow-[0_0_15px_rgba(255,0,170,0.3)]',
  ghost: 'border-white/20 text-white/80 hover:bg-white/5',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export function NeonButton({
  children,
  variant = 'cyan',
  size = 'md',
  className = '',
  disabled,
  onClick,
  type = 'button',
}: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`font-display cursor-pointer rounded border-2 font-semibold tracking-wider uppercase transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
