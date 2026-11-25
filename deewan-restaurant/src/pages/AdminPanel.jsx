import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Store,
  QrCode,
  ChefHat,
  Bell,
  BarChart3,
  Sliders,
  Search,
  Printer,
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  AlertTriangle,
  Check,
  Power,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
  Menu as MenuIcon,
  RefreshCw,
  Users,
  Volume2,
  VolumeX,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  Phone,
  Sparkles,
  Calendar
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
  formatSeqId,
  getRestaurantTables,
  saveRestaurantTable,
  deleteRestaurantTable,
  toggleTableActive,
  getRestaurantSettings,
  saveRestaurantSettings,
  calculateRestaurantAnalytics
} from '../services/restaurantService';

export default function AdminPanel() {
  // Navigation Tabs: 'overview', 'orders', 'menu', 'categories', 'profile', 'qr', 'kitchen', 'waiter', 'analytics', 'settings'
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer state

  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deewan_admin_theme') || 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('deewan_admin_theme', nextTheme);
  };

  // Audio chimes enabled
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // 4. Restaurant Tables State (Phase 2)
  const [tables, setTables] = useState([]);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableFormData, setTableFormData] = useState({
    table_number: '',
    capacity: 4,
    is_active: true
  });
  const [tableError, setTableError] = useState('');
  const [selectedTableForQr, setSelectedTableForQr] = useState(1);
  const [bulkPrintModalOpen, setBulkPrintModalOpen] = useState(false);

  // 5. Orders & Live Waiter Calls State
  const [orders, setOrders] = useState([]);
  const [waiterCalls, setWaiterCalls] = useState([]);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For detailed view / receipt
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [receiptType, setReceiptType] = useState('bill'); // 'bill' | 'kot'

  // 6. System Settings State (Phase 2)
  const [settings, setSettings] = useState({
    currency: 'PKR',
    currency_symbol: 'Rs.',
    tax_rate: 0,
    service_charge: 0,
    sound_enabled: true,
    auto_refresh_seconds: 15,
    default_prep_time_minutes: 20
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

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
            if (soundEnabled) sound.playNewOrderChime();
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
          if (payload.eventType === 'INSERT') {
            if (payload.new.call_type === 'order') {
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
                if (soundEnabled) sound.playNewOrderChime();
                setNewOrderAlert(orderObj);
                setOrders((prev) => {
                  if (prev.some((o) => o.order_no === orderObj.order_no)) return prev;
                  return [orderObj, ...prev];
                });
                setTimeout(() => setNewOrderAlert(null), 8000);
              } catch (e) {
                console.warn('Error parsing realtime order from waiter_calls:', e);
              }
            } else {
              // General service / waiter buzzer
              if (soundEnabled) sound.playBellChime();
              setWaiterCalls((prev) => [payload.new, ...prev.filter((w) => w.id !== payload.new.id)]);
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.call_type === 'order') {
              setOrders((prev) =>
                prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
              );
            } else {
              setWaiterCalls((prev) =>
                prev.map((w) => (w.id === payload.new.id ? payload.new : w))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setWaiterCalls((prev) => prev.filter((w) => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(waiterCallsChannel);
    };
  }, [soundEnabled]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profData, catsData, itemsData, tablesData] = await Promise.all([
        getRestaurantProfile(),
        getCategories(),
        getMenuItems(),
        getRestaurantTables()
      ]);
      setProfile(profData);
      setCategories(catsData);
      setMenuItems(itemsData);
      setTables(tablesData);
      setSettings(getRestaurantSettings());
      if (tablesData && tablesData.length > 0 && !tablesData.some((t) => t.table_number === selectedTableForQr)) {
        setSelectedTableForQr(tablesData[0].table_number);
      }
      await Promise.all([fetchOrders(), fetchWaiterCalls()]);
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
        .limit(50);

      const { data: wcOrders } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('call_type', 'order')
        .order('created_at', { ascending: false })
        .limit(50);

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
      console.error('Fetch orders error:', e);
    }
  };

  const fetchWaiterCalls = async () => {
    try {
      const { data } = await supabase
        .from('waiter_calls')
        .select('*')
        .neq('call_type', 'order')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) {
        setWaiterCalls(data);
      }
    } catch (e) {
      console.warn('Fetch waiter calls error:', e);
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

  const handleResolveWaiterCall = async (callId) => {
    setWaiterCalls((prev) =>
      prev.map((w) => (w.id === callId ? { ...w, status: 'resolved' } : w))
    );
    try {
      await supabase.from('waiter_calls').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('id', callId);
    } catch (err) {
      console.warn('Resolve call error:', err);
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
      setProfileSuccessMsg(`Restaurant status updated to ${nextStatus ? 'OPEN' : 'CLOSED'} and synced system-wide!`);
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

  const handleLogout = async () => {
    if (window.confirm('Do you want to log out of the Deewan Admin Terminal?')) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out note:', e);
      }
      window.location.href = '/login';
    }
  };

  // ==============================================================================
  // D. TABLE & QR MANAGEMENT ACTIONS (PHASE 2)
  // ==============================================================================

  const handleOpenTableModal = (table = null) => {
    setTableError('');
    if (table) {
      setEditingTable(table);
      setTableFormData({
        table_number: table.table_number,
        capacity: table.capacity || 4,
        is_active: table.is_active !== undefined ? table.is_active : true
      });
    } else {
      setEditingTable(null);
      const maxNum = tables.reduce((max, t) => Math.max(max, parseInt(t.table_number, 10) || 0), 0);
      setTableFormData({
        table_number: maxNum + 1,
        capacity: 4,
        is_active: true
      });
    }
    setTableModalOpen(true);
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    const num = parseInt(tableFormData.table_number, 10);
    if (isNaN(num) || num <= 0) {
      setTableError('Please enter a valid table number (e.g. 1, 2, 11)');
      return;
    }

    if (!editingTable && tables.some((t) => t.table_number === num)) {
      setTableError(`Table #${formatSeqId(num)} already exists.`);
      return;
    }

    try {
      const payload = {
        ...(editingTable ? { id: editingTable.id } : {}),
        table_number: num,
        capacity: parseInt(tableFormData.capacity, 10) || 4,
        is_active: tableFormData.is_active
      };
      const res = await saveRestaurantTable(payload);
      if (res.success) {
        setTables(res.tables);
        setTableModalOpen(false);
      }
    } catch (err) {
      setTableError(err.message || 'Failed to save table');
    }
  };

  const handleDeleteTable = async (tableId) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const hasActiveOrder = orders.some(
      (o) => parseInt(o.table_no, 10) === table.table_number && ['received', 'preparing'].includes(o.status)
    );
    if (hasActiveOrder) {
      alert(`Cannot delete Table #${formatSeqId(table.table_number)} because it has active dine-in orders in progress.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Table #${formatSeqId(table.table_number)}?`)) return;

    const res = await deleteRestaurantTable(tableId);
    if (res.success) {
      setTables(res.tables);
      if (selectedTableForQr === table.table_number && res.tables.length > 0) {
        setSelectedTableForQr(res.tables[0].table_number);
      }
    }
  };

  const handleToggleTableActive = async (table) => {
    const res = await toggleTableActive(table.id, table.is_active);
    if (res.success) {
      setTables(res.tables);
    }
  };

  // ==============================================================================
  // E. ORDER DETAILS & RECEIPT / KOT PRINTING (PHASE 2)
  // ==============================================================================

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handlePrintSlip = (type = 'bill') => {
    setReceiptType(type);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // ==============================================================================
  // F. SETTINGS ACTIONS (PHASE 2)
  // ==============================================================================

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccessMsg('');
    const res = saveRestaurantSettings(settings);
    if (res.success) {
      setSettings(res.settings);
      setSettingsSuccessMsg('System settings saved and applied across all terminals!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
    setSettingsSaving(false);
  };

  const handleTestChime = () => {
    sound.playNewOrderChime();
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

  // Filtered Orders with Search & Status Filter
  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      orderFilter === 'ALL' || (o.status || 'received').toLowerCase() === orderFilter.toLowerCase();

    const matchesSearch =
      !orderSearchQuery ||
      (o.order_no && o.order_no.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (o.customer_phone && o.customer_phone.includes(orderSearchQuery)) ||
      String(o.table_no).includes(orderSearchQuery);

    return matchesFilter && matchesSearch;
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

  // Compute live KPI metrics & analytics
  const analyticsData = calculateRestaurantAnalytics(orders, menuItems, tables);

  const totalGrossRevenue = analyticsData.grossSales;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const pendingWaiterCallsCount = waiterCalls.filter(
    (w) => w.status === 'pending'
  ).length;

  const occupiedTables = analyticsData.occupiedTableNumbers;

  // Sidebar navigation configuration matching actual restaurant system
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : orders.length },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed, badge: menuItems.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'profile', label: 'Restaurant Profile', icon: Store, badge: profile.is_open ? 'Open' : 'Closed' },
    { id: 'qr', label: 'Table & QR Management', icon: QrCode, badge: tables.length || '10' },
    { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat, badge: orders.filter((o) => o.status === 'received' || o.status === 'preparing').length },
    { id: 'waiter', label: 'Waiter Calls', icon: Bell, badge: pendingWaiterCallsCount > 0 ? pendingWaiterCallsCount : null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Sliders, badge: null }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-stone-950 text-stone-100' : 'bg-slate-50 text-stone-900'} flex font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200`}>
      {/* ==================================================================== */}
      {/* 1. LEFT SIDEBAR (FIXED NAVIGATION) */}
      {/* ==================================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* A. Sidebar Header & Logo */}
          <div className="p-5 border-b border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Restaurant Logo"
                  className="w-10 h-10 rounded-2xl object-cover border border-emerald-500/40 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-xs shrink-0">
                  🍖
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm text-stone-900 dark:text-white truncate leading-tight">
                  {profile.name || 'Deewan-E-Khaas'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Admin Dashboard
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 md:hidden rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* B. Navigation Items (Scrollable) */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Main Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'orders' && activeOrdersCount > 0
                          ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                          : item.id === 'waiter' && pendingWaiterCallsCount > 0
                          ? 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 animate-pulse'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* C. Sidebar Footer (Theme, Public Link, Admin Profile & Logout) */}
          <div className="p-3 border-t border-stone-100 dark:border-stone-800/80 space-y-2 bg-stone-50/50 dark:bg-stone-900/50">
            {/* Dark / Light Mode Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 text-xs">
              <span className="font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                onClick={toggleTheme}
                className="p-1 px-2.5 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-[11px] font-bold hover:opacity-80 transition"
              >
                Switch
              </button>
            </div>

            {/* Public Website Link */}
            <a
              href="/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              <span className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-stone-400" />
                Customer Menu
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>

            {/* Logged-In Admin Card */}
            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  DA
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-stone-900 dark:text-white truncate">
                    Deewan Admin
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                    Terminal #{profile.display_id || '01'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ==================================================================== */}
      <main className="flex-1 md:ml-64 lg:ml-72 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        {/* A. Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl md:hidden"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-white truncate">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'orders' && 'Live Dine-In Orders'}
                  {activeTab === 'menu' && 'Menu Management'}
                  {activeTab === 'categories' && 'Categories Management'}
                  {activeTab === 'profile' && 'Restaurant Profile'}
                  {activeTab === 'qr' && 'Table & QR Management'}
                  {activeTab === 'kitchen' && 'Kitchen Display (KDS)'}
                  {activeTab === 'waiter' && 'Floor Waiter Calls'}
                  {activeTab === 'analytics' && 'Restaurant Analytics'}
                  {activeTab === 'settings' && 'System Settings'}
                </h2>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700">
                  Terminal #{profile.display_id || '01'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
                {activeTab === 'overview' && 'Real-time performance, kitchen throughput and live orders stream'}
                {activeTab === 'orders' && 'Monitor, update, and manage customer orders across all dining tables'}
                {activeTab === 'menu' && 'Manage food dishes, half/full prices, availability and product units'}
                {activeTab === 'categories' && 'Organize category order, active visibility, and assigned dish counts'}
                {activeTab === 'profile' && 'Update restaurant contact, address, operating hours, and branding'}
                {activeTab === 'qr' && 'Generate and print table placards for contactless customer dine-in ordering'}
                {activeTab === 'kitchen' && 'Kitchen line view with cooking timers and status advance'}
                {activeTab === 'waiter' && 'Floor staff assistance requests with table-specific buzzer'}
                {activeTab === 'analytics' && 'Revenue metrics, popular menu categories, and sales analytics'}
                {activeTab === 'settings' && 'Configure sound chimes, terminal parameters, and currency'}
              </p>
            </div>
          </div>

          {/* Top-Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Status Toggle: OPEN / CLOSED */}
            <button
              onClick={handleQuickStatusToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 ${
                profile.is_open
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
              title="Click to toggle restaurant Open/Closed status instantly"
            >
              <span className={`w-2 h-2 rounded-full ${profile.is_open ? 'bg-emerald-200 animate-pulse' : 'bg-rose-200'}`} />
              <span className="hidden xs:inline">{profile.is_open ? 'STATUS: OPEN' : 'STATUS: CLOSED'}</span>
              <span className="xs:hidden">{profile.is_open ? 'OPEN' : 'CLOSED'}</span>
            </button>

            {/* Contextual Action Button */}
            {activeTab === 'menu' && (
              <button
                onClick={() => handleOpenItemModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Food Item</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            {activeTab === 'categories' && (
              <button
                onClick={() => handleOpenCatModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            {activeTab === 'qr' && (
              <button
                onClick={handlePrintQr}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Print Placard</span>
              </button>
            )}

            {/* Sound Mute Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>

            {/* Data Refresh */}
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition disabled:opacity-40"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </header>

        {/* Global Alert Notification for incoming real-time orders */}
        {newOrderAlert && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-white/20 rounded-xl text-base">🔔</span>
              <div>
                <span className="font-extrabold text-white text-sm">NEW ORDER {newOrderAlert.order_no}!</span>
                <span className="opacity-90 ml-2">Table #{formatSeqId(newOrderAlert.table_no)} • PKR {Number(newOrderAlert.total).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('orders');
                setNewOrderAlert(null);
              }}
              className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-50 transition"
            >
              View Order ➔
            </button>
          </div>
        )}

        {/* B. Tab Content Modules */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {/* ==================================================================== */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ==================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Bento KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono">
                    PKR {totalGrossRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Live Dine-In Revenue
                  </div>
                </div>

                {/* 2. Total Orders */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono">
                    {orders.length} Orders
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                    {activeOrdersCount} in-flight • {orders.filter((o) => o.status === 'served').length} served
                  </div>
                </div>

                {/* 3. Occupied Tables */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Tables</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono">
                    {occupiedTables.length} / 10 Tables
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                    {occupiedTables.length > 0 ? `Tables: ${occupiedTables.join(', ')}` : 'All tables ready'}
                  </div>
                </div>

                {/* 4. Menu Dishes */}
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Menu Catalog</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white font-mono">
                    {menuItems.length} Dishes
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                    Across {categories.length} organized categories
                  </div>
                </div>
              </div>

              {/* Recent Orders Stream & Floor Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Live Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                        Live Kitchen & Order Stream
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">Recent customer orders synchronized via Supabase Realtime</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      View All ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="font-semibold text-xs">No orders yet</p>
                      <p className="text-[11px]">Orders placed by customers in the chat will appear here live.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
                          <tr>
                            <th className="py-2.5 px-3">Order #</th>
                            <th className="py-2.5 px-3">Table</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                          {orders.slice(0, 6).map((ord) => (
                            <tr key={ord.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition">
                              <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {ord.order_no}
                              </td>
                              <td className="py-3 px-3 font-semibold text-stone-900 dark:text-white">
                                Table #{formatSeqId(ord.table_no)}
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-stone-900 dark:text-white truncate max-w-[120px]">
                                  {ord.customer_name || 'Guest'}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono">{ord.customer_phone}</div>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-stone-900 dark:text-white">
                                PKR {Number(ord.total).toLocaleString()}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    ord.status === 'received'
                                      ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                      : ord.status === 'preparing'
                                      ? 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                      : ord.status === 'ready'
                                      ? 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                                      : ord.status === 'served'
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                      : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                                  }`}
                                >
                                  {ord.status || 'received'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <select
                                  value={ord.status || 'received'}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-bold border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 cursor-pointer"
                                >
                                  <option value="received">Received</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="ready">Ready</option>
                                  <option value="served">Served</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Col: Waiter Calls & Quick Terminal Shortcuts */}
                <div className="space-y-6">
                  {/* Waiter Calls Quick Card */}
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-500" />
                        <h4 className="font-extrabold text-sm text-stone-900 dark:text-white">Floor Waiter Calls</h4>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {pendingWaiterCallsCount} Pending
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto">
                      {waiterCalls.filter((w) => w.status === 'pending').length === 0 ? (
                        <div className="text-center py-6 text-stone-400 text-xs">
                          <CheckCircle className="w-8 h-8 mx-auto mb-1 text-emerald-500/40" />
                          No pending waiter calls
                        </div>
                      ) : (
                        waiterCalls
                          .filter((w) => w.status === 'pending')
                          .slice(0, 4)
                          .map((call) => (
                            <div
                              key={call.id}
                              className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="font-bold text-xs text-stone-900 dark:text-white">
                                  Table #{formatSeqId(call.table_no)}
                                </div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                                  {call.notes || 'Service requested'}
                                </div>
                              </div>
                              <button
                                onClick={() => handleResolveWaiterCall(call.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition"
                              >
                                Resolve
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Terminal Quick Actions */}
                  <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5">
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-white mb-3">
                      Terminal Shortcuts
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('menu')}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1.5 transition text-center"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Add Dish</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('qr')}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1.5 transition text-center"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Print QRs</span>
                      </button>

                      <a
                        href="/kitchen"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1.5 transition text-center"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>KDS Screen</span>
                      </a>

                      <button
                        onClick={() => setActiveTab('profile')}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1.5 transition text-center"
                      >
                        <Store className="w-4 h-4" />
                        <span>Edit Hours</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: ORDERS MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Live Dine-In Orders ({filteredOrders.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Real-time order feed, digital KOT printing, and lifecycle status management
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Bar */}
                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search order #, customer, table..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
                    {['ALL', 'received', 'preparing', 'ready', 'served', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-2.5 py-1 rounded-lg capitalize transition text-[11px] ${
                          orderFilter === st
                            ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white font-bold shadow-xs'
                            : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-sm">No orders matching filter</p>
                  <p className="text-xs">Incoming dine-in orders will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Table</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Ordered Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status & Sync</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {filteredOrders.map((ord) => {
                        let parsedItems = [];
                        try {
                          parsedItems = typeof ord.notes === 'string' ? JSON.parse(ord.notes) : ord.notes || [];
                        } catch (e) {
                          parsedItems = [];
                        }

                        return (
                          <tr
                            key={ord.id}
                            className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition group cursor-pointer"
                            onClick={() => handleOpenOrderDetails(ord)}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                              {ord.order_no}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-stone-900 dark:text-white">
                              <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono font-bold">
                                Table #{formatSeqId(ord.table_no)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-stone-900 dark:text-white">{ord.customer_name || 'Guest'}</div>
                              <div className="text-stone-400 font-mono text-[11px]">{ord.customer_phone || '—'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                {parsedItems.slice(0, 2).map((itm, i) => (
                                  <div key={i} className="text-stone-700 dark:text-stone-300">
                                    <span className="font-bold text-stone-900 dark:text-white">{itm.quantity}x</span> {itm.name}
                                  </div>
                                ))}
                                {parsedItems.length > 2 && (
                                  <div className="text-[10px] text-stone-400 italic">
                                    +{parsedItems.length - 2} more items...
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                              {settings.currency_symbol || 'PKR'} {Number(ord.total).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={ord.status || 'received'}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border border-stone-200 dark:border-stone-700 cursor-pointer ${
                                  ord.status === 'received'
                                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    : ord.status === 'preparing'
                                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                    : ord.status === 'ready'
                                    ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                                    : ord.status === 'served'
                                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                                }`}
                              >
                                <option value="received">Received</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="served">Served</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                              {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenOrderDetails(ord)}
                                  className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-stone-700 dark:text-stone-300 hover:text-emerald-600 rounded-lg text-[11px] font-bold transition"
                                  title="View full order details and print receipt"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(ord);
                                    handlePrintSlip('kot');
                                  }}
                                  className="p-1 px-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                                  title="Print Kitchen KOT"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* ==================================================================== */}
          {/* TAB 3: MENU MANAGEMENT MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'menu' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-5">
              {/* Search & Category Filter Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name, ID (#01) or number..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-semibold hidden sm:inline">Category:</span>
                  <select
                    value={selectedCatFilter}
                    onChange={(e) => setSelectedCatFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">All Categories ({menuItems.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.display_id} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCatFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCatFilter === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  All ({menuItems.length})
                </button>
                {categories.map((cat) => {
                  const count = menuItems.filter((i) => i.category_id === cat.id || i.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                        selectedCatFilter === cat.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      <span>#{cat.display_id} {cat.name}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Menu Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Sequential ID</th>
                      <th className="py-3 px-4">Food Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-white">
                          #{item.display_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {item.photo_url ? (
                              <img
                                src={item.photo_url}
                                alt={item.name}
                                className="w-9 h-9 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 shrink-0">
                                <UtensilsCrossed className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-stone-900 dark:text-white text-xs sm:text-sm">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                            {getCatName(item.category_id)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 font-medium">
                          {item.unit || 'Portion'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-white">
                          {item.has_sizes && item.sizes ? (
                            <div className="text-[11px] space-y-0.5">
                              <div>Half: PKR {item.sizes.half?.price?.toLocaleString()}</div>
                              <div>Full: PKR {item.sizes.full?.price?.toLocaleString()}</div>
                            </div>
                          ) : (
                            <span>PKR {Number(item.price).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              item.is_available
                                ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                            {item.is_available ? 'Available' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenItemModal(item)}
                              className="p-1.5 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          {/* TAB 4: CATEGORIES MANAGEMENT MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'categories' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Food Categories ({categories.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Sequence order, assigned dishes count, and menu visibility controls
                  </p>
                </div>
                <button
                  onClick={() => handleOpenCatModal()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Sequential ID</th>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Display Order</th>
                      <th className="py-3 px-4">Assigned Dishes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {categories.map((cat) => {
                      const itemCount = menuItems.filter((i) => i.category_id === cat.id || i.category === cat.id).length;
                      return (
                        <tr key={cat.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-white">
                            #{cat.display_id}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-stone-900 dark:text-white text-xs sm:text-sm">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-600 dark:text-stone-400">
                            {cat.display_order}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
                              {itemCount} items
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleCategoryActive(cat)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                                cat.is_active !== false
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : 'bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                              {cat.is_active !== false ? 'Active' : 'Hidden'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenCatModal(cat)}
                                className="p-1.5 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          {/* TAB 5: RESTAURANT PROFILE MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Restaurant Profile & Identity
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Configure restaurant branding, address, operating hours, and customer chat headers
                  </p>
                </div>
                <button
                  onClick={handleQuickStatusToggle}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition ${
                    profile.is_open ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {profile.is_open ? 'STATUS: OPEN' : 'STATUS: CLOSED'}
                </button>
              </div>

              {profileSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Logo Section */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {profile.logo_url ? (
                      <img
                        src={profile.logo_url}
                        alt="Logo Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-stone-200 dark:bg-stone-700 border-2 border-dashed border-stone-300 dark:border-stone-600 flex items-center justify-center text-stone-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-white">Restaurant Logo</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Appears on customer chatbot header & placards (PNG/JPG, max 2MB)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {profile.logo_url && (
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-bold transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={profile.opening_hours}
                      onChange={(e) => setProfile((prev) => ({ ...prev, opening_hours: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Physical Restaurant Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      About & Specialty Description
                    </label>
                    <textarea
                      rows={3}
                      value={profile.description}
                      onChange={(e) => setProfile((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 6: TABLE & QR MANAGEMENT MODULE (PHASE 2) */}
          {/* ==================================================================== */}
          {activeTab === 'qr' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Dining Tables & QR Code Placards ({tables.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Manage restaurant floor tables, live occupancy status, and table-specific ordering QR codes
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenTableModal()}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Dining Table</span>
                  </button>
                  <button
                    onClick={() => setBulkPrintModalOpen(true)}
                    className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    title="Print QR tent cards for all tables in one document"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Print All Placards</span>
                  </button>
                  <button
                    onClick={handlePrintQr}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Table #{formatSeqId(selectedTableForQr)}</span>
                  </button>
                </div>
              </div>

              {/* Table Floor Cards Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Restaurant Floor Tables:
                  </label>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {analyticsData.occupiedTableNumbers.length} Occupied • {tables.length - analyticsData.occupiedTableNumbers.length} Vacant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {tables.map((t) => {
                    const isOccupied = analyticsData.occupiedTableNumbers.includes(t.table_number);
                    const isSelected = selectedTableForQr === t.table_number;

                    return (
                      <div
                        key={t.id || t.table_number}
                        onClick={() => setSelectedTableForQr(t.table_number)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/80 hover:bg-white dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-700/60">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-stone-900 dark:text-white">
                              Table #{formatSeqId(t.table_number)}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium">
                              👥 {t.capacity || 4} Seats
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isOccupied
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {isOccupied ? 'Occupied' : 'Vacant'}
                          </span>
                        </div>

                        <div className="py-2.5 flex items-center justify-between text-[11px]">
                          <span className="text-stone-500 dark:text-stone-400 font-medium">Ordering QR:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-[120px]">
                            /chat?table={t.table_number}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleTableActive(t)}
                              className={`p-1 rounded-lg text-[10px] font-bold ${
                                t.is_active
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
                              }`}
                              title="Toggle table active on ordering"
                            >
                              {t.is_active ? 'Active' : 'Disabled'}
                            </button>
                            <a
                              href={`/chat?table=${t.table_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 px-1.5 text-stone-500 hover:text-emerald-600 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition"
                              title="Test live table ordering"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenTableModal(t)}
                              className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 rounded-lg transition"
                              title="Edit table details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTable(t.id)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded-lg transition"
                              title="Delete table"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Printable Table Tent Placard Preview */}
              <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Placard Preview: Table #{formatSeqId(selectedTableForQr)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintQr}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print This Placard
                    </button>
                  </div>
                </div>

                <div className="max-w-sm mx-auto p-8 rounded-3xl bg-white text-stone-900 border-2 border-stone-200 shadow-lg text-center my-2 print:border-none print:shadow-none">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt="Logo"
                      className="w-16 h-16 mx-auto mb-2 rounded-2xl object-cover border border-emerald-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl shadow-xs">
                      🍖
                    </div>
                  )}
                  <h3 className="text-base font-black tracking-tight text-stone-900 uppercase">
                    {profile.name}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-5">
                    Dine-In • AI Chat Ordering
                  </p>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 inline-block mb-4 shadow-inner">
                    <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin={true} />
                  </div>

                  <div className="mt-2">
                    <span className="inline-block px-5 py-1.5 rounded-full bg-stone-900 text-white font-black text-base font-mono">
                      TABLE #{formatSeqId(selectedTableForQr)}
                    </span>
                    <p className="text-xs text-stone-600 mt-2 font-semibold">
                      Scan with camera to order via chat!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 7: KITCHEN MANAGEMENT MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'kitchen' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Kitchen Display System (KDS) Queue
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Live cooking line view for kitchen staff with status timers
                  </p>
                </div>
                <a
                  href="/kitchen"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Fullscreen KDS Screen
                </a>
              </div>

              {/* Kitchen In-Flight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.filter((o) => o.status === 'received' || o.status === 'preparing').length === 0 ? (
                  <div className="col-span-full py-16 text-center text-stone-400">
                    <ChefHat className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">All Kitchen Orders Cleared!</p>
                    <p className="text-xs">Incoming tickets will appear here with sound chimes.</p>
                  </div>
                ) : (
                  orders
                    .filter((o) => o.status === 'received' || o.status === 'preparing')
                    .map((ord) => {
                      let items = [];
                      try {
                        items = typeof ord.notes === 'string' ? JSON.parse(ord.notes) : ord.notes || [];
                      } catch (e) {
                        items = [];
                      }

                      return (
                        <div
                          key={ord.id}
                          className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-700/60">
                              <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                                {ord.order_no}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-stone-900 text-white font-bold text-xs">
                                Table #{formatSeqId(ord.table_no)}
                              </span>
                            </div>

                            <div className="py-3 space-y-1 text-xs">
                              {items.map((itm, idx) => (
                                <div key={idx} className="flex justify-between text-stone-800 dark:text-stone-200">
                                  <span>{itm.quantity}x {itm.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-stone-400">
                              {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, ord.status === 'received' ? 'preparing' : 'ready')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                            >
                              {ord.status === 'received' ? 'Mark Preparing ➔' : 'Mark Ready ➔'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 8: WAITER CALLS MODULE */}
          {/* ==================================================================== */}
          {activeTab === 'waiter' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                    Floor Staff & Waiter Calls ({waiterCalls.length})
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Real-time service buzzer notifications from customer tables
                  </p>
                </div>
                <a
                  href="/waiter"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Floor Waiter Screen
                </a>
              </div>

              {waiterCalls.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-500" />
                  <p className="font-bold text-sm">No Active Waiter Calls</p>
                  <p className="text-xs">When a guest taps "Waiter Bulao", buzzer alerts will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {waiterCalls.map((call) => (
                    <div
                      key={call.id}
                      className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-4 ${
                        call.status === 'pending'
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                          : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-stone-900 dark:text-white">
                            Table #{formatSeqId(call.table_no)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              call.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {call.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{call.notes || 'Service call'}</p>
                        <p className="text-[10px] font-mono text-stone-400 mt-1">
                          {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {call.status === 'pending' && (
                        <button
                          onClick={() => handleResolveWaiterCall(call.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 9: ANALYTICS MODULE (PHASE 2) */}
          {/* ==================================================================== */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                  Restaurant Performance & Sales Analytics
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Real-time sales velocity, average ticket value, floor table occupancy, and dish popularity
                </p>
              </div>

              {/* 4 Main Bento KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Gross Sales</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {settings.currency_symbol || 'PKR'} {analyticsData.grossSales.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">Across {analyticsData.totalOrders} total orders</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Today's Sales</span>
                  <div className="text-xl font-black text-stone-900 dark:text-white font-mono mt-1">
                    {settings.currency_symbol || 'PKR'} {analyticsData.todaySales.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">{analyticsData.todayOrdersCount} orders placed today</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Average Ticket (AOV)</span>
                  <div className="text-xl font-black text-stone-900 dark:text-white font-mono mt-1">
                    {settings.currency_symbol || 'PKR'} {analyticsData.avgOrderValue.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">Average guest order spend</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[11px] font-bold uppercase text-stone-400">Table Occupancy Rate</span>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                    {analyticsData.occupancyRate}%
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {analyticsData.occupiedTableNumbers.length} of {analyticsData.totalTablesCount} tables occupied
                  </span>
                </div>
              </div>

              {/* Two Column Section: Top Selling Dishes & Order Status Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                {/* Top Selling Dishes Leaderboard */}
                <div>
                  <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Top Selling Dishes
                  </h4>
                  {analyticsData.topDishes.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                      No order data available yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analyticsData.topDishes.map((dish, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 text-xs">
                          <div className="flex items-center justify-between mb-1.5 font-bold">
                            <span className="text-stone-900 dark:text-white truncate">
                              #{idx + 1} {dish.name}
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                              {settings.currency_symbol || 'PKR'} {dish.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500">
                            <span>{dish.count} portions sold</span>
                            <span className="font-mono">{Math.round((dish.revenue / (analyticsData.grossSales || 1)) * 100)}% of sales</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Distribution */}
                <div>
                  <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Live Order Pipeline
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Received / Queue</span>
                      <div className="text-lg font-black text-amber-800 dark:text-amber-300 font-mono mt-1">
                        {analyticsData.statusCounts.received}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">Cooking (Kitchen)</span>
                      <div className="text-lg font-black text-blue-800 dark:text-blue-300 font-mono mt-1">
                        {analyticsData.statusCounts.preparing}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">Ready for Pickup</span>
                      <div className="text-lg font-black text-purple-800 dark:text-purple-300 font-mono mt-1">
                        {analyticsData.statusCounts.ready}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Served & Billed</span>
                      <div className="text-lg font-black text-emerald-800 dark:text-emerald-300 font-mono mt-1">
                        {analyticsData.statusCounts.served}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bar */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                <h4 className="font-bold text-xs text-stone-700 dark:text-stone-300 mb-3">
                  Menu Catalog Distribution by Category
                </h4>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const count = menuItems.filter((i) => i.category_id === cat.id || i.category === cat.id).length;
                    const pct = menuItems.length > 0 ? Math.round((count / menuItems.length) * 100) : 0;
                    return (
                      <div key={cat.id} className="text-xs">
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-stone-800 dark:text-stone-200">#{cat.display_id} {cat.name}</span>
                          <span className="text-stone-500 font-mono">{count} items ({pct}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 10: SETTINGS MODULE (PHASE 2) */}
          {/* ==================================================================== */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 dark:text-white">
                  Terminal & Operational System Settings
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Configure hardware alerts, currency, taxes, prep timers, and Supabase integration parameters
                </p>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl text-xs">
                {/* Audio Chimes */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-white">Audio Chimes</h5>
                    <p className="text-stone-500 text-[11px]">Play chime when customer places an order or rings waiter buzzer</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestChime}
                      className="px-2.5 py-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 rounded-lg text-[11px] font-semibold"
                    >
                      Test Chime
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        setSettings((prev) => ({ ...prev, sound_enabled: !soundEnabled }));
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-white transition ${
                        soundEnabled ? 'bg-emerald-600' : 'bg-stone-400'
                      }`}
                    >
                      {soundEnabled ? 'Enabled' : 'Muted'}
                    </button>
                  </div>
                </div>

                {/* Currency & Symbol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                    <label className="block font-bold text-stone-900 dark:text-white mb-1">Currency Code</label>
                    <p className="text-stone-500 text-[11px] mb-2">Display denomination</p>
                    <input
                      type="text"
                      value={settings.currency || 'PKR'}
                      onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                    <label className="block font-bold text-stone-900 dark:text-white mb-1">Currency Symbol</label>
                    <p className="text-stone-500 text-[11px] mb-2">Symbol shown on receipts & menus</p>
                    <input
                      type="text"
                      value={settings.currency_symbol || 'Rs.'}
                      onChange={(e) => setSettings((prev) => ({ ...prev, currency_symbol: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Tax & Prep Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                    <label className="block font-bold text-stone-900 dark:text-white mb-1">GST / Sales Tax (%)</label>
                    <p className="text-stone-500 text-[11px] mb-2">Applicable tax rate on orders</p>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={settings.tax_rate || 0}
                      onChange={(e) => setSettings((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60">
                    <label className="block font-bold text-stone-900 dark:text-white mb-1">Default Cooking Time (Mins)</label>
                    <p className="text-stone-500 text-[11px] mb-2">KDS preparation countdown</p>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.default_prep_time_minutes || 20}
                      onChange={(e) => setSettings((prev) => ({ ...prev, default_prep_time_minutes: parseInt(e.target.value, 10) || 20 }))}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Terminal & Supabase Diagnostics */}
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-white">Supabase Realtime Sync</h5>
                    <p className="text-stone-500 text-[11px]">PostgreSQL websocket status for live order stream</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>

                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving...' : 'Save System Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: ADD / EDIT CATEGORY */}
      {/* ==================================================================== */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                {editingCat ? `Edit Category #${editingCat.display_id}` : 'Create New Category'}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{catError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Seafood & Fish"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Display Order Sequence</label>
                <input
                  type="number"
                  value={catFormData.display_order}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, display_order: e.target.value }))}
                  min="1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={catFormData.is_active}
                  onChange={(e) => setCatFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <label htmlFor="catActive" className="font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  Category is Active (Visible on Customer Menu)
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  {editingCat ? 'Update Category' : 'Create Category'}
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
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 dark:border-stone-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                {editingItem ? `Edit Dish #${editingItem.display_id}` : 'Add New Food Item'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{itemError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Chicken Malai Handi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Category *</label>
                  <select
                    value={itemFormData.category_id}
                    onChange={(e) => setItemFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        #{c.display_id} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Quantity Unit</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Portion">Portion (Karahi / Handi)</option>
                    <option value="Piece">Piece (Roti / Burger / Sweet)</option>
                    <option value="Platter">Platter (Special Combos)</option>
                    <option value="Deal">Deal (Special Deals)</option>
                    <option value="Skewer">Skewer (BBQ / Tikka)</option>
                    <option value="Bottle">Bottle (Cold Drinks)</option>
                    <option value="Can">Can (Beverages)</option>
                    <option value="Cup">Cup (Ice Cream)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Size Toggle */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasSizes"
                      checked={itemFormData.has_sizes}
                      onChange={(e) => setItemFormData((prev) => ({ ...prev, has_sizes: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                    />
                    <label htmlFor="hasSizes" className="font-bold text-stone-800 dark:text-stone-200 cursor-pointer">
                      Has Half / Full Sizes (Karahi / Handi)
                    </label>
                  </div>
                </div>

                {itemFormData.has_sizes ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Half Price (PKR)</label>
                      <input
                        type="number"
                        value={itemFormData.size_half_price}
                        onChange={(e) => setItemFormData((prev) => ({ ...prev, size_half_price: e.target.value }))}
                        placeholder="e.g. 950"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Full Price (PKR)</label>
                      <input
                        type="number"
                        value={itemFormData.size_full_price}
                        onChange={(e) => setItemFormData((prev) => ({ ...prev, size_full_price: e.target.value }))}
                        placeholder="e.g. 1799"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-stone-600 dark:text-stone-400 mb-1">Dish Price (PKR) *</label>
                    <input
                      type="number"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 850"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Dish Description</label>
                <textarea
                  rows={2}
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Ingredients, spice level, preparation style..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-3">
                {itemFormData.photo_url ? (
                  <img
                    src={itemFormData.photo_url}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <label className="cursor-pointer px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Dish Image</span>
                    <input type="file" accept="image/*" onChange={handleItemImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="itemAvailable"
                  checked={itemFormData.is_available}
                  onChange={(e) => setItemFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <label htmlFor="itemAvailable" className="font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  Item is Available for Dine-In Ordering
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  {editingItem ? 'Update Dish' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD / EDIT RESTAURANT TABLE (PHASE 2) */}
      {/* ==================================================================== */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-black text-base text-stone-900 dark:text-white">
                {editingTable ? `Edit Table #${formatSeqId(editingTable.table_number)}` : 'Add New Dining Table'}
              </h3>
              <button
                onClick={() => setTableModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tableError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{tableError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Table Number *
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={tableFormData.table_number}
                  onChange={(e) => setTableFormData((prev) => ({ ...prev, table_number: e.target.value }))}
                  placeholder="e.g. 11"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Unique physical dining table number in the restaurant
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tableFormData.capacity}
                  onChange={(e) => setTableFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tableActive"
                  checked={tableFormData.is_active}
                  onChange={(e) => setTableFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
                />
                <label htmlFor="tableActive" className="font-semibold text-stone-700 dark:text-stone-300 cursor-pointer">
                  Table is Active for Dine-In Ordering
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  {editingTable ? 'Update Table' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: ORDER DETAILS & RECEIPT / KOT PRINT MODAL (PHASE 2) */}
      {/* ==================================================================== */}
      {orderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 dark:border-stone-800 my-8 text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400">
                  {selectedOrder.order_no}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-stone-900 text-white font-bold text-xs">
                  Table #{formatSeqId(selectedOrder.table_no)}
                </span>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Timestamp Bar */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Guest Name</span>
                <div className="font-bold text-stone-900 dark:text-white text-sm">
                  {selectedOrder.customer_name || 'Guest'}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Mobile Phone</span>
                <div className="font-mono text-stone-700 dark:text-stone-300 font-semibold">
                  {selectedOrder.customer_phone || '—'}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Placed Time</span>
                <div className="font-mono text-stone-500">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Current Status</span>
                <div className="font-bold capitalize text-emerald-600 dark:text-emerald-400">
                  {selectedOrder.status || 'Received'}
                </div>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <div className="mb-4">
              <h4 className="font-bold text-stone-700 dark:text-stone-300 mb-2">Ordered Dishes & Portions</h4>
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {(() => {
                      let items = [];
                      try {
                        items = typeof selectedOrder.notes === 'string' ? JSON.parse(selectedOrder.notes) : selectedOrder.notes || [];
                      } catch (e) {
                        items = [];
                      }
                      return items.map((itm, i) => (
                        <tr key={i} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                          <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-white">
                            {itm.name}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-stone-700 dark:text-stone-300 font-mono">
                            {itm.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-500">
                            {settings.currency_symbol || 'PKR'} {Number(itm.price || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 dark:text-white">
                            {settings.currency_symbol || 'PKR'} {(Number(itm.subtotal) || (Number(itm.price) || 0) * (Number(itm.quantity) || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                  <tfoot className="bg-stone-50 dark:bg-stone-800/80 font-bold border-t border-stone-200 dark:border-stone-700">
                    <tr>
                      <td colSpan="3" className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300">Total Bill Amount:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {settings.currency_symbol || 'PKR'} {Number(selectedOrder.total).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Status Advancement */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 mb-4">
              <span className="block font-bold text-stone-700 dark:text-stone-300 mb-2">Update Order Status:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['received', 'preparing', 'ready', 'served'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, st);
                      setSelectedOrder((prev) => ({ ...prev, status: st }));
                    }}
                    className={`py-2 px-2 rounded-xl capitalize font-bold text-xs transition ${
                      selectedOrder.status === st
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Print Customer Receipt & Kitchen KOT */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  if (window.confirm(`Cancel order ${selectedOrder.order_no}?`)) {
                    handleUpdateOrderStatus(selectedOrder.id, 'cancelled');
                    setOrderModalOpen(false);
                  }
                }}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold transition"
              >
                Cancel Order
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintSlip('kot')}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Kitchen KOT</span>
                </button>

                <button
                  onClick={() => handlePrintSlip('bill')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Guest Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: BULK PRINT ALL PLACARDS (PHASE 2) */}
      {/* ==================================================================== */}
      {bulkPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-4xl shadow-2xl border border-stone-200 dark:border-stone-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6 print:hidden">
              <div>
                <h3 className="font-black text-lg text-stone-900 dark:text-white">
                  Bulk Print All Table QR Placards ({tables.length} Tables)
                </h3>
                <p className="text-xs text-stone-500">
                  Ready to print full sheet of table tent cards for restaurant dining tables
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print All Pages
                </button>
                <button
                  onClick={() => setBulkPrintModalOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid of Placards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {tables.map((t) => {
                const tableUrl = `${window.location.origin}/chat?table=${t.table_number}`;
                return (
                  <div
                    key={t.id || t.table_number}
                    className="p-6 rounded-3xl bg-white text-stone-900 border-2 border-stone-200 text-center shadow-xs page-break-inside-avoid"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl shadow-xs">
                      🍖
                    </div>
                    <h4 className="text-xs font-black tracking-tight text-stone-900 uppercase">
                      {profile.name}
                    </h4>
                    <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-3">
                      Dine-In • AI Chat Ordering
                    </p>

                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 inline-block mb-3">
                      <QRCodeSVG value={tableUrl} size={130} level="H" includeMargin={true} />
                    </div>

                    <div>
                      <span className="inline-block px-4 py-1 rounded-full bg-stone-900 text-white font-black text-sm font-mono">
                        TABLE #{formatSeqId(t.table_number)}
                      </span>
                      <p className="text-[10px] text-stone-600 mt-1 font-semibold">
                        Scan with camera to order!
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
