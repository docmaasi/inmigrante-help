import React from 'react';
import CalendarView from '../components/calendar/CalendarView';

export default function Calendar() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>
        <p className="text-slate-500 mt-1">View all appointments, tasks, and medication logs</p>
      </div>
      <CalendarView />
    </div>
  );
}