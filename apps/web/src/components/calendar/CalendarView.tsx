import { useMemo, useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Event, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useWorkItems } from '../../api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeLogsApi } from '../../api/timeLogs';
import { useWorkItemStore } from '../../stores/workItemStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-dark.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  type: 'due_date' | 'time_log' | 'scheduled';
  itemId: string;
  itemTitle: string;
}

export const CalendarView = () => {
  const openDrawer = useWorkItemStore((s) => s.openDrawer);
  const queryClient = useQueryClient();
  const { data: workItems = [] } = useWorkItems(undefined); // Get all items
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timeLogs'],
    queryFn: () => timeLogsApi.getAll(),
    staleTime: 0,
  });

  // Slot selection modal state
  const [slotModal, setSlotModal] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState('');
  const [slotNotes, setSlotNotes] = useState('');
  const [workItemSearch, setWorkItemSearch] = useState('');

  const createManualMutation = useMutation({
    mutationFn: timeLogsApi.createManual,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      if (selectedWorkItemId) {
        queryClient.invalidateQueries({ queryKey: ['timeLogs', selectedWorkItemId] });
      }
      setSlotModal(null);
      setSelectedWorkItemId('');
      setSlotNotes('');
      setWorkItemSearch('');
    },
  });

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSlotModal({ start: slotInfo.start, end: slotInfo.end });
    setSelectedWorkItemId('');
    setSlotNotes('');
    setWorkItemSearch('');
  }, []);

  const handleSlotSave = () => {
    if (!slotModal || !selectedWorkItemId) return;
    createManualMutation.mutate({
      work_item_id: selectedWorkItemId,
      start_time: slotModal.start.getTime(),
      end_time: slotModal.end.getTime(),
      notes: slotNotes.trim() || null,
    });
  };

  const filteredWorkItems = useMemo(() => {
    if (!workItemSearch.trim()) return workItems.slice(0, 20);
    const q = workItemSearch.toLowerCase();
    return workItems.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 20);
  }, [workItems, workItemSearch]);

  // Create calendar events from work items and time logs
  const events = useMemo<CalendarEvent[]>(() => {
    const calendarEvents: CalendarEvent[] = [];

    // Add due dates as all-day events
    workItems
      .filter((item) => item.due_at)
      .forEach((item) => {
        calendarEvents.push({
          title: `📌 ${item.title}`,
          start: new Date(item.due_at!),
          end: new Date(item.due_at!),
          allDay: true,
          type: 'due_date',
          itemId: item.id,
          itemTitle: item.title,
        });
      });

    // Add scheduled events (event tickets with scheduled_start/end)
    workItems
      .filter((item) => (item as any).item_type === 'event' && (item as any).scheduled_start)
      .forEach((item) => {
        const scheduledStart = (item as any).scheduled_start;
        const scheduledEnd = (item as any).scheduled_end || scheduledStart + 3600000;
        calendarEvents.push({
          title: `📅 ${item.title}`,
          start: new Date(scheduledStart),
          end: new Date(scheduledEnd),
          allDay: false,
          type: 'scheduled',
          itemId: item.id,
          itemTitle: item.title,
        });
      });

    // Add completed time logs as timed events
    timeLogs
      .filter((log) => log.end_time !== null)
      .forEach((log) => {
        const workItem = workItems.find((item) => item.id === log.work_item_id);
        if (workItem) {
          calendarEvents.push({
            title: `⏱️ ${workItem.title}`,
            start: new Date(log.start_time),
            end: new Date(log.end_time!),
            allDay: false,
            type: 'time_log',
            itemId: workItem.id,
            itemTitle: workItem.title,
          });
        }
      });

    return calendarEvents;
  }, [workItems, timeLogs]);

  const handleSelectEvent = (event: CalendarEvent) => {
    openDrawer(event.itemId);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const colorMap: Record<string, string> = {
      due_date: '#f59e0b',   // amber
      time_log: '#3b82f6',   // blue
      scheduled: '#10b981',  // green
    };
    const style: React.CSSProperties = {
      backgroundColor: colorMap[event.type] || '#3b82f6',
      borderRadius: '6px',
      opacity: 1,
      color: 'white',
      border: 'none',
      display: 'block',
      fontWeight: 600,
      fontSize: '12px',
    };

    return { style };
  };

  const formats = {
    eventTimeRangeFormat: () => '', // Hide time range in event display
    timeGutterFormat: (date: Date) => format(date, 'h a'), // Show hours in sidebar
  };

  return (
    <div className="h-full p-6 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-blue-400">📅</span> Track View
        </h2>
        <p className="text-sm text-gray-400 flex items-center gap-4 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-amber-500 rounded"></span>
            Due dates
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-500 rounded"></span>
            Scheduled
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded"></span>
            Time logs
          </span>
        </p>
      </div>
      <div className="h-[calc(100%-4rem)] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          formats={formats}
          views={['month', 'week', 'day']}
          defaultView="week"
          style={{ height: '100%' }}
        />
      </div>

      {/* Slot selection modal */}
      {slotModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setSlotModal(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">⏱️</span> Log Time
              </h3>

              {/* Time display */}
              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Start</span>
                    <div className="text-white font-mono">
                      {format(slotModal.start, 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">End</span>
                    <div className="text-white font-mono">
                      {format(slotModal.end, 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-purple-400 mt-2">
                  Duration: {(() => {
                    const ms = slotModal.end.getTime() - slotModal.start.getTime();
                    const h = Math.floor(ms / 3600000);
                    const m = Math.floor((ms % 3600000) / 60000);
                    return h > 0 ? `${h}h ${m}m` : `${m}m`;
                  })()}
                </div>
              </div>

              {/* Work item picker */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Work Item</label>
                <input
                  type="text"
                  value={workItemSearch}
                  onChange={(e) => setWorkItemSearch(e.target.value)}
                  placeholder="Search work items..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                />
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1 rounded-lg">
                  {filteredWorkItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedWorkItemId(item.id);
                        setWorkItemSearch(item.title);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedWorkItemId === item.id
                          ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200'
                          : 'bg-gray-800/60 border border-gray-700/40 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                  {filteredWorkItems.length === 0 && (
                    <p className="text-xs text-gray-500 p-2">No matching work items</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  placeholder="What were you working on?"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setSlotModal(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSlotSave}
                  disabled={!selectedWorkItemId || createManualMutation.isPending}
                  className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {createManualMutation.isPending ? 'Saving...' : 'Save Time Log'}
                </button>
              </div>
              {createManualMutation.isError && (
                <p className="text-xs text-red-400">Failed to save. Please try again.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
