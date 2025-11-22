import { useEffect, useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function MoveHistory() {
  const [rows, setRows] = useState([])
  useEffect(() => { fetch(`${baseUrl}/moves`).then(r=>r.json()).then(setRows) }, [])

  return (
    <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-semibold text-white/90">Move History</h2>
        <div className="ml-auto">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-semibold">NEW</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr>
              {['Reference','Date','Contact','From','To','Quantity','Status'].map(h => <th key={h} className="text-left px-4 py-3 border-b border-white/10">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 text-white/80">{r.reference}</td>
                <td className="px-4 py-3 text-white/80">{new Date(r.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-white/80">{r.contact||'—'}</td>
                <td className="px-4 py-3 text-emerald-300">{r.direction==='in'?r.from_location:'—'}</td>
                <td className="px-4 py-3 text-rose-300">{r.direction==='out'?r.to_location:'—'}</td>
                <td className={`px-4 py-3 ${r.direction==='in'?'text-emerald-300':'text-rose-300'}`}>{r.quantity}</td>
                <td className="px-4 py-3 text-white/80">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
