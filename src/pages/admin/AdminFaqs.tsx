import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { Faq } from '../../types';

export default function AdminFaqs() {
  const { toast } = useToast();
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({ id: null as string | null, category: 'General', question: '', answer: '', is_active: true, sort_order: '0' });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<Faq[]>('/api/cms/faqs');
      setItems(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => { setEditingForm({ id: null, category: 'General', question: '', answer: '', is_active: true, sort_order: '0' }); setOpen(true); };
  const openEdit = (f: Faq) => { setEditingForm({ id: f.id, category: f.category || 'General', question: f.question, answer: f.answer, is_active: f.is_active, sort_order: String(f.sort_order) }); setOpen(true); };

  const save = async () => {
    if (!editingForm.question.trim() || !editingForm.answer.trim()) return toast('Question and answer are required', 'error');
    setSaving(true);
    try {
      const payload = { category: editingForm.category, question: editingForm.question, answer: editingForm.answer, is_active: editingForm.is_active, sort_order: Number(editingForm.sort_order) || 0 };
      if (editingForm.id) {
        await apiPut(`/api/cms/faqs/${editingForm.id}`, payload);
        toast('FAQ updated');
      } else {
        await apiPost('/api/cms/faqs', payload);
        toast('FAQ created');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f: Faq) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await apiDelete(`/api/cms/faqs/${f.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (f: Faq) => {
    try {
      await apiPut(`/api/cms/faqs/${f.id}`, { is_active: !f.is_active });
      setItems((xs) => xs.map((x) => (x.id === f.id ? { ...x, is_active: !f.is_active } : x)));
      toast(f.is_active ? 'Unpublished' : 'Published');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;

  const categories = [...new Set([...items.map((f) => f.category || 'General'), 'General', 'Products', 'Services', 'Installation', 'Support', 'Billing'])].sort();

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">FAQs</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add FAQ</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Frequently asked questions shown on the FAQ page.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Question</Th><Th>Category</Th><Th>Answer</Th><Th>Status</Th><Th /></>}>
          {items.map((f) => (
            <tr key={f.id} className="hover:bg-slate-50">
              <Td className="max-w-sm font-medium">{f.question}</Td>
              <Td><span className="badge badge-option">{f.category || 'General'}</span></Td>
              <Td className="max-w-md truncate text-slate-500">{f.answer}</Td>
              <Td><button className="text-lg" onClick={() => toggle(f)}>{f.is_active ? '🟢' : '🔴'}</button></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}>Edit</button>
                  <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(f)}>Delete</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editingForm.id ? 'Edit FAQ' : 'Add FAQ'}</h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <input className="input" value={editingForm.category} list="faq-categories" onChange={(e) => setEditingForm((f) => ({ ...f, category: e.target.value }))} />
                  <datalist id="faq-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editingForm.sort_order} onChange={(e) => setEditingForm((f) => ({ ...f, sort_order: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Question *</label>
                <input className="input" value={editingForm.question} onChange={(e) => setEditingForm((f) => ({ ...f, question: e.target.value }))} />
              </div>
              <div>
                <label className="label">Answer *</label>
                <textarea className="input" rows={5} value={editingForm.answer} onChange={(e) => setEditingForm((f) => ({ ...f, answer: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={editingForm.is_active} onChange={(e) => setEditingForm((f) => ({ ...f, is_active: e.target.checked }))} /> Published
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <CancelButton onClick={() => setOpen(false)} />
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}