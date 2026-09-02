import React from 'react'

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <table className={`w-full text-left border-collapse text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <thead className={`bg-slate-50/80 border-b border-slate-200/80 ${className}`}>{children}</thead>
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>
}

export function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-slate-50/80 transition-colors ${className}`}>{children}</tr>
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`p-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${className}`}>{children}</th>
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-4 text-slate-700 font-medium ${className}`}>{children}</td>
}
