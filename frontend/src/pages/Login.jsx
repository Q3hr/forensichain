import { useState } from 'react'
import api from '../api'

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!name || !key) return setMsg({ type: 'error', text: 'Fill all fields.' })
    setLoading(true); setMsg(null)
    try {
      if (tab === 'login') {
        const r = await api.post('/investigators/login', { name, private_key: key })
        onLogin(r.data)
      } else {
        await api.post('/investigators/create', { name, private_key: key })
        const r = await api.post('/investigators/login', { name, private_key: key })
        onLogin(r.data)
      }
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error occurred.' })
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-big">FORENSICHAIN</div>
          <div className="logo-big2">DIGITAL FORENSICS IDENTITY LEDGER</div>
        </div>

        <div className="login-tabs">
          <div className={`login-tab ${tab==='login'?'active':''}`} onClick={() => setTab('login')}>LOGIN</div>
          <div className={`login-tab ${tab==='register'?'active':''}`} onClick={() => setTab('register')}>REGISTER</div>
        </div>

        {msg && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}

        <div className="form-group">
          <label className="form-label">Investigator Name</label>
          <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Inspector Ayesha" />
        </div>
        <div className="form-group">
          <label className="form-label">Private Key (Password)</label>
          <input className="form-input" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="Your secret key" />
        </div>
        <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={handle} disabled={loading}>
          {loading ? '...' : tab==='login' ? '→ ACCESS SYSTEM' : '+ CREATE ACCOUNT'}
        </button>

        <div style={{marginTop:20, padding:'12px', background:'rgba(0,212,255,0.05)', borderRadius:6, border:'1px solid rgba(0,212,255,0.1)'}}>
          <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>QUICK DEMO ACCOUNTS</div>
          {[['Inspector Ayesha','ayesha_key_001'],['Analyst Bilal','bilal_key_002'],['Supervisor Tariq','tariq_key_003']].map(([n,k])=>(
            <div key={n} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)'}}>{n}</span>
              <button className="btn btn-outline" style={{padding:'2px 10px',fontSize:10}} onClick={()=>{setName(n);setKey(k);setTab('register')}}>USE</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
