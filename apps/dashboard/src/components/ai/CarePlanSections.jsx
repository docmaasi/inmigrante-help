import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Clock,
  Heart,
  Activity,
  AlertCircle,
  Users,
} from 'lucide-react';

export function ScheduleSection({ items }) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <Badge className="bg-blue-600 text-white mt-0.5">
              {item.time}
            </Badge>
            <div className="flex-1">
              <p className="font-medium text-slate-800">{item.activity}</p>
              {item.notes && (
                <p className="text-sm text-slate-600 mt-1">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function MonitoringSection({ data }) {
  if (!data) return null;
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Health Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {data.vitals_to_track?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Vitals to Track
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.vitals_to_track.map((v, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {data.warning_signs?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              Warning Signs
            </h4>
            <ul className="space-y-1">
              {data.warning_signs.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-700 flex items-start gap-2"
                >
                  <span className="text-orange-500 mt-0.5">-</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.checkup_frequency && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Check-up Frequency:</span>{' '}
              {data.checkup_frequency}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ActivitiesSection({ items }) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Recommended Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-shadow"
            >
              <Badge className="bg-purple-100 text-purple-800 mb-2">
                {a.category}
              </Badge>
              <h4 className="font-semibold text-slate-800 mb-1">
                {a.activity}
              </h4>
              <p className="text-sm text-slate-600 mb-2">{a.frequency}</p>
              <p className="text-xs text-slate-500 italic">{a.benefits}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ConsiderationsSection({ items }) {
  if (!items?.length) return null;
  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="border-b border-orange-200">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="w-5 h-5" />
          Special Considerations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-2">
          {items.map((note, i) => (
            <li
              key={i}
              className="text-sm text-orange-900 flex items-start gap-2"
            >
              <span className="text-orange-500 mt-0.5 font-bold">-</span>
              {note}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
