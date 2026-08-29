import type { ReactNode } from 'react';
import { ApiError } from '../../lib/api';
import { Spinner } from '../../components/ui';

export function AdminError({ error }: { error: unknown }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {error instanceof ApiError ? error.message : String(error)}
    </div>
  );
}

export function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
      <Spinner className="h-4 w-4" /> {label}
    </div>
  );
}

export function EmptyBlock({ label = 'Nothing here yet' }: { label?: string }) {
  return <div className="py-10 text-center text-sm text-slate-400">{label}</div>;
}

export function SearchBox({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input className="input input-sm w-full sm:w-64" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  );
}

export function PaginationControls({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
        <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function StatCard({ label, value, diff, color = 'primary' }: { label: string; value: ReactNode; diff?: string; color?: 'primary' | 'green' | 'amber' | 'red' }) {
  const colors: Record<string, string> = {
    primary: 'text-[var(--primary)]',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };
  return (
    <div className="card card-pad">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-extrabold ${colors[color]}`}>{value}</div>
      {diff && <div className="mt-1 text-xs font-medium text-slate-500">{diff}</div>}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3">{children}</div>;
}

export function Table({ head, children, className = '' }: { head: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>{head}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return <th className="table-th">{children}</th>;
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`table-td ${className}`}>{children}</td>;
}

export function CancelButton({ onClick, children = 'Cancel' }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={onClick}>{children}</button>
  );
}