import { useMemo, useState } from 'react';
import { AlertTriangle, Package, Warehouse } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchAllProducts, updateStock } from '../../services/products';
import { formatETB, stockLevel } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

export function InventoryTab({ refreshSignal }: { refreshSignal: number }) {
  const { showToast } = useToast();
  const products = useQuery(() => fetchAllProducts(), [refreshSignal]);
  const [editing, setEditing] = useState<Record<string, string>>({});

  const summary = useMemo(() => {
    const list = products.data ?? [];
    let inStock = 0;
    let lowStock = 0;
    let outStock = 0;
    let units = 0;
    let value = 0;
    for (const p of list) {
      const level = stockLevel(p);
      if (level === 'in') inStock += 1;
      if (level === 'low') lowStock += 1;
      if (level === 'out') outStock += 1;
      units += p.stock;
      value += p.stock * p.price;
    }
    return { inStock, lowStock, outStock, units, value, total: list.length };
  }, [products.data]);

  const saveStock = async (id: string, value: string) => {
    const stock = Number(value);
    if (!Number.isFinite(stock)) {
      showToast('Enter a valid quantity', 'error');
      return;
    }
    try {
      await updateStock(id, stock);
      showToast('Stock updated', 'success');
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await products.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Warehouse className="w-4 h-4 text-blue-400" /> Inventory Management
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="admin-stat">
          <div className="text-2xl font-bold text-emerald-400">{summary.inStock}</div>
          <div className="text-sm text-gray-400">In Stock</div>
        </div>
        <div className="admin-stat">
          <div className="text-2xl font-bold text-yellow-400">{summary.lowStock}</div>
          <div className="text-sm text-gray-400">Low Stock</div>
        </div>
        <div className="admin-stat">
          <div className="text-2xl font-bold text-red-400">{summary.outStock}</div>
          <div className="text-sm text-gray-400">Out of Stock</div>
        </div>
        <div className="admin-stat">
          <div className="text-2xl font-bold text-blue-400">{summary.units}</div>
          <div className="text-sm text-gray-400">Total Units</div>
        </div>
        <div className="admin-stat">
          <div className="text-2xl font-bold text-purple-400">{formatETB(summary.value)}</div>
          <div className="text-sm text-gray-400">Inventory Value</div>
        </div>
      </div>

      {products.loading ? (
        <Spinner />
      ) : products.error ? (
        <ErrorBox message={products.error} onRetry={() => void products.refetch()} />
      ) : (products.data ?? []).length === 0 ? (
        <EmptyState message="No products in inventory." icon={<Package className="w-14 h-14 opacity-30" />} />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(products.data ?? []).map((product) => {
                  const level = stockLevel(product);
                  const draft = editing[product.id];
                  return (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 font-medium">{product.name}</td>
                      <td className="p-3 text-gray-400">{product.sku ?? '—'}</td>
                      <td className="p-3">{formatETB(product.price)}</td>
                      <td className="p-3">
                        {draft !== undefined ? (
                          <input
                            type="number"
                            min="0"
                            className="form-input !w-24 !py-1"
                            value={draft}
                            onChange={(e) =>
                              setEditing((prev) => ({ ...prev, [product.id]: e.target.value }))
                            }
                          />
                        ) : (
                          product.stock
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`stock-badge stock-${level}`}>
                          {level === 'out' ? 'Out of Stock' : level === 'low' ? 'Low Stock' : 'In Stock'}
                        </span>
                        {level === 'low' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 inline ml-1" />
                        )}
                      </td>
                      <td className="p-3">
                        {draft !== undefined ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => void saveStock(product.id, draft)}
                              className="btn-success px-3 py-1 text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setEditing((prev) => {
                                  const next = { ...prev };
                                  delete next[product.id];
                                  return next;
                                })
                              }
                              className="btn-outline px-3 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setEditing((prev) => ({
                                ...prev,
                                [product.id]: String(product.stock),
                              }))
                            }
                            className="btn-outline px-3 py-1 text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
