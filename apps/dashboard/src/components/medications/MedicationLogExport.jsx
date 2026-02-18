import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Download, Printer, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

function buildCsvContent(logs) {
  const header = 'Medication,Dosage,Recipient,Date,Time,Status,Notes';
  const rows = logs.map(log => {
    const name = log.medications?.name || 'Unknown';
    const dosage = log.medications?.dosage || '';
    const recipient = log.profiles?.full_name || 'Unknown';
    const date = log.scheduled_time ? format(new Date(log.scheduled_time), 'yyyy-MM-dd') : '';
    const time = log.scheduled_time ? format(new Date(log.scheduled_time), 'HH:mm') : '';
    const status = log.status || '';
    const notes = (log.notes || '').replace(/"/g, '""');
    return `"${name}","${dosage}","${recipient}","${date}","${time}","${status}","${notes}"`;
  });
  return [header, ...rows].join('\n');
}

function downloadCsv(logs) {
  const csv = buildCsvContent(logs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medication-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function MedicationLogExport({ logs }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleCsv = () => { downloadCsv(logs); setIsOpen(false); };
  const handlePrint = () => { window.print(); setIsOpen(false); };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}
        className="border-slate-200 text-slate-700"
      >
        <Download className="w-4 h-4 mr-2" />Export
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 w-44">
            <button onClick={handleCsv}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg">
              <Download className="w-4 h-4" />Download CSV
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-b-lg">
              <Printer className="w-4 h-4" />Print / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
