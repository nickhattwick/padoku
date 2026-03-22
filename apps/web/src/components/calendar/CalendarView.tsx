import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useWorkItems } from '../../api/queries';
import { useQuery } from '@tanstack/react-query';
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
  const { data: workItems = [] } = useWorkItems(undefined); // Get all items
  const { data: timeLogs = [] } = useQuery({
    queryKey: ['timeLogs'],
    queryFn: () => timeLogsApi.getAll(),
    staleTime: 0,
  });

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
          eventPropGetter={eventStyleGetter}
          formats={formats}
          views={['month', 'week', 'day']}
          defaultView="week"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
};
