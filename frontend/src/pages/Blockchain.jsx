import { useState, useEffect } from 'react'
import api from '../api'

const TYPE_COLOR = {
  ACCESS_LOG:'var(--accent)',
  EVIDENCE_REGISTERED:'var(--accent3)',
  INVESTIGATOR_REGISTERED:'var(--warn)',
  DH_KEY_EXCHANGE:'#a78bfa'
}

export default function Blockchain() {
  const [chain, setChain] = useState([])
  const [tampered, setTampered] = useState([])
  const [valid, setValid] = useState(true)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    const r = await api.get('/blockchain')
    setChain([...r.data.chain].reverse())
    setTampered(r.data.tampered_indices)
    setValid(r.data.is_valid)
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load,5000); return ()=>clearInterval(t) }, [])

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div className="page-title">Blockchain <span className="tag">{valid?'VALID':'TAMPERED'}</span></div>
            <div className="page-subtitle">Immutable chain of all forensic events. Each block is cryptographically linked to the previous one.</div>
          </div>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <span className={`badge ${valid?'badge-success':'badge-danger'}`} style={{fontSize:12,padding:'6px 14px'}}>
              {valid ? '✓ CHAIN INTEGRITY OK' : '✗ TAMPERING DETECTED'}
            </span>
            <button className="btn btn-outline" onClick={load}>↻ REFRESH</button>
          </div>
        </div>
      </div>

      {!valid && (
        <div className="alert alert-error">
          ⚠ Tampered blocks detected at indices: {tampered.join(', ')}. Evidence chain integrity is compromised.
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"/>Loading blockchain...</div>
      ) : chain.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-icon">⛓</div>No blocks yet.</div></div>
      ) : (
        <div className="block-chain">
          {chain.map((b,i) => {
            const isOpen = expanded === b.index
            const isTampered = tampered.includes(b.index)
            return (
              <div key={b.index}>
                <div className={`block-item ${isTampered?'tampered':''}`} onClick={()=>setExpanded(isOpen?null:b.index)} style={{cursor:'pointer'}}>
                  <div className="block-header">
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <span className="block-index">BLOCK #{b.index}</span>
                      <span className="badge" style={{
                        color: TYPE_COLOR[b.data?.type]||'var(--muted)',
                        background:`${TYPE_COLOR[b.data?.type]}18`,
                        border:`1px solid ${TYPE_COLOR[b.data?.type]}44`,
                        fontSize:9
                      }}>{b.data?.type}</span>
                      {isTampered && <span className="badge badge-danger">TAMPERED</span>}
                    </div>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <span className="block-time">{b.timestamp?.slice(0,19).replace('T',' ')} UTC</span>
                      <span style={{color:'var(--muted)',fontSize:12}}>{isOpen?'▲':'▼'}</span>
                    </div>
                  </div>

                  <div style={{display:'flex',gap:12,fontSize:12,color:'var(--muted)'}}>
                    {b.data?.investigator && <span>By: <b style={{color:'var(--text)'}}>{b.data.investigator}</b></span>}
                    {b.data?.name && <span>Name: <b style={{color:'var(--text)'}}>{b.data.name}</b></span>}
                    {b.data?.evidence_id && <span>Evidence: <b style={{color:'var(--text)'}}>{b.data.evidence_id}</b></span>}
                    {b.data?.action && <span>Action: <b style={{color: TYPE_COLOR.ACCESS_LOG}}>{b.data.action}</b></span>}
                    {b.data?.secure_channel !== undefined && <span>Secure Channel: <b style={{color: b.data.secure_channel?'var(--accent3)':'var(--danger)'}}>{b.data.secure_channel?'ESTABLISHED':'FAILED'}</b></span>}
                  </div>

                  {isOpen && (
                    <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
                      <div className="block-hashes">
                        <div className="hash-row">
                          <span className="hash-label">PREV</span>
                          <span className="hash" style={{color:'var(--muted)'}}>{b.previous_hash}</span>
                        </div>
                        <div className="hash-row">
                          <span className="hash-label">HASH</span>
                          <span className="hash" style={{color:'var(--accent)'}}>{b.hash}</span>
                        </div>
                        {b.data?.signature && (
                          <div className="hash-row">
                            <span className="hash-label">SIG</span>
                            <span className="hash" style={{color:'var(--accent3)'}}>{b.data.signature}</span>
                          </div>
                        )}
                        {b.data?.public_key && (
                          <div className="hash-row">
                            <span className="hash-label">PUB KEY</span>
                            <span className="hash" style={{color:'var(--warn)'}}>{b.data.public_key}</span>
                          </div>
                        )}
                      </div>
                      {b.data?.notes && (
                        <div style={{marginTop:10,fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)'}}>Notes: "{b.data.notes}"</div>
                      )}
                    </div>
                  )}
                </div>
                {i < chain.length - 1 && <div className="block-connector"/>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
