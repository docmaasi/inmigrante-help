import React, { useState } from 'react';
import { useCareRecipients, useCarePlans, useDeleteCarePlan } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import CarePlanForm from '../components/careplan/CarePlanForm';
import CarePlanCard from '../components/careplan/CarePlanCard';

export default function CarePlanBuilder() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const { data: recipients = [], isLoading: loadingRecipients } = useCareRecipients();
  const { data: carePlans = [], isLoading: loadingPlans } = useCarePlans();
  const deleteMutation = useDeleteCarePlan();

  const handleDelete = (plan) => {
    if (!confirm(`Delete care plan "${plan.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(plan.id, {
      onSuccess: () => toast.success('Care plan deleted'),
      onError: (err) => toast.error(err.message || 'Failed to delete care plan'),
    });
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingPlan(null);
  };

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <CarePlanForm
          plan={editingPlan}
          recipients={recipients}
          onClose={handleClose}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#4F46E5] mb-1 flex items-center gap-2">
              <FileText className="w-8 h-8 text-[#8B7EC8]" />
              Care Plan Builder
            </h1>
            <p className="text-sm md:text-base text-[#8B7EC8]">
              Create comprehensive care plans with daily routines, medications, contacts, and emergency procedures
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] hover:from-[#4F46E5]/90 hover:to-[#8B7EC8]/90 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Care Plan
          </Button>
        </div>

        {loadingPlans || loadingRecipients ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-[#8B7EC8]/15">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : carePlans.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#8B7EC8]/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#8B7EC8]" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-[#4F46E5] mb-2">No care plans yet</h3>
            <p className="text-sm md:text-base text-[#8B7EC8] mb-6">Create your first care plan to organize care routines</p>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-[#4F46E5] to-[#8B7EC8] hover:from-[#4F46E5]/90 hover:to-[#8B7EC8]/90 text-white w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Care Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carePlans.map(plan => (
              <CarePlanCard
                key={plan.id}
                plan={plan}
                recipients={recipients}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
