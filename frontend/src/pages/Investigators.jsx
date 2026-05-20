import { useState, useEffect } from 'react'
import api from '../api'

export default function Investigators({ user }) {
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const r = await api.get('/investigators')
    setList(r.data)
  }
  useEffect(() => { load() }, [])

  async function create() {
    if (!name || !key) return setMsg({ type: 'error', text: 'Fill all fields.' })
    setLoading(true); setMsg(null)
    try {
      const r = await api.post('/investigators/create', { name, private_key: key })
      setMsg({ type: 'success', text: `Investigator "${name}" registered on block #${r.data.block.index}` })
      setName(''); setKey('')
      load()
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.detail || 'Error' })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Investigators <span className="tag">WALLETS</span></div>
        <div className="page-subtitle">Each investigator has a cryptographic identity — name, private key, and a derived public key.</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Register New Investigator</div>
          {msg && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Inspector Ayesha Khan" />
          </div>
          <div className="form-group">
            <label className="form-label">Private Key</label>
            <input className="form-input" value={key} onChange={e=>setKey(e.target.value)} placeholder="Secret key (used for signing)" />
          </div>
          <div style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)',borderRadius:6,padding:12,marginBottom:16,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)'}}>
            Public key = SHA-256(private_key)<br/>
            This is the simplified model from the lab manual.
          </div>
          {key && (
            <div style={{marginBottom:16}}>
              <div className="form-label">Derived Public Key (preview)</div>
              <div className="hash" style={{maxWidth:'100%',color:'var(--accent3)'}}>{[...key].reduce((h,c)=>h+c.charCodeAt(0).toString(16),'').padEnd(64,'0').slice(0,64)}</div>
            </div>
          )}
          <button className="btn btn-primary" onClick={create} disabled={loading}>
            {loading ? '...' : '+ REGISTER INVESTIGATOR'}
          </button>
        </div>

        <div className="card">
          <div className="card-title">Registered Investigators ({list.length})</div>
          {list.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👤</div>No investigators yet.</div>
          ) : list.map(inv => (
            <div key={inv.name} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontFamily:'var(--heading)',fontWeight:700,fontSize:15}}>{inv.name}</div>
                <span className={`badge ${inv.name === user.name ? 'badge-success' : 'badge-info'}`}>
                  {inv.name === user.name ? 'YOU' : 'ACTIVE'}
                </span>
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginBottom:2}}>PUBLIC KEY</div>
              <div className="hash" style={{maxWidth:'100%',color:'var(--accent)'}}>{inv.public_key}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginTop:6}}>
                Registered: {inv.created_at?.slice(0,19).replace('T',' ')} UTC
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
