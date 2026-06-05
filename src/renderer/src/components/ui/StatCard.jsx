import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, sub, icon: Icon, color = 'blue', onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div
      className={clsx('card flex items-center gap-4', onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
      onClick={onClick}
    >
      {Icon && (
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colors[color])}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
