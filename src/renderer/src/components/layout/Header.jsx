import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/immobili': 'Immobili',
  '/spese': 'Spese & Bollette',
  '/affitti': 'Affitti & Contratti',
  '/inquilini': 'Inquilini',
  '/report': 'Report',
  '/alert': 'Alert & Scadenze'
}

export default function Header({ onToggleSidebar, alertCount }) {
  const { pathname } = useLocation()
  const baseRoute = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[baseRoute] || 'Immobili Manager'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0">
      <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-800 transition-colors">
        <Menu size={20} />
      </button>
      <h1 className="font-semibold text-slate-800 text-lg">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <Link to="/alert" className="relative text-slate-500 hover:text-slate-800">
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-4 h-4 flex items-center justify-center px-0.5">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
