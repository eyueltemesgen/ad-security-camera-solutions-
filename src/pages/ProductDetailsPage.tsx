import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useData';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import ProductCard from '../components/home/ProductCard';
import { EmptyState, PageLoader, PageTitle, Stars, formatMoney } from '../components/ui';

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, related, loading, error } = useProduct(slug);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState('');

  const images = product?.image_url ? [product.image_url, ...(product.images ?? []).map((i) => i.url)].filter(Boolean) : [];

  const handleAdd = async () => {
    if (!user) {
      toast('Please login to add items to your cart', 'info');
      return;
    }
    try {
      await addItem(product!.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  if (loading) return <PageLoader label="Loading product…" />;

  if (error || !product) {
    return (
      <div className="container-x py-16">
        <EmptyState title="Product not found" subtitle="The product you are looking for does not exist." action={<Link to="/products" className="btn btn-primary">Back to Products</Link>} />
      </div>
    );
  }

  const inStock = product.stock > 0;
  const price = product.sale_price ?? product.price;
  const currentImage = activeImg || images[0] || '';

  return (
    <div>
      <PageTitle
        title={product.name}
        subtitle={`${product.brand} · SKU: ${product.sku}`}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: product.name }]}
      />
      <div className="container-x py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="card aspect-[4/3] overflow-hidden">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300">
                  <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="13" r="3" /></svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(img)} className={`h-16 w-20 overflow-hidden rounded-lg border-2 ${currentImage === img ? 'border-[var(--primary)]' : 'border-transparent'}`}>
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 text-sm">
              <Stars rating={product.rating} />
              <span className="text-slate-400">{product.rating ?? '—'} · {product.category?.name}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{product.short_description}</p>

            <div className="mt-5 flex items-end gap-3">
              {product.sale_price && (
                <span className="text-lg text-slate-400 line-through">{formatMoney(product.price)}</span>
              )}
              <span className="text-3xl font-extrabold text-[var(--primary)]">{formatMoney(price)}</span>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className={`badge ${inStock ? 'status-completed' : 'status-cancelled'}`}>
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              {product.warranty_info && <span className="text-slate-500">🛡 {product.warranty_info}</span>}
            </div>

            {inStock && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-[var(--radius)] border border-slate-300">
                  <button className="px-3 py-2 text-lg text-slate-500 hover:text-slate-900" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button className="px-3 py-2 text-lg text-slate-500 hover:text-slate-900" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg flex-1" onClick={handleAdd} disabled={added}>
                  {added ? 'Added ✓' : 'Add to Cart'}
                </button>
                <Link to="/checkout" className="btn btn-accent btn-lg">Order Now</Link>
              </div>
            )}

            <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShippingIcon />
                Delivery available across Ethiopia — cash on delivery or mobile payment.
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheckIcon />
                Genuine equipment with warranty. Installation available on request.
              </div>
            </div>
          </div>
        </div>

        {/* Description / specs / features */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 card card-pad">
            <h2 className="text-lg font-bold">Description</h2>
            <div className="prose-cms mt-3">{product.description}</div>

            {product.specifications.length > 0 && (
              <>
                <h2 className="mt-8 text-lg font-bold">Specifications</h2>
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((s) => (
                        <tr key={s.id} className="border-b border-slate-100 last:border-0">
                          <td className="table-td w-1/3 bg-slate-50 font-medium">{s.key}</td>
                          <td className="table-td">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card card-pad">
              <h3 className="font-bold">Product Info</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">SKU</dt><dd className="font-medium">{product.sku}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Brand</dt><dd className="font-medium">{product.brand}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="font-medium">{product.category?.name}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Warranty</dt><dd className="font-medium">{product.warranty_info}</dd></div>
              </dl>
            </div>
            <div className="card card-pad bg-[var(--primary)] text-white">
              <h3 className="font-bold text-white">Need installation?</h3>
              <p className="mt-2 text-sm text-slate-300">Our technicians will install and configure your security system professionally.</p>
              <Link to="/request-service" className="btn btn-accent btn-sm mt-4 w-full">Request Installation</Link>
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-6 text-lg font-bold">Related Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ShippingIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0 text-[var(--primary)]"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" strokeLinejoin="round" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
}
function ShieldCheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="shrink-0 text-[var(--primary)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}