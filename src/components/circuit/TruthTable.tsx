import { motion } from 'framer-motion'

interface TruthTableProps {
  headers: string[]
  rows: boolean[][]
}

export function TruthTable({ headers, rows }: TruthTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="glass-panel overflow-x-auto rounded-lg p-3"
    >
      <p className="font-display mb-2 text-xs tracking-widest text-[#00f5ff] uppercase">
        Truth Table
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-[#00f5ff]/30 px-3 py-1 font-display text-[#00f5ff]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-white/5">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-1 text-center font-mono ${
                    cell ? 'text-[#39ff14]' : 'text-white/40'
                  }`}
                >
                  {cell ? '1' : '0'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}
