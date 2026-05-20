import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Investigators from './pages/Investigators'
import Evidence from './pages/Evidence'
import AccessLog from './pages/AccessLog'
import Blockchain from './pages/Blockchain'
import DHExchange from './pages/DHExchange'
import Verify from './pages/Verify'

const PAGES = {
  dashboard: Dashboard,
  investigators: Investigators,
  evidence: Evidence,
  accesslog: AccessLog,
  blockchain: Blockchain,
  dh: DHExchange,
  verify: Verify,
}

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')

  if (!user) return <Login onLogin={setUser} />

  const Page = PAGES[page] || Dashboard

  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />
      <main className="main-content">
        <Page user={user} />
      </main>
    </div>
  )
}

function Sidebar({ user, page, setPage, onLogout }) {
  const nav = [
    { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
    { id: 'investigators', icon: '👤', label: 'Investigators' },
    { id: 'evidence', icon: '🗂', label: 'Evidence Vault' },
    { id: 'accesslog', icon: '📋', label: 'Access Log' },
    { id: 'blockchain', icon: '⛓', label: 'Blockchain' },
    { id: 'dh', icon: '🔐', label: 'DH Key Exchange' },
    { id: 'verify', icon: '✓', label: 'Verify Signature' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon">⛓</div>
          <div>
            <div className="logo-text">FORENSI</div>
            <div className="logo-sub">CHAIN v1.0</div>
          </div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-label">Active Investigator</div>
        <div className="user-name">{user.name}</div>
        <div style={{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--muted)',marginTop:2}}>
          PUB: {user.public_key?.slice(0,16)}...
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {nav.map(n => (
          <div
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="chain-status">
          <span className="dot" />
          CHAIN ONLINE
        </div>
        <div style={{marginTop:12}}>
          <button className="btn btn-outline" style={{width:'100%',fontSize:11}} onClick={onLogout}>
            ⎋ LOGOUT
          </button>
        </div>
      </div>
    </aside>
  )
}
