import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, User, Users, Heart, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Diagnostics() {
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const { user, profile } = useAuth();

  const runDiagnostics = useCallback(async () => {
    if (!user) return;

    setRunningTests(true);
    const results = [];

    // Test 1: User Authentication
    try {
      results.push({
        name: 'User Authentication',
        status: 'success',
        message: `Logged in as ${user.email}`,
        details: { role: profile?.role, name: profile?.full_name }
      });
    } catch (error) {
      results.push({
        name: 'User Authentication',
        status: 'error',
        message: 'Not authenticated',
        details: { error: error.message }
      });
    }

    // Test 2: Subscription Status
    try {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const activeSubscription = subscriptions?.find(s => s.status === 'active');

      if (activeSubscription) {
        results.push({
          name: 'Subscription Status',
          status: 'success',
          message: 'Active subscription found',
          details: {
            status: activeSubscription.status,
            max_care_recipients: activeSubscription.max_care_recipients,
            stripe_customer_id: activeSubscription.stripe_customer_id
          }
        });
      } else {
        results.push({
          name: 'Subscription Status',
          status: 'warning',
          message: 'No active subscription',
          details: { found: subscriptions?.length || 0, statuses: subscriptions?.map(s => s.status) || [] }
        });
      }
    } catch (error) {
      results.push({
        name: 'Subscription Status',
        status: 'error',
        message: 'Failed to fetch subscription',
        details: { error: error.message }
      });
    }

    // Test 3: Care Recipients
    try {
      const { data: recipients, error } = await supabase
        .from('care_recipients')
        .select('id');

      if (error) throw error;

      results.push({
        name: 'Care Recipients',
        status: 'success',
        message: `${recipients?.length || 0} care recipients`,
        details: { count: recipients?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'Care Recipients',
        status: 'error',
        message: 'Failed to fetch care recipients',
        details: { error: error.message }
      });
    }

    // Test 4: Appointments
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id');

      if (error) throw error;

      results.push({
        name: 'Appointments',
        status: 'success',
        message: `${appointments?.length || 0} appointments`,
        details: { count: appointments?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'Appointments',
        status: 'error',
        message: 'Failed to fetch appointments',
        details: { error: error.message }
      });
    }

    // Test 5: Medications
    try {
      const { data: medications, error } = await supabase
        .from('medications')
        .select('id');

      if (error) throw error;

      results.push({
        name: 'Medications',
        status: 'success',
        message: `${medications?.length || 0} medications`,
        details: { count: medications?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'Medications',
        status: 'error',
        message: 'Failed to fetch medications',
        details: { error: error.message }
      });
    }

    // Test 6: Tasks
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id');

      if (error) throw error;

      results.push({
        name: 'Tasks',
        status: 'success',
        message: `${tasks?.length || 0} tasks`,
        details: { count: tasks?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'Tasks',
        status: 'error',
        message: 'Failed to fetch tasks',
        details: { error: error.message }
      });
    }

    // Test 7: Documents
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('id');

      if (error) throw error;

      results.push({
        name: 'Documents',
        status: 'success',
        message: `${documents?.length || 0} documents`,
        details: { count: documents?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'Documents',
        status: 'error',
        message: 'Failed to fetch documents',
        details: { error: error.message }
      });
    }

    // Test 8: Notifications
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, is_read')
        .eq('user_id', user.id);

      if (error) throw error;

      const unread = notifications?.filter(n => !n.is_read).length || 0;
      results.push({
        name: 'Notifications',
        status: 'success',
        message: `${notifications?.length || 0} total, ${unread} unread`,
        details: { total: notifications?.length || 0, unread }
      });
    } catch (error) {
      results.push({
        name: 'Notifications',
        status: 'error',
        message: 'Failed to fetch notifications',
        details: { error: error.message }
      });
    }

    // Test 9: Onboarding Status
    try {
      const { data: onboarding, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (onboarding && onboarding.length > 0) {
        const progress = onboarding[0];
        results.push({
          name: 'Onboarding Status',
          status: progress.onboarding_completed ? 'success' : 'warning',
          message: progress.onboarding_completed ? 'Onboarding complete' : 'Onboarding in progress',
          details: {
            tutorial_completed: progress.tutorial_completed,
            welcome_email_sent: progress.welcome_email_sent,
            onboarding_completed: progress.onboarding_completed
          }
        });
      } else {
        results.push({
          name: 'Onboarding Status',
          status: 'warning',
          message: 'No onboarding record found',
          details: { note: 'User may need to visit Dashboard to initialize onboarding' }
        });
      }
    } catch (error) {
      results.push({
        name: 'Onboarding Status',
        status: 'error',
        message: 'Failed to check onboarding',
        details: { error: error.message }
      });
    }

    setTestResults(results);
    setRunningTests(false);
  }, [user, profile]);

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user, runDiagnostics]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-teal-100 text-teal-800">Passed</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800">Unknown</Badge>;
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">System Diagnostics</h1>
                  <p className="text-teal-100 text-sm font-normal">Comprehensive app health check</p>
                </div>
              </div>
              <Button
                onClick={runDiagnostics}
                disabled={runningTests}
                className="bg-white text-teal-700 hover:bg-teal-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${runningTests ? 'animate-spin' : ''}`} />
                Rerun Tests
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-green-200 bg-green-50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">Passed</p>
                    <p className="text-3xl font-bold text-green-900">{successCount}</p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Warnings</p>
                    <p className="text-3xl font-bold text-amber-900">{warningCount}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-200 bg-red-50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-medium">Failed</p>
                    <p className="text-3xl font-bold text-red-900">{errorCount}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Results */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            {runningTests ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                <span className="ml-3 text-slate-600">Running diagnostics...</span>
              </div>
            ) : testResults.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No tests run yet. Click "Rerun Tests" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className="border border-slate-200 border-l-4 shadow-sm" style={{
                    borderLeftColor: result.status === 'success' ? '#0d9488' : result.status === 'warning' ? '#d97706' : '#dc2626'
                  }}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{result.name}</h3>
                              {getStatusBadge(result.status)}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{result.message}</p>
                            {result.details && (
                              <details className="text-xs bg-slate-100 rounded-lg p-2">
                                <summary className="cursor-pointer text-slate-500 hover:text-teal-700 font-medium">
                                  View details
                                </summary>
                                <pre className="mt-2 text-slate-700 overflow-x-auto">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">User:</span>
                <span className="font-medium">{user?.email || 'Not logged in'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Role:</span>
                <span className="font-medium">{profile?.role || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Tests Run:</span>
                <span className="font-medium">{testResults.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
