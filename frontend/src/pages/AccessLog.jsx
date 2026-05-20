import { useState, useEffect } from 'react'
import api from '../api'

const ACTIONS = ['VIEW','ANALYZE','TRANSFER','SEAL','EXPORT','HASH_CHECK']
const ACTION_COLOR = { VIEW:'var(--accent)',ANALYZE:'var(--accent3)',TRANSFER:'var(--warn)',SEAL:'#a78bfa',EXPORT:'#fb923c',HASH_CHECK:'var(--muted)' }

export default function AccessLog({ user }) {
  const [evidence, setEvidence] = useState([])
  const [logs, setLogs] = useState([])
  const [form, setForm] = useState({ evidence_id:'', action:'VIEW', notes:'', private_key:'' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const load = async () => {
    const [ev, chain] = await Promise.all([api.get('/evidence'), api.get('/blockchain')])
    setEvidence(ev.data)
    setLogs(chain.data.chain.filter(b => b.data?.type === 'ACCESS_LOG').reverse())
  }
  useEffect(() => { load() }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  async function logAccess() {
    if (!form.evidence_id || !form.private_key) return setMsg({ type:'error', text:'Select evidence and enter your private key.' })
    setLoading(true); setMsg(null); setResult(null)
    try {
      const r = await api.post('/access/log', { ...form, investigator_name: user.name })
      setResult(r.data)
      setMsg({ type:'success', text:`Access logged on block #${r.data.block?.index}` })
      setForm(f=>({...f, notes:'', private_key:''}))
      load()
    } catch(e) {
      setMsg({ type:'error', text: e.response?.data?.detail || 'Error' })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Access Log <span className="tag">SIGNED</span></div>
        <div className="page-subtitle">Every access to evidence is cryptographically signed and permanently recorded on the blockchain.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Log Evidence Access</div>
            {msg && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}

            <div className="form-group">
              <label className="form-label">Select Evidence</label>
              <select className="form-select" value={form.evidence_id} onChange={e=>set('evidence_id',e.target.value)}>
                <option value="">— Choose evidence item —</option>
                {evidence.map(ev => <option key={ev.id} value={ev.id}>{ev.id} — {ev.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Action Type</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                {ACTIONS.map(a => (
                  <div key={a}
                    onClick={() => set('action',a)}
                    style={{
                      padding:'8px',textAlign:'center',borderRadius:6,cursor:'pointer',
                      fontFamily:'var(--mono)',fontSize:10,letterSpacing:1,
                      border: form.action===a ? `1px solid ${ACTION_COLOR[a]}` : '1px solid var(--border)',
                      background: form.action===a ? `${ACTION_COLOR[a]}18` : 'var(--bg)',
                      color: form.action===a ? ACTION_COLOR[a] : 'var(--muted)',
                      transition:'all 0.15s'
                    }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="e.g. Examined drive for deleted partitions..." />
            </div>

            <div className="form-group">
              <label className="form-label">Your Private Key (to sign)</label>
              <input className="form-input" type="password" value={form.private_key} onChange={e=>set('private_key',e.target.value)} placeholder="Secret key" />
            </div>

            <button className="btn btn-primary" onClick={logAccess} disabled={loading} style={{width:'100%',justifyContent:'center'}}>
              {loading ? '...' : '📋 SIGN & LOG ACCESS'}
            </button>
          </div>

          {result && (
            <div className="card">
              <div className="card-title">Signed Transaction</div>
              <div style={{marginBottom:10}}>
                <div className="form-label">Transaction String</div>
                <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text)',wordBreak:'break-all',lineHeight:1.6}}>{result.transaction}</div>
              </div>
              <div style={{marginBottom:10}}>
                <div className="form-label">Signature</div>
                <div className="hash" style={{maxWidth:'100%',color:'var(--accent)'}}>{result.signature}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div className="form-label" style={{marginBottom:0}}>Verification:</div>
                <span className={`badge ${result.verified ? 'badge-success':'badge-danger'}`}>
                  {result.verified ? '✓ VALID' : '✗ INVALID'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Access History ({logs.length})</div>
          {logs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div>No access logs yet.</div>
          ) : (
            <div style={{maxHeight:600,overflowY:'auto'}}>
              {logs.map(b => (
                <div key={b.index} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)'}}>#{b.index}</span>
                      <span className="badge" style={{color: ACTION_COLOR[b.data?.action]||'var(--muted)',background:`${ACTION_COLOR[b.data?.action]}18`,border:`1px solid ${ACTION_COLOR[b.data?.action]}44`,fontSize:9}}>
                        {b.data?.action}
                      </span>
                    </div>
                    <span className={`badge ${b.data?.verified ? 'badge-success':'badge-danger'}`} style={{fontSize:9}}>
                      {b.data?.verified ? '✓ VERIFIED' : '✗ FAILED'}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:12}}>
                    <span><span style={{color:'var(--muted)'}}>By:</span> <b>{b.data?.investigator}</b></span>
                    <span><span style={{color:'var(--muted)'}}>Evidence:</span> <b>{b.data?.evidence_id}</b></span>
                  </div>
                  {b.data?.notes && <div style={{fontSize:11,color:'var(--muted)',marginTop:4,fontStyle:'italic'}}>"{b.data.notes}"</div>}
                  <div className="hash" style={{marginTop:6}}>SIG: {b.data?.signature}</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginTop:3}}>
                    {b.timestamp?.slice(0,19).replace('T',' ')} UTC
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
