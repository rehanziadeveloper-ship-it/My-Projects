import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Globe, Search, Star, Wallet } from 'lucide-react';
import { formatPKR, formatPhoneDisplay, getStatusBadge } from '../lib/api';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'NEEDS_ACTION', label: 'Needs Action' },
  { id: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { id: 'PENDING_DRIVER', label: 'Pending Driver' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'NO_DRIVER', label: 'No Driver' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

function getPaymentBadge(booking) {
  const paid = Number(booking.advance_paid || 0);
  const req = Number(booking.advance_required || 0);
  if (booking.payment_status === 'pending_confirmation') {
    return { label: 'Receipt Review', cls: 'bg-amber-50 text-amber-700 border-amber-300' };
  }
  if (paid === 0) {
    return { label: 'Unpaid', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
  if (paid > req) {
    return { label: 'Above Required', cls: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (paid === req) {
    return { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Partial / Short', cls: 'bg-orange-50 text-orange-700 border-orange-200' };
}

export default function BookingsPage({ bookings, onSelectBooking }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const stats = useMemo(() => {
    const needsAction = bookings.filter(
      (b) => b.needs_operator || b.payment_status === 'pending_confirmation' || b.status === 'NO_DRIVER'
    ).length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length;
    const pendingPay = bookings.filter((b) => b.status === 'PENDING_PAYMENT').length;
    const revenue = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .reduce((sum, b) => sum + Number(b.fare_total || 0), 0);
    return { total: bookings.length, needsAction, confirmed, pendingPay, revenue };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter === 'NEEDS_ACTION') {
        const hit = b.needs_operator || b.payment_status === 'pending_confirmation' || b.status === 'NO_DRIVER';
        if (!hit) return false;
      } else if (filter !== 'ALL' && b.status !== filter) {
        return false;
      }
      if (!q) return true;
      return [
        b.booking_code,
        b.customer_name,
        b.customer_phone,
        b.customer_contact_number,
        b.pickup,
        b.destination,
        b.luggage,
        b.driver_name,
        b.vehicle_type,
        b.customer_language,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [bookings, filter, search]);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Bookings</span>
            <Clock className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-2xl font-bold text-[#1E293B] mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Needs Action</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.needsAction}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active / Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.confirmed}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Booked Value</span>
            <Wallet className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E293B] mt-1">{formatPKR(stats.revenue)}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, customer, phone, route, luggage, driver, language..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === f.id
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#F4F8FD] text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F4F8FD]/70 text-[11px] font-semibold uppercase text-[#64748B]">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Trip Date</th>
                <th className="py-3 px-4">Vehicle & Luggage</th>
                <th className="py-3 px-4">Fare (Locked)</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Driver & Rating</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#64748B]">
                    No bookings match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const badge = getStatusBadge(b.status);
                  const payBadge = getPaymentBadge(b);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => onSelectBooking(b)}
                      className="hover:bg-[#F4F8FD] cursor-pointer transition"
                    >
                      <td className="py-3 px-4 font-semibold text-[#3B82F6]">
                        {b.booking_code}
                        {b.payment_status === 'pending_confirmation' && (
                          <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-500" title="Receipt awaiting review" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#1E293B] flex items-center gap-1.5">
                          {b.customer_name || 'Customer'}
                          {b.customer_language && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200" title={`Language: ${b.customer_language}`}>
                              {b.customer_language}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {formatPhoneDisplay(b.customer_contact_number || b.customer_phone)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#1E293B] font-medium">
                          {b.pickup} → {b.destination}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {b.return_trip ? 'Return' : 'One-way'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-[#1E293B]">
                          {b.trip_date}
                          {b.return_trip && b.end_date && b.end_date !== b.trip_date ? ` → ${b.end_date}` : ''}
                        </div>
                        <div className="text-xs text-[#64748B]">{String(b.trip_time || '').slice(0, 5)}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#1E293B]">
                        <div className="uppercase font-semibold">{b.vehicle_type} · {b.passengers} pax</div>
                        <div className="text-[#64748B]">Luggage: <span className="font-medium text-[#1E293B]">{b.luggage || 'N/A'}</span></div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#1E293B] flex items-center gap-1">
                          {formatPKR(b.fare_total)}
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">locked</span>
                        </div>
                        <div className="text-xs text-[#64748B]">Adv Req: {formatPKR(b.advance_required)}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${payBadge.cls}`}>
                          {payBadge.label}
                        </span>
                        <div className="text-xs text-[#64748B] mt-0.5">
                          Paid: {formatPKR(b.advance_paid)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#1E293B]">
                        <div>{b.driver_name || <span className="text-[#64748B]">Unassigned</span>}</div>
                        {b.customer_rating ? (
                          <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px] mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {b.customer_rating}★
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            No bookings match your current filter.
          </div>
        ) : (
          filtered.map((b) => {
            const badge = getStatusBadge(b.status);
            const payBadge = getPaymentBadge(b);
            return (
              <div
                key={b.id}
                onClick={() => onSelectBooking(b)}
                className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-2 cursor-pointer active:bg-[#F4F8FD]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#3B82F6]">{b.booking_code}</span>
                    {b.customer_language && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {b.customer_language}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${payBadge.cls}`}>
                      {payBadge.label}
                    </span>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#1E293B]">
                  {b.pickup} → {b.destination}
                </div>
                <div className="text-xs text-[#64748B] flex items-center justify-between">
                  <span>{b.customer_name || 'Customer'} ({formatPhoneDisplay(b.customer_contact_number || b.customer_phone)})</span>
                  <span className="uppercase font-medium text-[#1E293B]">
                    {b.vehicle_type} · {b.passengers}p
                  </span>
                </div>
                <div className="text-xs text-[#64748B] flex items-center justify-between">
                  <span>Luggage: <strong className="text-[#1E293B]">{b.luggage || 'N/A'}</strong></span>
                  {b.customer_rating ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {b.customer_rating}★
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-[#64748B] flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                  <span>
                    {b.trip_date}
                    {b.return_trip && b.end_date && b.end_date !== b.trip_date ? ` → ${b.end_date}` : ''} ·{' '}
                    {String(b.trip_time || '').slice(0, 5)}
                  </span>
                  <span className="font-semibold text-[#1E293B]">{formatPKR(b.fare_total)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
