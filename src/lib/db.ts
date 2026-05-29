export type QueueEvent = {
  id: string;
  queue_name: string;
  status: 'completed' | 'failed' | 'retried';
  metadata?: Record<string, any>;
  timestamp: string;
};

// In-memory store for Hackathon MVP
// Use global to persist across Next.js dev server hot-reloads
const globalForDb = global as unknown as { events: QueueEvent[] };

if (!globalForDb.events) {
  globalForDb.events = [];
}

class InMemoryDB {
  addEvent(event: Omit<QueueEvent, 'id' | 'timestamp'>) {
    const newEvent: QueueEvent = {
      ...event,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    globalForDb.events.push(newEvent);
    if (globalForDb.events.length > 1000) {
      globalForDb.events.shift();
    }
    return newEvent;
  }

  getEvents() {
    return globalForDb.events;
  }
  
  getEventsByQueue(queue_name: string) {
    return globalForDb.events.filter(e => e.queue_name === queue_name);
  }

  clear() {
    globalForDb.events = [];
  }
}

export const db = new InMemoryDB();
