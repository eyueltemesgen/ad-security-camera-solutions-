import { useState, type FormEvent } from 'react';
import { Send, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { createServiceRequest } from '../../services/misc';
import { Modal } from '../ui';

export function ServiceBookingModal() {
  const { modal, selectedService, closeModal } = useStorefront();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    location: '',
    description: '',
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createServiceRequest({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        service: selectedService,
        preferredDate: form.date || null,
        preferredTime: '',
        location: form.location,
        propertyType: '',
        numDevices: null,
        currentSystem: '',
        description: form.description,
        notes: '',
        userId: user?.id ?? null,
      });
      showToast('Service booked! We will contact you shortly.', 'success');
      setForm({ name: '', email: '', phone: '', date: '', location: '', description: '' });
      closeModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Booking failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={modal === 'service'} onClose={closeModal}>
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Wrench className="w-6 h-6 text-blue-400" /> Book Service
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Fill in your details and we'll contact you shortly
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name *"
          required
          className="form-input"
          defaultValue={profile?.full_name ?? ''}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email *"
          required
          className="form-input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone"
          className="form-input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          readOnly
          className="form-input bg-white/5"
          value={selectedService}
          aria-label="Selected service"
        />
        <label className="block text-xs text-gray-400 -mb-2">Preferred date</label>
        <input
          type="date"
          className="form-input [color-scheme:dark]"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location / site address"
          className="form-input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <textarea
          rows={3}
          placeholder="Additional details…"
          className="form-input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit" disabled={busy} className="btn-orange w-full py-3">
          <Send className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit Booking'}
        </button>
      </form>
    </Modal>
  );
}
