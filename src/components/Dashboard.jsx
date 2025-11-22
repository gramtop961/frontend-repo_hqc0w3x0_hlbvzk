import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Dashboard() {
  const [data, setData] = useState({ receipt: { to_receive: 0, late: 0, operations: 0 }, delivery: { to_deliver: 0, late: 0, waiting: 0, operations: 0 } })
  useEffect(() => { fetch(`${baseUrl}/dashboard`).then(r => r.json()).then(setData) }, [])

  const Card = ({ title, pill, lines, href }) => (
    <motion.a href={href} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }} className="block group rounded-3xl p-6 md:p-8 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/10 transition overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-cyan-400/0 via-fuchsia-500/0 to-white/5 opacity-0 group-hover:opacity-100 transition" />
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-semibold text-white/90">{title}</h3>
        <span className="px-3 py-1.5 rounded-full text-xs bg-cyan-400/20 text-cyan-300 border border-cyan-500/30">{pill}</span>
      </div>
      <div className="space-y-1 text-white/70">
        {lines.map((l) => <div key={l}>{l}</div>)}
      </div>
      <div className="mt-6 flex items-center gap-2 text-cyan-300/80">
        Open <ArrowUpRight size={16} />
      </div>
    </motion.a>
  )

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <Card
          title="Receipt"
          pill={`${data.receipt.to_receive} to receive`}
          lines={[`1 Late`, `${data.receipt.operations} operations`]}
          href="/operations/receipts"
        />
        <Card
          title="Delivery"
          pill={`${data.delivery.to_deliver} to Deliver`}
          lines={[`1 Late`, `${data.delivery.waiting} waiting`, `${data.delivery.operations} operations`]}
          href="/operations/deliveries"
        />
      </div>
    </div>
  )
}
