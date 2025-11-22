import { useState } from 'react'

const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export function Login() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login_id: loginId, password }) })
    if (!res.ok) { setError('Invalid credentials'); return }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    window.location.href = '/dashboard'
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Login ID" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-rose-300 bg-rose-900/30 border border-rose-500/30 px-3 py-2 rounded-lg text-sm">{error}</div>}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition">SIGN IN</button>
        <div className="text-xs text-white/60 flex items-center justify-between">
          <a href="/forgot" className="hover:text-white">Forgot Password?</a>
          <a href="/signup" className="hover:text-white">Sign Up</a>
        </div>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const [form, setForm] = useState({ login_id: '', email: '', password: '', confirm_password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const onChange = (k, v) => setForm({ ...form, [k]: v })
  const rules = [
    { ok: form.password.length >= 6, text: 'Min 6 characters' },
    { ok: /[A-Z]/.test(form.password), text: 'At least 1 uppercase' },
    { ok: /[0-9]/.test(form.password), text: 'At least 1 number' },
  ]

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setMsg('')
    const res = await fetch(`${baseUrl}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'Error'); return }
    setMsg('Signup successful. You can sign in now.')
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Login ID" value={form.login_id} onChange={(e) => onChange('login_id', e.target.value)} />
        <Input label="Email ID" value={form.email} onChange={(e) => onChange('email', e.target.value)} />
        <Input label="Password" type="password" value={form.password} onChange={(e) => onChange('password', e.target.value)} />
        <Input label="Re-enter Password" type="password" value={form.confirm_password} onChange={(e) => onChange('confirm_password', e.target.value)} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          {rules.map((r) => (
            <div key={r.text} className={`px-2 py-1 rounded bg-white/5 ${r.ok ? 'text-emerald-300 border border-emerald-500/30' : 'text-white/60 border border-white/10'}`}>{r.text}</div>
          ))}
        </div>
        {error && <div className="text-rose-300 bg-rose-900/30 border border-rose-500/30 px-3 py-2 rounded-lg text-sm">{error}</div>}
        {msg && <div className="text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-sm">{msg}</div>}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition">SIGN UP</button>
      </form>
    </AuthShell>
  )
}

export function Forgot() {
  const [stage, setStage] = useState('email')
  const [form, setForm] = useState({ email: '', otp: '', new_password: '', confirm_password: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const onChange = (k, v) => setForm({ ...form, [k]: v })

  const submit = async (e) => {
    e.preventDefault()
    setMsg(''); setError('')
    const payload = stage === 'email' ? { email: form.email } : form
    const res = await fetch(`${baseUrl}/auth/forgot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) { setError(data.detail || 'Error'); return }
    setMsg(data.message || 'Success')
    if (stage === 'email') setStage('reset')
  }

  return (
    <AuthShell>
      <form onSubmit={submit} className="space-y-4">
        {stage === 'email' && <Input label="Email ID" value={form.email} onChange={(e) => onChange('email', e.target.value)} />}
        {stage === 'reset' && (
          <>
            <Input label="OTP" value={form.otp} onChange={(e) => onChange('otp', e.target.value)} />
            <Input label="New Password" type="password" value={form.new_password} onChange={(e) => onChange('new_password', e.target.value)} />
            <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={(e) => onChange('confirm_password', e.target.value)} />
          </>
        )}
        {error && <div className="text-rose-300 bg-rose-900/30 border border-rose-500/30 px-3 py-2 rounded-lg text-sm">{error}</div>}
        {msg && <div className="text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-sm">{msg}</div>}
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30 hover:scale-[1.01] active:scale-[0.99] transition">{stage==='email'?'Send OTP':'Reset Password'}</button>
      </form>
    </AuthShell>
  )
}

function AuthShell({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04)_1px),linear-gradient(to_bottom,transparent,rgba(255,255,255,0.04)_1px)] bg-[size:24px_24px]" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-lg shadow-cyan-500/30" />
            <h1 className="mt-3 text-xl font-semibold text-white/90">Invex Inventory</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-white/70 mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 transition" />
    </div>
  )
}
