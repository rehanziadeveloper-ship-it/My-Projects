import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings,
  Utensils,
  QrCode,
  FileText,
  Search,
  Printer,
  DollarSign,
  Image as ImageIcon,
  Bell,
  CheckCircle,
  Clock,
  Store,
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  AlertTriangle,
  Check,
  Power
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { sound } from '../utils/audio';
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  getCategories,
  saveCategory,
  deleteCategory,
  getMenuItems,
  saveMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  formatSeqId
} from '../services/restaurantService';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('menu'); // 'profile', 'menu', 'categories', 'qr', 'orders'
  const [loading, setLoading] = useState(false);

  // 1. Restaurant Profile State
  const [profile, setProfile] = useState({
    id: '',
    display_id: '01',
    name: 'Deewan-E-Khaas (Deewan Namak Mandi)',
    description: '',
    phone: '',
    address: '',
    opening_hours: '12:00 PM - 02:00 AM',
    is_open: true,
    logo_url: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // 2. Categories State
  const [categories, setCategories] = useState([]);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', display_order: 1, is_active: true });
  const [catError, setCatError] = useState('');

  // 3. Menu Items State
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    unit: 'Portion',
    unit_plural: 'Portions',
    photo_url: '',
    is_available: true,
    has_sizes: false,
    size_half_price: '',
    size_full_price: ''
  });
  const [itemError, setItemError] = useState('');

  // 4. Orders & QR State
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [selectedTableForQr, setSelectedTableForQr] = useState(1);

  // Initialize data & real-time subscriptions
  useEffect(() => {
    loadAllData();

    // 1. Subscribe to Supabase Realtime for orders table
    const ordersChannel = supabase
      .channel('admin_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            sound.playNewOrderChime();
            setNewOrderAlert(payload.new);
            setOrders((prev) => [payload.new, ...prev.filter((o) => o.id !== payload.new.id)]);
            setTimeout(() => setNewOrderAlert(null), 8000);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? payload.new : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 2. Subscribe to Supabase Realtime for waiter_calls table
    const waiterCallsChannel = supabase
      .channel('admin_waiter_calls_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.call_type === 'order') {
            try {
              const parsed = JSON.parse(payload.new.notes);
              const orderObj = {
                id: payload.new.id,
                order_no: parsed.order_no || '#' + payload.new.id.slice(0, 4),
                table_no: payload.new.table_no,
                customer_name: parsed.customer_name || 'Guest',
                customer_phone: parsed.customer_phone || '',
                total: parsed.total || 0,
                status: payload.new.status === 'pending' ? 'received' : payload.new.status,
                notes: JSON.stringify(parsed.items || []),
                created_at: payload.new.created_at
              };
              sound.playNewOrderChime();
              setNewOrderAlert(orderObj);
              setOrders((prev) => {
                if (prev.some((o) => o.order_no === orderObj.order_no)) return prev;
                return [orderObj, ...prev];
              });
              setTimeout(() => setNewOrderAlert(null), 8000);
            } catch (e) {
              console.warn('Error parsing realtime order from waiter_calls:', e);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new.call_type === 'order') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(waiterCallsChannel);
    };
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profData, catsData, itemsData] = await Promise.all([
        getRestaurantProfile(),
        getCategories(),
        getMenuItems()
      ]);
      setProfile(profData);
      setCategories(catsData);
      setMenuItems(itemsData);
      await fetchOrders();
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      const { data: wcOrders } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('call_type', 'order')
        .order('created_at', { ascending: false })
        .limit(30);

      const combined = [...(dbOrders || [])];

      if (wcOrders && wcOrders.length > 0) {
        wcOrders.forEach((wc) => {
          try {
            const parsed = JSON.parse(wc.notes);
            const ordNo = parsed.order_no || '#' + wc.id.slice(0, 4);
            if (!combined.some((o) => o.order_no === ordNo)) {
              combined.push({
                id: wc.id,
                order_no: ordNo,
                table_no: wc.table_no,
                customer_name: parsed.customer_name || 'Guest',
                customer_phone: parsed.customer_phone || '',
                total: parsed.total || 0,
                status: wc.status === 'pending' ? 'received' : wc.status,
                notes: JSON.stringify(parsed.items || []),
                created_at: wc.created_at
              });
            }
          } catch (e) {
            console.warn('Error parsing order note:', e);
          }
        });
      }

      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(combined);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      await supabase.from('waiter_calls').update({ status: newStatus }).eq('id', orderId);
    } catch (err) {
      console.warn('Status update note:', err);
    }
  };

  // ==============================================================================
  // A. RESTAURANT PROFILE ACTIONS
  // ==============================================================================

  // Quick Instant Status Toggle
  const handleQuickStatusToggle = async () => {
    const nextStatus = !profile.is_open;
    setProfile((prev) => ({ ...prev, is_open: nextStatus }));
    try {
      const saved = await updateRestaurantProfile({ ...profile, is_open: nextStatus });
      setProfile(saved);
      setProfileSuccessMsg(`Restaurant status updated to ${nextStatus ? 'OPEN' : 'CLOSED'} and synced!`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');
    try {
      const saved = await updateRestaurantProfile(profile);
      setProfile(saved);
      setProfileSuccessMsg('Restaurant profile saved successfully and updated system-wide!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteLogo = () => {
    setProfile((prev) => ({ ...prev, logo_url: '' }));
  };

  // ==============================================================================
  // B. CATEGORIES MANAGEMENT ACTIONS
  // ==============================================================================

  const handleOpenCatModal = (cat = null) => {
    setCatError('');
    if (cat) {
      setEditingCat(cat);
      setCatFormData({
        name: cat.name,
        display_order: cat.display_order,
        is_active: cat.is_active !== undefined ? cat.is_active : true
      });
    } else {
      setEditingCat(null);
      const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.display_order || 0)) + 1 : 1;
      setCatFormData({ name: '', display_order: nextOrder, is_active: true });
    }
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) {
      setCatError('Category name is required');
      return;
    }

    try {
      const payload = {
        ...(editingCat ? { id: editingCat.id } : {}),
        name: catFormData.name.trim(),
        display_order: parseInt(catFormData.display_order, 10) || 1,
        is_active: catFormData.is_active
      };

      const res = await saveCategory(payload);
      if (res.success) {
        setCategories(res.categories);
        setCatModalOpen(false);
      }
    } catch (err) {
      setCatError(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (catId) => {
    const cat = categories.find((c) => c.id === catId);
    if (!window.confirm(`Are you sure you want to delete category "${cat?.name}"?`)) return;

    const res = await deleteCategory(catId);
    if (!res.success) {
      alert(res.error);
    } else {
      setCategories(res.categories);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    const updated = { ...cat, is_active: !cat.is_active };
    const res = await saveCategory(updated);
    if (res.success) {
      setCategories(res.categories);
    }
  };

  // ==============================================================================
  // C. MENU ITEMS MANAGEMENT ACTIONS
  // ==============================================================================

  const handleOpenItemModal = (item = null) => {
    setItemError('');
    if (item) {
      setEditingItem(item);
      setItemFormData({
        name: item.name,
        category_id: item.category_id || (categories[0]?.id || ''),
        price: item.price || '',
        description: item.description || '',
        unit: item.unit || 'Portion',
        unit_plural: item.unit_plural || 'Portions',
        photo_url: item.photo_url || '',
        is_available: item.is_available !== undefined ? item.is_available : true,
        has_sizes: Boolean(item.has_sizes || item.sizes),
        size_half_price: item.sizes?.half?.price || '',
        size_full_price: item.sizes?.full?.price || ''
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: '',
        category_id: categories[0]?.id || '',
        price: '',
        description: '',
        unit: 'Portion',
        unit_plural: 'Portions',
        photo_url: '',
        is_available: true,
        has_sizes: false,
        size_half_price: '',
        size_full_price: ''
      });
    }
    setItemModalOpen(true);
  };

  const handleItemImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setItemFormData((prev) => ({ ...prev, photo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) {
      setItemError('Item name is required');
      return;
    }

    const priceNum = parseFloat(itemFormData.price);
    if (!itemFormData.has_sizes && (isNaN(priceNum) || priceNum <= 0)) {
      setItemError('Please enter a valid price');
      return;
    }

    let sizesObj = null;
    if (itemFormData.has_sizes) {
      const halfP = parseFloat(itemFormData.size_half_price) || 0;
      const fullP = parseFloat(itemFormData.size_full_price) || 0;
      if (halfP <= 0 || fullP <= 0) {
        setItemError('Please enter valid prices for both Half and Full sizes');
        return;
      }
      sizesObj = {
        half: { label: 'Half', price: halfP },
        full: { label: 'Full', price: fullP }
      };
    }

    try {
      const payload = {
        ...(editingItem ? { id: editingItem.id, item_number: editingItem.item_number } : {}),
        name: itemFormData.name.trim(),
        category_id: itemFormData.category_id || categories[0]?.id,
        price: itemFormData.has_sizes ? parseFloat(itemFormData.size_full_price) : priceNum,
        description: itemFormData.description.trim(),
        unit: itemFormData.unit,
        unit_plural: itemFormData.unit_plural || itemFormData.unit + 's',
        photo_url: itemFormData.photo_url || null,
        is_available: itemFormData.is_available,
        has_sizes: itemFormData.has_sizes,
        sizes: sizesObj
      };

      const res = await saveMenuItem(payload);
      if (res.success) {
        setMenuItems(res.items);
        setItemModalOpen(false);
      }
    } catch (err) {
      setItemError(err.message || 'Failed to save menu item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!window.confirm(`Are you sure you want to delete dish "${item?.name}"?`)) return;

    const res = await deleteMenuItem(itemId);
    if (res.success) {
      setMenuItems(res.items);
    }
  };

  const handleToggleAvailability = async (item) => {
    const res = await toggleItemAvailability(item.id, item.is_available);
    if (res.success) {
      setMenuItems(res.items);
    }
  };

  // Filtered menu items
  const filteredItems = menuItems.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(i.item_number).includes(searchQuery) ||
      (i.display_id && i.display_id.includes(searchQuery));

    const matchesCat =
      selectedCatFilter === 'ALL' ||
      i.category_id === selectedCatFilter ||
      i.category === selectedCatFilter;

    return matchesSearch && matchesCat;
  });

  const handlePrintQr = () => {
    window.print();
  };

  const qrUrl = `${window.location.origin}/chat?table=${selectedTableForQr}`;

  // Find category name helper
  const getCatName = (catId) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'General';
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <nav className="bg-stone-900 text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-orange-500/50 shadow"
            />
          ) : (
            <div className="p-2.5 bg-orange-600 rounded-xl shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg leading-tight truncate max-w-[220px] sm:max-w-xs">
                {profile.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  profile.is_open ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {profile.is_open ? 'Open' : 'Closed'}
              </span>
            </div>
            <p className="text-xs text-stone-400">Admin Operating System • Terminal #{profile.display_id || '01'}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Store className="w-4 h-4" />
            Profile (#{profile.display_id || '01'})
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'menu'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu ({menuItems.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'qr'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Table QRs
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Orders ({orders.length})
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Realtime Alert Banner */}
        {newOrderAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-600 text-white shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base">🔔 New Order: {newOrderAlert.order_no}</h3>
                <p className="text-xs text-orange-100">
                  Table #{newOrderAlert.table_no} • {newOrderAlert.customer_name} • PKR {Number(newOrderAlert.total).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('orders');
                setNewOrderAlert(null);
              }}
              className="px-3.5 py-1.5 bg-white text-orange-800 font-bold text-xs rounded-xl shadow hover:bg-orange-50 active:scale-95 transition"
            >
              View Orders
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 1: RESTAURANT PROFILE MODULE */}
        {/* ==================================================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-orange-50 to-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white font-mono font-bold text-xs">
                    ID #{profile.display_id || '01'}
                  </span>
                  <h2 className="text-lg font-black text-stone-900">Restaurant Profile & Settings</h2>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Manage restaurant identity, contact details, opening hours, and operating status.
                </p>
              </div>

              {/* Open / Closed Toggle */}
              <button
                type="button"
                onClick={handleQuickStatusToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs shadow-sm transition active:scale-95 ${
                  profile.is_open
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Power className="w-4 h-4" />
                {profile.is_open ? 'STATUS: OPEN' : 'STATUS: CLOSED'}
              </button>
            </div>

            {profileSuccessMsg && (
              <div className="m-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              {/* Logo Upload Section */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Logo Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-stone-900">Restaurant Logo</h4>
                    <p className="text-[11px] text-stone-500">Appears on customer chatbot header & placards (PNG/JPG, max 2MB)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {profile.logo_url && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+92 313 88 88 458"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={profile.opening_hours}
                    onChange={(e) => setProfile((p) => ({ ...p, opening_hours: e.target.value }))}
                    placeholder="12:00 PM - 02:00 AM"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                    placeholder="North Circular Road Near Fowara Chowk, D.I Khan"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">About / Description</label>
                  <textarea
                    rows={3}
                    value={profile.description}
                    onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Authentic Shinwari Karahi, Dum Pukht, BBQ & Traditional Namak Mandi Flavors."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: MENU MANAGEMENT MODULE (CRUD) */}
        {/* ==================================================================== */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-orange-50 to-white">
              <div>
                <h2 className="text-lg font-black text-stone-900">Menu Items & Stock Control</h2>
                <p className="text-xs text-stone-500">
                  Add, edit, or delete dishes. Manage prices, sizes, units, and availability in real time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, #, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>

                <button
                  onClick={() => handleOpenItemModal()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Food Item
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/60 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCatFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  selectedCatFilter === 'ALL'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCatFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedCatFilter === c.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  #{c.display_id} {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Sequential ID</th>
                    <th className="py-3 px-4">Dish Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price & Unit</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                          #{formatSeqId(item.display_id || item.item_number)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.photo_url ? (
                            <img
                              src={item.photo_url}
                              alt={item.name}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center shrink-0">
                              🍗
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-stone-500 line-clamp-1">{item.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {getCatName(item.category_id)}
                      </td>
                      <td className="py-3 px-4">
                        {item.has_sizes && item.sizes ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] block font-mono text-stone-700">
                              Half: <b>PKR {Number(item.sizes.half?.price || 0).toLocaleString()}</b>
                            </span>
                            <span className="text-[11px] block font-mono text-orange-700 font-bold">
                              Full: <b>PKR {Number(item.sizes.full?.price || 0).toLocaleString()}</b>
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-mono font-bold text-orange-600 text-xs sm:text-sm">
                              PKR {Number(item.price).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-stone-500 block">per {item.unit || 'Portion'}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition active:scale-95 ${
                              item.is_available
                                ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {item.is_available ? 'Set Out' : 'Set Avail'}
                          </button>
                          <button
                            onClick={() => handleOpenItemModal(item)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: CATEGORIES MANAGEMENT MODULE */}
        {/* ==================================================================== */}
        {activeTab === 'categories' && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-orange-50 to-white">
              <div>
                <h2 className="text-lg font-black text-stone-900">Categories Management</h2>
                <p className="text-xs text-stone-500">
                  Organize food categories, adjust sequence order, and manage active visibility.
                </p>
              </div>

              <button
                onClick={() => handleOpenCatModal()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Sequential ID</th>
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Display Order</th>
                    <th className="py-3 px-4">Assigned Dishes</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {categories.map((cat, idx) => {
                    const assignedCount = menuItems.filter(
                      (i) => i.category_id === cat.id || i.category === cat.slug
                    ).length;

                    return (
                      <tr key={cat.id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                            #{formatSeqId(cat.display_id || cat.display_order || idx + 1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-900 text-xs sm:text-sm">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-stone-600">
                          {cat.display_order}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-200">
                            {assignedCount} items
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleCategoryActive(cat)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition ${
                              cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {cat.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenCatModal(cat)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              title="Edit Category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: TABLE QR CODE GENERATOR */}
        {/* ==================================================================== */}
        {activeTab === 'qr' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-black text-stone-900">Printable Table QR Placards</h2>
              <p className="text-xs text-stone-500 mt-1">
                Select a table number to generate a QR code linking directly to the guest chat.
              </p>
            </div>

            {/* Table Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedTableForQr(num)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                    selectedTableForQr === num
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Table {formatSeqId(num)}
                </button>
              ))}
            </div>

            {/* Printable Card Area */}
            <div
              id="printable-card"
              className="border-4 border-stone-900 rounded-3xl p-8 bg-gradient-to-b from-orange-50 to-white text-center shadow-lg max-w-sm mx-auto"
            >
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="w-16 h-16 mx-auto mb-2 rounded-2xl object-cover border-2 border-orange-500 shadow"
                />
              ) : (
                <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-2xl shadow-md">
                  🍖
                </div>
              )}
              <h3 className="text-xl font-black tracking-tight text-stone-900 uppercase">{profile.name}</h3>
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-widest mb-6">
                Dine-In • AI Chat Ordering
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-inner border border-stone-200 inline-block mb-4">
                <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin={true} />
              </div>

              <div className="mt-2">
                <span className="inline-block px-5 py-1.5 rounded-full bg-stone-900 text-white font-black text-lg font-mono">
                  TABLE #{formatSeqId(selectedTableForQr)}
                </span>
                <p className="text-xs text-stone-600 mt-3 font-medium">
                  Scan QR with your phone camera to order via chat!
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handlePrintQr}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                Print Table #{formatSeqId(selectedTableForQr)} Placard
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: RECENT ORDERS AUDIT */}
        {/* ==================================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-stone-900">Live Dine-In Orders ({orders.length})</h2>
                <p className="text-xs text-stone-500">Realtime order stream with customer details and status sync.</p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                Refresh Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <FileText className="w-12 h-12 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-sm">No orders yet</p>
                <p className="text-xs">New dine-in orders placed through the chatbot will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Table</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items Ordered</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status & Sync</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {orders.map((ord) => {
                      let parsedItems = [];
                      try {
                        parsedItems = typeof ord.notes === 'string' ? JSON.parse(ord.notes) : ord.notes || [];
                      } catch (e) {
                        parsedItems = [];
                      }

                      return (
                        <tr key={ord.id} className="hover:bg-stone-50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-orange-600 text-xs sm:text-sm">
                            {ord.order_no}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-900">
                            Table #{formatSeqId(ord.table_no)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900">{ord.customer_name || 'Guest'}</div>
                            <div className="text-stone-500 font-mono text-[11px]">{ord.customer_phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              {parsedItems.map((itm, i) => (
                                <div key={i} className="text-stone-700">
                                  {itm.quantity}x {itm.name}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-900 text-xs sm:text-sm">
                            PKR {Number(ord.total).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status || 'received'}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-300 bg-white"
                            >
                              <option value="received">Received</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="served">Served</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                            {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: ADD / EDIT CATEGORY */}
      {/* ==================================================================== */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="font-black text-base text-stone-900">
                {editingCat ? `Edit Category #${editingCat.display_id}` : 'Create New Category'}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {catError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seafood & Fish"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Display Order Sequence</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={catFormData.display_order}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, display_order: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat_active"
                  checked={catFormData.is_active}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="cat_active" className="text-xs font-bold text-stone-700 cursor-pointer">
                  Category is Active (Visible on Customer Menu)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition active:scale-95"
                >
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADD / EDIT MENU ITEM */}
      {/* ==================================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <h3 className="font-black text-base text-stone-900">
                {editingItem ? `Edit Food Item #${formatSeqId(editingItem.display_id || editingItem.item_number)}` : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {itemError}
              </div>
            )}

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              {/* Dish Photo Upload */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {itemFormData.photo_url ? (
                    <img
                      src={itemFormData.photo_url}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-orange-500 shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-xs text-stone-800">Dish Photo</h5>
                    <p className="text-[10px] text-stone-500">Upload thumbnail for the customer menu (Max 2MB)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                  </label>
                  {itemFormData.photo_url && (
                    <button
                      type="button"
                      onClick={() => setItemFormData((p) => ({ ...p, photo_url: '' }))}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dish Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mutton Shinwari Karahi"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                  <select
                    value={itemFormData.category_id}
                    onChange={(e) => setItemFormData((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.display_id} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Quantity Unit *</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => {
                      const u = e.target.value;
                      let pl = u + 's';
                      if (u === 'Piece') pl = 'Pieces';
                      if (u === 'Portion') pl = 'Portions';
                      if (u === 'Box') pl = 'Boxes';
                      setItemFormData((p) => ({ ...p, unit: u, unit_plural: pl }));
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-semibold"
                  >
                    <option value="Portion">Portion (Karahi, Biryani, Rice)</option>
                    <option value="Piece">Piece (Roti, Naan, Kabab, Tikka)</option>
                    <option value="Cup">Cup (Ice Cream, Kheer)</option>
                    <option value="Bottle">Bottle (Cold Drink, Water)</option>
                    <option value="Can">Can / Tin (Tin Pack, Diet Can)</option>
                    <option value="Skewer">Skewer (BBQ Boti, Malai Boti)</option>
                    <option value="Platter">Platter (Special Deals, Platters)</option>
                    <option value="Box">Box (Sweets, Cakes)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Size Toggle */}
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="has_sizes_checkbox"
                    checked={itemFormData.has_sizes}
                    onChange={(e) => setItemFormData((p) => ({ ...p, has_sizes: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="has_sizes_checkbox" className="text-xs font-bold text-orange-950 cursor-pointer">
                    This item has Multiple Portions / Sizes (Half & Full)
                  </label>
                </div>

                {itemFormData.has_sizes ? (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-orange-200/70">
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-1">Half Price (PKR) *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 950"
                        value={itemFormData.size_half_price}
                        onChange={(e) => setItemFormData((p) => ({ ...p, size_half_price: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-1">Full Price (PKR) *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 1799"
                        value={itemFormData.size_full_price}
                        onChange={(e) => setItemFormData((p) => ({ ...p, size_full_price: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Single Price (PKR) *</label>
                    <input
                      type="number"
                      min="1"
                      required={!itemFormData.has_sizes}
                      placeholder="e.g. 900"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData((p) => ({ ...p, price: e.target.value }))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description / Details</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation style, or included items (for platters)..."
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="item_available"
                  checked={itemFormData.is_available}
                  onChange={(e) => setItemFormData((p) => ({ ...p, is_available: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="item_available" className="text-xs font-bold text-stone-700 cursor-pointer">
                  In Stock & Available for Ordering
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition active:scale-95"
                >
                  {editingItem ? 'Save Item Changes' : 'Create Food Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
