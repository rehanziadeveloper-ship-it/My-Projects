import { useMemo, useState } from 'react';

export default function ActivityLogPage({ events, workflowErrors, bookings }) {
  const [tab, setTab] = useState('events');

  const bookingCodeMap = useMemo(() => {
    const map = {};
    for (const b of bookings || []) map[b.id] = b.booking_code;
    return map;
  }, [bookings]);

  return (
    <div className="space-y-4">
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] flex gap-2">
        <button
          type="button"
          onClick={() => setTab('events')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'events' ? 'bg-[#3B82F6] text-white' : 'bg-[#F4F8FD] text-[#64748B]'
          }`}
        >
          Audit Events ({events?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setTab('errors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'errors' ? 'bg-[#3B82F6] text-white' : 'bg-[#F4F8FD] text-[#64748B]'
          }`}
        >
          System Errors ({workflowErrors?.length || 0})
        </button>
      </div>

      {tab === 'events' ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
          {(events || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-[#64748B]">No booking events recorded yet.</div>
          ) : (
            (events || []).map((ev) => (
              <div key={ev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-[#3B82F6] mr-2">
                    {bookingCodeMap[ev.booking_id] || `Booking #${ev.booking_id}`}
                  </span>
                  <span className="font-semibold text-[#1E293B]">{ev.event_type}</span>
                  <div className="text-[#64748B] mt-0.5">
                    Actor: {ev.actor || 'system'} · {JSON.stringify(ev.details || {})}
                  </div>
                </div>
                <span className="text-[11px] text-[#64748B] whitespace-nowrap">
                  {new Date(ev.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
          {(workflowErrors || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-[#64748B]">Zero workflow errors recorded.</div>
          ) : (
            (workflowErrors || []).map((err) => (
              <div key={err.id} className="p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-600">{err.workflow_name || 'Workflow Error'}</span>
                  <span className="text-[11px] text-[#64748B]">{new Date(err.created_at).toLocaleString()}</span>
                </div>
                <div className="text-[#1E293B]">{err.error_message || JSON.stringify(err)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
