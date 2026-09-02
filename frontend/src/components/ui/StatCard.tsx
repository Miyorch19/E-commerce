import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './Card'

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: string
    type: 'up' | 'down' | 'neutral'
  }
  isHero?: boolean
  className?: string
  style?: React.CSSProperties
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isHero = false,
  className = '',
  style,
}: StatCardProps) {
  if (isHero) {
    return (
      <div
        style={style}
        className={`bg-slate-900 text-white rounded-xl p-6 shadow-xs border border-slate-800/90 ring-1 ring-black/5 hover:scale-[1.01] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="p-2.5 rounded-full bg-white/10 text-white border border-white/15">
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-2">
          <span className="text-4xl font-bold tracking-tight text-white">{value}</span>
          {trend && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 inline-flex items-center gap-1 backdrop-blur-xs">
              {trend.type === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
              {trend.type === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
              {trend.type === 'neutral' && <Minus className="w-3 h-3 text-white/70" />}
              {trend.value}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-slate-400 mt-3 font-medium">{description}</p>
        )}
      </div>
    )
  }

  return (
    <Card hoverable style={style} className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-l-2 border-slate-300 pl-2">
          {title}
        </span>
        <div className="p-2.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80">
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-4xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
              trend.type === 'up'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : trend.type === 'down'
                ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                : 'bg-slate-100/90 text-slate-600 border border-slate-200/80'
            }`}
          >
            {trend.type === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
            {trend.type === 'down' && <TrendingDown className="w-3 h-3 text-rose-600" />}
            {trend.type === 'neutral' && <Minus className="w-3 h-3 text-slate-400" />}
            {trend.value}
          </span>
        )}
      </div>

      {description && <p className="text-xs text-slate-500 mt-3 font-medium">{description}</p>}
    </Card>
  )
}
