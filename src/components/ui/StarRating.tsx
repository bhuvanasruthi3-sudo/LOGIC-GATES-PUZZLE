import { motion } from 'framer-motion'

export function StarRating({ stars, max = 3 }: { stars: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.15, type: 'spring' }}
          className={`text-xl ${i < stars ? 'text-[#ffe600]' : 'text-white/20'}`}
          style={
            i < stars
              ? { filter: 'drop-shadow(0 0 6px #ffe600)' }
              : undefined
          }
        >
          ★
        </motion.span>
      ))}
    </div>
  )
}
