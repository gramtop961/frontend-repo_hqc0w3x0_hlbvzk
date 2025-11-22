import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value)
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t) }, [value, delay])
  return v
}

function Pagination({ page, pageSize, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs text-white/60">
      <div>Page {page} of {pages} • {total} items</div>
      <div className="flex items-center gap-2">
        <button disabled={page<=1} onClick={() => onPageChange(page-1)} className={`px-2 py-1 rounded border ${page<=1?'opacity-40 cursor-not-allowed':'hover:bg-white/10'} border-white/10`}>Prev</button>
        <button disabled={page>=pages} onClick={() => onPageChange(page+1)} className={`px-2 py-1 rounded border ${page>=pages?'opacity-40 cursor-not-allowed':'hover:bg-white/10'} border-white/10`}>Next</button>
      </div>
    </div>
  )
}

export default function ProductsStock() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const dq = useDebounced(q)

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (dq) params.set('q', dq)
    const res = await fetch(`${baseUrl}/products?${params.toString()}`)
    const data = await res.json()
    setRows(data.items || [])
    setTotal(data.total || 0)
  }

  useEffect(() => { load() // eslint-disable-next-line
  }, [page, dq])

  const update = async (sku, field, value) => {
    const res = await fetch(`${baseUrl}/products/${sku}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) })
    if (res.ok) load()
  }

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-white/90">Stock</h2>
        <div className="ml-auto flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/60">
          <span className="mr-2">🔍</span>
          <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value) }} placeholder="Search SKU or name..." className="bg-transparent outline-none text-sm" />
        </div>
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
          <tfoot>
            <tr>
              <td colSpan={4}>
                <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function InlineEdit({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(value)
  useEffect(()=>{ setV(value) }, [value])
  return editing ? (
    <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onBlur={() => { setEditing(false); onSave(v) }} className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white w-24" />
  ) : (
    <button onClick={() => setEditing(true)} className="hover:underline">{value}</button>
  )
}
