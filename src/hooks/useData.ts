import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import type { Category, Product, Service, ServiceCategory } from '../types';

export function useProducts(params: Record<string, string | number | boolean | undefined> = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ products: Product[]; total: number }>(`/api/products?${qs}`, false);
      setProducts(res.products);
      setTotal(res.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [qs.toString()]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, total, loading, error, reload: load };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Category[]>('/api/products/categories', false)
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Service[]>('/api/services', false)
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return { services, loading };
}

export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  useEffect(() => {
    apiGet<ServiceCategory[]>('/api/services/categories', false)
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);
  return { categories };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    apiGet<{ product: Product; related: Product[] }>(`/api/products/${slug}`, false)
      .then((d) => {
        setProduct(d.product);
        setRelated((d.related ?? []).filter((x) => x.id !== d.product.id).slice(0, 4));
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { product, related, loading, error };
}

export function useService(slug: string | undefined) {
  const [service, setService] = useState<Service | null>(null);
  const [related, setRelated] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    apiGet<{ service: Service; related: Service[] }>(`/api/services/${slug}`, false)
      .then((r) => {
        setService(r.service);
        setRelated(r.related ?? []);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { service, related, loading, error };
}