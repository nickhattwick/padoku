import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useWorkItems } from '../../api/queries';
import { useQuery } from '@tanstack/react-query';
import { timeLogsApi } from '../../api/timeLogs';
import { useWorkItemStore } from '../../stores/workItemStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  type: 'due_date' | 'time_log';
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

    // Add completed time logs as timed events
    timeLogs
      .filter((log) => log.end_time !== null)
      .forEach((log) => {
        const workItem = workItems.find((item) => item.id === log.work_item_id);
        if (workItem) {
          calendarEvents.push({
            title: `Worked on: ${workItem.title}`,
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
    const style: React.CSSProperties = {
      backgroundColor: event.type === 'due_date' ? '#ff9800' : '#2196f3',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
    };

    return { style };
  };

  const formats = {
    eventTimeRangeFormat: () => '', // Hide time range in event display
    timeGutterFormat: (date: Date) => format(date, 'h a'), // Show hours in sidebar
  };

  return (
    <div className="h-full p-6 bg-white">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Track View - Calendar</h2>
        <p className="text-sm text-gray-600">
          📌 Orange = Due dates • 🔵 Blue = Time logs
        </p>
      </div>
      <div className="h-[calc(100%-4rem)]">
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
