import React, { useState } from 'react';
import { Showing, Agent } from '../../types';
import { supabase } from '../../lib/supabase';
import { syncShowingToGoogleCalendar } from '../../lib/n8n';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  ExternalLink,
  CalendarCheck,
  Sparkles,
  RefreshCw,
  Building2,
  X
} from 'lucide-react';

interface CalendarViewProps {
  showings: Showing[];
  agents: Agent[];
  currentAgentId?: string;
  onRefresh: () => void;
}

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  showings,
  agents,
  currentAgentId,
  onRefresh,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarMode>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [selectedShowing, setSelectedShowing] = useState<Showing | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncSuccessId, setSyncSuccessId] = useState<string | null>(null);

  // Filter showings
  const filteredShowings = showings.filter(s => {
    if (statusFilter === 'confirmed') return s.broker_confirmed;
    if (statusFilter === 'pending') return !s.broker_confirmed;
    return true;
  });

  // Date Navigation Helpers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Google Calendar 1-Click Sync Handler via n8n
  const handleSyncToGoogleCalendar = async (showing: Showing) => {
    setSyncingId(showing.id);
    try {
      const broker = showing.agent || agents.find(a => a.id === showing.agent_id) || agents[0];
      const res = await syncShowingToGoogleCalendar({
        showingId: showing.id,
        leadName: showing.lead?.full_name || 'Valued Client',
        clientPhone: showing.lead?.phone,
        propertyTitle: showing.property?.title || 'Luxury Property',
        propertyAddress: showing.property?.address || 'DHA Lahore, Pakistan',
        showingTime: showing.showing_time,
        brokerName: broker?.name || 'Licensed Broker',
        brokerEmail: broker?.email || 'kamran@raqba.pk',
        gateCode: showing.gate_pin_code,
        notes: showing.notes
      });

      setSyncSuccessId(showing.id);
      if (res.googleCalendarUrl) {
        window.open(res.googleCalendarUrl, '_blank');
      }
      setTimeout(() => setSyncSuccessId(null), 4000);
    } catch (e) {
      console.warn('Google Calendar sync failed:', e);
    } finally {
      setSyncingId(null);
    }
  };

  // Month Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    monthDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    monthDays.push(new Date(year, month, d));
  }

  // Week Grid Calculations
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      week.push(d);
    }
    return week;
  };
  const weekDates = getWeekDates(currentDate);

  // Time slots for Day and Week views (8 AM to 8 PM)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getShowingsForDay = (date: Date) => {
    return filteredShowings.filter(s => {
      const sDate = new Date(s.showing_time);
      return isSameDay(sDate, date);
    });
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      
      {/* Calendar Top Control Header */}
      <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        
        {/* Left: Navigation & Current Date Title */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-gold-400 border border-slate-700/80 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="font-serif font-bold text-xl text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gold-400" />
              <span>
                {viewMode === 'month' && `${monthNames[month]} ${year}`}
                {viewMode === 'week' && `Week of ${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {filteredShowings.length} scheduled walkthroughs • Google Calendar Real-Time Sync Active
            </p>
          </div>
        </div>

        {/* Right: View Mode Toggle & Status Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Status Filter */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['all', 'confirmed', 'pending'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-gold-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mode Tabs: Month / Week / Day */}
          <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['month', 'week', 'day'] as CalendarMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-slate-800 text-gold-400 font-semibold border border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
            title="Refresh Appointments"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 py-3 bg-[#0d1424]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60">
            {monthDays.map((day, idx) => {
              if (!day) {
                return (
                  <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-950/40 p-2" />
                );
              }

              const dayShowings = getShowingsForDay(day);
              const currentDayIsToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewMode('day');
                  }}
                  className={`min-h-[110px] p-2 transition-colors cursor-pointer hover:bg-slate-900/60 ${
                    currentDayIsToday ? 'bg-gold-500/5' : 'bg-[#090d16]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        currentDayIsToday
                          ? 'bg-gold-500 text-slate-950 shadow-md'
                          : 'text-slate-400'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {dayShowings.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {dayShowings.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments in this Day */}
                  <div className="space-y-1">
                    {dayShowings.slice(0, 3).map(showing => {
                      const isConfirmed = showing.broker_confirmed;
                      const timeStr = new Date(showing.showing_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={showing.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShowing(showing);
                          }}
                          className={`px-2 py-1 rounded text-[11px] truncate flex items-center gap-1 transition-all border ${
                            isConfirmed
                              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-amber-950/60 border-amber-500/30 text-amber-300 hover:bg-amber-900/60'
                          }`}
                        >
                          <span className="font-mono text-[9px] shrink-0 font-bold">{timeStr}</span>
                          <span className="truncate">{showing.lead?.full_name || showing.property?.title}</span>
                        </div>
                      );
                    })}

                    {dayShowings.length > 3 && (
                      <div className="text-[10px] text-gold-400 font-medium pl-1">
                        +{dayShowings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl overflow-x-auto shadow-xl">
          <div className="min-w-[800px]">
            {/* Header: Days of the Week */}
            <div className="grid grid-cols-8 border-b border-slate-800 bg-[#0d1424] text-center text-xs py-3">
              <span className="text-slate-400 font-medium">Time</span>
              {weekDates.map(date => {
                const currentDayIsToday = isToday(date);
                return (
                  <div key={date.toISOString()} className="space-y-0.5">
                    <div className="text-[11px] font-semibold uppercase text-slate-400">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-sm font-mono font-bold mx-auto w-6 h-6 flex items-center justify-center rounded-full ${
                      currentDayIsToday ? 'bg-gold-500 text-slate-950' : 'text-slate-200'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Hours */}
            <div className="divide-y divide-slate-800/60">
              {hours.map(hour => {
                const displayHour = hour > 12 ? `${hour - 12} PM` : (hour === 12 ? '12 PM' : `${hour} AM`);

                return (
                  <div key={hour} className="grid grid-cols-8 min-h-[58px]">
                    <div className="p-2 text-right text-[11px] font-mono text-slate-400 border-r border-slate-800/60 bg-slate-950/20">
                      {displayHour}
                    </div>

                    {weekDates.map(date => {
                      const dayShowings = getShowingsForDay(date).filter(s => {
                        const sHour = new Date(s.showing_time).getHours();
                        return sHour === hour;
                      });

                      return (
                        <div key={date.toISOString() + hour} className="p-1 border-r border-slate-800/40 relative">
                          {dayShowings.map(showing => (
                            <div
                              key={showing.id}
                              onClick={() => setSelectedShowing(showing)}
                              className={`p-1.5 rounded-lg text-xs cursor-pointer border shadow-sm transition-all ${
                                showing.broker_confirmed
                                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 hover:border-emerald-400'
                                  : 'bg-amber-950/80 border-amber-500/40 text-amber-200 hover:border-amber-400'
                              }`}
                            >
                              <div className="font-semibold text-[11px] truncate">
                                {showing.property?.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                <User className="w-2.5 h-2.5" />
                                {showing.lead?.full_name}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW TIMELINE */}
      {viewMode === 'day' && (
        <div className="bg-[#090d16] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              <span>Appointments on {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              {getShowingsForDay(currentDate).length} scheduled
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {hours.map(hour => {
              const displayHour = hour > 12 ? `${hour - 12}:00 PM` : (hour === 12 ? '12:00 PM' : `${hour}:00 AM`);
              const hourShowings = getShowingsForDay(currentDate).filter(s => {
                return new Date(s.showing_time).getHours() === hour;
              });

              return (
                <div key={hour} className="py-3 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-24 shrink-0 text-xs font-mono font-bold text-gold-400 pt-1">
                    {displayHour}
                  </div>

                  <div className="flex-1 space-y-2">
                    {hourShowings.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-1">No walkthrough scheduled</div>
                    ) : (
                      hourShowings.map(showing => {
                        const isConfirmed = showing.broker_confirmed;
                        const broker = showing.agent || agents.find(a => a.id === showing.agent_id);

                        return (
                          <div
                            key={showing.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                              isConfirmed
                                ? 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/50'
                                : 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/50'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                  isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {isConfirmed ? 'Confirmed Walkthrough' : 'Pending Broker Clearance'}
                                </span>
                                {showing.gate_pin_code && (
                                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-gold-500/30 text-gold-400 font-mono text-[10px] font-bold flex items-center gap-1">
                                    <Key className="w-3 h-3" />
                                    Gate PIN: {showing.gate_pin_code}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-serif font-bold text-slate-100">
                                {showing.property?.title}
                              </h4>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  {showing.lead?.full_name} ({showing.lead?.phone})
                                </span>
                                <span className="flex items-center gap-1 text-slate-400">
                                  <Building2 className="w-3.5 h-3.5" />
                                  Broker: {broker?.name || 'Unassigned'}
                                </span>
                                {showing.property?.address && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {showing.property?.address}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions on Card */}
                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                              <button
                                onClick={() => handleSyncToGoogleCalendar(showing)}
                                disabled={syncingId === showing.id}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                                <span>{syncSuccessId === showing.id ? 'Synced to G-Cal!' : 'Google Calendar'}</span>
                              </button>

                              <button
                                onClick={() => setSelectedShowing(showing)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Details</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* APPOINTMENT DETAIL & GOOGLE CALENDAR MODAL */}
      {selectedShowing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif font-bold text-base text-slate-100">
                  Showing & Walkthrough Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedShowing(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-0.5">Property Listing</span>
                <p className="text-sm font-serif font-bold text-slate-100">
                  {selectedShowing.property?.title}
                </p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  {selectedShowing.property?.address || 'DHA Lahore'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Date & Time</span>
                  <span className="font-semibold text-slate-200 text-xs">
                    {new Date(selectedShowing.showing_time).toLocaleString('en-PK', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Status</span>
                  <span className={`font-semibold text-xs ${selectedShowing.broker_confirmed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedShowing.broker_confirmed ? 'Confirmed' : 'Pending Broker Review'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Client Name</span>
                  <span className="font-semibold text-slate-200 text-xs">
                    {selectedShowing.lead?.full_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Client Phone</span>
                  <span className="font-semibold text-slate-200 text-xs">
                    {selectedShowing.lead?.phone}
                  </span>
                </div>
              </div>

              {selectedShowing.gate_pin_code && (
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gold-400" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-gold-400 block font-bold">
                        Society Security Clearance
                      </span>
                      <span className="text-sm font-mono font-extrabold text-gold-300">
                        {selectedShowing.gate_pin_code}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Gated Entrance Pass</span>
                </div>
              )}

              {selectedShowing.notes && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
                  <span className="text-[10px] text-slate-400 block mb-1">Appointment Notes</span>
                  <p className="text-xs">{selectedShowing.notes}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleSyncToGoogleCalendar(selectedShowing)}
                disabled={syncingId === selectedShowing.id}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{syncSuccessId === selectedShowing.id ? 'Synced to Google Calendar!' : 'Sync to Google Calendar'}</span>
              </button>

              <button
                onClick={() => setSelectedShowing(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
