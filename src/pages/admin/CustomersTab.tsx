import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { fetchCustomers } from '../../services/admin';
import { formatDate, formatETB } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

export function CustomersTab({ refreshSignal }: { refreshSignal: number }) {
  const customers = useQuery(() => fetchCustomers(), [refreshSignal]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (customers.data ?? []).filter(({ profile }) => {
      if (!term) return true;
      return (
        profile.full_name.toLowerCase().includes(term) ||
        profile.email.toLowerCase().includes(term) ||
        profile.phone.includes(term)
      );
    });
  }, [customers.data, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" /> Customer Management
        </h3>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input !w-52 pl-9"
          />
        </div>
      </div>

      {customers.loading ? (
        <Spinner />
      ) : customers.error ? (
        <ErrorBox message={customers.error} onRetry={() => void customers.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No customers found." />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ profile, orderCount, totalSpent }) => (
                  <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">{profile.full_name || '—'}</td>
                    <td className="p-3 text-gray-300">{profile.email}</td>
                    <td className="p-3 text-gray-400">{profile.phone || '—'}</td>
                    <td className="p-3 text-gray-400">{formatDate(profile.created_at)}</td>
                    <td className="p-3">{orderCount}</td>
                    <td className="p-3 text-orange-400">{formatETB(totalSpent, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
