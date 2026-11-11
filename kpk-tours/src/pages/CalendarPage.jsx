import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusBadge } from '../lib/api';

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CalendarPage({ bookings, onSelectBooking }) {
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(() => new Date());

  const visibleDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    if (view === 'month') {
      const first = new Date(year, month, 1);
      const startOffset = first.getDay();
      const start = new Date(year, month, 1 - startOffset);
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, iso: toISODate(d), inMonth: d.getMonth() === month };
      });
    } else {
      const start = new Date(cursor);
      start.setDate(cursor.getDate() - cursor.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, iso: toISODate(d), inMonth: true };
      });
    }
  }, [cursor, view]);

  const bookingsByDay = useMemo(() => {
    const map = {};
    for (const day of visibleDays) {
      map[day.iso] = bookings.filter((b) => {
        if (!b.trip_date) return false;
        const end = b.end_date || b.trip_date;
        return day.iso >= b.trip_date && day.iso <= end;
      });
    }
    return map;
  }, [bookings, visibleDays]);

  function step(dir) {
    const next = new Date(cursor);
    if (view === 'month') {
      next.setMonth(cursor.getMonth() + dir);
    } else {
      next.setDate(cursor.getDate() + dir * 7);
    }
    setCursor(next);
  }

  const title =
    view === 'month'
      ? cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `Week of ${visibleDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F8FD] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-[#1E293B] min-w-[170px] text-center">{title}</h2>
          <button
            type="button"
            onClick={() => step(1)}
            className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F4F8FD] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium hover:bg-[#F4F8FD] cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="inline-flex rounded-lg border border-[#E2E8F0] p-0.5 bg-[#F4F8FD]">
          {['month', 'week'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize cursor-pointer ${
                view === mode ? 'bg-white text-[#3B82F6] shadow-2xs' : 'text-[#64748B]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F4F8FD]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2.5 px-3 text-[11px] font-semibold uppercase text-[#64748B]">
                {d}
              </div>
            ))}
          </div>
          <div className={`grid grid-cols-7 divide-x divide-y divide-[#E2E8F0]`}>
            {visibleDays.map((day) => {
              const items = bookingsByDay[day.iso] || [];
              const isToday = day.iso === toISODate(new Date());
              return (
                <div
                  key={day.iso}
                  className={`${view === 'week' ? 'min-h-[240px]' : 'min-h-[112px]'} p-2 ${
                    day.inMonth ? 'bg-white' : 'bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-semibold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-[#3B82F6] text-white'
                          : day.inMonth
                          ? 'text-[#1E293B]'
                          : 'text-[#64748B]/60'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {items.length > 0 && (
                      <span className="text-[10px] font-medium text-[#64748B]">{items.length}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, view === 'week' ? 8 : 3).map((b) => {
                      const badge = getStatusBadge(b.status);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => onSelectBooking(b)}
                          className={`w-full text-left px-2 py-1 rounded-md border text-[11px] truncate cursor-pointer hover:opacity-90 ${badge.cls}`}
                        >
                          <span className="font-semibold">{b.booking_code}</span> · {b.destination}
                        </button>
                      );
                    })}
                    {view === 'month' && items.length > 3 && (
                      <div className="text-[10px] text-[#3B82F6] font-medium pl-1">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
