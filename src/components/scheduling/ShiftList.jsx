import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  completed: 'bg-slate-100 text-slate-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ShiftList({
  shifts,
  teamMembers,
  adminName,
  onEdit,
  onDelete,
}) {
  const getCaregiverName = (shift) => {
    if (!shift.team_member_id) {
      return adminName ? `${adminName} (Me)` : 'Me';
    }
    return shift.caregiver_name || 'Unassigned';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shifts.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No upcoming shifts</p>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">
                    {getCaregiverName(shift)}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {format(new Date(shift.start_date), 'MMM d, yyyy')} &bull;{' '}
                    {shift.start_time} - {shift.end_time}
                  </p>
                  {shift.notes && (
                    <p className="text-xs text-slate-500 mt-1">{shift.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[shift.status] || STATUS_COLORS.scheduled}>
                    {shift.status}
                  </Badge>
                  {shift.recurring !== 'none' && (
                    <Badge variant="outline" className="text-xs">
                      {shift.recurring}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => onEdit(shift)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(shift.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
