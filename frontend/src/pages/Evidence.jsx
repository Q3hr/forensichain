import { useState, useEffect } from 'react'
import api from '../api'

export default function Evidence({ user }) {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ evidence_id:'', name:'', description:'', file_hash:'', private_key:'' })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const load = async () => { const r = await api.get('/evidence'); setList(r.data) }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function register() {
    if (!form.evidence_id || !form.name || !form.file_hash || !form.private_key)
      return setMsg({ type:'error', text:'Fill all required fields.' })
    setLoading(true); setMsg(null); setResult(null)
    try {
      const r = await api.post('/evidence/register', { ...form, investigator_name: user.name })
      setResult(r.data)
      setMsg({ type:'success', text:`Evidence "${form.name}" registered on block #${r.data.block.index}` })
      setForm({ evidence_id:'', name:'', description:'', file_hash:'', private_key:'' })
      load()
    } catch (e) {
      setMsg({ type:'error', text: e.response?.data?.detail || 'Error' })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Evidence Vault <span className="tag">IMMUTABLE</span></div>
        <div className="page-subtitle">Register digital evidence with cryptographic file hashes. All registrations are signed and stored on-chain.</div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-title">Register Evidence</div>
            {msg && <div className={`alert alert-${msg.type==='error'?'error':'success'}`}>{msg.text}</div>}
            {[
              ['evidence_id','Evidence ID','e.g. EVD-2025-001','text'],
              ['name','Evidence Name','e.g. Suspect Laptop SSD Image','text'],
              ['description','Description','Details about this evidence item','text'],
              ['file_hash','File Hash (SHA-256)','Paste the hash of the evidence file','text'],
              ['private_key','Your Private Key','To sign this registration','password'],
            ].map(([k,l,p,t]) => (
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input className="form-input" type={t} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} />
              </div>
            ))}
            <div style={{marginBottom:16,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',background:'rgba(0,212,255,0.04)',padding:10,borderRadius:6,border:'1px solid var(--border)'}}>
              Transaction = "{user.name} registers evidence [ID] with hash [HASH]"<br/>
              Signature = SHA256(SHA256(transaction) + private_key)
            </div>
            <button className="btn btn-success" onClick={register} disabled={loading}>
              {loading ? '...' : '🔏 SIGN & REGISTER'}
            </button>
          </div>

          {result && (
            <div className="card">
              <div className="card-title">Registration Result</div>
              <div style={{marginBottom:8}}>
                <div className="form-label">Transaction</div>
                <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text)',wordBreak:'break-all'}}>{result.block?.data?.transaction}</div>
              </div>
              <div style={{marginBottom:8}}>
                <div className="form-label">Digital Signature</div>
                <div className="hash" style={{maxWidth:'100%',color:'var(--accent3)'}}>{result.signature}</div>
              </div>
              <div>
                <div className="form-label">Block Hash</div>
                <div className="hash" style={{maxWidth:'100%',color:'var(--accent)'}}>{result.block?.hash}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Evidence Items ({list.length})</div>
          {list.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🗂</div>No evidence registered yet.</div>
          ) : list.map(ev => (
            <div key={ev.id} style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <div>
                  <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)',background:'rgba(0,212,255,0.1)',padding:'1px 8px',borderRadius:4}}>{ev.id}</span>
                  <span style={{fontFamily:'var(--heading)',fontWeight:700,fontSize:14,marginLeft:10}}>{ev.name}</span>
                </div>
              </div>
              {ev.description && <div style={{fontSize:12,color:'var(--muted)',marginBottom:6}}>{ev.description}</div>}
              <div className="form-label" style={{marginBottom:2}}>File Hash</div>
              <div className="hash" style={{maxWidth:'100%',color:'var(--accent3)'}}>{ev.file_hash}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginTop:6}}>
                By: {ev.registered_by} | {ev.registered_at?.slice(0,19).replace('T',' ')} UTC
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
