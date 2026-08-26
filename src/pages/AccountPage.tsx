import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Camera,
  Heart,
  LogOut,
  Package,
  ShoppingCart,
  User,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useQuery } from '../hooks/useQuery';
import { useToast } from '../hooks/useToast';
import { useWishlist } from '../hooks/useWishlist';
import { fetchMyOrders } from '../services/orders';
import {
  fetchMyServiceRequests,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/misc';
import { fetchWishlistProducts } from '../services/wishlist';
import { formatDate, formatDateTime, formatETB, paymentMethodLabel } from '../lib/utils';
import type { Order } from '../types';
import { EmptyState, ErrorBox, Spinner } from '../components/ui';
import { OrderDetailModal, StatusBadge } from '../components/modals/OrderDetailModal';

type Tab = 'orders' | 'wishlist' | 'services' | 'notifications';

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'services', label: 'Service Requests', icon: Wrench },
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-700/30 border-2 border-brand-500/40 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-brand-300" />
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
        </div>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
