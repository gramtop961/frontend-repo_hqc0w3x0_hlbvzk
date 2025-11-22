import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function ProductsStock() {
  const [rows, setRows] = useState([])
  useEffect(() => { load() }, [])
  const load = async () => setRows(await fetch(`${baseUrl}/products`).then(r=>r.json()))

  const update = async (sku, field, value) => {
    const res = await fetch(`${baseUrl}/products/${sku}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) })
    if (res.ok) load()
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-white/90">Stock</h2>
        <div className="ml-auto text-white/60">🔍</div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr>
              <th className="text-left px-4 py-3 border-b border-white/10">Product</th>
              <th className="text-left px-4 py-3 border-b border-white/10">Per unit cost</th>
              <th className="text-left px-4 py-3 border-b border-white/10">On hand</th>
              <th className="text-left px-4 py-3 border-b border-white/10">Free to use</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <motion.tr key={r.sku} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }} className="border-b border-white/10">
                <td className="px-4 py-3 text-white/80">{r.name} <span className="text-white/40 font-mono">[{r.sku}]</span></td>
                <td className="px-4 py-3 text-white/80">
                  <InlineEdit value={r.cost} onSave={(v) => update(r.sku, 'cost', parseFloat(v))} />
                </td>
                <td className="px-4 py-3 text-white/80">
                  <InlineEdit value={r.on_hand} onSave={(v) => update(r.sku, 'on_hand', parseInt(v))} />
                </td>
                <td className="px-4 py-3 text-white/80">
                  <InlineEdit value={r.free_to_use} onSave={(v) => update(r.sku, 'free_to_use', parseInt(v))} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InlineEdit({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(value)
  return editing ? (
    <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onBlur={() => { setEditing(false); onSave(v) }} className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white w-24" />
  ) : (
    <button onClick={() => setEditing(true)} className="hover:underline">{value}</button>
  )
}
