import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, LayoutGrid, Rows, BadgeCheck, Printer, XCircle } from 'lucide-react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

const StatusBadge = ({ s }) => {
  const map = { Draft: 'bg-slate-500/20 text-slate-200 border-slate-400/30', Ready: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', Waiting: 'bg-amber-500/20 text-amber-300 border-amber-400/30', Done: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30', Canceled: 'bg-rose-500/20 text-rose-300 border-rose-400/30' }
  return <span className={`px-2 py-1 text-xs rounded-full border ${map[s]}`}>{s}</span>
}

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value)
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t) }, [value, delay])
  return v
}

function Toolbar({ title, view, setView, onNew, filters, setFilters }) {
  const dq = useDebounced(filters.q)
  useEffect(()=>{ setFilters(f => ({ ...f, dq })) }, [dq])
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
      <h2 className="text-xl font-semibold text-white/90 flex-1">{title}</h2>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white/60 hover:text-white">
          <Search size={16} />
          <input value={filters.q} onChange={(e)=>setFilters(v=>({...v, q:e.target.value, page:1}))} placeholder="Search..." className="bg-transparent outline-none ml-2 text-sm" />
        </div>
        {filters.supportsStatus && (
          <select value={filters.status||''} onChange={(e)=>setFilters(v=>({...v, status:e.target.value||undefined, page:1}))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm">
            <option value="">All Status</option>
            {filters.statuses.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <div className="flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button onClick={() => setView('table')} className={`px-3 py-2 ${view==='table' ? 'bg-white/10 text-white' : 'text-white/70'}`}><Rows size={16} /></button>
          <button onClick={() => setView('kanban')} className={`px-3 py-2 ${view==='kanban' ? 'bg-white/10 text-white' : 'text-white/70'}`}><LayoutGrid size={16} /></button>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-semibold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition"><Plus size={16}/> NEW</button>
      </div>
    </div>
  )
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

function Table({ columns, rows, onOpen, footer }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full text-sm">
        <thead className="text-white/60">
          <tr>
            {columns.map((c) => <th key={c} className="text-left px-4 py-3 border-b border-white/10">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} onClick={() => onOpen(r)} className="group hover:bg-white/5 cursor-pointer transition">
              {columns.map((c) => (
                <td key={c} className="px-4 py-3 border-b border-white/10 text-white/80">
                  {c === 'Status' ? <StatusBadge s={r[c]} /> : r[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer}
      </table>
    </div>
  )
}

function Kanban({ statuses, items, onOpen }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {statuses.map((s) => (
        <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-sm text-white/70 mb-2">{s}</div>
          <div className="space-y-2">
            {items.filter(i => i.Status === s).map((i) => (
              <motion.div layoutId={i.Reference} key={i.Reference} onClick={() => onOpen(i)} whileHover={{ y: -2 }} className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-white/80 cursor-pointer">
                <div className="font-mono text-xs text-white/60">{i.Reference}</div>
                <div className="text-sm">{i.Contact || '—'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ReceiptsList({ onOpen }) {
  const [view, setView] = useState('table')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ q: '', dq: '', supportsStatus: true, status: '', statuses: ['Draft','Ready','Done','Canceled'] })

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (filters.dq) params.set('q', filters.dq)
    if (filters.status) params.set('status', filters.status)
    const res = await fetch(`${baseUrl}/receipts?${params.toString()}`)
    const data = await res.json()
    const rows = (data.items||[]).map(r => ({
      Reference: r.reference,
      From: r.from_location || '—',
      To: r.to_location || '—',
      Contact: r.contact || '—',
      'Schedule date': new Date(r.schedule_date).toLocaleDateString(),
      Status: r.status,
    }))
    setItems(rows)
    setTotal(data.total||0)
  }

  useEffect(()=>{ load() // eslint-disable-next-line
  }, [page, filters.dq, filters.status])

  const columns = ['Reference','From','To','Contact','Schedule date','Status']
  const statuses = ['Draft','Ready','Done','Canceled']

  return (
    <div>
      <Toolbar title="Receipts" view={view} setView={setView} onNew={() => onOpen({ new: true, type: 'receipt' })} filters={filters} setFilters={setFilters} />
      {view === 'table' ? (
        <Table columns={columns} rows={items} onOpen={(r) => onOpen({ reference: r.Reference, type: 'receipt' })} footer={<tfoot><tr><td colSpan={columns.length}><Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} /></td></tr></tfoot>} />
      ) : (
        <Kanban statuses={statuses} items={items} onOpen={(r) => onOpen({ reference: r.Reference, type: 'receipt' })} />
      )}
    </div>
  )
}

export function DeliveriesList({ onOpen }) {
  const [view, setView] = useState('table')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ q: '', dq: '', supportsStatus: true, status: '', statuses: ['Draft','Waiting','Ready','Done','Canceled'] })

  const load = async () => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (filters.dq) params.set('q', filters.dq)
    if (filters.status) params.set('status', filters.status)
    const res = await fetch(`${baseUrl}/deliveries?${params.toString()}`)
    const data = await res.json()
    const rows = (data.items||[]).map(r => ({
      Reference: r.reference,
      From: r.from_location || '—',
      To: r.to_location || '—',
      Contact: r.contact || '—',
      'Schedule date': new Date(r.schedule_date).toLocaleDateString(),
      Status: r.status,
    }))
    setItems(rows)
    setTotal(data.total||0)
  }

  useEffect(()=>{ load() // eslint-disable-next-line
  }, [page, filters.dq, filters.status])

  const columns = ['Reference','From','To','Contact','Schedule date','Status']
  const statuses = ['Draft','Waiting','Ready','Done','Canceled']
  return (
    <div>
      <Toolbar title="Delivery" view={view} setView={setView} onNew={() => onOpen({ new: true, type: 'delivery' })} filters={filters} setFilters={setFilters} />
      {view === 'table' ? (
        <Table columns={columns} rows={items} onOpen={(r) => onOpen({ reference: r.Reference, type: 'delivery' })} footer={<tfoot><tr><td colSpan={columns.length}><Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} /></td></tr></tfoot>} />
      ) : (
        <Kanban statuses={statuses} items={items} onOpen={(r) => onOpen({ reference: r.Reference, type: 'delivery' })} />
      )}
    </div>
  )
}

export function ReceiptDetail({ reference, close }) {
  const [rec, setRec] = useState(null)
  useEffect(() => {
    if (!reference?.new) fetch(`${baseUrl}/receipts/${reference}`).then(r => r.json()).then(setRec)
    else setRec({ reference: 'Auto', status: 'Draft', responsible: JSON.parse(localStorage.getItem('user')||'{}').login_id || 'admin', lines: [{ product_sku: 'DESK001', quantity: 1 }] })
  }, [reference])

  const action = async (a) => {
    const res = await fetch(`${baseUrl}/receipts/${rec.reference}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: a }) })
    const data = await res.json(); setRec({ ...rec, status: data.status })
  }

  return rec && (
    <Panel title="Receipt" statusFlow={['Draft','Ready','Done']} status={rec.status} close={close} actions=[
      { label: 'New', onClick: () => window.location.reload() },
      { label: rec.status==='Draft'?'To Do':'', primary: true, onClick: () => action('todo') },
      { label: rec.status==='Ready'?'Validate':'', primary: true, onClick: () => action('validate'), icon: BadgeCheck },
      { label: 'Print', icon: Printer },
      { label: 'Cancel', icon: XCircle, danger: true, onClick: () => action('cancel') },
    ]>
      <FormGrid>
        <Field label="Reference" value={rec.reference} />
        <Field label="Receive From" value={rec.from_location || ''} />
        <Field label="Schedule Date" value={new Date(rec.schedule_date).toLocaleString()} />
        <Field label="Responsible" value={rec.responsible || ''} />
      </FormGrid>
      <ProductsTable lines={rec.lines} />
      <SideNote lines=[
        'Draft = Initial stage',
        'Ready = Ready to receive',
        'Done = Received',
      ] />
    </Panel>
  )
}

export function DeliveryDetail({ reference, close }) {
  const [rec, setRec] = useState(null)
  useEffect(() => {
    if (!reference?.new) fetch(`${baseUrl}/deliveries/${reference}`).then(r => r.json()).then(setRec)
    else setRec({ reference: 'Auto', status: 'Draft', responsible: JSON.parse(localStorage.getItem('user')||'{}').login_id || 'admin', lines: [{ product_sku: 'DESK001', quantity: 6 }] })
  }, [reference])

  const action = async (a) => {
    const res = await fetch(`${baseUrl}/deliveries/${rec.reference}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: a }) })
    const data = await res.json(); setRec({ ...rec, status: data.status })
  }

  return rec && (
    <Panel title="Delivery" statusFlow={['Draft','Waiting','Ready','Done']} status={rec.status} close={close} actions=[
      { label: 'New', onClick: () => window.location.reload() },
      { label: rec.status==='Draft'?'To Do':'', primary: true, onClick: () => action('todo') },
      { label: rec.status==='Ready'?'Validate':'', primary: true, onClick: () => action('validate'), icon: BadgeCheck },
    ]>
      <FormGrid>
        <Field label="Reference" value={rec.reference} />
        <Field label="Delivery Address" value={rec.to_location || ''} />
        <Field label="Responsible" value={rec.responsible || ''} />
        <Field label="Schedule Date" value={new Date(rec.schedule_date).toLocaleString()} />
        <Field label="Operation type" value={rec.operation_type || ''} />
      </FormGrid>
      <ProductsTable lines={rec.lines} highlightInsufficient={rec.status==='Waiting'} />
    </Panel>
  )
}

function Panel({ title, statusFlow, status, actions, children, close }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={close} />
      <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} className="w-full max-w-3xl h-full overflow-y-auto bg-slate-900 border-l border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white/90">{title}</h3>
          <button onClick={close} className="text-white/60 hover:text-white">Close</button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {statusFlow.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${s===status?'bg-cyan-500/20 text-cyan-300 border-cyan-400/30':'bg-white/5 text-white/60 border-white/10'}`}>{s}</span>
              {i<statusFlow.length-1 && <span className="text-white/20">›</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-6">
          {actions.filter(a=>a.label).map((a) => (
            <button key={a.label} onClick={a.onClick} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${a.danger?'border-rose-500/30 text-rose-300 bg-rose-500/10':a.primary?'border-cyan-500/30 text-cyan-300 bg-cyan-500/10':'border-white/10 text-white/80 bg-white/5'}`}>
              {a.icon && <a.icon size={16} />} {a.label}
            </button>
          ))}
        </div>
        {children}
      </motion.div>
    </div>
  )
}

function FormGrid({ children }) { return <div className="grid md:grid-cols-2 gap-4 mb-6">{children}</div> }
function Field({ label, value }) { return <div><div className="text-xs text-white/50 mb-1">{label}</div><div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80">{value||'—'}</div></div> }

function ProductsTable({ lines, highlightInsufficient }) {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-white/60 bg-white/5">
          <tr>
            <th className="text-left px-4 py-2">Product</th>
            <th className="text-left px-4 py-2">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={i} className={`border-t border-white/10 ${highlightInsufficient ? 'bg-rose-500/5' : 'hover:bg-white/5'}`}>
              <td className="px-4 py-2 text-white/80">[{l.product_sku}]</td>
              <td className="px-4 py-2 text-white/80">{l.quantity}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="px-4 py-2 text-white/50">New Product +</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
