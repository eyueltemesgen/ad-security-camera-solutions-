import { LOW_STOCK_THRESHOLD, TAX_RATE, type Product } from '../types';

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Format an ETB amount — "17,000 Br" / "17,000.00 Br". */
export function formatETB(value: number, decimals?: number): string {
  const fraction =
    decimals ?? (Number.isInteger(value) ? 0 : 2);
  return (
    value.toLocaleString('en-US', {
      minimumFractionDigits: fraction,
      maximumFractionDigits: Math.max(fraction, 2),
    }) + ' Br'
  );
}

export function calcTotals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal: round2(subtotal), tax, total: round2(subtotal + tax) };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export type StockLevel = 'in' | 'low' | 'out';

export function stockLevel(product: Pick<Product, 'stock'>): StockLevel {
  if (product.stock <= 0) return 'out';
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

export function stockLabel(product: Pick<Product, 'stock'>): string {
  const level = stockLevel(product);
  if (level === 'out') return 'Out of Stock';
  if (level === 'low') return 'Low Stock';
  return 'In Stock';
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function paymentMethodLabel(value: string): string {
  switch (value) {
    case 'telebirr':
      return 'Telebirr';
    case 'cbe_birr':
      return 'CBE Birr';
    case 'chapa':
      return 'Chapa';
    case 'cash_on_delivery':
      return 'Cash on Delivery';
    default:
      return value;
  }
}

export function statusLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
