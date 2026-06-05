import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Receipt, Home, Users,
  BarChart2, Bell, HardDrive, TrendingUp
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/immobili',   icon: Building2,       label: 'Immobili' },
  { to: '/spese',      icon: Receipt,         label: 'Spese & Bollette' },
  { to: '/affitti',    icon: Home,            label: 'Affitti & Contratti' },
  { to: '/inquilini',  icon: Users,           label: 'Inquilini' },
  { to: '/grafici',    icon: TrendingUp,      label: 'Grafici consumi' },
  { to: '/report',     icon: BarChart2,       label: 'Report export' },
  { to: '/backup',     icon: HardDrive,       label: 'Backup & Dati' },
]

export default function Sidebar({ open, alertCount }) {
  return (
    <aside className={clsx(
      'bg-slate-900 text-white flex flex-col transition-all duration-200 shrink-0',
      open ? 'w-56' : 'w-16'
    )}>
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <Building2 className="shrink-0 text-blue-400" size={22} />
        {open && <span className="ml-3 font-bold text-sm tracking-wide">Immobili Manager</span>}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}>
            <Icon size={18} className="shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}

        <NavLink to="/alert" className={({ isActive }) => clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
          isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        )}>
          <Bell size={18} className="shrink-0" />
          {open && <span>Alert & Scadenze</span>}
          {alertCount > 0 && (
            <span className={clsx(
              'absolute bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center',
              open ? 'right-2 top-2 min-w-5 h-5 px-1' : 'right-1 top-1 min-w-4 h-4 text-[10px]'
            )}>
              {alertCount > 99 ? '99+' : alertCount}
            </span>
          )}
        </NavLink>
      </nav>

      <div className="p-3 border-t border-slate-700 shrink-0">
        {open && <p className="text-xs text-slate-500 text-center">v1.0.0</p>}
      </div>
    </aside>
  )
}
