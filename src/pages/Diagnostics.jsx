import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, User, Users, Heart, Calendar, Pill, ListTodo, FileText, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Diagnostics() {
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const runDiagnostics = async () => {
    setRunningTests(true);
    const results = [];

    // Test 1: User Authentication
    try {
      const currentUser = await base44.auth.me();
      results.push({
        name: 'User Authentication',
        status: 'success',
        message: `Logged in as ${currentUser.email}`,
        details: { role: currentUser.role, name: currentUser.full_name }
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
      const subscriptions = await base44.entities.Subscription.filter({ user_email: user.email });
      const activeSubscription = subscriptions.find(s => s.status === 'active');
      
      if (activeSubscription) {
        results.push({
          name: 'Subscription Status',
          status: 'success',
          message: `Active subscription found`,
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
          details: { found: subscriptions.length, statuses: subscriptions.map(s => s.status) }
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
      const recipients = await base44.entities.CareRecipient.list();
      results.push({
        name: 'Care Recipients',
        status: 'success',
        message: `${recipients.length} care recipients`,
        details: { count: recipients.length }
      });
    } catch (error) {
      results.push({
        name: 'Care Recipients',
        status: 'error',
        message: 'Failed to fetch care recipients',
        details: { error: error.message }
      });
    }

    // Test 5: Appointments
    try {
      const appointments = await base44.entities.Appointment.list();
      results.push({
        name: 'Appointments',
        status: 'success',
        message: `${appointments.length} appointments`,
        details: { count: appointments.length }
      });
    } catch (error) {
      results.push({
        name: 'Appointments',
        status: 'error',
        message: 'Failed to fetch appointments',
        details: { error: error.message }
      });
    }

    // Test 6: Medications
    try {
      const medications = await base44.entities.Medication.list();
      results.push({
        name: 'Medications',
        status: 'success',
        message: `${medications.length} medications`,
        details: { count: medications.length }
      });
    } catch (error) {
      results.push({
        name: 'Medications',
        status: 'error',
        message: 'Failed to fetch medications',
        details: { error: error.message }
      });
    }

    // Test 7: Tasks
    try {
      const tasks = await base44.entities.Task.list();
      results.push({
        name: 'Tasks',
        status: 'success',
        message: `${tasks.length} tasks`,
        details: { count: tasks.length }
      });
    } catch (error) {
      results.push({
        name: 'Tasks',
        status: 'error',
        message: 'Failed to fetch tasks',
        details: { error: error.message }
      });
    }

    // Test 8: Documents
    try {
      const documents = await base44.entities.Document.list();
      results.push({
        name: 'Documents',
        status: 'success',
        message: `${documents.length} documents`,
        details: { count: documents.length }
      });
    } catch (error) {
      results.push({
        name: 'Documents',
        status: 'error',
        message: 'Failed to fetch documents',
        details: { error: error.message }
      });
    }

    // Test 9: Notifications
    try {
      const notifications = await base44.entities.Notification.filter({ user_email: user.email });
      const unread = notifications.filter(n => !n.read).length;
      results.push({
        name: 'Notifications',
        status: 'success',
        message: `${notifications.length} total, ${unread} unread`,
        details: { total: notifications.length, unread }
      });
    } catch (error) {
      results.push({
        name: 'Notifications',
        status: 'error',
        message: 'Failed to fetch notifications',
        details: { error: error.message }
      });
    }

    // Test 10: Onboarding Status
    try {
      const onboarding = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      if (onboarding.length > 0) {
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
  };

  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">System Diagnostics</h1>
                  <p className="text-blue-100 text-sm font-normal">Comprehensive app health check</p>
                </div>
              </div>
              <Button
                onClick={runDiagnostics}
                disabled={runningTests}
                className="bg-white text-blue-600 hover:bg-blue-50"
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
            <Card className="border-green-200 bg-green-50">
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

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Warnings</p>
                    <p className="text-3xl font-bold text-yellow-900">{warningCount}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
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
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            {runningTests ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
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
                  <Card key={index} className="border-l-4" style={{
                    borderLeftColor: result.status === 'success' ? '#16a34a' : result.status === 'warning' ? '#ca8a04' : '#dc2626'
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
                              <details className="text-xs bg-slate-50 rounded p-2">
                                <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
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
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
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
                <span className="font-medium">{user?.role || 'N/A'}</span>
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