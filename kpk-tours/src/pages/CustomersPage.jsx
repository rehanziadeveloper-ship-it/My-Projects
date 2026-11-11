import { useMemo, useState } from 'react';
import { Bot, MessageSquare, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { callDashboardAction, formatPhoneDisplay } from '../lib/api';

export default function CustomersPage({ customers, conversations, messages, onRefresh, notify }) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const convoByCustomer = useMemo(() => {
    const map = {};
    for (const c of conversations || []) {
      if (!map[c.customer_id]) map[c.customer_id] = c;
    }
    return map;
  }, [conversations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (customers || []).filter((c) => {
      if (!q) return true;
      return [c.name, c.contact_number, c.phone_or_jid].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [customers, search]);

  async function handleResumeBot(customerId) {
    setBusyId(customerId);
    try {
      await callDashboardAction('resume_bot', { customer_id: customerId });
      notify('success', 'WhatsApp bot resumed for customer.');
      await onRefresh();
    } catch (err) {
      notify('error', err.message || 'Could not resume bot.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or phone..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-[#64748B]">
            No customers found.
          </div>
        ) : (
          filtered.map((c) => {
            const convo = convoByCustomer[c.id];
            const isTakeover = convo?.state === 'TAKEOVER';
            const isOpen = expandedId === c.id;
            const thread = (messages || []).filter((m) => m.customer_id === c.id).slice(0, 12);

            return (
              <div key={c.id} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1E293B]">{c.name || 'Customer'}</span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                          isTakeover
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-[#E0EEFF] text-[#3B82F6] border-blue-200'
                        }`}
                      >
                        {convo?.state || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {formatPhoneDisplay(c.contact_number || c.phone_or_jid)} · {c.total_trips || 0} completed trips · Joined{' '}
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTakeover && (
                      <button
                        type="button"
                        disabled={busyId === c.id}
                        onClick={() => handleResumeBot(c.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                      >
                        <Bot className="w-3.5 h-3.5" /> Resume Bot
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : c.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#1E293B] hover:bg-[#F4F8FD] cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Messages ({thread.length})
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#E2E8F0] bg-[#F4F8FD] p-4 space-y-2 max-h-72 overflow-y-auto">
                    {thread.length === 0 ? (
                      <p className="text-xs text-[#64748B]">No recent messages logged.</p>
                    ) : (
                      [...thread].reverse().map((m) => (
                        <div
                          key={m.id}
                          className={`p-2.5 rounded-lg text-xs max-w-xl ${
                            m.direction === 'outbound'
                              ? 'ml-auto bg-[#E0EEFF] text-[#1E293B]'
                              : 'bg-white border border-[#E2E8F0] text-[#1E293B]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] text-[#64748B] mb-1">
                            <span className="uppercase font-semibold">
                              {m.direction} · {m.type}
                            </span>
                            <span>{new Date(m.created_at).toLocaleString()}</span>
                          </div>
                          <div className="whitespace-pre-wrap">{m.body}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
