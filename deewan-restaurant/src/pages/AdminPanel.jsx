import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Settings, Utensils, QrCode, FileText, ToggleLeft, ToggleRight, Search, Printer, DollarSign, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../services/supabase';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'qr', 'orders'
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedTableForQr, setSelectedTableForQr] = useState(1);

  useEffect(() => {
    fetchMenuItems();
    fetchOrders();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('item_number', { ascending: true });

      if (data && !error) {
        setMenuItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && !error) {
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAvailability = async (itemId, currentVal) => {
    const newVal = !currentVal;
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, is_available: newVal } : item))
    );

    try {
      await supabase
        .from('menu_items')
        .update({ is_available: newVal })
        .eq('id', itemId);
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    }
  };

  const handlePrintQr = () => {
    window.print();
  };

  const filteredItems = menuItems.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(i.item_number).includes(searchQuery);
    return matchSearch;
  });

  const qrUrl = `${window.location.origin}/chat?table=${selectedTableForQr}`;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <nav className="bg-stone-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-xl">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight">Deewan-E-Khaas Admin</h1>
            <p className="text-xs text-stone-400">Namak Mandi Manager & QR Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'menu'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu & Stock ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'qr'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Table QR Generator
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'orders'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Recent Orders ({orders.length})
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* 1. Menu Items Management */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Menu Items & Stock Control</h2>
                <p className="text-xs text-stone-500">Toggle dish availability instantly. Unavailable items are politely refused by the AI chatbot.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish or item #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Price (PKR)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-stone-500">
                        {item.item_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-orange-600">
                        PKR {Number(item.price).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.is_available
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                            item.is_available
                              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {item.is_available ? 'Set Out of Stock' : 'Make Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. QR Code Generator */}
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
                  Table {num}
                </button>
              ))}
            </div>

            {/* Printable Card Area */}
            <div
              id="printable-card"
              className="border-4 border-stone-900 rounded-3xl p-8 bg-gradient-to-b from-orange-50 to-white text-center shadow-lg max-w-sm mx-auto"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl">
                🍖
              </div>
              <h3 className="text-2xl font-black tracking-tight text-stone-900">DEEWAN-E-KHAAS</h3>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-6">
                Namak Mandi • Dine-In
              </p>

              <div className="bg-white p-4 rounded-2xl shadow-inner border border-stone-200 inline-block mb-4">
                <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin={true} />
              </div>

              <div className="mt-2">
                <span className="inline-block px-5 py-1.5 rounded-full bg-stone-900 text-white font-black text-lg">
                  TABLE #{selectedTableForQr}
                </span>
                <p className="text-xs text-stone-600 mt-3 font-medium">
                  Scan QR with your phone camera to browse the menu and order by chat!
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handlePrintQr}
                className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                Print Table {selectedTableForQr} Placard
              </button>
            </div>
          </div>
        )}

        {/* 3. Recent Orders Audit */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Recent Dine-In Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Table</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{o.order_no}</td>
                      <td className="py-3 px-4 font-bold text-orange-600">Table {o.table_no}</td>
                      <td className="py-3 px-4">{o.customer_name}</td>
                      <td className="py-3 px-4 font-mono">{o.customer_phone}</td>
                      <td className="py-3 px-4 font-mono font-bold">PKR {Number(o.total).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-200 text-stone-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-400">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
