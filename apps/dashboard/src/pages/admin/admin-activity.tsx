import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminActivity } from '@/hooks/admin/use-admin-activity';
import { ActivityFilters } from '@/components/admin/activity/activity-filters';
import { ActivityTable } from '@/components/admin/activity/activity-table';
import type { ActivityLogEntry } from '@/components/admin/activity/activity-table';
import {
  Activity,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type {
  AdminActionType,
  AdminActionTargetType,
} from '@/services/admin-activity-logger';

interface ActivityFiltersState {
  adminId?: string;
  action?: AdminActionType;
  targetType?: AdminActionTargetType;
  startDate?: string;
  endDate?: string;
}

const PAGE_SIZE = 25;

function AdminActivity(): JSX.Element {
  const [filters, setFilters] = useState<ActivityFiltersState>({});
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminActivity({
    ...filters,
    limit: 500,
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data];
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return sorted;
  }, [data, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil((sortedData.length || 0) / PAGE_SIZE);

  function handleFiltersChange(newFilters: ActivityFiltersState): void {
    setFilters(newFilters);
    setCurrentPage(1);
  }

  function handleSortChange(direction: 'asc' | 'desc'): void {
    setSortDirection(direction);
  }

  function handlePreviousPage(): void {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }

  function handleNextPage(): void {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }

  function handleRefresh(): void {
    refetch();
  }

  function handleExportCSV(): void {
    if (!sortedData.length) return;

    const headers = [
      'Timestamp',
      'Admin ID',
      'Admin Name',
      'Action',
      'Target Type',
      'Target ID',
      'Details',
      'IP Address',
      'User Agent',
    ];

    const csvRows = sortedData.map((entry) => {
      const adminName = entry.profiles?.full_name ?? entry.profiles?.email ?? 'Unknown';
      const details = entry.details ? JSON.stringify(entry.details) : '';
      return [
        entry.created_at,
        entry.admin_id,
        adminName,
        entry.action,
        entry.target_type,
        entry.target_id ?? '',
        `"${details.replace(/"/g, '""')}"`,
        entry.ip_address ?? '',
        entry.user_agent ?? '',
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `admin-activity-log-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Activity Log</h1>
                  <p className="text-indigo-100 text-sm font-normal">
                    View and audit all administrative actions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExportCSV}
                  disabled={!sortedData.length || isLoading}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="bg-white text-indigo-700 hover:bg-indigo-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Records</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {sortedData.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Current Page</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {currentPage} of {totalPages || 1}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Badge className="bg-purple-600 text-white border-0">{PAGE_SIZE}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Sort Order</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">
                    {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Badge
                    className={`${
                      sortDirection === 'desc' ? 'bg-amber-600' : 'bg-slate-600'
                    } text-white border-0`}
                  >
                    {sortDirection.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <ActivityFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Error State */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Error loading activity logs</p>
                  <p className="text-sm">
                    {error instanceof Error
                      ? error.message
                      : 'An unexpected error occurred. Please try again.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Table */}
        <ActivityTable
          data={paginatedData as ActivityLogEntry[]}
          isLoading={isLoading}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(currentPage * PAGE_SIZE, sortedData.length)} of{' '}
              {sortedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AdminActivity };
