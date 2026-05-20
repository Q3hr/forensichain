import { useState, useEffect } from 'react'
import api from '../api'

export default function DHExchange({ user }) {
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState({ p:29, g:3, private_key_a:4 })
  const [respForm, setRespForm] = useState({ session_id:'', private_key_b:7 })
  const [step, setStep] = useState(null)
  const [result, setResult] = useState(null)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try { const r = await api.get('/dh/sessions'); setSessions(r.data) } catch {}
  }
  useEffect(() => { load() }, [])

  async function initiate() {
    setLoading(true); setMsg(null)
    try {
      const r = await api.post('/dh/initiate', { initiator: user.name, ...form, private_key_a: Number(form.private_key_a), p: Number(form.p), g: Number(form.g) })
      setStep(r.data)
      setRespForm(f => ({ ...f, session_id: r.data.session_id }))
      setMsg({ type:'success', text:`Session ${r.data.session_id} initiated. Now have Bob respond below.` })
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.detail||'Error' }) }
    setLoading(false)
  }

  async function respond() {
    setLoading(true); setMsg(null)
    try {
      const r = await api.post('/dh/respond', { session_id: respForm.session_id, private_key_b: Number(respForm.private_key_b) })
      setResult(r.data)
      setMsg({ type:'success', text: r.data.match ? '✓ Secure channel established! Both parties computed the same shared key.' : '✗ Key mismatch.' })
      load()
    } catch(e) { setMsg({ type:'error', text: e.response?.data?.detail||'Error' }) }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">DH Key Exchange <span className="tag">SECURE</span></div>
        <div className="page-subtitle">Diffie-Hellman key exchange establishes a secure channel between two investigators before sharing sensitive case data.</div>
      </div>

      {msg && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}

      <div style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)',borderRadius:8,padding:16,marginBottom:20,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',lineHeight:1.8}}>
        <b style={{color:'var(--accent)'}}>How it works:</b><br/>
        Public values (p, g) are shared openly. Alice picks private key <i>a</i>, Bob picks private key <i>b</i>.<br/>
        Alice sends A = g^a mod p → Bob computes shared = A^b mod p<br/>
        Bob sends B = g^b mod p → Alice computes shared = B^a mod p<br/>
        Both arrive at the same shared secret — without ever sharing their private keys!
      </div>

      <div className="grid-2" style={{marginBottom:24}}>
        <div className="card">
          <div className="card-title">Step 1 — Alice Initiates</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
            {[['p','Prime (p)',29],['g','Base (g)',3],['private_key_a',"Alice's Private Key (a)",4]].map(([k,l,def])=>(
              <div key={k}>
                <label className="form-label">{l}</label>
                <input className="form-input" type="number" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
          {form.private_key_a && form.p && form.g && (
            <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:6,padding:12,marginBottom:16,fontFamily:'var(--mono)',fontSize:12}}>
              A = {form.g}^{form.private_key_a} mod {form.p} = <span style={{color:'var(--accent3)'}}>{Math.pow(Number(form.g),Number(form.private_key_a)) % Number(form.p)}</span>
            </div>
          )}
          <button className="btn btn-primary" onClick={initiate} disabled={loading}>
            {loading?'...':'→ INITIATE SESSION'}
          </button>
          {step && (
            <div style={{marginTop:16,padding:12,background:'rgba(0,212,255,0.05)',borderRadius:6,border:'1px solid rgba(0,212,255,0.2)'}}>
              <div className="form-label" style={{marginBottom:4}}>Session ID</div>
              <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--accent)',wordBreak:'break-all'}}>{step.session_id}</div>
              <div style={{marginTop:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)'}}>
                Public values: p={step.p}, g={step.g}, A={step.a_public}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Step 2 — Bob Responds</div>
          <div className="form-group">
            <label className="form-label">Session ID</label>
            <input className="form-input" value={respForm.session_id} onChange={e=>setRespForm(f=>({...f,session_id:e.target.value}))} placeholder="Paste session ID from Alice" />
          </div>
          <div className="form-group">
            <label className="form-label">Bob's Private Key (b)</label>
            <input className="form-input" type="number" value={respForm.private_key_b} onChange={e=>setRespForm(f=>({...f,private_key_b:e.target.value}))} />
          </div>
          <button className="btn btn-success" onClick={respond} disabled={loading}>
            {loading?'...':'🔐 RESPOND & COMPUTE'}
          </button>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="card-title">Key Exchange Result</div>
          <div className="dh-visual">
            <div className="dh-party">
              <div className="dh-party-name">🔍 Alice (Initiator)</div>
              <div className="dh-value"><span className="dh-value-label">Private (a)</span><span className="dh-value-val">{result.a_public !== undefined ? form.private_key_a : '?'}</span></div>
              <div className="dh-value"><span className="dh-value-label">Public (A)</span><span className="dh-value-val">{result.a_public}</span></div>
              <div className="dh-value"><span className="dh-value-label">Computed Shared</span><span className="dh-value-val" style={{color:'var(--accent3)'}}>{result.a_shared_key}</span></div>
              <div style={{marginTop:12,fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)'}}>
                S = B^a mod p<br/>= {result.b_public}^{form.private_key_a} mod {result.p}
              </div>
            </div>

            <div className="dh-arrow">
              <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)'}}>PUBLIC VALUES</div>
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)'}}>p={result.p}, g={result.g}</div>
              <div className="dh-arrow-line" style={{margin:'8px auto'}}/>
              <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)'}}>SHARED KEY</div>
              <div style={{fontSize:24,color: result.match ? 'var(--accent3)':'var(--danger)'}}>
                {result.match ? '✓' : '✗'}
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:13,color: result.match?'var(--accent3)':'var(--danger)',fontWeight:'bold'}}>
                {result.a_shared_key}
              </div>
              {result.match && <span className="badge badge-success" style={{marginTop:4}}>SECURE CHANNEL</span>}
            </div>

            <div className="dh-party">
              <div className="dh-party-name">🔬 Bob (Responder)</div>
              <div className="dh-value"><span className="dh-value-label">Private (b)</span><span className="dh-value-val">{respForm.private_key_b}</span></div>
              <div className="dh-value"><span className="dh-value-label">Public (B)</span><span className="dh-value-val">{result.b_public}</span></div>
              <div className="dh-value"><span className="dh-value-label">Computed Shared</span><span className="dh-value-val" style={{color:'var(--accent3)'}}>{result.b_shared_key}</span></div>
              <div style={{marginTop:12,fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)'}}>
                S = A^b mod p<br/>= {result.a_public}^{respForm.private_key_b} mod {result.p}
              </div>
            </div>
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="card" style={{marginTop:20}}>
          <div className="card-title">All DH Sessions</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Session ID</th><th>Initiator</th><th>p</th><th>g</th><th>A_public</th><th>B_public</th><th>Shared</th><th>Status</th></tr>
              </thead>
              <tbody>
                {sessions.map(s=>(
                  <tr key={s.session_id}>
                    <td><span className="hash">{s.session_id}</span></td>
                    <td>{s.initiator}</td>
                    <td style={{fontFamily:'var(--mono)'}}>{s.p}</td>
                    <td style={{fontFamily:'var(--mono)'}}>{s.g}</td>
                    <td style={{fontFamily:'var(--mono)',color:'var(--accent)'}}>{s.a_public}</td>
                    <td style={{fontFamily:'var(--mono)',color:'var(--accent)'}}>{s.b_public||'—'}</td>
                    <td style={{fontFamily:'var(--mono)',color:'var(--accent3)'}}>{s.a_shared||'—'}</td>
                    <td><span className={`badge ${s.status==='ESTABLISHED'?'badge-success':s.status==='FAILED'?'badge-danger':'badge-warn'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
