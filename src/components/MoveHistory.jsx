import { useEffect, useState } from 'react'

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

export default function MoveHistory() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [sku, setSku] = useState('')
  const dq = useDebounced(q)
  const dsku = useDebounced(sku)

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (dq) params.set('q', dq)
    if (dsku) params.set('sku', dsku)
    const res = await fetch(`${baseUrl}/moves?${params.toString()}`)
    const data = await res.json()
    setRows(data.items || [])
    setTotal(data.total || 0)
  }

  useEffect(() => { load() // eslint-disable-next-line
  }, [page, dq, dsku])

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-white/90">Move History</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/60">
            <span className="mr-2">🔍</span>
            <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value) }} placeholder="Search ref/contact/location..." className="bg-transparent outline-none text-sm" />
          </div>
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/60">
            <span className="mr-2">SKU</span>
            <input value={sku} onChange={(e)=>{ setPage(1); setSku(e.target.value) }} placeholder="DESK001" className="bg-transparent outline-none text-sm w-28" />
          </div>
          <button onClick={()=>{ setQ(''); setSku(''); setPage(1) }} className="px-3 py-2 rounded-xl border border-white/10 text-white/70 hover:bg-white/10">Reset</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr>
              {['Reference','Date','Contact','From','To','SKU','Qty','Status'].map(h => <th key={h} className="text-left px-4 py-3 border-b border-white/10">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 text-white/80">{r.reference}</td>
                <td className="px-4 py-3 text-white/80">{new Date(r.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-white/80">{r.contact||'—'}</td>
                <td className={`px-4 py-3 ${r.direction==='in'?'text-emerald-300':'text-white/70'}`}>{r.from_location||'—'}</td>
                <td className={`px-4 py-3 ${r.direction==='out'?'text-rose-300':'text-white/70'}`}>{r.to_location||'—'}</td>
                <td className="px-4 py-3 text-white/80">{r.product_sku}</td>
                <td className={`px-4 py-3 ${r.direction==='in'?'text-emerald-300':'text-rose-300'}`}>{r.quantity}</td>
                <td className="px-4 py-3 text-white/80">{r.status}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8}>
                <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
