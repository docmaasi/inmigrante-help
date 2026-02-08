import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from 'lucide-react';

export default function ReportFilters({
  dateRange,
  setDateRange,
  selectedRecipient,
  setSelectedRecipient,
  recipients
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Care Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Care Recipient *</Label>
            <Select
              value={selectedRecipient?.id || ''}
              onValueChange={(value) => {
                const recipient = recipients.find(r => r.id === value);
                setSelectedRecipient(recipient);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a care recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map(recipient => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.full_name || `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim() || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Reporting period: {dateRange.startDate} to {dateRange.endDate}
        </div>
      </CardContent>
    </Card>
  );
}