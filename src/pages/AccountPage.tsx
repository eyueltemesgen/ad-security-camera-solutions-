import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Camera,
  Heart,
  LogOut,
  MapPin,
  Package,
  Save,
  ShoppingCart,
  User,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useQuery } from '../hooks/useQuery';
import { useToast } from '../hooks/useToast';
import { useWishlist } from '../hooks/useWishlist';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
  uploadAvatar,
} from '../services/account';
import { fetchMyOrders } from '../services/orders';
import {
  fetchMyServiceRequests,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/misc';
import { fetchWishlistProducts } from '../services/wishlist';
import { formatDate, formatDateTime, formatETB, paymentMethodLabel } from '../lib/utils';
import type { Address, Order } from '../types';
import { EmptyState, ErrorBox, Spinner } from '../components/ui';
import { OrderDetailModal, StatusBadge } from '../components/modals/OrderDetailModal';

type Tab = 'orders' | 'wishlist' | 'services' | 'notifications' | 'addresses';

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'services', label: 'Service Requests', icon: Wrench },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function AccountPage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth();
  const { addItem } = useCart();
  const { toggle: toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  const orders = useQuery(() => (user ? fetchMyOrders(user.id) : Promise.resolve([])), [user?.id]);
  const wishlist = useQuery(
    () => (user ? fetchWishlistProducts(user.id) : Promise.resolve([])),
    [user?.id, tab]
  );
  const services = useQuery(
    () => (user ? fetchMyServiceRequests(user.id) : Promise.resolve([])),
    [user?.id, tab]
  );
  const notifications = useQuery(
    () => (user ? fetchNotifications({ userId: user.id, admin: false }) : Promise.resolve([])),
    [user?.id, tab]
  );
  const addresses = useQuery(
    () => (user ? fetchAddresses(user.id) : Promise.resolve([])),
    [user?.id, tab]
  );

  useEffect(() => {
    if (!loading && !user) navigate('/', { replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <Spinner className="min-h-[60vh]" />;
  }

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out', 'info');
    navigate('/');
  };

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const error = await updateProfile({
      full_name: editForm.name,
      phone: editForm.phone,
    });
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Profile updated', 'success');
      setEditMode(false);
    }
  };

  const unread = (notifications.data ?? []).filter((n) => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile card */}
        <div className="glass-card p-6 rounded-2xl h-fit">
          <div className="relative mx-auto mb-3 w-20 h-20">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500/30 to-brand-700/30 border-2 border-brand-500/40 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-brand-300" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-600 hover:bg-brand-500 cursor-pointer border-2 border-white/20 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadAvatar(user.id, file);
                    const error = await updateProfile({ avatar_url: url });
                    if (error) showToast(error, 'error');
                    else showToast('Photo updated', 'success');
                  } catch (err) {
                    showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
                  } finally {
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
          <h2 className="text-xl font-bold text-center">{profile?.full_name || user.email}</h2>
          <p className="text-sm text-gray-400 text-center">{user.email}</p>
          <p className="text-sm text-gray-400 text-center">{profile?.phone || 'No phone on file'}</p>

          {editMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 mt-4">
              <input
                className="form-input"
                value={editForm.name}
                placeholder="Full name"
                required
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="form-input"
                value={editForm.phone}
                placeholder="Phone"
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 py-2 text-sm">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="btn-outline flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setEditForm({ name: profile?.full_name ?? '', phone: profile?.phone ?? '' });
                setEditMode(true);
              }}
              className="btn-outline w-full mt-4 py-2 text-sm"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={() => void handleLogout()}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`tab-btn flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${
                  tab === id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
                {id === 'notifications' && unread > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            orders.loading ? (
              <Spinner />
            ) : orders.error ? (
              <ErrorBox message={orders.error} onRetry={() => void orders.refetch()} />
            ) : (orders.data ?? []).length === 0 ? (
              <EmptyState message="You haven't placed any orders yet." />
            ) : (
              <div className="space-y-3">
                {(orders.data ?? []).map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left glass-card glass-card-hover rounded-xl p-4 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="text-orange-400 font-bold">
                          {formatETB(order.total, 2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(order.items ?? []).length} item(s) •{' '}
                      {paymentMethodLabel(order.payment_method)}
                    </p>
                  </button>
                ))}
              </div>
            )
          )}

          {tab === 'wishlist' && (
            wishlist.loading ? (
              <Spinner />
            ) : wishlist.error ? (
              <ErrorBox message={wishlist.error} onRetry={() => void wishlist.refetch()} />
            ) : (wishlist.data ?? []).length === 0 ? (
              <EmptyState message="Your wishlist is empty." icon={<Heart className="w-14 h-14 opacity-30" />} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(wishlist.data ?? []).map((product) => (
                  <div key={product.id} className="glass-card rounded-xl p-4">
                    <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-blue-400/50" />
                      )}
                    </div>
                    <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                    <p className="text-orange-400 font-bold text-sm">{formatETB(product.price)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          addItem(product);
                          showToast(`${product.name} added to cart`, 'success');
                        }}
                        className="btn-primary flex-1 text-xs py-1.5 px-2"
                      >
                        <ShoppingCart className="w-3 h-3" /> Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          void toggleWishlist(product.id).then(() => void wishlist.refetch());
                        }}
                        className="p-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'services' && (
            services.loading ? (
              <Spinner />
            ) : services.error ? (
              <ErrorBox message={services.error} onRetry={() => void services.refetch()} />
            ) : (services.data ?? []).length === 0 ? (
              <EmptyState message="No service requests yet." icon={<Wrench className="w-14 h-14 opacity-30" />} />
            ) : (
              <div className="space-y-3">
                {(services.data ?? []).map((request) => (
                  <div key={request.id} className="glass-card rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{request.service}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(request.created_at)}
                          {request.preferred_date && ` • preferred: ${formatDate(request.preferred_date)}`}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    {request.description && (
                      <p className="text-sm text-gray-400 mt-2">{request.description}</p>
                    )}
                    {request.location && (
                      <p className="text-xs text-gray-500 mt-1">Location: {request.location}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'notifications' && (
            notifications.loading ? (
              <Spinner />
            ) : notifications.error ? (
              <ErrorBox message={notifications.error} onRetry={() => void notifications.refetch()} />
            ) : (
              <div>
                {(notifications.data ?? []).length > 0 && unread > 0 && (
                  <button
                    onClick={() => {
                      void markAllNotificationsRead(user.id, false).then(() =>
                        void notifications.refetch()
                      );
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 mb-3"
                  >
                    Mark all as read
                  </button>
                )}
                {(notifications.data ?? []).length === 0 ? (
                  <EmptyState message="No notifications." icon={<Bell className="w-14 h-14 opacity-30" />} />
                ) : (
                  <div className="space-y-2">
                    {(notifications.data ?? []).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() =>
                          void markNotificationRead(notification.id).then(() =>
                            void notifications.refetch()
                          )
                        }
                        className={`w-full text-left rounded-xl p-3 transition glass-card ${
                          notification.is_read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{notification.message}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {tab === 'addresses' && (
            addresses.loading ? (
              <Spinner />
            ) : addresses.error ? (
              <ErrorBox message={addresses.error} onRetry={() => void addresses.refetch()} />
            ) : (
              <AddressBook
                user={user}
                items={addresses.data ?? []}
                onChanged={() => void addresses.refetch()}
              />
            )
          )}
        </div>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

function AddressBook({
  user,
  items,
  onChanged,
}: {
  user: { id: string };
  items: Address[];
  onChanged: () => void;
}) {
  const { showToast } = useToast();
  const blank = { label: '', full_name: '', phone: '', address: '', city: '', notes: '', is_default: false };
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const [form, setForm] = useState<{ label: string; full_name: string; phone: string; address: string; city: string; notes: string; is_default: boolean }>(blank);
  const [busy, setBusy] = useState(false);

  const startNew = () => {
    setForm(blank);
    setEditing('new');
  };
  const startEdit = (a: Address) => {
    setForm({ label: a.label, full_name: a.full_name, phone: a.phone, address: a.address, city: a.city, notes: a.notes, is_default: a.is_default });
    setEditing(a);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      if (editing === 'new') {
        await createAddress(user.id, form);
        showToast('Address added', 'success');
      } else {
        await updateAddress(user.id, editing.id, form);
        showToast('Address updated', 'success');
      }
      setEditing(null);
      onChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save address', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Saved Addresses</h3>
        <button onClick={startNew} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Add Address
        </button>
      </div>

      {items.length === 0 && !editing ? (
        <EmptyState message="No saved addresses." icon={<MapPin className="w-14 h-14 opacity-30" />} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {items.map((a) => (
            <div key={a.id} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{a.label || 'Address'}</p>
                <div className="flex gap-2 items-center">
                  {a.is_default && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-medium">
                      Default
                    </span>
                  )}
                  <button onClick={() => startEdit(a)} className="text-[11px] text-brand-400 hover:underline">Edit</button>
                  <button
                    onClick={() => {
                      void deleteAddress(user.id, a.id).then(() => {
                        showToast('Address removed', 'info');
                        onChanged();
                      });
                    }}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {a.full_name && <p className="text-sm text-gray-300">{a.full_name}</p>}
              {a.phone && <p className="text-xs text-gray-400">{a.phone}</p>}
              <p className="text-sm text-gray-400 mt-1">{a.address}, {a.city}</p>
              {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="glass-card rounded-xl p-5 space-y-3">
          <h4 className="font-bold">{editing === 'new' ? 'New Address' : 'Edit Address'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="form-input" placeholder="Label (e.g. Home, Office)" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <input className="form-input" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <input className="form-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="form-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <textarea className="form-input" rows={2} placeholder="Address (street, area)" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="form-input" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
