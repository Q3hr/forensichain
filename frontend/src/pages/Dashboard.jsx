import { useState, useEffect } from 'react'
import api from '../api'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({ blocks: 0, investigators: 0, evidence: 0, valid: true })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [chain, invs, evs] = await Promise.all([
          api.get('/blockchain'),
          api.get('/investigators'),
          api.get('/evidence')
        ])
        setStats({
          blocks: chain.data.length,
          investigators: invs.data.length,
          evidence: evs.data.length,
          valid: chain.data.is_valid
        })
        setRecent(chain.data.chain.slice(-5).reverse())
      } catch {}
      setLoading(false)
    }
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  const typeColor = { ACCESS_LOG:'var(--accent)',EVIDENCE_REGISTERED:'var(--accent3)',INVESTIGATOR_REGISTERED:'var(--warn)',DH_KEY_EXCHANGE:'#a78bfa' }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          Dashboard <span className="tag">LIVE</span>
        </div>
        <div className="page-subtitle">Forensic Investigator Identity & Access Ledger — Real-time overview</div>
      </div>

      <div className="grid-4" style={{marginBottom:24}}>
        {[
          { label:'Total Blocks', value: stats.blocks, sub:'On-chain records', color:'rgba(0,212,255,0.2)' },
          { label:'Investigators', value: stats.investigators, sub:'Registered identities', color:'rgba(0,255,157,0.2)' },
          { label:'Evidence Items', value: stats.evidence, sub:'In the vault', color:'rgba(167,139,250,0.2)' },
          { label:'Chain Status', value: stats.valid ? '✓ VALID' : '✗ TAMPERED', sub: stats.valid ? 'All hashes match' : 'Integrity breach!', color: stats.valid ? 'rgba(0,255,157,0.15)' : 'rgba(255,59,92,0.15)' }
        ].map(s => (
          <div className="stat-card" key={s.label} style={{'--accent-color': s.color}}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{fontSize: typeof s.value === 'string' ? 20 : 36, color: s.label==='Chain Status' ? (stats.valid ? 'var(--accent3)' : 'var(--danger)') : 'var(--text)'}}>{loading ? '—' : s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Recent Blocks</div>
          {loading ? <div className="loading"><div className="spinner" /> Loading chain...</div> : recent.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">⛓</div>No blocks yet. Register an investigator to begin.</div>
          ) : recent.map(b => (
            <div key={b.index} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)',minWidth:28}}>#{b.index}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span className="badge badge-info" style={{color: typeColor[b.data?.type] || 'var(--accent)',fontSize:9}}>{b.data?.type}</span>
                </div>
                <div className="hash">HASH: {b.hash}</div>
                <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginTop:2}}>{b.timestamp?.slice(0,19).replace('T',' ')} UTC</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">How It Works</div>
          {[
            ['1','Register Investigator','Each investigator gets a wallet: name + private key → public key via SHA-256.'],
            ['2','Register Evidence','Evidence items are hashed and stored. The action is signed with your private key.'],
            ['3','Log Access','Every time you access evidence, a signed transaction is created and added to the chain.'],
            ['4','DH Key Exchange','Two investigators establish a secure channel using Diffie-Hellman before sharing sensitive data.'],
            ['5','Verify Signatures','Any signature can be verified using the investigator\'s public key — courtroom-ready.'],
          ].map(([n, title, desc]) => (
            <div key={n} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(0,212,255,0.15)',border:'1px solid var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:11,color:'var(--accent)',flexShrink:0}}>{n}</div>
              <div>
                <div style={{fontFamily:'var(--heading)',fontWeight:700,fontSize:13,marginBottom:3}}>{title}</div>
                <div style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
