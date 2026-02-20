import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent } from '../ui/card';

export function CalendarFilters({
  viewMode,
  setViewMode,
  filterRecipient,
  setFilterRecipient,
  filterType,
  setFilterType,
  recipients,
  getRecipientColor,
}) {
  return (
    <Card className="border-[#E07A5F]/20">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-sm font-medium text-[#4F46E5]">View:</span>
            <div className="flex gap-1">
              {['day', 'week', 'month'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={`capitalize ${
                    viewMode === mode
                      ? 'bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white'
                      : 'border-[#4F46E5]/30 text-[#4F46E5] hover:bg-[#4F46E5]/10'
                  }`}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#4F46E5]">
              Care Recipient:
            </span>
            <Select value={filterRecipient} onValueChange={setFilterRecipient}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipients</SelectItem>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getRecipientColor(recipient.id)}`}
                      />
                      {recipient.first_name} {recipient.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#4F46E5]">Type:</span>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="medication">Medications</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {recipients.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#4F46E5]/10">
            <p className="text-xs font-medium text-[#8B7EC8] mb-2">
              Care Recipients:
            </p>
            <div className="flex flex-wrap gap-3">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${getRecipientColor(recipient.id)}`}
                  />
                  <span className="text-xs text-[#4F46E5]/70">
                    {recipient.first_name} {recipient.last_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
