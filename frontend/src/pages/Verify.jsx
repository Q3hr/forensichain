import { useState, useEffect } from 'react'
import api from '../api'

export default function Verify() {
  const [chain, setChain] = useState([])
  const [form, setForm] = useState({ transaction:'', signature:'', public_key:'' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)

  useEffect(() => {
    async function load() {
      const chainR = await api.get('/blockchain')
      setChain(chainR.data.chain.filter(b => b.data?.signature))
    }
    load()
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  function fillFromBlock(b) {
    setForm(f => ({ ...f, transaction: b.data?.transaction||'', signature: b.data?.signature||'' }))
    setSelectedBlock(b.index)
    setResult(null)
  }

  async function verify() {
    if (!form.transaction || !form.signature || !form.public_key)
      return
    setLoading(true)
    try {
      const r = await api.post('/verify', {
        transaction: form.transaction,
        signature: form.signature,
        private_key: form.public_key
      })
      setResult(r.data)
    } catch {}
    setLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Signature Verifier <span className="tag">CRYPTOGRAPHIC</span></div>
        <div className="page-subtitle">Verify any transaction signature using an investigator's private key. Court-admissible proof of authenticity.</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Verify a Signature</div>

          <div className="form-group">
            <label className="form-label">Private Key (used to verify)</label>
            <input className="form-input" type="password" value={form.public_key} onChange={e=>set('public_key',e.target.value)} placeholder="Enter the investigator's private key" />
          </div>

          <div className="form-group">
            <label className="form-label">Transaction String</label>
            <textarea className="form-textarea" value={form.transaction} onChange={e=>set('transaction',e.target.value)} placeholder="Paste the full transaction string or click a block on the right..." />
          </div>

          <div className="form-group">
            <label className="form-label">Signature</label>
            <input className="form-input" value={form.signature} onChange={e=>set('signature',e.target.value)} placeholder="Paste the SHA-256 signature hash" />
          </div>

          <button className="btn btn-primary" onClick={verify} disabled={loading} style={{width:'100%',justifyContent:'center'}}>
            {loading ? '...' : '🔍 VERIFY SIGNATURE'}
          </button>

          {result && (
            <div style={{marginTop:20,padding:20,borderRadius:8,textAlign:'center',
              background: result.valid ? 'rgba(0,255,157,0.08)':'rgba(255,59,92,0.08)',
              border: `1px solid ${result.valid?'rgba(0,255,157,0.3)':'rgba(255,59,92,0.3)'}`
            }}>
              <div style={{fontSize:40,marginBottom:8}}>{result.valid ? '✅' : '❌'}</div>
              <div style={{fontFamily:'var(--heading)',fontWeight:900,fontSize:22,
                color: result.valid ? 'var(--accent3)':'var(--danger)'
              }}>
                {result.valid ? 'SIGNATURE VALID' : 'SIGNATURE INVALID'}
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',marginTop:8}}>
                {result.valid
                  ? 'This transaction was genuinely signed by the claimed investigator.'
                  : 'Signature does not match. Transaction may be forged or tampered.'}
              </div>
            </div>
          )}

          <div style={{marginTop:16,padding:12,background:'rgba(0,212,255,0.04)',borderRadius:6,border:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',lineHeight:1.8}}>
            <b style={{color:'var(--accent)'}}>Verification Logic:</b><br/>
            tx_hash = SHA256(transaction)<br/>
            expected = SHA256(tx_hash + private_key)<br/>
            valid = (expected == signature)
          </div>
        </div>

        <div className="card">
          <div className="card-title">Signed Blocks (click to fill)</div>
          {chain.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔏</div>No signed blocks yet.</div>
          ) : (
            <div style={{maxHeight:580,overflowY:'auto'}}>
              {[...chain].reverse().map(b => (
                <div
                  key={b.index}
                  onClick={() => fillFromBlock(b)}
                  style={{
                    padding:'12px',marginBottom:8,borderRadius:6,cursor:'pointer',
                    border: selectedBlock===b.index ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selectedBlock===b.index ? 'rgba(0,212,255,0.06)' : 'var(--bg)',
                    transition:'all 0.15s'
                  }}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--accent)'}}>#{b.index}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)'}}>{b.data?.type}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text)',marginBottom:4,wordBreak:'break-word'}}>
                    {b.data?.transaction?.slice(0,80)}{b.data?.transaction?.length > 80 ? '...' : ''}
                  </div>
                  <div className="hash">SIG: {b.data?.signature}</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:9,color:'var(--muted)',marginTop:4}}>
                    By: {b.data?.investigator || b.data?.registered_by || b.data?.name}
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