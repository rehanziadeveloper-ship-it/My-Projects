import { useMemo } from 'react';
import { formatPKR } from '../lib/api';

export default function AnalyticsPage({ summary, bookings, drivers }) {
  const topRoutes = useMemo(() => {
    const counts = {};
    for (const b of bookings || []) {
      const key = `${b.pickup} → ${b.destination}`;
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [bookings]);

  const statusCounts = useMemo(() => {
    const counts = {};
    for (const b of bookings || []) {
      counts[b.status] = (counts[b.status] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const topDrivers = useMemo(() => {
    return [...(drivers || [])].sort((a, b) => (b.total_trips || 0) - (a.total_trips || 0)).slice(0, 5);
  }, [drivers]);

  const s = summary || {};
  const maxRoute = Math.max(1, ...(topRoutes.map((r) => r[1]) || [1]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B]">Total Revenue</div>
          <div className="text-xl font-bold text-[#1E293B] mt-1">{formatPKR(s.total_revenue)}</div>
          <div className="text-[11px] text-[#64748B] mt-1">This month: {formatPKR(s.revenue_this_month)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B]">Advance Collected</div>
          <div className="text-xl font-bold text-[#3B82F6] mt-1">{formatPKR(s.total_advance_collected)}</div>
          <div className="text-[11px] text-[#64748B] mt-1">This week: {formatPKR(s.revenue_this_week)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B]">Driver Acceptance Rate</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{Number(s.driver_acceptance_rate || 0)}%</div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {s.accepted_requests || 0} / {s.total_requests || 0} requests accepted
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
          <div className="text-xs text-[#64748B]">Cancellations & No-Driver</div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {(s.cancelled_bookings || 0) + (s.no_driver_bookings || 0)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {s.cancelled_bookings || 0} cancelled · {s.no_driver_bookings || 0} no driver
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B]">Most Requested Routes</h3>
          {topRoutes.length === 0 ? (
            <p className="text-xs text-[#64748B]">No booking data available yet.</p>
          ) : (
            <div className="space-y-3">
              {topRoutes.map(([route, count]) => (
                <div key={route} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#1E293B]">{route}</span>
                    <span className="text-[#64748B]">{count} bookings</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F4F8FD] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3B82F6]"
                      style={{ width: `${Math.round((count / maxRoute) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B]">Booking Status Breakdown</h3>
          <div className="space-y-2.5">
            {statusCounts.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs py-1.5 border-b border-[#E2E8F0] last:border-0">
                <span className="font-medium text-[#1E293B]">{status.replace(/_/g, ' ')}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E0EEFF] text-[#3B82F6] font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-3">
        <h3 className="text-sm font-bold text-[#1E293B]">Top Drivers by Completed Trips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topDrivers.map((d) => (
            <div key={d.id} className="p-3 rounded-lg bg-[#F4F8FD] border border-[#E2E8F0]">
              <div className="font-semibold text-xs text-[#1E293B]">{d.name}</div>
              <div className="text-lg font-bold text-[#3B82F6] mt-1">{d.total_trips || 0} trips</div>
              <div className="text-[11px] text-[#64748B]">{Number(d.rating || 5).toFixed(1)}★ rating</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
