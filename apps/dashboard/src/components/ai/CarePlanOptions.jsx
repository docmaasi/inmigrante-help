import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  ShieldCheck,
  Scale,
  Zap,
  RefreshCw,
  Clock,
  Heart,
  Users,
} from 'lucide-react';

const OPTION_CONFIG = {
  Conservative: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    accent: 'border-blue-400',
    icon: ShieldCheck,
    iconColor: 'text-blue-600',
  },
  Balanced: {
    color: 'bg-green-100 text-green-800 border-green-200',
    accent: 'border-green-400',
    icon: Scale,
    iconColor: 'text-green-600',
  },
  Comprehensive: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    accent: 'border-purple-400',
    icon: Zap,
    iconColor: 'text-purple-600',
  },
};

function getConfig(label) {
  return (
    OPTION_CONFIG[label] ||
    OPTION_CONFIG.Balanced
  );
}

function getQuickStats(plan) {
  return [
    {
      icon: Clock,
      label: `${plan.daily_schedule?.length || 0} scheduled items`,
    },
    {
      icon: Heart,
      label: `${plan.health_monitoring?.vitals_to_track?.length || 0} vitals tracked`,
    },
    {
      icon: Users,
      label: `${plan.activities_recommendations?.length || 0} activities`,
    },
  ];
}

function SkeletonCard() {
  return (
    <Card className="border border-slate-200 animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-6 w-24 bg-slate-200 rounded-full" />
        <div className="h-4 w-full bg-slate-100 rounded mt-2" />
        <div className="h-4 w-3/4 bg-slate-100 rounded mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-2/3 bg-slate-100 rounded" />
        <div className="h-4 w-1/2 bg-slate-100 rounded" />
        <div className="h-4 w-3/5 bg-slate-100 rounded" />
        <div className="h-10 w-full bg-slate-200 rounded mt-4" />
      </CardContent>
    </Card>
  );
}

export function CarePlanOptions({
  plans,
  isLoading,
  onSelect,
  onRegenerate,
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
          <span className="font-medium">
            Generating 3 plan options...
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Compare the 3 options below and select the best fit.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, idx) => {
          const cfg = getConfig(plan.label);
          const Icon = cfg.icon;
          const stats = getQuickStats(plan);

          return (
            <Card
              key={idx}
              className={`border-t-4 ${cfg.accent} hover:shadow-lg transition-shadow`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  <Badge className={cfg.color}>
                    {plan.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {plan.summary}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <s.icon className="w-4 h-4 text-slate-400" />
                    {s.label}
                  </div>
                ))}
                <Button
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={() => onSelect(plan)}
                >
                  Select This Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CarePlanOptions;
